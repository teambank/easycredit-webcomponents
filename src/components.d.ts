/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface EasycreditAccordion {
        /**
          * close an accordion item
          * @param index
         */
        "close": (index: number) => Promise<void>;
        /**
          * Open an accordion item
          * @param index
         */
        "open": (index: number) => Promise<void>;
    }
    interface EasycreditAccordionItem {
        /**
          * close the accordion item
         */
        "closeItem": () => Promise<void>;
        /**
          * index of accordion item from top to bottom
         */
        "index": number;
        /**
          * The mutation observer config to listen for content changes in the accordion item
         */
        "mutationObserverConfig": { childList: boolean; subtree: boolean; };
        /**
          * accordion item is open or opening (css transition)
         */
        "open": boolean;
        /**
          * open the accordion item
         */
        "openItem": () => Promise<void>;
    }
    interface EasycreditBase {
    }
    interface EasycreditBoxFlash {
        "isOpen": boolean;
        "src": string;
        "toggle": () => Promise<void>;
    }
    interface EasycreditBoxListing {
        "src": string;
        "toggle": () => Promise<void>;
    }
    interface EasycreditBoxModal {
        "delay": number;
        "isOpen": boolean;
        "snoozeFor": number;
        "src": string;
        "toggle": () => Promise<void>;
    }
    interface EasycreditBoxTop {
    }
    interface EasycreditCheckout {
        "alert": string;
        "amount": number;
        "isActive": boolean;
        "paymentPlan": string;
        "webshopId": string;
    }
    interface EasycreditCheckoutInstallments {
        "installments": any;
        "rows": number;
        "showMoreButtonText": string;
    }
    interface EasycreditCheckoutLabel {
        "label": string;
        "slogan": string;
    }
    interface EasycreditExpressButton {
        "bgBlue": boolean;
        "fullWidth": boolean;
        "link": string;
    }
    interface EasycreditFaq {
    }
    interface EasycreditInfopage {
    }
    interface EasycreditLogo {
        "alt": string;
    }
    interface EasycreditMerchantManager {
        "date": string;
        "txId": string;
    }
    interface EasycreditMerchantStatusWidget {
        "date": string;
        "isManager": boolean;
        "txId": string;
    }
    interface EasycreditModal {
        "close": () => Promise<void>;
        "isOpen": boolean;
        "loading": boolean;
        "loadingMessage": string;
        "open": () => Promise<void>;
        "show": boolean;
        "toggle": () => Promise<void>;
    }
    interface EasycreditWidget {
        /**
          * Financing Amount
         */
        "amount": number;
        /**
          * Webshop Id
         */
        "webshopId": string;
    }
}
export interface EasycreditAccordionItemCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLEasycreditAccordionItemElement;
}
export interface EasycreditCheckoutInstallmentsCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLEasycreditCheckoutInstallmentsElement;
}
export interface EasycreditModalCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLEasycreditModalElement;
}
declare global {
    interface HTMLEasycreditAccordionElement extends Components.EasycreditAccordion, HTMLStencilElement {
    }
    var HTMLEasycreditAccordionElement: {
        prototype: HTMLEasycreditAccordionElement;
        new (): HTMLEasycreditAccordionElement;
    };
    interface HTMLEasycreditAccordionItemElement extends Components.EasycreditAccordionItem, HTMLStencilElement {
    }
    var HTMLEasycreditAccordionItemElement: {
        prototype: HTMLEasycreditAccordionItemElement;
        new (): HTMLEasycreditAccordionItemElement;
    };
    interface HTMLEasycreditBaseElement extends Components.EasycreditBase, HTMLStencilElement {
    }
    var HTMLEasycreditBaseElement: {
        prototype: HTMLEasycreditBaseElement;
        new (): HTMLEasycreditBaseElement;
    };
    interface HTMLEasycreditBoxFlashElement extends Components.EasycreditBoxFlash, HTMLStencilElement {
    }
    var HTMLEasycreditBoxFlashElement: {
        prototype: HTMLEasycreditBoxFlashElement;
        new (): HTMLEasycreditBoxFlashElement;
    };
    interface HTMLEasycreditBoxListingElement extends Components.EasycreditBoxListing, HTMLStencilElement {
    }
    var HTMLEasycreditBoxListingElement: {
        prototype: HTMLEasycreditBoxListingElement;
        new (): HTMLEasycreditBoxListingElement;
    };
    interface HTMLEasycreditBoxModalElement extends Components.EasycreditBoxModal, HTMLStencilElement {
    }
    var HTMLEasycreditBoxModalElement: {
        prototype: HTMLEasycreditBoxModalElement;
        new (): HTMLEasycreditBoxModalElement;
    };
    interface HTMLEasycreditBoxTopElement extends Components.EasycreditBoxTop, HTMLStencilElement {
    }
    var HTMLEasycreditBoxTopElement: {
        prototype: HTMLEasycreditBoxTopElement;
        new (): HTMLEasycreditBoxTopElement;
    };
    interface HTMLEasycreditCheckoutElement extends Components.EasycreditCheckout, HTMLStencilElement {
    }
    var HTMLEasycreditCheckoutElement: {
        prototype: HTMLEasycreditCheckoutElement;
        new (): HTMLEasycreditCheckoutElement;
    };
    interface HTMLEasycreditCheckoutInstallmentsElement extends Components.EasycreditCheckoutInstallments, HTMLStencilElement {
    }
    var HTMLEasycreditCheckoutInstallmentsElement: {
        prototype: HTMLEasycreditCheckoutInstallmentsElement;
        new (): HTMLEasycreditCheckoutInstallmentsElement;
    };
    interface HTMLEasycreditCheckoutLabelElement extends Components.EasycreditCheckoutLabel, HTMLStencilElement {
    }
    var HTMLEasycreditCheckoutLabelElement: {
        prototype: HTMLEasycreditCheckoutLabelElement;
        new (): HTMLEasycreditCheckoutLabelElement;
    };
    interface HTMLEasycreditExpressButtonElement extends Components.EasycreditExpressButton, HTMLStencilElement {
    }
    var HTMLEasycreditExpressButtonElement: {
        prototype: HTMLEasycreditExpressButtonElement;
        new (): HTMLEasycreditExpressButtonElement;
    };
    interface HTMLEasycreditFaqElement extends Components.EasycreditFaq, HTMLStencilElement {
    }
    var HTMLEasycreditFaqElement: {
        prototype: HTMLEasycreditFaqElement;
        new (): HTMLEasycreditFaqElement;
    };
    interface HTMLEasycreditInfopageElement extends Components.EasycreditInfopage, HTMLStencilElement {
    }
    var HTMLEasycreditInfopageElement: {
        prototype: HTMLEasycreditInfopageElement;
        new (): HTMLEasycreditInfopageElement;
    };
    interface HTMLEasycreditLogoElement extends Components.EasycreditLogo, HTMLStencilElement {
    }
    var HTMLEasycreditLogoElement: {
        prototype: HTMLEasycreditLogoElement;
        new (): HTMLEasycreditLogoElement;
    };
    interface HTMLEasycreditMerchantManagerElement extends Components.EasycreditMerchantManager, HTMLStencilElement {
    }
    var HTMLEasycreditMerchantManagerElement: {
        prototype: HTMLEasycreditMerchantManagerElement;
        new (): HTMLEasycreditMerchantManagerElement;
    };
    interface HTMLEasycreditMerchantStatusWidgetElement extends Components.EasycreditMerchantStatusWidget, HTMLStencilElement {
    }
    var HTMLEasycreditMerchantStatusWidgetElement: {
        prototype: HTMLEasycreditMerchantStatusWidgetElement;
        new (): HTMLEasycreditMerchantStatusWidgetElement;
    };
    interface HTMLEasycreditModalElement extends Components.EasycreditModal, HTMLStencilElement {
    }
    var HTMLEasycreditModalElement: {
        prototype: HTMLEasycreditModalElement;
        new (): HTMLEasycreditModalElement;
    };
    interface HTMLEasycreditWidgetElement extends Components.EasycreditWidget, HTMLStencilElement {
    }
    var HTMLEasycreditWidgetElement: {
        prototype: HTMLEasycreditWidgetElement;
        new (): HTMLEasycreditWidgetElement;
    };
    interface HTMLElementTagNameMap {
        "easycredit-accordion": HTMLEasycreditAccordionElement;
        "easycredit-accordion-item": HTMLEasycreditAccordionItemElement;
        "easycredit-base": HTMLEasycreditBaseElement;
        "easycredit-box-flash": HTMLEasycreditBoxFlashElement;
        "easycredit-box-listing": HTMLEasycreditBoxListingElement;
        "easycredit-box-modal": HTMLEasycreditBoxModalElement;
        "easycredit-box-top": HTMLEasycreditBoxTopElement;
        "easycredit-checkout": HTMLEasycreditCheckoutElement;
        "easycredit-checkout-installments": HTMLEasycreditCheckoutInstallmentsElement;
        "easycredit-checkout-label": HTMLEasycreditCheckoutLabelElement;
        "easycredit-express-button": HTMLEasycreditExpressButtonElement;
        "easycredit-faq": HTMLEasycreditFaqElement;
        "easycredit-infopage": HTMLEasycreditInfopageElement;
        "easycredit-logo": HTMLEasycreditLogoElement;
        "easycredit-merchant-manager": HTMLEasycreditMerchantManagerElement;
        "easycredit-merchant-status-widget": HTMLEasycreditMerchantStatusWidgetElement;
        "easycredit-modal": HTMLEasycreditModalElement;
        "easycredit-widget": HTMLEasycreditWidgetElement;
    }
}
declare namespace LocalJSX {
    interface EasycreditAccordion {
    }
    interface EasycreditAccordionItem {
        /**
          * index of accordion item from top to bottom
         */
        "index"?: number;
        /**
          * The mutation observer config to listen for content changes in the accordion item
         */
        "mutationObserverConfig"?: { childList: boolean; subtree: boolean; };
        /**
          * triggered when the content of the accordion item changes
         */
        "onContentChanged"?: (event: EasycreditAccordionItemCustomEvent<any>) => void;
        /**
          * triggered when the accordion item is opened
         */
        "onOpenEvent"?: (event: EasycreditAccordionItemCustomEvent<any>) => void;
        /**
          * accordion item is open or opening (css transition)
         */
        "open"?: boolean;
    }
    interface EasycreditBase {
    }
    interface EasycreditBoxFlash {
        "isOpen"?: boolean;
        "src"?: string;
    }
    interface EasycreditBoxListing {
        "src"?: string;
    }
    interface EasycreditBoxModal {
        "delay"?: number;
        "isOpen"?: boolean;
        "snoozeFor"?: number;
        "src"?: string;
    }
    interface EasycreditBoxTop {
    }
    interface EasycreditCheckout {
        "alert"?: string;
        "amount"?: number;
        "isActive"?: boolean;
        "paymentPlan"?: string;
        "webshopId"?: string;
    }
    interface EasycreditCheckoutInstallments {
        "installments"?: any;
        "onSelectedInstallment"?: (event: EasycreditCheckoutInstallmentsCustomEvent<string>) => void;
        "rows"?: number;
        "showMoreButtonText"?: string;
    }
    interface EasycreditCheckoutLabel {
        "label"?: string;
        "slogan"?: string;
    }
    interface EasycreditExpressButton {
        "bgBlue"?: boolean;
        "fullWidth"?: boolean;
        "link"?: string;
    }
    interface EasycreditFaq {
    }
    interface EasycreditInfopage {
    }
    interface EasycreditLogo {
        "alt"?: string;
    }
    interface EasycreditMerchantManager {
        "date"?: string;
        "txId"?: string;
    }
    interface EasycreditMerchantStatusWidget {
        "date"?: string;
        "isManager"?: boolean;
        "txId"?: string;
    }
    interface EasycreditModal {
        "isOpen"?: boolean;
        "loading"?: boolean;
        "loadingMessage"?: string;
        "onModalClosed"?: (event: EasycreditModalCustomEvent<any>) => void;
        "onModalOpened"?: (event: EasycreditModalCustomEvent<any>) => void;
        "show"?: boolean;
    }
    interface EasycreditWidget {
        /**
          * Financing Amount
         */
        "amount"?: number;
        /**
          * Webshop Id
         */
        "webshopId"?: string;
    }
    interface IntrinsicElements {
        "easycredit-accordion": EasycreditAccordion;
        "easycredit-accordion-item": EasycreditAccordionItem;
        "easycredit-base": EasycreditBase;
        "easycredit-box-flash": EasycreditBoxFlash;
        "easycredit-box-listing": EasycreditBoxListing;
        "easycredit-box-modal": EasycreditBoxModal;
        "easycredit-box-top": EasycreditBoxTop;
        "easycredit-checkout": EasycreditCheckout;
        "easycredit-checkout-installments": EasycreditCheckoutInstallments;
        "easycredit-checkout-label": EasycreditCheckoutLabel;
        "easycredit-express-button": EasycreditExpressButton;
        "easycredit-faq": EasycreditFaq;
        "easycredit-infopage": EasycreditInfopage;
        "easycredit-logo": EasycreditLogo;
        "easycredit-merchant-manager": EasycreditMerchantManager;
        "easycredit-merchant-status-widget": EasycreditMerchantStatusWidget;
        "easycredit-modal": EasycreditModal;
        "easycredit-widget": EasycreditWidget;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "easycredit-accordion": LocalJSX.EasycreditAccordion & JSXBase.HTMLAttributes<HTMLEasycreditAccordionElement>;
            "easycredit-accordion-item": LocalJSX.EasycreditAccordionItem & JSXBase.HTMLAttributes<HTMLEasycreditAccordionItemElement>;
            "easycredit-base": LocalJSX.EasycreditBase & JSXBase.HTMLAttributes<HTMLEasycreditBaseElement>;
            "easycredit-box-flash": LocalJSX.EasycreditBoxFlash & JSXBase.HTMLAttributes<HTMLEasycreditBoxFlashElement>;
            "easycredit-box-listing": LocalJSX.EasycreditBoxListing & JSXBase.HTMLAttributes<HTMLEasycreditBoxListingElement>;
            "easycredit-box-modal": LocalJSX.EasycreditBoxModal & JSXBase.HTMLAttributes<HTMLEasycreditBoxModalElement>;
            "easycredit-box-top": LocalJSX.EasycreditBoxTop & JSXBase.HTMLAttributes<HTMLEasycreditBoxTopElement>;
            "easycredit-checkout": LocalJSX.EasycreditCheckout & JSXBase.HTMLAttributes<HTMLEasycreditCheckoutElement>;
            "easycredit-checkout-installments": LocalJSX.EasycreditCheckoutInstallments & JSXBase.HTMLAttributes<HTMLEasycreditCheckoutInstallmentsElement>;
            "easycredit-checkout-label": LocalJSX.EasycreditCheckoutLabel & JSXBase.HTMLAttributes<HTMLEasycreditCheckoutLabelElement>;
            "easycredit-express-button": LocalJSX.EasycreditExpressButton & JSXBase.HTMLAttributes<HTMLEasycreditExpressButtonElement>;
            "easycredit-faq": LocalJSX.EasycreditFaq & JSXBase.HTMLAttributes<HTMLEasycreditFaqElement>;
            "easycredit-infopage": LocalJSX.EasycreditInfopage & JSXBase.HTMLAttributes<HTMLEasycreditInfopageElement>;
            "easycredit-logo": LocalJSX.EasycreditLogo & JSXBase.HTMLAttributes<HTMLEasycreditLogoElement>;
            "easycredit-merchant-manager": LocalJSX.EasycreditMerchantManager & JSXBase.HTMLAttributes<HTMLEasycreditMerchantManagerElement>;
            "easycredit-merchant-status-widget": LocalJSX.EasycreditMerchantStatusWidget & JSXBase.HTMLAttributes<HTMLEasycreditMerchantStatusWidgetElement>;
            "easycredit-modal": LocalJSX.EasycreditModal & JSXBase.HTMLAttributes<HTMLEasycreditModalElement>;
            "easycredit-widget": LocalJSX.EasycreditWidget & JSXBase.HTMLAttributes<HTMLEasycreditWidgetElement>;
        }
    }
}
