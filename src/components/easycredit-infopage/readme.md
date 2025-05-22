# easycredit-infopage



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type                      | Default     |
| -------------- | --------------- | ----------- | ------------------------- | ----------- |
| `paymentTypes` | `payment-types` |             | `string`                  | `undefined` |
| `variant`      | `variant`       |             | `"default" \| "enhanced"` | `'default'` |


## Dependencies

### Used by

 - [easycredit-express-button](../easycredit-express-button)

### Depends on

- [easycredit-logo](../easycredit-logo)
- [easycredit-faq](../easycredit-faq)

### Graph
```mermaid
graph TD;
  easycredit-infopage --> easycredit-logo
  easycredit-infopage --> easycredit-faq
  easycredit-faq --> easycredit-accordion
  easycredit-faq --> easycredit-accordion-item
  easycredit-express-button --> easycredit-infopage
  style easycredit-infopage fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
