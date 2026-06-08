<?php

declare(strict_types=1);

/**
 * Calls the Node prerender service (scripts/prerender-server/server.cjs).
 *
 * Start the service on the app server (same host as PHP, or internal network):
 *   npm run build && npm run prerender:serve
 *
 * Configure base URL via constructor or env EASYCREDIT_PRERENDER_URL (default http://127.0.0.1:4711).
 * Logging: each POST is logged to STDERR (visible in the terminal for `php -S` and in `docker logs`).
 * On the PHP built-in server (SAPI cli-server), logging is on by default. Set EASYCREDIT_PRERENDER_LOG=0 to turn off.
 * For other SAPIs (e.g. php-fpm), set EASYCREDIT_PRERENDER_LOG=1 to enable.
 */
final class EasycreditPrerenderClient
{
    private string $baseUrl;

    private static function shouldLogPrerender(): bool
    {
        $v = getenv('EASYCREDIT_PRERENDER_LOG');
        if ($v === '0' || $v === 'false' || $v === 'no') {
            return false;
        }
        if (is_string($v) && $v !== '') {
            return true;
        }

        return PHP_SAPI === 'cli-server';
    }

    /**
     * php://stderr so output shows next to `php -S` and in Docker; error_log() often goes elsewhere.
     */
    private static function logPrerender(string $message): void
    {
        if (!self::shouldLogPrerender()) {
            return;
        }
        @file_put_contents('php://stderr', '[EasycreditPrerender] ' . $message . "\n");
    }

    public function __construct(?string $baseUrl = null)
    {
        $env = getenv('EASYCREDIT_PRERENDER_URL');
        $this->baseUrl = rtrim($baseUrl ?? (is_string($env) && $env !== '' ? $env : 'http://127.0.0.1:4711'), '/');
    }

    /**
     * @param array<string, mixed> $options Passed to Stencil serialize options (optional).
     * @return array{html: string|null, hydratedCount?: int, diagnostics?: list<array{level: string, messageText: string}>, error?: string}
     */
    public function renderFragment(string $html, array $options = []): array
    {
        $url = $this->baseUrl . '/render';
        $payload = json_encode(['html' => $html, 'options' => $options]);
        if ($payload === false) {
            return ['html' => null, 'error' => 'json_encode failed: ' . json_last_error_msg()];
        }

        self::logPrerender('POST ' . $url . ' body=' . $payload);

        $ctx = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $payload,
                'timeout' => 30.0,
                'ignore_errors' => true,
            ],
        ]);

        $response = @file_get_contents($url, false, $ctx);
        if ($response === false) {
            return ['html' => null, 'error' => 'Prerender request failed (is the Node service running?)'];
        }

        $data = json_decode($response, true);
        if (!is_array($data)) {
            return ['html' => null, 'error' => 'Invalid JSON from prerender service: ' . json_last_error_msg()];
        }

        return $data;
    }

    public function healthCheck(): bool
    {
        $url = $this->baseUrl . '/health';
        $ctx = stream_context_create([
            'http' => ['method' => 'GET', 'timeout' => 2.0, 'ignore_errors' => true],
        ]);
        $body = @file_get_contents($url, false, $ctx);
        return is_string($body) && trim($body) === 'ok';
    }
}
