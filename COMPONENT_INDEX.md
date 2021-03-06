# Component Index

## Components

- [`Svrollbar`](#svrollbar)
- [`Svroller`](#svroller)

---

## `Svrollbar`

### Props

| Prop name     | Kind             | Reactive | Type                                                                     | Default value                                        | Description |
| :------------ | :--------------- | :------- | :----------------------------------------------------------------------- | ---------------------------------------------------- | ----------- |
| viewport      | <code>let</code> | No       | <code>HTMLElement</code>                                                 | --                                                   | --          |
| contents      | <code>let</code> | No       | <code>HTMLElement</code>                                                 | --                                                   | --          |
| hideAfter     | <code>let</code> | No       | <code>number</code>                                                      | <code>1000</code>                                    | --          |
| transitionIn  | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => svelte.TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --          |
| transitionOut | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => svelte.TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --          |

### Slots

None.

### Events

| Event name | Type       | Detail |
| :--------- | :--------- | :----- |
| show       | dispatched | --     |
| hide       | dispatched | --     |

## `Svroller`

### Props

| Prop name     | Kind             | Reactive | Type                                                                     | Default value                                        | Description |
| :------------ | :--------------- | :------- | :----------------------------------------------------------------------- | ---------------------------------------------------- | ----------- |
| width         | <code>let</code> | No       | <code>string</code>                                                      | <code>'10rem'</code>                                 | --          |
| height        | <code>let</code> | No       | <code>string</code>                                                      | <code>'10rem'</code>                                 | --          |
| hideAfter     | <code>let</code> | No       | <code>number</code>                                                      | <code>1000</code>                                    | --          |
| transitionIn  | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => svelte.TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --          |
| transitionOut | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => svelte.TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --          |

### Slots

| Slot name | Default | Props | Fallback |
| :-------- | :------ | :---- | :------- |
| --        | Yes     | --    | --       |

### Events

| Event name | Type      | Detail |
| :--------- | :-------- | :----- |
| show       | forwarded | --     |
| hide       | forwarded | --     |