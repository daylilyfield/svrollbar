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
   * @default (node) => fade(node, { duration: 100 })
   */
  transitionIn?: (node: HTMLElement, params: any) => svelte.TransitionConfig;

  /**
   * @default (node) => fade(node, { duration: 300 })
   */
  transitionOut?: (node: HTMLElement, params: any) => svelte.TransitionConfig;
}

export default class Svroller extends SvelteComponentTyped<
  SvrollerProps,
  { show: WindowEventMap["show"]; hide: WindowEventMap["hide"] },
  { default: {} }
> {}
