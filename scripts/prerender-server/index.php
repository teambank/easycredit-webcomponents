<?php

declare(strict_types=1);

/**
 * Local demo: PHP → Node prerender (EasycreditPrerenderClient).
 * For development only — do not expose publicly without authentication.
 */

require __DIR__ . '/EasycreditPrerenderClient.php';

$client = new EasycreditPrerenderClient();
$prerenderOk = $client->healthCheck();
$prerenderUrlDisplay = getenv('EASYCREDIT_PRERENDER_URL');
if (!is_string($prerenderUrlDisplay) || $prerenderUrlDisplay === '') {
  $prerenderUrlDisplay = 'http://127.0.0.1:4711';
}

$defaultFragment = '<easycredit-widget webshop-id="2.de.9999.9999" payment-type="INSTALLMENT,BILL" amount="2000"></easycredit-widget>';

$result = null;
$error = null;
$submittedHtml = $defaultFragment;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $submittedHtml = isset($_POST['html']) ? (string) $_POST['html'] : '';
  $result = $client->renderFragment($submittedHtml, []);
  if (isset($result['error']) && $result['error'] !== '') {
    $error = (string) $result['error'];
    $result = null;
  }
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>easycredit prerender (PHP demo)</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 960px;
      margin: 1rem auto;
      padding: 0 1rem;
    }

    .ok {
      color: #0a0;
    }

    .bad {
      color: #a00;
    }

    textarea {
      width: 100%;
      min-height: 120px;
      font-family: ui-monospace, monospace;
      font-size: 13px;
    }

    pre {
      background: #f4f4f4;
      padding: 1rem;
      overflow: auto;
      max-height: 420px;
      border: 1px solid #ddd;
    }

    code {
      background: #eee;
      padding: 0 4px;
    }

    .hydrate-preview {
      border: 2px solid #06c;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin: 1rem 0;
      background: #fff;
    }

    .hydrate-preview p.hint {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      color: #333;
    }
  </style>
</head>

<body>
  <h1>easycredit prerender (PHP demo)</h1>

  <p>
    Node prerender service:
    <?php if ($prerenderOk): ?>
      <strong class="ok">reachable</strong> (target: <code><?php echo htmlspecialchars($prerenderUrlDisplay, ENT_QUOTES, 'UTF-8'); ?></code>)
    <?php else: ?>
      <strong class="bad">not reachable</strong> — start it in another terminal: <code>npm run prerender:serve</code>
      (after <code>npm run build</code>).
    <?php endif; ?>
  </p>

  <form method="post" action="">
    <label for="html">HTML fragment (custom elements)</label>
    <textarea id="html" name="html" required><?php echo htmlspecialchars($submittedHtml, ENT_QUOTES, 'UTF-8'); ?></textarea>
    <p><button type="submit">Render via prerender API</button></p>
  </form>

  <?php if ($error !== null): ?>
    <p class="bad"><strong>Error:</strong> <?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></p>
  <?php endif; ?>

  <?php if ($result !== null && $error === null && isset($result['html'])): ?>
    <h2>SSR markup (source)</h2>
    <pre id="out"><?php echo htmlspecialchars((string) $result['html'], ENT_QUOTES, 'UTF-8'); ?></pre>
    <?php if (!empty($result['diagnostics'])): ?>
      <h3>Diagnostics</h3>
      <pre><?php echo htmlspecialchars(json_encode($result['diagnostics'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8'); ?></pre>
    <?php endif; ?>

    <h2>Hydration preview</h2>
    <p>
      The same server-rendered string is inserted below. The Stencil client bundle runs afterward and
      <strong>hydrates</strong> these hosts (attach listeners, complete client behavior). In DevTools, hosts should gain
      <code>class="hydrated"</code> (and shadow roots stay in sync).
    </p>
    <div class="hydrate-preview">
      <p class="hint">Output of Node <code>renderToString</code> + client runtime:</p>
      <?php echo $result['html']; ?>
    </div>
    <script type="module" src="/dist/easycredit-components/easycredit-components.esm.js"></script>
  <?php endif; ?>

  <?php if ($result === null || $error !== null || !isset($result['html'])): ?>
    <p><em>Submit the form to fetch SSR HTML, then the hydration preview and script load appear below the diagnostics.</em></p>
  <?php endif; ?>

  <hr>
  <h2>How to access</h2>
  <ol>
    <li><code>npm run build</code> (needs <code>dist/</code> for the client bundle that hydrates)</li>
    <li>Terminal A — Node prerender: <code>npm run prerender:serve</code> (<code>127.0.0.1:4711</code>)</li>
    <li>Terminal B — PHP + <code>router.php</code>: <code>npm run prerender:php</code></li>
    <li>Open <a href="http://127.0.0.1:8088/">http://127.0.0.1:8088/</a>, submit the form, check the blue box for hydrated components</li>
    <li>Or run everything in one container: <code>docker compose up --build</code> (see repository <code>Dockerfile</code>), then open the mapped host port (default <code>8088</code>).</li>
  </ol>
  <p>Override Node URL: <code>EASYCREDIT_PRERENDER_URL=…</code>. Custom PHP port: <code>php -S 127.0.0.1:8090 -t scripts/prerender-server scripts/prerender-server/router.php</code></p>
</body>

</html>