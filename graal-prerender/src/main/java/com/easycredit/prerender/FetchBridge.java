package com.easycredit.prerender;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyExecutable;

/**
 * Installs {@code fetch} into GraalJS using blocking Java HttpClient.
 * The JS wrapper builds real Promises so {@code await} / {@code .then} flush correctly.
 */
final class FetchBridge {
  private final HttpClient httpClient;
  private final Duration timeout;

  FetchBridge(Duration timeout) {
    this.timeout = timeout;
    this.httpClient = HttpClient.newBuilder()
        .connectTimeout(timeout)
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();
  }

  void install(Context context) {
    ProxyExecutable javaFetch = args -> {
      String url = args.length > 0 ? args[0].asString() : "";
      String method = "GET";
      String body = null;
      Map<String, String> headers = new LinkedHashMap<>();

      if (args.length > 1 && args[1] != null && args[1].hasMembers()) {
        Value opts = args[1];
        if (opts.hasMember("method") && !opts.getMember("method").isNull()) {
          method = opts.getMember("method").asString();
        }
        if (opts.hasMember("body") && !opts.getMember("body").isNull()) {
          body = opts.getMember("body").asString();
        }
        if (opts.hasMember("headers") && opts.getMember("headers").hasMembers()) {
          Value hdrs = opts.getMember("headers");
          for (String key : hdrs.getMemberKeys()) {
            Value value = hdrs.getMember(key);
            if (value != null && !value.isNull()) {
              headers.put(key, value.asString());
            }
          }
        }
      }

      try {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url)).timeout(timeout);
        headers.forEach(builder::header);
        if (body != null && !method.equalsIgnoreCase("GET") && !method.equalsIgnoreCase("HEAD")) {
          builder.method(method.toUpperCase(), HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        } else {
          builder.method(method.toUpperCase(), HttpRequest.BodyPublishers.noBody());
        }

        HttpResponse<String> response =
            httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        return toJsResponse(context, response);
      } catch (Exception e) {
        throw new IllegalStateException(e.getMessage() == null ? String.valueOf(e) : e.getMessage(), e);
      }
    };

    Value install = context.eval("js", """
        (function(javaFetch) {
          globalThis.fetch = function(url, opts) {
            return new Promise(function(resolve, reject) {
              try {
                resolve(javaFetch(url, opts));
              } catch (e) {
                reject(e && e.message ? e.message : String(e));
              }
            });
          };
        })
        """);
    install.execute(javaFetch);
  }

  private static Value toJsResponse(Context context, HttpResponse<String> response) {
    String body = response.body() == null ? "" : response.body();
    boolean ok = response.statusCode() >= 200 && response.statusCode() < 300;
    int status = response.statusCode();

    // Build the Response object entirely in JS so .json/.text are real functions.
    Value factory = context.eval("js", """
        (function(ok, status, body) {
          return {
            ok: ok,
            status: status,
            statusText: '',
            headers: {
              get: function() { return null; }
            },
            json: function() {
              return Promise.resolve(JSON.parse(body));
            },
            text: function() {
              return Promise.resolve(body);
            }
          };
        })
        """);
    return factory.execute(ok, status, body);
  }
}
