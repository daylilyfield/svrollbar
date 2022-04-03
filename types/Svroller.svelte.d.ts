/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface SvrollerProps {
  /**
   * @default '10rem'
   */
  width?: string;

  /**
   * @default '10rem'
   */
  height?: string;

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

export default class Svroller extends SvelteComponentTyped<
  SvrollerProps,
  { show: WindowEventMap["show"]; hide: WindowEventMap["hide"] },
  { default: {} }
> {}
