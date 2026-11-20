package com.easycredit.prerender;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Executors;
import org.graalvm.polyglot.Value;

public final class GraalPrerenderServer {
  private static final String DEFAULT_HYDRATE_URL = "https://ratenkauf.easycredit.de/";

  public static void main(String[] args) throws Exception {
    String host = env("PRERENDER_HOST", "0.0.0.0");
    int port = envInt("PRERENDER_PORT", 4711);
    long timeoutMs = envLong("PRERENDER_TIMEOUT", 15_000);
    int maxBody = envInt("PRERENDER_MAX_BODY", 1_048_576);
    int maxComponents = envInt("PRERENDER_MAX_COMPONENTS", 32);
    String hydrateUrl = normalizeHydrateUrl(env("PRERENDER_HYDRATE_URL", DEFAULT_HYDRATE_URL));
    Path bundlePath = Path.of(env("PRERENDER_HYDRATE_BUNDLE", "/app/hydrate-graal/index.js")).toAbsolutePath().normalize();

    FragmentGuard guard = new FragmentGuard(maxComponents);
    System.setProperty("polyglotimpl.AttachLibraryFailureAction", "ignore");

    HydrateEngine engine = new HydrateEngine(bundlePath, hydrateUrl, timeoutMs, maxComponents);

    HttpServer server = HttpServer.create(new InetSocketAddress(host, port), 0);
    server.createContext("/health", exchange -> {
      if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
        send(exchange, 405, "text/plain; charset=utf-8", "method not allowed");
        return;
      }
      send(exchange, 200, "text/plain; charset=utf-8", "ok");
    });
    server.createContext("/render", exchange -> handleRender(exchange, guard, engine, maxBody));
    server.setExecutor(Executors.newCachedThreadPool());
    server.start();

    System.err.println("easycredit graal prerender on http://" + host + ":" + port);
    System.err.println("hydrate bundle: " + bundlePath);
    System.err.println("hydrate page URL: " + hydrateUrl);
    System.err.println("hydrate timeout: " + timeoutMs + "ms");
    System.err.println("max components: " + maxComponents);

    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
      server.stop(0);
      engine.close();
    }));
  }

  private static void handleRender(HttpExchange exchange, FragmentGuard guard, HydrateEngine engine, int maxBody)
      throws IOException {
    if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
      sendJson(exchange, 405, "{\"html\":null,\"error\":\"method not allowed\"}");
      return;
    }

    byte[] raw;
    try {
      raw = readBody(exchange.getRequestBody(), maxBody);
    } catch (BodyTooLargeException e) {
      sendJson(exchange, 413, "{\"html\":null,\"error\":\"request body too large\"}");
      return;
    }

    String html;
    try {
      html = extractHtml(new String(raw, StandardCharsets.UTF_8));
    } catch (IllegalArgumentException e) {
      sendJson(exchange, 400, jsonError(e.getMessage()));
      return;
    }

    try {
      guard.validate(html);
    } catch (FragmentGuard.GuardException e) {
      sendJson(exchange, e.status, jsonError(e.getMessage()));
      return;
    }

    try {
      Map<String, Object> result = engine.render(html);
      String htmlOut = result.get("html") == null ? null : String.valueOf(result.get("html"));
      int hydratedCount = result.get("hydratedCount") instanceof Number n ? n.intValue() : 0;
      Value diagnostics = (Value) result.get("diagnostics");
      boolean hasError = diagnosticsHasError(diagnostics);
      String body = "{\"html\":" + jsonString(htmlOut)
          + ",\"hydratedCount\":" + hydratedCount
          + ",\"diagnostics\":" + valueToJson(diagnostics) + "}";
      sendJson(exchange, hasError ? 422 : 200, body);
    } catch (Exception e) {
      sendJson(exchange, 500, jsonError(e.getMessage() == null ? String.valueOf(e) : e.getMessage()));
    }
  }

  private static boolean diagnosticsHasError(Value diagnostics) {
    if (diagnostics == null || diagnostics.isNull() || !diagnostics.hasArrayElements()) {
      return false;
    }
    long size = diagnostics.getArraySize();
    for (long i = 0; i < size; i++) {
      Value item = diagnostics.getArrayElement(i);
      if (item != null && item.hasMember("level") && "error".equalsIgnoreCase(item.getMember("level").asString())) {
        return true;
      }
    }
    return false;
  }

  private static String extractHtml(String raw) {
    String trimmed = raw == null ? "" : raw.trim();
    if (trimmed.isEmpty()) {
      return "";
    }
    // Minimal JSON object parser for { "html": "..." } without pulling a dependency.
    if (!trimmed.startsWith("{")) {
      throw new IllegalArgumentException("invalid JSON body");
    }
    int htmlKey = indexOfJsonKey(trimmed, "html");
    if (htmlKey < 0) {
      return "";
    }
    int colon = trimmed.indexOf(':', htmlKey);
    if (colon < 0) {
      throw new IllegalArgumentException("invalid JSON body");
    }
    int i = colon + 1;
    while (i < trimmed.length() && Character.isWhitespace(trimmed.charAt(i))) {
      i++;
    }
    if (i >= trimmed.length()) {
      throw new IllegalArgumentException("invalid JSON body");
    }
    char start = trimmed.charAt(i);
    if (start == 'n' && trimmed.startsWith("null", i)) {
      return "";
    }
    if (start != '"') {
      throw new IllegalArgumentException("html must be a string");
    }
    StringBuilder out = new StringBuilder();
    i++;
    while (i < trimmed.length()) {
      char c = trimmed.charAt(i++);
      if (c == '"') {
        return out.toString();
      }
      if (c == '\\') {
        if (i >= trimmed.length()) {
          throw new IllegalArgumentException("invalid JSON body");
        }
        char esc = trimmed.charAt(i++);
        switch (esc) {
          case '"', '\\', '/' -> out.append(esc);
          case 'b' -> out.append('\b');
          case 'f' -> out.append('\f');
          case 'n' -> out.append('\n');
          case 'r' -> out.append('\r');
          case 't' -> out.append('\t');
          case 'u' -> {
            if (i + 4 > trimmed.length()) {
              throw new IllegalArgumentException("invalid JSON body");
            }
            int code = Integer.parseInt(trimmed.substring(i, i + 4), 16);
            out.append((char) code);
            i += 4;
          }
          default -> throw new IllegalArgumentException("invalid JSON body");
        }
      } else {
        out.append(c);
      }
    }
    throw new IllegalArgumentException("invalid JSON body");
  }

  private static int indexOfJsonKey(String json, String key) {
    String pattern = "\"" + key + "\"";
    int from = 0;
    while (from < json.length()) {
      int at = json.indexOf(pattern, from);
      if (at < 0) {
        return -1;
      }
      return at;
    }
    return -1;
  }

  private static byte[] readBody(InputStream in, int maxBody) throws IOException {
    byte[] buffer = in.readAllBytes();
    if (buffer.length > maxBody) {
      throw new BodyTooLargeException();
    }
    return buffer;
  }

  private static void sendJson(HttpExchange exchange, int status, String body) throws IOException {
    send(exchange, status, "application/json; charset=utf-8", body);
  }

  private static void send(HttpExchange exchange, int status, String contentType, String body) throws IOException {
    byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
    Headers headers = exchange.getResponseHeaders();
    headers.set("Content-Type", contentType);
    exchange.sendResponseHeaders(status, bytes.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(bytes);
    }
  }

  private static String jsonError(String message) {
    return "{\"html\":null,\"error\":" + jsonString(message) + "}";
  }

  private static String jsonString(String value) {
    if (value == null) {
      return "null";
    }
    StringBuilder out = new StringBuilder("\"");
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      switch (c) {
        case '"' -> out.append("\\\"");
        case '\\' -> out.append("\\\\");
        case '\b' -> out.append("\\b");
        case '\f' -> out.append("\\f");
        case '\n' -> out.append("\\n");
        case '\r' -> out.append("\\r");
        case '\t' -> out.append("\\t");
        default -> {
          if (c < 0x20) {
            out.append(String.format(Locale.ROOT, "\\u%04x", (int) c));
          } else {
            out.append(c);
          }
        }
      }
    }
    out.append('"');
    return out.toString();
  }

  private static String valueToJson(Value value) {
    if (value == null || value.isNull()) {
      return "null";
    }
    return contextJsonStringify(value);
  }

  private static String contextJsonStringify(Value value) {
    try {
      Value json = value.getContext().getBindings("js").getMember("JSON");
      return json.invokeMember("stringify", value).asString();
    } catch (Exception e) {
      return "[]";
    }
  }

  private static String normalizeHydrateUrl(String raw) {
    String value = raw == null || raw.isBlank() ? DEFAULT_HYDRATE_URL : raw.trim();
    if (!value.endsWith("/")) {
      value = value + "/";
    }
    return value;
  }

  private static String env(String name, String fallback) {
    String value = System.getenv(name);
    return value == null || value.isBlank() ? fallback : value;
  }

  private static int envInt(String name, int fallback) {
    String value = System.getenv(name);
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return Integer.parseInt(value.trim());
  }

  private static long envLong(String name, long fallback) {
    String value = System.getenv(name);
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return Long.parseLong(value.trim());
  }

  private static final class BodyTooLargeException extends RuntimeException {
  }
}
