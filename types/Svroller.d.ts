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
}

export default class Svroller extends SvelteComponentTyped<
  SvrollerProps,
  {},
  { default: {} }
> {}
