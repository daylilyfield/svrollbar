/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface SvrollbarProps {
  viewport?: HTMLElement;

  contents?: HTMLElement;

  /**
   * @default 1000
   */
  visibilityTimeout?: number;
}

export default class Svrollbar extends SvelteComponentTyped<
  SvrollbarProps,
  {},
  {}
> {}
