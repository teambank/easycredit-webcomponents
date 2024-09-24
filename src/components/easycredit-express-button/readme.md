# easycredit-express-button-set



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type      | Default     |
| -------------- | --------------- | ----------- | --------- | ----------- |
| `amount`       | `amount`        |             | `number`  | `undefined` |
| `fullWidth`    | `full-width`    |             | `boolean` | `false`     |
| `paymentTypes` | `payment-types` |             | `string`  | `undefined` |
| `redirectUrl`  | `redirect-url`  |             | `string`  | `undefined` |
| `webshopId`    | `webshop-id`    |             | `string`  | `undefined` |


## Dependencies

### Depends on

- [easycredit-modal](../easycredit-modal)
- [easycredit-logo](../easycredit-logo)
- [easycredit-checkout-installments](../easycredit-checkout-installments)
- [easycredit-checkout-bill-payment-timeline](../easycredit-checkout-bill-payment-timeline)
- [easycredit-checkout-totals](../easycredit-checkout-totals)
- [easycredit-checkout-privacy-approval](../easycredit-checkout-privacy-approval)
- [easycredit-express-button-single](../easycredit-express-button-single)
- [easycredit-infopage](../easycredit-infopage)

### Graph
```mermaid
graph TD;
  easycredit-express-button --> easycredit-modal
  easycredit-express-button --> easycredit-logo
  easycredit-express-button --> easycredit-checkout-installments
  easycredit-express-button --> easycredit-checkout-bill-payment-timeline
  easycredit-express-button --> easycredit-checkout-totals
  easycredit-express-button --> easycredit-checkout-privacy-approval
  easycredit-express-button --> easycredit-express-button-single
  easycredit-express-button --> easycredit-infopage
  easycredit-infopage --> easycredit-faq
  easycredit-faq --> easycredit-accordion
  easycredit-faq --> easycredit-accordion-item
  style easycredit-express-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
