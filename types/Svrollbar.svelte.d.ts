/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface SvrollbarProps {
  /**
   * the 1viewport` is a scrolling host element.
   * @default undefined
   */
  viewport?: Element;

  /**
   * the `contents` is an area scrolled by host element.
   * @default undefined
   */
  contents?: Element;

  /**
   * @default 1000
   */
  hideAfter?: number;

  /**
   * @default false
   */
  alwaysVisible?: boolean;

  /**
   * @default false
   */
  initiallyVisible?: boolean;

  /**
   * @default (node) => fade(node, { duration: 100 })
   */
  vTrackIn?: (
    node: HTMLElement,
    params: any
  ) => import("svelte/transition").TransitionConfig;

  /**
   * @default (node) => fade(node, { duration: 300 })
   */
  vTrackOut?: (
    node: HTMLElement,
    params: any
  ) => import("svelte/transition").TransitionConfig;

  /**
   * @default (node) => fade(node, { duration: 100 })
   */
  vThumbIn?: (
    node: HTMLElement,
    params: any
  ) => import("svelte/transition").TransitionConfig;

  /**
   * @default (node) => fade(node, { duration: 300 })
   */
  vThumbOut?: (
    node: HTMLElement,
    params: any
  ) => import("svelte/transition").TransitionConfig;
}

export default class Svrollbar extends SvelteComponentTyped<
  SvrollbarProps,
  { show: CustomEvent<any>; hide: CustomEvent<any> },
  {}
> {}
