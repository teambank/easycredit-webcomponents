import { Loader } from './loader'
import { InstallmentPlans, InstallmentPlansContainer } from '../types'
import { getFromCache, setToCache } from './cache'

export function addErrorHandler(component, callback): number {
  let time = 10

  const timeout: number = window.setTimeout(() => {
    console.error('No event handler handled the submit event of <easycredit-checkout> within ' + time + ' seconds. Please check the integration.')
    sendFeedback(component, { component: 'EasycreditCheckout', action: 'error' })

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
  if (installmentsLoader == null) {
    var installmentsStore: {[key: number]: any} = []
    installmentsLoader = new Loader(fetchAllInstallmentPlans.bind(this, webshopId), installmentsStore)
  }
  return installmentsLoader.load(amount.toString())
}

export function fetchAllInstallmentPlans (webshopId: string, amounts: number[]) {
  let url = getApiUrl('/api/ratenrechner/v3/webshop/{{webshopId}}/installmentplans')
    .replace('{{webshopId}}', webshopId)

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
  let url = getApiUrl('/api/ratenrechner/v3/webshop/{{webshopId}}/installmentplans')
    .replace('{{webshopId}}', webshopId)

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

export async function getWebshopInfo(webshopId: string) {
  const cacheKey = `easycredit-webshop-info-${webshopId}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  if (webshopInfoLoader == null) {
    var webshopInfoStore: { [key: string]: any } = {};
    webshopInfoLoader = new Loader(fetchWebshopInfo, webshopInfoStore);
  }
  const result = await webshopInfoLoader.load(webshopId);

  setToCache(cacheKey, result);
  return result;
}

export function fetchWebshopInfo (webshopId: string) {
  const url = getApiUrl('/api/payment/v3/webshop/{{webshopId}}')
    .replace('{{webshopId}}', webshopId)
  return fetch(url, getOptions({})).then((response) => {
    if (response.ok) { 
     return {
      [webshopId]: response.json()
     }
    }
    return Promise.reject(response); 
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

export async function fetchInstallmentPlans(webshopId: string, amount: number, opts: object = {}): Promise<InstallmentPlansContainer> {

  const fetchPlans = (opts) ?
      fetchSingleInstallmentPlan.bind(this, webshopId, amount, opts) :
      fetchMultiInstallmentPlans.bind(this, webshopId, amount)

    return await fetchPlans()
}

function getPersistentOptions (data) {
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
  if (!options.id) {
    options.id = Math.random().toString(16).slice(2)
  }
  window.localStorage.setItem('easycredit-components', JSON.stringify(options))
  return options
}

export async function sendFeedback (_callee, feedback) {
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

  (component as any).style = (component as any)
    .style
    .split(defaultUrl.href)
    .join((getConfiguredBaseUrl()) ? getConfiguredBaseUrl() : baseUrl.origin)
}
