<?php

/**
 * Router for `php -S` so:
 * - `/dist/**` maps to repository `dist/` (Stencil bundle + chunks)
 * - `/easycredit-components/**` maps to `dist/easycredit-components/` (same tree as CDN asset URLs from getAssetUrl)
 *
 *   php -S 127.0.0.1:8088 -t scripts/prerender-server scripts/prerender-server/router.php
 */

declare(strict_types=1);

$prerenderDir = __DIR__;
$repoRoot = dirname($prerenderDir, 2);
$distRoot = $repoRoot . '/dist';

/**
 * @return bool true if a file was served
 */
function serve_dist_static(string $distRoot, string $candidatePath): bool
{
    $realDist = realpath($distRoot);
    $realFile = realpath($candidatePath);
    if ($realDist === false || $realFile === false || strpos($realFile, $realDist) !== 0 || !is_file($realFile)) {
        return false;
    }

    $ext = strtolower(pathinfo($realFile, PATHINFO_EXTENSION));
    $mime = [
        'js' => 'application/javascript; charset=utf-8',
        'mjs' => 'application/javascript; charset=utf-8',
        'css' => 'text/css; charset=utf-8',
        'svg' => 'image/svg+xml',
        'json' => 'application/json',
        'woff2' => 'font/woff2',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'ico' => 'image/x-icon',
    ][$ext] ?? 'application/octet-stream';

    header('Content-Type: ' . $mime);
    readfile($realFile);
    return true;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (!is_string($uri)) {
    return false;
}

if (strpos($uri, '/dist/') === 0) {
    $path = $distRoot . substr($uri, strlen('/dist'));
    if (serve_dist_static($distRoot, $path)) {
        return true;
    }
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    return true;
}

if (strpos($uri, '/easycredit-components/') === 0) {
    $path = $distRoot . $uri;
    if (serve_dist_static($distRoot, $path)) {
        return true;
    }
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    return true;
}

if ($uri === '/' || $uri === '/index.php') {
    include $prerenderDir . '/index.php';
    return true;
}

return false;
