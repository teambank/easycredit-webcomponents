# easycredit-modal



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description | Type      | Default        |
| ---------------- | ----------------- | ----------- | --------- | -------------- |
| `isOpen`         | `is-open`         |             | `boolean` | `false`        |
| `loading`        | `loading`         |             | `boolean` | `false`        |
| `loadingMessage` | `loading-message` |             | `string`  | `'Loading...'` |
| `show`           | `show`            |             | `boolean` | `undefined`    |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `modalClosed` |             | `CustomEvent<any>` |
| `modalOpened` |             | `CustomEvent<any>` |


## Methods

### `close() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `open() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `toggle() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [easycredit-checkout](../easycredit-checkout)
 - [easycredit-widget](../easycredit-widget)

### Graph
```mermaid
graph TD;
  easycredit-checkout --> easycredit-modal
  easycredit-widget --> easycredit-modal
  style easycredit-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
