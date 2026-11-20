import { Build } from '@stencil/core'
import { Loader } from './loader'
import { InstallmentPlans, InstallmentPlansContainer } from '../types'
import { getFromCache, setToCache } from './cache'

export function addErrorHandler(component, callback): number {
  let time = 10

  const timeout: number = window.setTimeout(() => {
    console.error('No event handler handled the submit event of <'+ component.el.localName +'> within ' + time + ' seconds. Please check the integration.')
    sendFeedback(component, { component: Object.getPrototypeOf(component).constructor.name, action: 'error' })

    callback()
  }, time * 1000)

  window.addEventListener("beforeunload", function () {
    window.clearTimeout(timeout)
  });
  return timeout;
}

export function formatAmount(amount: number): string {
  if (isNaN(amount)) {
    return ''
  }
  return Number(
    Math.round(
      Number(amount.toString() + 'e2')
    ).toString() + 'e-2'
  ).toFixed(2).replace('.',',');
}
export function formatCurrency(amount: number): string {
  return formatAmount(amount) + ' €'
}

export function formatDate (dateString: string): string | undefined {
  if (dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {year: 'numeric', month: '2-digit', day: '2-digit'})
  }
  return undefined;
}

export function formatDatetime(dateString: string): string | undefined {
  if (!dateString) {
    return undefined;
  }

  const params: Intl.DateTimeFormatOptions = {year: "numeric", month: '2-digit', day: '2-digit'};
  if (dateString.match(/^\d{4}-\d{2}-\d{2}Z/)) {
    params.hour = '2-digit';
    params.minute = '2-digit';
  }
  return new Date(dateString).toLocaleDateString('de-DE', params)
}

var installmentsLoader: Loader

export function fetchMultiInstallmentPlans (webshopId: string, amount: number) {
  if (amount === undefined || amount === null || (typeof amount === 'number' && Number.isNaN(amount))) {
    return Promise.reject(new Error('amount is required for installment plans'))
  }
  if (installmentsLoader == null) {
    var installmentsStore: {[key: number]: any} = []
    installmentsLoader = new Loader(fetchAllInstallmentPlans.bind(this, webshopId), installmentsStore)
  }
  return installmentsLoader.load(String(amount))
}

export function fetchAllInstallmentPlans (webshopId: string, amounts: number[]) {
  let url = getApiUrl('/api/ratenrechner/v3/webshop/{{webshopId}}/installmentplans')
    .replace('{{webshopId}}', encodeWebshopId(webshopId))

  const articles = amounts.map(amount => {
    return {
      "identifier": amount.toString(),
      "price": amount
    }
  })

  const options = getOptions({
    method: 'POST',
    body: JSON.stringify({
      "articles": articles
    })
  })

  return fetch(url, options)
    .then((response) => {
      if (response.ok) { 
        return response.json().then(data => {
          return Object.fromEntries(data.installmentPlans.map(installmentPlan => {
            return [
              installmentPlan.articleIdentifier,
              {...data, ... { installmentPlans: [installmentPlan] } }
            ]
          }))
        })
      }
      return Promise.reject(response)
    }) 
    .then((response) => {
      return response
    })
}

export function fetchSingleInstallmentPlan (webshopId: string, amount: number, opts: object = {}) {
  if (amount === undefined || amount === null || (typeof amount === 'number' && Number.isNaN(amount))) {
    return Promise.reject(new Error('amount is required for installment plans'))
  }
  let url = getApiUrl('/api/ratenrechner/v3/webshop/{{webshopId}}/installmentplans')
    .replace('{{webshopId}}', encodeWebshopId(webshopId))

  const options = getOptions({
    method: 'POST',
    body: JSON.stringify({
      "articles": [{
        "identifier": "single",
        "price": amount,
        ...opts
      }]
    })
  })
  return fetch(url, options)
    .then((response) => {
      if (response.ok) {
      return response.json()
      }
      return Promise.reject(response)
    })
    .then((response) => {
      return response
    })
}

var webshopInfoLoader: Loader;

// Stencil's hydrate runtime re-executes component code for every render and
// rebinds the identifier `globalThis` to the mock window inside hydrateFactory.
// Function('return globalThis') escapes that scope and returns the real host
// global (Node, GraalJS, and other embedders), which survives across renders.
const SERVER_WEBSHOP_INFO_KEY = '__easycreditWebshopInfo';
const SERVER_WEBSHOP_INFO_TTL_MS = 60 * 60 * 1000;
const SERVER_WEBSHOP_INFO_NEGATIVE_TTL_MS = 30 * 1000;

const SERVER_INSTALLMENT_PLANS_KEY = '__easycreditInstallmentPlans';
const INSTALLMENT_PLANS_CACHE_MS = 10 * 1000;
const INSTALLMENT_PLANS_NEGATIVE_TTL_MS = 5 * 1000;

const SERVER_CACHE_SWEEP_KEY = '__easycreditCacheSweep';
const WEBSHOP_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

interface ServerCacheEntry {
  storedAt: number;
  data?: string;
  pending?: Promise<any>;
  negative?: boolean;
  error?: string;
  ttlMs?: number;
}

type ServerGlobal = {
  setInterval?: (callback: () => void, delay: number) => { unref?: () => void };
  [SERVER_WEBSHOP_INFO_KEY]?: Map<string, ServerCacheEntry>;
  [SERVER_INSTALLMENT_PLANS_KEY]?: Map<string, ServerCacheEntry>;
  [SERVER_CACHE_SWEEP_KEY]?: { unref?: () => void };
};

function serverGlobal(): ServerGlobal | null {
  if (!Build.isServer) {
    return null;
  }
  try {
    const root = Function('return globalThis')() as ServerGlobal | null;
    if (!root || typeof root !== 'object') {
      return null;
    }
    return root;
  } catch {
    return null;
  }
}

function encodeWebshopId(webshopId: string | string[]): string {
  // Loader.batchLoader passes missingIds as string[]; a single id is a string.
  const raw = Array.isArray(webshopId) ? webshopId[0] : webshopId;
  const id = typeof raw === 'string' ? raw.trim() : '';
  if (!WEBSHOP_ID_PATTERN.test(id)) {
    throw new Error('invalid webshop id');
  }
  return encodeURIComponent(id);
}

function pruneExpired(cache: Map<string, ServerCacheEntry>, defaultTtlMs: number) {
  const now = Date.now();
  cache.forEach((entry, key) => {
    const ttlMs = entry.ttlMs ?? defaultTtlMs;
    if (now - entry.storedAt >= ttlMs) {
      cache.delete(key);
    }
  });
}

function ensureServerCacheSweep() {
  const root = serverGlobal();
  if (!root || typeof root.setInterval !== 'function') {
    return;
  }
  if (root[SERVER_CACHE_SWEEP_KEY]) {
    return;
  }
  // Use the host timer from the real globalThis, not the mock window timer.
  const timer = root.setInterval(() => {
    const webshops = root[SERVER_WEBSHOP_INFO_KEY];
    if (webshops) {
      pruneExpired(webshops, SERVER_WEBSHOP_INFO_TTL_MS);
    }
    const plans = root[SERVER_INSTALLMENT_PLANS_KEY];
    if (plans) {
      pruneExpired(plans, INSTALLMENT_PLANS_CACHE_MS);
    }
  }, INSTALLMENT_PLANS_CACHE_MS) as { unref?: () => void };
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
  root[SERVER_CACHE_SWEEP_KEY] = timer;
}

function serverWebshopInfoCache(): Map<string, ServerCacheEntry> | null {
  const root = serverGlobal();
  if (!root) {
    return null;
  }
  if (!root[SERVER_WEBSHOP_INFO_KEY]) {
    root[SERVER_WEBSHOP_INFO_KEY] = new Map();
  }
  pruneExpired(root[SERVER_WEBSHOP_INFO_KEY], SERVER_WEBSHOP_INFO_TTL_MS);
  ensureServerCacheSweep();
  return root[SERVER_WEBSHOP_INFO_KEY];
}

function readServerCacheEntry(cache: Map<string, ServerCacheEntry> | null, key: string): any | Promise<any> | undefined {
  if (!cache || !key) {
    return undefined;
  }
  const entry = cache.get(key);
  if (!entry) {
    return undefined;
  }
  if (entry.pending) {
    return entry.pending;
  }
  if (entry.negative) {
    return Promise.reject(new Error(entry.error || 'cached failure'));
  }
  if (typeof entry.data === 'string') {
    return JSON.parse(entry.data);
  }
  return undefined;
}

function rememberNegative(
  cache: Map<string, ServerCacheEntry> | null,
  key: string,
  pending: Promise<any>,
  error: unknown,
  ttlMs: number,
) {
  if (!cache || !key) {
    return;
  }
  const current = cache.get(key);
  if (current && current.pending === pending) {
    cache.set(key, {
      storedAt: Date.now(),
      negative: true,
      error: error instanceof Error ? error.message : String(error),
      ttlMs,
    });
  }
}

function readServerWebshopInfo(webshopId: string): any | Promise<any> | undefined {
  return readServerCacheEntry(serverWebshopInfoCache(), webshopId);
}

async function loadWebshopInfo(webshopId: string, cacheKey: string) {
  if (webshopInfoLoader == null) {
    const webshopInfoStore: { [key: string]: any } = {};
    webshopInfoLoader = new Loader(fetchWebshopInfo, webshopInfoStore);
  }
  const result = await webshopInfoLoader.load(webshopId);
  setToCache(cacheKey, result);
  return result;
}

export async function getWebshopInfo(webshopId: string) {
  const cacheKey = `easycredit-webshop-info-${webshopId}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const remembered = readServerWebshopInfo(webshopId);
  if (remembered !== undefined) {
    return remembered;
  }

  const cache = serverWebshopInfoCache();
  const pending = loadWebshopInfo(webshopId, cacheKey);
  if (cache && webshopId) {
    cache.set(webshopId, { storedAt: Date.now(), pending });
  }

  try {
    const result = await pending;
    if (cache && webshopId && result && typeof result === 'object') {
      cache.set(webshopId, {
        storedAt: Date.now(),
        data: JSON.stringify(result),
      });
    } else if (cache && webshopId) {
      const current = cache.get(webshopId);
      if (current && current.pending === pending) {
        cache.delete(webshopId);
      }
    }
    return result;
  } catch (error) {
    rememberNegative(cache, webshopId, pending, error, SERVER_WEBSHOP_INFO_NEGATIVE_TTL_MS);
    throw error;
  }
}

export function fetchWebshopInfo (webshopId: string | string[]) {
  const id = Array.isArray(webshopId) ? webshopId[0] : webshopId
  const url = getApiUrl('/api/payment/v3/webshop/{{webshopId}}')
    .replace('{{webshopId}}', encodeWebshopId(id))
  return fetch(url, getOptions({})).then(async (response) => {
    if (response.ok) {
      const data = await response.json()
      return {
        [id]: data,
      }
    }
    return Promise.reject(new Error(`Webshop info HTTP ${response.status}`))
  })
}

export const validateInstallmentPlans = (data: any): InstallmentPlans => {
    if (!data || !data.installmentPlans) {
      throw new Error('Invalid installment plans data');
    }
    const installmentPlans: InstallmentPlans = data.installmentPlans.find(() => true)
    if (installmentPlans.errors) {
      let alert = installmentPlans.errors.violations?.find(() => true)?.message || 'Unknown error';
      if (installmentPlans.errors.title === 'INVALID_PRICE') {
        alert = `Der Finanzierungbetrag liegt außerhalb der zulässigen Beträge (${data.minFinancingAmount} € - ${data.maxFinancingAmount} €)`
      }
      throw new Error(alert)
    }
    return installmentPlans
}

function serverInstallmentPlansCache(): Map<string, ServerCacheEntry> | null {
  const root = serverGlobal();
  if (!root) {
    return null;
  }
  if (!root[SERVER_INSTALLMENT_PLANS_KEY]) {
    root[SERVER_INSTALLMENT_PLANS_KEY] = new Map();
  }
  pruneExpired(root[SERVER_INSTALLMENT_PLANS_KEY], INSTALLMENT_PLANS_CACHE_MS);
  ensureServerCacheSweep();
  return root[SERVER_INSTALLMENT_PLANS_KEY];
}

function installmentPlansCacheKey(webshopId: string, amount: number, opts: object): string {
  return webshopId + '\0' + String(amount) + '\0' + (opts ? JSON.stringify(opts) : '');
}

function readServerInstallmentPlans(key: string): any | Promise<any> | undefined {
  return readServerCacheEntry(serverInstallmentPlansCache(), key);
}

export async function fetchInstallmentPlans(webshopId: string, amount: number, opts: object = {}): Promise<InstallmentPlansContainer> {
  if (amount === undefined || amount === null || (typeof amount === 'number' && Number.isNaN(amount))) {
    return Promise.reject(new Error('amount is required for installment plans'))
  }

  const cacheKey = installmentPlansCacheKey(webshopId, amount, opts);
  const remembered = readServerInstallmentPlans(cacheKey);
  if (remembered !== undefined) {
    return remembered;
  }

  const fetchPlans = (opts) ?
      fetchSingleInstallmentPlan.bind(this, webshopId, amount, opts) :
      fetchMultiInstallmentPlans.bind(this, webshopId, amount)

  const cache = serverInstallmentPlansCache();
  const pending = fetchPlans();
  if (cache) {
    cache.set(cacheKey, { storedAt: Date.now(), pending });
  }

  try {
    const result = await pending;
    if (cache && result && typeof result === 'object') {
      cache.set(cacheKey, {
        storedAt: Date.now(),
        data: JSON.stringify(result),
      });
    } else if (cache) {
      const current = cache.get(cacheKey);
      if (current && current.pending === pending) {
        cache.delete(cacheKey);
      }
    }
    return result;
  } catch (error) {
    rememberNegative(cache, cacheKey, pending, error, INSTALLMENT_PLANS_NEGATIVE_TTL_MS);
    throw error;
  }
}

export function getPersistentOptions (data) {
  let options;
  try {
    options = JSON.parse(window.localStorage.getItem('easycredit-components'))
  } catch (e) {}

  if (Object.prototype.toString.call(options) !== '[object Object]') {
    options = {}
  }

  if (data.webshopId) {
    options.webshopId = data.webshopId
  }
  if (data.variant) {
    options.variant = data.variant;
  }
  if (!options.id) {
    options.id = Math.random().toString(16).slice(2)
  }
  window.localStorage.setItem('easycredit-components', JSON.stringify(options))
  return options
}

export async function sendFeedback (_callee, feedback) {
  if (!Build.isBrowser) {
    return false
  }
  let options = getOptions({
    method: 'POST',
    body: JSON.stringify({
      amount: _callee.amount,
      page_title: document.title,
      url: window.location.href,
      ...getPersistentOptions(_callee),
      ...feedback,
    })
  });
  return fetch(getApiUrl('/api/webcomponents/v3/feedback'), options).then((response) => {
    if (response.ok) {
     return true
    }
    return Promise.reject(response)
  })
}

function getApiUrl (path) {
  return getConfig().apiBaseUrl + path;
}

const defaultConfig = {
  request_config: {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Webcomponents-User-Agent' : 'EasyCreditWebComponents/2.0.0'
    }
  },
  apiBaseUrl: 'https://ratenkauf.easycredit.de',
  endpoints: {
    list: 'https://partner.easycredit-ratenkauf.de/api/merchant/v3/transaction?tId={transactionId}',
    get: 'https://partner.easycredit-ratenkauf.de/api/merchant/v3/transaction/{transactionId}',
    capture: 'https://partner.easycredit-ratenkauf.de/api/merchant/v3/transaction/{transactionId}/capture',
    refund: 'https://partner.easycredit-ratenkauf.de/api/merchant/v3/transaction/{transactionId}/refund'
  }
}

function getConfig () {
  if (window && typeof (window as any).ratenkaufbyeasycreditOrderManagementConfig !== 'undefined') {
    return (window as any).ratenkaufbyeasycreditOrderManagementConfig
  }
  if (window && typeof (window as any).easycreditRatenkaufWebComponentsConfig !== 'undefined') {
    return (window as any).easycreditRatenkaufWebComponentsConfig
  }
  return defaultConfig
}

function getOptions (opts) {
  return {
    ...getConfig().request_config,
    ...opts
  }
}

export async function fetchSingleTransaction (txId: string) {
  if (txId === '') {
    return Promise.reject()
  }
  let url = getConfig().endpoints.get.replace('{transactionId}', txId)
  return fetch(url, getOptions({
    method: 'GET' 
  }))
  .then((response) => {
      if (response.ok) { 
        return response.json()
      }
      return Promise.reject(response)
    }) 
    .then((response) => {
      return response
    })
}

var transactionLoader: Loader

const fetchTransactions = async (txIds: Array<Number>) => {
  let url = getConfig().endpoints.list.replace('{transactionId}', txIds.join(','))
  return fetch(url, getOptions({
    method: 'GET'
  }))
  .then((response) => {
    if (response.ok) {
      return response.json().then((json) => {
        return Object.fromEntries(json.TransactionList.map(tx => [tx.transactionId, tx]))
      })
    }
    return Promise.reject(response)
  })
  .then((response) => {
    return response
  })
}

export async function fetchTransaction (txId: string, reload: Boolean = false) {
  if (txId === '') {
    return Promise.reject()
  }

  if (typeof getConfig().endpoints.list !== 'undefined') {
    if (transactionLoader == null) {
      var transactionsStore: {[key: string]: any} = []
      transactionLoader = new Loader(fetchTransactions, transactionsStore)
    }
    if (reload) {
      transactionLoader.remove(txId)
    }
    return transactionLoader.load(txId)
  }
  return fetchSingleTransaction(txId) // legacy behavior
}

export async function captureTransaction (txId: string, data) {
  let url = getConfig().endpoints.capture.replace('{transactionId}', txId)
  return fetch(url, getOptions({
    method: 'POST', 
    body: JSON.stringify(data)
  }))
  .then((response) => {
    if (response.ok) { 
      return true
    }
    return Promise.reject(response)
  })
}

export async function refundTransaction (txId: string, data) {
  let url = getConfig().endpoints.refund.replace('{transactionId}', txId)
  return fetch(url, getOptions({
    method: 'POST', 
    body: JSON.stringify(data)
  }))
  .then((response) => {
    if (response.ok) { 
      return true
    }
    return Promise.reject(response)
  })
}

export function youngerThanOneDay (date: string): boolean {
  const oneDay = 24 * 60 * 60 * 1000 // in ms
  const parsed = Date.parse(date)
  return !isNaN(parsed) && parsed > (Date.now() - oneDay)
}

const defaultBaseUrl = 'https://ratenkauf.easycredit.de/api/resource/webcomponents/v3'

function getConfiguredBaseUrl () {
  return window && typeof (window as any).easycreditRatenkaufWebComponentsBaseUrl == 'string' ?
  (window as any).easycreditRatenkaufWebComponentsBaseUrl :
  null
}

function getDocumentSrc () {
  // @ts-ignore
  var isIE = window.document.documentMode ? true : false;
  if (isIE) {
    return
  }

  let currentScript = (document.currentScript as HTMLScriptElement);
  if (typeof currentScript !== 'undefined' && currentScript !== null) {
    return currentScript.src
  }

  let metaUri = import.meta;
  return metaUri.url
}

function getBaseUrl (): URL {
  var baseUrl = defaultBaseUrl
  if (getDocumentSrc()) {
    baseUrl = getDocumentSrc()
  }
  return new URL(baseUrl)
}

export function getAssetUrl (file: String) {
  if (getConfiguredBaseUrl()) {
      return getConfiguredBaseUrl() + file
  }
  if (new URL(defaultBaseUrl).origin === getBaseUrl().origin) {
    return defaultBaseUrl + file
  }

  return getBaseUrl().origin + file
}

export function applyAssetsUrl (component) {

  const baseUrl = getBaseUrl()
  const defaultUrl = new URL(defaultBaseUrl)
  if (defaultUrl.origin === baseUrl.origin) {
    return
  }

  const replacement = (getConfiguredBaseUrl()) ? getConfiguredBaseUrl() : baseUrl.origin
  const styleVal = (component as any).style
  if (typeof styleVal !== 'string') {
    return
  }
  const updated = styleVal.split(defaultUrl.href).join(replacement)
  if (updated === styleVal) {
    return
  }

  try {
    (component as any).style = updated
  } catch {
    try {
      Object.defineProperty(component, 'style', {
        value: updated,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    } catch {
      /* Stencil / hydrate may expose style as getter-only; skip URL rewrite */
    }
  }
}
