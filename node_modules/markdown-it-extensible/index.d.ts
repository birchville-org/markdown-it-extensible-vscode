import type { PluginWithParams } from 'markdown-it';

/**
 * Configuration option for a custom block container (::: containerName [Title])
 */
export interface BlockContainerOption {
  /**
   * The container trigger name used after triple colons (e.g., 'grammar-box' for ::: grammar-box)
   */
  name: string;

  /**
   * The CSS class name assigned to the container wrapper <div class="{className} custom-block">
   */
  className: string;
}

/**
 * Configuration option for a custom inline directive (:directiveName[Content])
 */
export interface InlineDirectiveOption {
  /**
   * The inline directive trigger name used after a colon (e.g., 'sig' for :sig[Text])
   */
  name: string;

  /**
   * The CSS class name applied to the generated element. Defaults to the directive name if omitted.
   */
  className?: string;

  /**
   * The HTML tag name generated for this directive (e.g., 'strong', 'mark', 'span'). Defaults to 'span'.
   */
  tag?: string;
}

/**
 * Options for the markdown-it-extensible plugin
 */
export interface ScholarlyPluginOptions {
  /**
   * Whether to inject the default Scholarly CSS stylesheet automatically into rendered output.
   * Set to `false` if you import CSS manually (e.g., `import 'markdown-it-extensible/css'`).
   * @default true
   */
  injectStyles?: boolean;

  /**
   * Custom list of block containers. Overrides or extends default containers.
   * @example
   * ```js
   * blockContainers: [
   *   { name: 'warning-box', className: 'alert-red' },
   *   { name: 'solution', className: 'solution-card' }
   * ]
   * ```
   */
  blockContainers?: BlockContainerOption[];

  /**
   * Custom list of inline directives. Overrides or extends default inline directives.
   * @example
   * ```js
   * inlineDirectives: [
   *   { name: 'badge', className: 'badge-blue', tag: 'span' },
   *   { name: 'alert', className: 'text-red', tag: 'strong' }
   * ]
   * ```
   */
  inlineDirectives?: InlineDirectiveOption[];
}

/**
 * Description item returned by getSyntaxHelp()
 */
export interface SyntaxHelpItem {
  syntax: string;
  description: string;
}

/**
 * Syntax help structure for host applications
 */
export interface SyntaxHelp {
  containers: SyntaxHelpItem[];
  inline: SyntaxHelpItem[];
}

/**
 * Extensible block container and inline directive plugin for markdown-it.
 */
declare function scholarlyPlugin(md: any, options?: ScholarlyPluginOptions): void;

declare namespace scholarlyPlugin {
  /** Default block container configurations */
  export const DEFAULT_BLOCK_CONTAINERS: BlockContainerOption[];

  /** Default inline directive configurations */
  export const DEFAULT_INLINE_DIRECTIVES: InlineDirectiveOption[];

  /**
   * Helper function returning human-readable syntax documentation for host applications
   */
  export function getSyntaxHelp(): SyntaxHelp;
}

export default scholarlyPlugin;
