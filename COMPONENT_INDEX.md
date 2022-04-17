# Component Index

## Components

- [`Svrollbar`](#svrollbar)
- [`Svroller`](#svroller)

---

## `Svrollbar`

### Props

| Prop name        | Kind             | Reactive | Type                                                                                          | Default value                                        | Description                                                                                                                                                                        |
| :--------------- | :--------------- | :------- | :-------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contents         | <code>let</code> | Yes      | <code>Element</code>                                                                          | <code>undefined</code>                               | the area scrolled by host element.                                                                                                                                                 |
| viewport         | <code>let</code> | Yes      | <code>Element</code>                                                                          | <code>undefined</code>                               | the scrolling host element.                                                                                                                                                        |
| hideAfter        | <code>let</code> | No       | <code>number</code>                                                                           | <code>1000</code>                                    | milliseconds to keep scrollbar visible.                                                                                                                                            |
| alwaysVisible    | <code>let</code> | No       | <code>boolean</code>                                                                          | <code>false</code>                                   | make scrollbar always visible if the content is scrollable.                                                                                                                        |
| initiallyVisible | <code>let</code> | No       | <code>boolean</code>                                                                          | <code>false</code>                                   | make scrollbar initially visible if the content is scrollable.<br /><br />after you interact with your scrollable contents, scrollbar fallback to the default visibility behavior. |
| margin           | <code>let</code> | No       | <code>{ top?: number, right?: number, buttom?: number, left?: number }</code>                 | <code>{}</code>                                      | margin (px) from viewport top, right, bottom and left.                                                                                                                             |
| vTrackIn         | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | svelte transition to show track in.                                                                                                                                                |
| vTrackOut        | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | svelte transition to hide track out.                                                                                                                                               |
| vThumbIn         | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | svelte transition to show thumb in.                                                                                                                                                |
| vThumbOut        | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | svelte transition to hide thumb out.                                                                                                                                               |

### Slots

None.

### Events

| Event name | Type       | Detail |
| :--------- | :--------- | :----- |
| show       | dispatched | --     |
| hide       | dispatched | --     |

## `Svroller`

### Props

| Prop name        | Kind             | Reactive | Type                                                                                          | Default value                                        | Description                                            |
| :--------------- | :--------------- | :------- | :-------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| width            | <code>let</code> | No       | <code>string</code>                                                                           | <code>'10rem'</code>                                 | --                                                     |
| height           | <code>let</code> | No       | <code>string</code>                                                                           | <code>'10rem'</code>                                 | --                                                     |
| hideAfter        | <code>let</code> | No       | <code>number</code>                                                                           | <code>1000</code>                                    | --                                                     |
| alwaysVisible    | <code>let</code> | No       | <code>boolean</code>                                                                          | <code>false</code>                                   | --                                                     |
| initiallyVisible | <code>let</code> | No       | <code>boolean</code>                                                                          | <code>false</code>                                   | --                                                     |
| margin           | <code>let</code> | No       | <code>{ top?: number, right?: number, buttom?: number, left?: number }</code>                 | <code>{}</code>                                      | margin (px) from viewport top, right, bottom and left. |
| vTrackIn         | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --                                                     |
| vTrackOut        | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --                                                     |
| vThumbIn         | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 100 })</code> | --                                                     |
| vThumbOut        | <code>let</code> | No       | <code>(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig</code> | <code>(node) => fade(node, { duration: 300 })</code> | --                                                     |

### Slots

| Slot name | Default | Props | Fallback |
| :-------- | :------ | :---- | :------- |
| --        | Yes     | --    | --       |

### Events

| Event name | Type      | Detail |
| :--------- | :-------- | :----- |
| show       | forwarded | --     |
| hide       | forwarded | --     |
