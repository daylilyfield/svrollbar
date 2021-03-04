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
  visibilityTimeout?: number;
}

export default class Svroller extends SvelteComponentTyped<
  SvrollerProps,
  {},
  { default: {} }
> {}
