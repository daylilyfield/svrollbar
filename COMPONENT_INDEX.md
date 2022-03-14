# Component Index

## Components

- [`Svrollbar`](#svrollbar)
- [`Svroller`](#svroller)

---

## `Svrollbar`

### Props

| Prop name     | Kind             | Reactive | Type                                                                                          | Default value                                        | Description |
| :------------ | :--------------- | :------- | :-------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------- |
| contents      | <code>let</code> | Yes      | <code>Element</code>                                                                          | <code>undefined</code>                               | --          |
| viewport      | <code>let</code> | Yes      | <code>Element</code>                                                                          | <code>undefined</code>                               | --          |
| hideAfter     | <code>let</code> | No       | <code>number</code>                                                                           | <code>1000</code>                                    | --          |
| alwaysVisible | <code>let</code> | No       | <code>boolean</code>                                                                          | <code>false</code>                                   | --          |
| vTrackIn      | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --          |
| vTrackOut     | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --          |
| vThumbIn      | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --          |
| vThumbOut     | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --          |

### Slots

None.

### Events

| Event name | Type       | Detail |
| :--------- | :--------- | :----- |
| show       | dispatched | --     |
| hide       | dispatched | --     |

## `Svroller`

### Props

| Prop name     | Kind             | Reactive | Type                                                                                          | Default value                                        | Description |
| :------------ | :--------------- | :------- | :-------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------- |
| width         | <code>let</code> | No       | <code>string</code>                                                                           | <code>'10rem'</code>                                 | --          |
| height        | <code>let</code> | No       | <code>string</code>                                                                           | <code>'10rem'</code>                                 | --          |
| hideAfter     | <code>let</code> | No       | <code>number</code>                                                                           | <code>1000</code>                                    | --          |
| alwaysVisible | <code>let</code> | No       | <code>boolean</code>                                                                          | <code>false</code>                                   | --          |
| vTrackIn      | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --          |
| vTrackOut     | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --          |
| vThumbIn      | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --          |
| vThumbOut     | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --          |

### Slots

| Slot name | Default | Props | Fallback |
| :-------- | :------ | :---- | :------- |
| --        | Yes     | --    | --       |

### Events

| Event name | Type      | Detail |
| :--------- | :-------- | :----- |
| show       | forwarded | --     |
| hide       | forwarded | --     |
