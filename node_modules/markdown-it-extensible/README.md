Warning: Identity file /Users/marco/.ssh/id_rsa not accessible: No such file or directory.
# markdown-it-extensible (v1.1.0)

A highly extensible, zero-code block container and inline directive syntax engine for [`markdown-it`](https://github.com/markdown-it/markdown-it).

`markdown-it-extensible` allows developers and end-users to create, modify, or extend custom Markdown syntax elements—such as custom styled callout boxes (`::: warning-box [Title]`) or inline highlights (`:mark[Text]`)—purely via JavaScript options, JSON configuration, or CSS classes, without writing custom Regex parsers or modifying plugin source code.

---

## Motivation & Architecture

While static site generators like VitePress offer built-in container support, creating a dedicated `markdown-it` plugin provides significant architectural advantages for complex projects:

1. **Single Source of Truth (Reusability):** By extracting the rendering logic into a standalone plugin, it can be shared across multiple environments—whether it's the main VitePress build, a local standalone QA-Viewer, or automated Node.js test scripts.
2. **Clean Configuration (Separation of Concerns):** Custom markdown blocks often require complex HTML generation and class assignments. Moving this out of `.vitepress/config.js` keeps the site configuration clean and maintainable.
3. **Editor Integration:** A dedicated plugin makes it possible to seamlessly integrate custom syntax into IDEs (e.g., via the bundled VS Code extension) for live previews and syntax highlighting.
4. **Domain Encapsulation:** It cleanly separates domain-specific formatting rules from the rendering engine, ensuring the content remains portable across different static site generators.

---

## Key Features

- 📦 **Dynamic Block Containers (`::: name [Title]`)**: Add or customize custom callouts with optional title headers.
- 🎨 **Dynamic Inline Directives (`:name[Content]`)**: Map custom inline markup to any CSS class or HTML tag (`<strong>`, `<mark>`, `<span>`, etc.).
- 🚀 **File-Based Configuration**: Define custom syntax elements effortlessly via a `markdown-it-extensible.json` file—no JS required.
- 🚀 **File-Based Configuration**: Define custom syntax elements effortlessly via a `markdown-it-extensible.json` file—no JS required.
- 🚀 **Zero-Code CSS Fallback**: Use any `:class-name[Text]` in Markdown—it automatically renders `<span class="class-name">Text</span>` without needing JavaScript registration.
- 📐 **Multi-Level Nesting & Case-Insensitive Matching**: Handles `::::` nesting and case-insensitive container names (`::: Grammar-Box`, `::: GRAMMAR-BOX`).
- 📚 **Built-in Scholarly Syntax**: Native support for Sanskrit Devanagari brackets (`《धर्मः》`), intra-table line breaks (`:br`), and intra-table indents (`:indent`).
- 🔷 **TypeScript First Class Support**: Comes with `index.d.ts` providing full autocomplete, hover docs, and type safety in VS Code and WebStorm.
- 🛠 **Programmatic Syntax Help API**: Exposes `getSyntaxHelp()` so host applications (like Zentauri, Payer, or custom editors) can dynamically render help modals and cheatsheets.

---

## Installation

```bash
npm install markdown-it-extensible
```

---

## Quick Start

```javascript
const MarkdownIt = require('markdown-it');
const extensiblePlugin = require('markdown-it-extensible');

const md = new MarkdownIt({ html: true }).use(extensiblePlugin);

// Render Markdown with default containers and directives
const html = md.render(`
::: grammar-box [Grammatischer Hinweis]
Klassifikation der Vokale und Konsonanten.
:::

Dies ist :sig[Signalrot-Text] und :mark[gelb markierter Text].
`);

console.log(html);
```

---

## How to Extend & Modify Syntax Definitions (Core Feature)

### 1. Adding & Customizing Block Containers (`::: name [Title]`)

Pass a custom array to `blockContainers` when initializing the plugin. Each container maps a Markdown trigger name to a generated HTML CSS class `<div class="{className} custom-block">`.

```javascript
md.use(extensiblePlugin, {
  blockContainers: [
    { name: 'warning-box', className: 'alert-red' },
    { name: 'solution', className: 'solution-card' },
    { name: 'info', className: 'info-box' }
  ]
});
```

#### Markdown Usage:
```markdown
::: warning-box [Achtung!]
Dies ist eine rot hervorgehobene Warnungsbox.
:::
```

#### Rendered HTML:
```html
<div class="alert-red custom-block">
  <div class="md-box__title">Achtung!</div>
  <p>Dies ist eine rot hervorgehobene Warnungsbox.</p>
</div>
```

---

### 2. Adding & Customizing Inline Directives (`:name[Content]`)

Pass a custom array to `inlineDirectives`. You can define the trigger name, the generated CSS class, and the target HTML tag (e.g. `strong`, `mark`, `span`, `em`, `ins`).

```javascript
md.use(extensiblePlugin, {
  inlineDirectives: [
    { name: 'highlight', className: 'marker-green', tag: 'mark' },
    { name: 'danger', className: 'text-red-600', tag: 'strong' },
    { name: 'badge', className: 'pill-badge', tag: 'span' }
  ]
});
```

#### Markdown Usage:
```markdown
Das ist :highlight[grün markierter Text] und ein :badge[v1.0.0] Badge.
```

#### Rendered HTML:
```html
Das ist <mark class="marker-green">grün markierter Text</mark> und ein <span class="pill-badge">v1.0.0</span> Badge.
```

---

### 3. Zero-Code CSS Inline Directives

If a user writes `:any-custom-class[Some Text]` in Markdown without registering it beforehand in JavaScript, `markdown-it-extensible` automatically falls back to rendering:

```html
<span class="any-custom-class">Some Text</span>
```

This allows non-technical users or template designers to introduce new inline styles purely by writing a new class in their CSS stylesheet!

---

### 4. Overriding or Removing Default Syntax Elements

When you pass your own `blockContainers` or `inlineDirectives` array, only the elements explicitly listed in your array are registered. This allows host applications to disable default containers or restrict users to specific allowed syntax blocks.

```javascript
// Only allow 'note-box' and disable all other default containers
md.use(extensiblePlugin, {
  blockContainers: [
    { name: 'note-box', className: 'note-box' }
  ]
});
```

---

## Programmatic Metadata & Syntax Help API

Applications (like desktop editors, web previewers, or documentation generators) can query syntax help programmatically directly from the plugin:

```javascript
const extensiblePlugin = require('markdown-it-extensible');

// Retrieve syntax metadata for Help Modals or Cheatsheets
const help = extensiblePlugin.getSyntaxHelp();
console.log(help.containers);
// [ { syntax: '::: grammar-box [Titel]', description: 'Erstellt den Block-Container .grammar-box' }, ... ]

console.log(help.inline);
// [ { syntax: ':sig[Text]', description: 'Erzeugt <strong class="signalrot">Text</strong>' }, ... ]

// Access default arrays directly
console.log(extensiblePlugin.DEFAULT_BLOCK_CONTAINERS);
console.log(extensiblePlugin.DEFAULT_INLINE_DIRECTIVES);
```

---

## TypeScript & IDE Autocomplete Support

`markdown-it-extensible` includes full TypeScript definitions in `index.d.ts`. When configuring the plugin, your IDE will provide autocomplete for options and parameter descriptions:

```typescript
import MarkdownIt from 'markdown-it';
## Defining Custom Syntax (JSON or JS)

You can define your own containers and inline directives in two ways:

### Method 1: JSON File (Zero-JS)
Simply create a `markdown-it-extensible.json` file in your project's root directory. The plugin will automatically detect and load it.

```json
{
  "blockContainers": [
    { "name": "custom-card", "className": "custom-card-wrapper" }
  ],
  "inlineDirectives": [
    { "name": "warning", "className": "text-red-500", "tag": "strong" }
  ]
}
```

Now you can immediately use `::: custom-card [Title]` and `:warning[Text]` in your Markdown files.

### Method 2: JavaScript Configuration
If you prefer, you can pass options directly when initializing the plugin:

```javascript
import extensiblePlugin, { ScholarlyPluginOptions } from 'markdown-it-extensible';

const options: ScholarlyPluginOptions = {
  injectStyles: true,
  blockContainers: [
    { name: 'custom-card', className: 'custom-card' }
  ]
};

const md = new MarkdownIt().use(extensiblePlugin, options);
```

---

## CSS & Theming Options

### Option A: Automatic CSS Injection (Default)
By default (`injectStyles: true`), the plugin automatically injects its theme CSS into rendered output.

### Option B: Manual CSS Import
If you prefer importing CSS in your frontend bundle (Vite, Next.js, Webpack):

```javascript
// Disable automatic inline injection
md.use(extensiblePlugin, { injectStyles: false });
```

```javascript
// Import CSS in your frontend entry file
import 'markdown-it-extensible/css';
```

---

## Default Built-in Elements Reference

### Block Containers
| Syntax | Rendered Class |
| :--- | :--- |
| `::: grammar-box [Titel]` | `<div class="grammar-box custom-block">` |
| `::: grammar-box2 [Titel]` | `<div class="grammar-box2 custom-block">` |
| `::: important [Titel]` | `<div class="important custom-block">` |
| `::: note-box [Titel]` | `<div class="note-box custom-block">` |
| `::: media` | `<div class="media custom-block">` |
| `::: center` | `<div class="center custom-block">` |
| `::: indent` | `<div class="indent custom-block">` |
| `::: compact` | `<div class="compact custom-block">` |
| `::: metrik-schema` | `<div class="metrik-schema custom-block">` |
| `::: deleteme-box` | `<div class="deleteme-box custom-block">` |
| `::: literatur-box` | `<div class="literatur-box custom-block">` |
| `::: literatur` | `<div class="literatur-box custom-block">` |

### Inline Directives
| Syntax | Rendered HTML |
| :--- | :--- |
| `:sig[Text]` | `<strong class="signalrot">Text</strong>` |
| `:mark[Text]` | `<mark class="marker-yellow">Text</mark>` |
| `《संस्कृतम्》` | `<span class="sanskrit-dev" translate="no" lang="sa">संस्कृतम्</span>` |
| `《धर्मः \|\|》` | `<span class="sanskrit-dev" translate="no" lang="sa">धर्मः ॥</span>` |
| `:br` | `<br>` *(Inside Markdown tables)* |
| `:indent` | `<span class="indent-inline"></span>` *(Inside Markdown tables)* |

---

## Ecosystem & Integrations

`markdown-it-extensible` serves as the single source of truth for:
- **VS Code Extension**: [`extensible-markdown`](./vscode-extension) (Provides live autocomplete snippets in VS Code)
- **Zentauri Desktop Editor**
- **Payer Web Application**

### VitePress Compatibility
If you are using `markdown-it-extensible` alongside **VitePress**, note that VitePress natively supports five standard block containers out of the box without requiring registration in this plugin:
- `::: info` (Blue informational box)
- `::: tip` (Green tip box)
- `::: warning` (Yellow warning box)
- `::: danger` (Red critical box)
- `::: details` (Collapsible `<details>` block)

You can freely mix these VitePress standard containers with your custom `markdown-it-extensible` syntax.

---

## License

[MIT](./LICENSE) © birchville-org
