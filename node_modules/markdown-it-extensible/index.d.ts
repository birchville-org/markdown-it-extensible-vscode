
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
 * Configuration options for container nesting normalization.
 */
export interface ContainerNestingOptions {
  /**
   * Set or iterable of container names (case-insensitive) to recognize as openers.
   * If omitted, default registered containers and standard callout containers are recognized.
   * Pass null to recognize any valid container name.
   */
  names?: Iterable<string> | null;

  /**
   * Whether to append missing closing fences at the end of the document.
   * @default false
   */
  closeUnclosed?: boolean;
}

/**
 * Result returned by adjustContainerNesting()
 */
export interface ContainerNestingResult {
  /** The normalized Markdown source with adjusted colon counts */
  repaired: string;
  /** Whether any opening or closing fences were updated */
  didRepair: boolean;
  /** Number of container blocks adjusted */
  adjustedCount: number;
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
   * Automatically normalizes container colon counts for nested blocks before parsing,
   * ensuring outer containers always have strictly more colons than inner containers.
   * Set to `false` to disable automatic nesting normalization, or provide options.
   * @default true
   */
  autoNesting?: boolean | ContainerNestingOptions;

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
 * Adjusts container colons according to hierarchy depth.
 * Outer containers are rewritten to use strictly more colons than any container nested inside them.
 */
export function adjustContainerNesting(
  src: string,
  options?: ContainerNestingOptions
): ContainerNestingResult;

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

  /**
   * Adjusts container colons according to hierarchy depth.
   */
  export function adjustContainerNesting(
    src: string,
    options?: ContainerNestingOptions
  ): ContainerNestingResult;
}

export default scholarlyPlugin;
