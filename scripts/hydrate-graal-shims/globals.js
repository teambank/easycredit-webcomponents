/* Minimal browser globals for GraalJS (no Node / browser host). */
(function (g) {
  if (typeof g.queueMicrotask === 'undefined') {
    g.queueMicrotask = function (fn) {
      Promise.resolve().then(fn);
    };
  }

  // Stencil MockWindow captures these at init — must exist before hydrate loads.
  // Delayed timers are stored and flushed by __graalPumpTimers from the Java host.
  if (typeof g.setTimeout === 'undefined') {
    var __timers = Object.create(null);
    var __nextTimerId = 1;
    g.setTimeout = function (fn, ms) {
      var id = __nextTimerId++;
      var delay = ms == null ? 0 : Number(ms);
      if (!(delay > 0)) {
        __timers[id] = { fn: fn, due: 0 };
        Promise.resolve().then(function () {
          var t = __timers[id];
          if (!t) return;
          delete __timers[id];
          if (typeof t.fn === 'function') t.fn();
        });
      } else {
        __timers[id] = { fn: fn, due: Date.now() + delay };
      }
      return id;
    };
    g.clearTimeout = function (id) {
      delete __timers[id];
    };
    g.setInterval = function (fn, ms) {
      var delay = ms == null ? 0 : Number(ms);
      var id = __nextTimerId++;
      function tick() {
        if (!__timers[id]) return;
        if (typeof fn === 'function') fn();
        if (__timers[id]) {
          __timers[id].due = Date.now() + delay;
        }
      }
      __timers[id] = { fn: tick, due: Date.now() + delay, interval: true };
      return id;
    };
    g.clearInterval = function (id) {
      delete __timers[id];
    };
    g.__graalPumpTimers = function (now) {
      now = now == null ? Date.now() : now;
      Object.keys(__timers).forEach(function (key) {
        var t = __timers[key];
        if (!t || t.due > now) return;
        if (!t.interval) delete __timers[key];
        if (typeof t.fn === 'function') {
          try {
            t.fn();
          } catch (_) {}
        }
      });
    };
  }

  if (typeof g.AbortController === 'undefined') {
    g.AbortController = class AbortController {
      constructor() {
        var listeners = [];
        this.signal = {
          aborted: false,
          reason: undefined,
          onabort: null,
          addEventListener: function (type, fn) {
            if (type === 'abort' && typeof fn === 'function') listeners.push(fn);
          },
          removeEventListener: function (type, fn) {
            listeners = listeners.filter(function (l) {
              return l !== fn;
            });
          },
          dispatchEvent: function () {
            return false;
          },
        };
        this._listeners = listeners;
      }
      abort(reason) {
        this.signal.aborted = true;
        this.signal.reason = reason;
        if (typeof this.signal.onabort === 'function') this.signal.onabort();
        (this._listeners || []).slice().forEach(function (fn) {
          try {
            fn();
          } catch (_) {}
        });
      }
    };
  }

  if (typeof g.URLSearchParams === 'undefined') {
    g.URLSearchParams = function URLSearchParams(init) {
      this._pairs = [];
      this._url = null;
      if (typeof init === 'string') {
        var q = init.charAt(0) === '?' ? init.slice(1) : init;
        if (q) {
          q.split('&').forEach(function (part) {
            if (!part) return;
            var i = part.indexOf('=');
            var k = decodeURIComponent((i < 0 ? part : part.slice(0, i)).replace(/\+/g, ' '));
            var v = decodeURIComponent((i < 0 ? '' : part.slice(i + 1)).replace(/\+/g, ' '));
            this._pairs.push([k, v]);
          }, this);
        }
      }
    };
    g.URLSearchParams.prototype._syncUrl = function () {
      if (!this._url) return;
      var qs = this.toString();
      this._url.search = qs ? '?' + qs : '';
      this._url.href =
        this._url.origin + this._url.pathname + this._url.search + this._url.hash;
    };
    g.URLSearchParams.prototype.append = function (k, v) {
      this._pairs.push([String(k), String(v)]);
      this._syncUrl();
    };
    g.URLSearchParams.prototype.set = function (k, v) {
      k = String(k);
      v = String(v);
      var replaced = false;
      for (var i = 0; i < this._pairs.length; i++) {
        if (this._pairs[i][0] === k) {
          if (!replaced) {
            this._pairs[i][1] = v;
            replaced = true;
          } else {
            this._pairs.splice(i, 1);
            i--;
          }
        }
      }
      if (!replaced) this._pairs.push([k, v]);
      this._syncUrl();
    };
    g.URLSearchParams.prototype.get = function (k) {
      k = String(k);
      for (var i = 0; i < this._pairs.length; i++) {
        if (this._pairs[i][0] === k) return this._pairs[i][1];
      }
      return null;
    };
    g.URLSearchParams.prototype.toString = function () {
      return this._pairs
        .map(function (p) {
          return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
        })
        .join('&');
    };
  }

  if (typeof g.URL === 'undefined') {
    function resolveUrl(url, base) {
      var input = String(url);
      if (base != null && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input)) {
        var baseStr = String(base);
        if (input.charAt(0) === '/' && input.charAt(1) === '/') {
          var proto = /^([a-zA-Z][a-zA-Z0-9+.-]*:)/.exec(baseStr);
          input = (proto ? proto[1] : 'https:') + input;
        } else if (input.charAt(0) === '/') {
          var origin = /^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/?#]*)/.exec(baseStr);
          input = (origin ? origin[1] : '') + input;
        } else if (input.charAt(0) === '?' || input.charAt(0) === '#') {
          input = baseStr.replace(/[?#].*$/, '') + input;
        } else {
          input = baseStr.replace(/\/[^/]*$/, '/') + input;
        }
      }
      var match = /^([a-zA-Z][a-zA-Z0-9+.-]*:)\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/.exec(input);
      if (!match) {
        throw new TypeError('Invalid URL: ' + url);
      }
      var host = match[2];
      var hostname = host;
      var port = '';
      if (host.charAt(0) !== '[') {
        var colon = host.lastIndexOf(':');
        if (colon > 0) {
          hostname = host.slice(0, colon);
          port = host.slice(colon + 1);
        }
      }
      return {
        href: input,
        protocol: match[1],
        host: host,
        hostname: hostname,
        port: port,
        pathname: match[3] || '/',
        search: match[4] || '',
        hash: match[5] || '',
        origin: match[1] + '//' + host,
      };
    }

    g.URL = function URL(url, base) {
      var parsed = resolveUrl(url, base);
      this.href = parsed.href;
      this.protocol = parsed.protocol;
      this.host = parsed.host;
      this.hostname = parsed.hostname;
      this.port = parsed.port;
      this.pathname = parsed.pathname;
      this.search = parsed.search;
      this.hash = parsed.hash;
      this.origin = parsed.origin;
      this.searchParams = new g.URLSearchParams(parsed.search);
      this.searchParams._url = this;
    };
    g.URL.prototype.toString = function () {
      return this.href;
    };
    g.URL.prototype.toJSON = function () {
      return this.href;
    };
    g.URL.createObjectURL = function () {
      return '';
    };
    g.URL.revokeObjectURL = function () {};
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
