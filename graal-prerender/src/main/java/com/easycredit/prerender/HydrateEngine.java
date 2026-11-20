package com.easycredit.prerender;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.ReentrantLock;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyExecutable;

final class HydrateEngine implements AutoCloseable {
  private static final String STENCIL_DOC_DATA = "_stencilDocData";

  private final Context context;
  private final Value renderToString;
  private final String hydratePageUrl;
  private final long timeoutMs;
  private final int maxComponents;
  private final ReentrantLock lock = new ReentrantLock();

  HydrateEngine(Path bundlePath, String hydratePageUrl, long timeoutMs, int maxComponents) throws IOException {
    this.hydratePageUrl = hydratePageUrl;
    this.timeoutMs = timeoutMs;
    this.maxComponents = maxComponents;

    String source = Files.readString(bundlePath, StandardCharsets.UTF_8);
    this.context = Context.newBuilder("js")
        .allowHostAccess(HostAccess.ALL)
        .allowHostClassLookup(className -> true)
        .allowIO(true)
        .option("engine.WarnInterpreterOnly", "false")
        .build();

    new FetchBridge(Duration.ofMillis(timeoutMs)).install(context);
    context.eval(Source.newBuilder("js", source, bundlePath.getFileName().toString()).build());

    Value candidate = context.getBindings("js").getMember("renderToString");
    if (candidate == null || !candidate.canExecute()) {
      Value ns = context.getBindings("js").getMember("easycreditHydrate");
      if (ns != null && ns.hasMember("renderToString")) {
        candidate = ns.getMember("renderToString");
      }
    }
    if (candidate == null || !candidate.canExecute()) {
      throw new IllegalStateException("hydrate-graal bundle did not expose renderToString");
    }
    this.renderToString = candidate;
  }

  Map<String, Object> render(String html) {
    lock.lock();
    try {
      Value options = context.eval("js", """
          (function(url, timeout, maxHydrateCount, resetIds) {
            return {
              fullDocument: false,
              serializeShadowRoot: 'declarative-shadow-dom',
              maxHydrateCount: maxHydrateCount,
              url: url,
              timeout: timeout,
              beforeHydrate: function(doc) { resetIds(doc); },
              afterHydrate: function(doc) { resetIds(doc); }
            };
          })
          """).execute(
          hydratePageUrl,
          timeoutMs,
          maxComponents,
          (ProxyExecutable) args -> {
            resetHydrateIds(args.length > 0 ? args[0] : null);
            return null;
          });

      Value resultValue = renderToString.execute(html, options);
      Value settled = awaitValue(resultValue);

      Map<String, Object> out = new LinkedHashMap<>();
      out.put("html", memberString(settled, "html"));
      out.put("hydratedCount", memberInt(settled, "hydratedCount"));
      if (settled != null && settled.hasMember("diagnostics") && !settled.getMember("diagnostics").isNull()) {
        out.put("diagnostics", settled.getMember("diagnostics"));
      } else {
        out.put("diagnostics", context.eval("js", "[]"));
      }
      return out;
    } finally {
      lock.unlock();
    }
  }

  private Value awaitValue(Value value) {
    if (value == null || value.isNull() || !value.canInvokeMember("then")) {
      return value;
    }

    AtomicReference<Value> resolved = new AtomicReference<>();
    AtomicReference<String> rejected = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    ProxyExecutable onFulfilled = args -> {
      resolved.set(args.length > 0 ? args[0] : null);
      latch.countDown();
      return null;
    };
    ProxyExecutable onRejected = args -> {
      Value reason = args.length > 0 ? args[0] : null;
      rejected.set(formatJsError(reason));
      latch.countDown();
      return null;
    };

    // Register then/catch; GraalJS flushes promise jobs when control returns to Java.
    value.invokeMember("then", onFulfilled, onRejected);

    long deadline = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(timeoutMs + 2_000L);
    try {
      while (latch.getCount() > 0) {
        long remainingMs = TimeUnit.NANOSECONDS.toMillis(deadline - System.nanoTime());
        if (remainingMs <= 0) {
          throw new IllegalStateException("hydrate timed out after " + timeoutMs + "ms");
        }
        // Flush delayed setTimeout/setInterval polyfills while the hydrate promise is pending.
        try {
          context.getBindings("js").getMember("__graalPumpTimers").execute();
        } catch (Exception ignored) {
          // polyfill may be absent on older bundles
        }
        if (latch.await(Math.min(25L, remainingMs), TimeUnit.MILLISECONDS)) {
          break;
        }
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("hydrate interrupted", e);
    }

    if (rejected.get() != null) {
      throw new IllegalStateException(rejected.get());
    }
    return resolved.get();
  }

  private static String formatJsError(Value reason) {
    if (reason == null || reason.isNull()) {
      return "Promise rejected";
    }
    StringBuilder sb = new StringBuilder();
    if (reason.hasMember("name") && !reason.getMember("name").isNull()) {
      sb.append(reason.getMember("name").asString()).append(": ");
    }
    if (reason.hasMember("message") && !reason.getMember("message").isNull()) {
      sb.append(reason.getMember("message").asString());
    } else {
      sb.append(reason.toString());
    }
    if (reason.hasMember("stack") && !reason.getMember("stack").isNull()) {
      sb.append('\n').append(reason.getMember("stack").asString());
    }
    return sb.toString();
  }

  private void resetHydrateIds(Value document) {
    if (document == null || document.isNull() || !document.hasMembers()) {
      return;
    }
    if (!document.hasMember(STENCIL_DOC_DATA)) {
      return;
    }
    Value docData = document.getMember(STENCIL_DOC_DATA);
    if (docData == null || docData.isNull() || !docData.hasMembers()) {
      return;
    }
    docData.putMember("hostIds", 0);
    docData.putMember("rootLevelIds", 0);
  }

  private static String memberString(Value value, String name) {
    if (value == null || !value.hasMember(name) || value.getMember(name).isNull()) {
      return null;
    }
    return value.getMember(name).asString();
  }

  private static int memberInt(Value value, String name) {
    if (value == null || !value.hasMember(name) || value.getMember(name).isNull()) {
      return 0;
    }
    return value.getMember(name).asInt();
  }

  @Override
  public void close() {
    context.close(true);
  }
}
