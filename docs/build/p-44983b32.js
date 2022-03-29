import { B as BUILD, c as consoleDevInfo, p as plt, w as win, H, d as doc, N as NAMESPACE, a as promiseResolve, b as bootstrapLazy } from './index-4f89a2f1.js';
import { g as globalScripts } from './app-globals-0f993ce5.js';

/*
 Stencil Client Patch Browser v2.12.1 | MIT Licensed | https://stenciljs.com
 */
const getDynamicImportFunction = (namespace) => `__sc_import_${namespace.replace(/\s|-/g, '_')}`;
const patchBrowser = () => {
    // NOTE!! This fn cannot use async/await!
    if (BUILD.isDev && !BUILD.isTesting) {
        consoleDevInfo('Running in development mode.');
    }
    if (BUILD.cssVarShim) {
        // shim css vars
        plt.$cssShim$ = win.__cssshim;
    }
    if (BUILD.cloneNodeFix) {
        // opted-in to polyfill cloneNode() for slot polyfilled components
        patchCloneNodeFix(H.prototype);
    }
    if (BUILD.profile && !performance.mark) {
        // not all browsers support performance.mark/measure (Safari 10)
        performance.mark = performance.measure = () => {
            /*noop*/
        };
        performance.getEntriesByName = () => [];
    }
    // @ts-ignore
    const scriptElm = BUILD.scriptDataOpts || BUILD.safari10 || BUILD.dynamicImportShim
        ? Array.from(doc.querySelectorAll('script')).find((s) => new RegExp(`\/${NAMESPACE}(\\.esm)?\\.js($|\\?|#)`).test(s.src) ||
            s.getAttribute('data-stencil-namespace') === NAMESPACE)
        : null;
    const importMeta = "";
    const opts = BUILD.scriptDataOpts ? scriptElm['data-opts'] || {} : {};
    if (BUILD.safari10 && 'onbeforeload' in scriptElm && !history.scrollRestoration /* IS_ESM_BUILD */) {
        // Safari < v11 support: This IF is true if it's Safari below v11.
        // This fn cannot use async/await since Safari didn't support it until v11,
        // however, Safari 10 did support modules. Safari 10 also didn't support "nomodule",
        // so both the ESM file and nomodule file would get downloaded. Only Safari
        // has 'onbeforeload' in the script, and "history.scrollRestoration" was added
        // to Safari in v11. Return a noop then() so the async/await ESM code doesn't continue.
        // IS_ESM_BUILD is replaced at build time so this check doesn't happen in systemjs builds.
        return {
            then() {
                /* promise noop */
            },
        };
    }
    if (!BUILD.safari10 && importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    else if (BUILD.dynamicImportShim || BUILD.safari10) {
        opts.resourcesUrl = new URL('.', new URL(scriptElm.getAttribute('data-resources-url') || scriptElm.src, win.location.href)).href;
        if (BUILD.dynamicImportShim) {
            patchDynamicImport(opts.resourcesUrl, scriptElm);
        }
        if (BUILD.dynamicImportShim && !win.customElements) {
            // module support, but no custom elements support (Old Edge)
            // @ts-ignore
            return __sc_import_easycredit_components(/* webpackChunkName: "polyfills-dom" */ './dom-ba83fb9d.js').then(() => opts);
        }
    }
    return promiseResolve(opts);
};
const patchDynamicImport = (base, orgScriptElm) => {
    const importFunctionName = getDynamicImportFunction(NAMESPACE);
    try {
        // test if this browser supports dynamic imports
        // There is a caching issue in V8, that breaks using import() in Function
        // By generating a random string, we can workaround it
        // Check https://bugs.chromium.org/p/chromium/issues/detail?id=990810 for more info
        win[importFunctionName] = new Function('w', `return import(w);//${Math.random()}`);
    }
    catch (e) {
        // this shim is specifically for browsers that do support "esm" imports
        // however, they do NOT support "dynamic" imports
        // basically this code is for old Edge, v18 and below
        const moduleMap = new Map();
        win[importFunctionName] = (src) => {
            const url = new URL(src, base).href;
            let mod = moduleMap.get(url);
            if (!mod) {
                const script = doc.createElement('script');
                script.type = 'module';
                script.crossOrigin = orgScriptElm.crossOrigin;
                script.src = URL.createObjectURL(new Blob([`import * as m from '${url}'; window.${importFunctionName}.m = m;`], {
                    type: 'application/javascript',
                }));
                mod = new Promise((resolve) => {
                    script.onload = () => {
                        resolve(win[importFunctionName].m);
                        script.remove();
                    };
                });
                moduleMap.set(url, mod);
                doc.head.appendChild(script);
            }
            return mod;
        };
    }
};
const patchCloneNodeFix = (HTMLElementPrototype) => {
    const nativeCloneNodeFn = HTMLElementPrototype.cloneNode;
    HTMLElementPrototype.cloneNode = function (deep) {
        if (this.nodeName === 'TEMPLATE') {
            return nativeCloneNodeFn.call(this, deep);
        }
        const clonedNode = nativeCloneNodeFn.call(this, false);
        const srcChildNodes = this.childNodes;
        if (deep) {
            for (let i = 0; i < srcChildNodes.length; i++) {
                // Node.ATTRIBUTE_NODE === 2, and checking because IE11
                if (srcChildNodes[i].nodeType !== 2) {
                    clonedNode.appendChild(srcChildNodes[i].cloneNode(true));
                }
            }
        }
        return clonedNode;
    };
};

patchBrowser().then(options => {
  globalScripts();
  return bootstrapLazy([["easycredit-infopage",[[1,"easycredit-infopage"]]],["easycredit-checkout",[[1,"easycredit-checkout",{"isActive":[4,"is-active"],"amount":[2],"webshopId":[1,"webshop-id"],"alert":[1],"paymentPlan":[1,"payment-plan"],"askForPrefix":[4,"ask-for-prefix"],"privacyApprovalForm":[32],"privacyCheckboxChecked":[32],"totals":[32],"installments":[32],"selectedInstallment":[32],"example":[32],"submitDisabled":[32]},[[0,"selectedInstallment","selectedInstallmentHandler"]]]]],["easycredit-merchant-manager",[[1,"easycredit-merchant-manager",{"txId":[1,"tx-id"],"date":[1025],"tx":[32],"loading":[32],"status":[32],"submitDisabled":[32],"alert":[32],"progressItems":[32],"trackingNumber":[32],"amount":[32]}]]],["easycredit-widget",[[1,"easycredit-widget",{"webshopId":[1,"webshop-id"],"amount":[2],"installments":[32],"isValid":[32]}]]],["easycredit-base",[[1,"easycredit-base"]]],["easycredit-box-flash",[[1,"easycredit-box-flash",{"src":[1],"isOpen":[4,"is-open"],"toggle":[64]}]]],["easycredit-box-listing",[[1,"easycredit-box-listing",{"src":[1],"isOpen":[32],"toggle":[64]}]]],["easycredit-box-modal",[[1,"easycredit-box-modal",{"src":[1025],"snoozeFor":[1026,"snooze-for"],"delay":[1026],"isOpen":[1028,"is-open"],"toggle":[64]}]]],["easycredit-box-top",[[1,"easycredit-box-top",{"slideIndex":[32],"isScrolled":[32]}]]],["easycredit-checkout-label",[[1,"easycredit-checkout-label",{"label":[1025],"slogan":[1025]}]]],["easycredit-accordion",[[1,"easycredit-accordion",{"open":[64],"close":[64]},[[0,"openEvent","openEventHandler"]]]]],["easycredit-accordion-item",[[1,"easycredit-accordion-item",{"index":[1538],"open":[1540],"mutationObserverConfig":[16],"transitioning":[32],"closeItem":[64],"openItem":[64]},[[0,"contentChanged","recalculateHeight"]]]]],["easycredit-faq",[[1,"easycredit-faq"]]],["easycredit-checkout-installments",[[0,"easycredit-checkout-installments",{"showMoreButtonText":[1025,"show-more-button-text"],"installments":[8],"rows":[2],"collapsed":[32],"collapsing":[32],"_installments":[32],"selectedInstallmentValue":[32]},[[0,"selectedInstallment","selectedInstallmentHandler"]]]]],["easycredit-merchant-status-widget",[[1,"easycredit-merchant-status-widget",{"txId":[1,"tx-id"],"date":[1],"isManager":[4,"is-manager"],"tx":[32],"loading":[32]}]]],["easycredit-modal",[[4,"easycredit-modal",{"loading":[4],"loadingMessage":[1,"loading-message"],"show":[4],"isOpen":[1028,"is-open"],"close":[64],"open":[64],"toggle":[64]}]]]], options);
});
