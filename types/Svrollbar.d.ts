/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface SvrollbarProps {
  viewport?: HTMLElement;

  contents?: HTMLElement;

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

export default class Svrollbar extends SvelteComponentTyped<
  SvrollbarProps,
  { show: CustomEvent<any>; hide: CustomEvent<any> },
  {}
> {}
