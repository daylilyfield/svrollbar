/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface SvrollbarProps {
  viewport?: HTMLElement;

  contents?: HTMLElement;
}

export default class Svrollbar extends SvelteComponentTyped<
  SvrollbarProps,
  {},
  {}
> {}
