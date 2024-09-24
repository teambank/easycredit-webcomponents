# easycredit-checkout-installments



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute               | Description | Type     | Default                      |
| -------------------- | ----------------------- | ----------- | -------- | ---------------------------- |
| `installments`       | `installments`          |             | `any`    | `undefined`                  |
| `rows`               | `rows`                  |             | `number` | `5`                          |
| `showMoreButtonText` | `show-more-button-text` |             | `string` | `'Weitere Raten anzeigen +'` |


## Events

| Event                 | Description | Type                  |
| --------------------- | ----------- | --------------------- |
| `selectedInstallment` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [easycredit-checkout](../easycredit-checkout)
 - [easycredit-express-button](../easycredit-express-button)

### Graph
```mermaid
graph TD;
  easycredit-checkout --> easycredit-checkout-installments
  easycredit-express-button --> easycredit-checkout-installments
  style easycredit-checkout-installments fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
