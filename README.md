# Markdown-it Extensible Extension

A configurable VS Code extension for dynamically defining and visualizing custom markdown container blocks and inline directives (such as `::: grammar-box`, `:mark[text]`, `:sig[text]`, etc.).

## Features

This extension equips Visual Studio Code with native snippets for custom markdown syntax and allows you to dynamically define new syntax elements via VS Code settings.

### Snippets for Markdown Files

Type the following prefixes into a `.md` file and press `Tab`:

- **`sbox`**: Creates a standard `::: grammar-box` for rules and paradigms.
- **`sbox4`**: Creates a nested `:::: grammar-box` (useful when containing inner `::: indent` blocks).
- **`sindent`**: Creates an `::: indent` block (e.g. for indented examples or sub-vocabularies).
- **`smedia`**: Creates a complete `::: media` block including placeholders for image path and formatted attribution.
- **`sdel`**: Creates a `::: deleteme-box` for hidden metadata or draft notes.
- **`snohead`**: Creates a `::: no-header` container, ideal for hiding empty table headers.
- **`ssig`**: Inserts a `:sig[text]` directive for bright signal red text highlighting.
- **`smark`**: Inserts a `:mark[text]` directive for yellow highlighter marking.
- **`sbr`**: Inserts an in-cell line break replacement (`:br`) without splitting markdown table rows.

## Installation

### Option A: Install VSIX Package
Download or build the `.vsix` file and install it directly:
```bash
code --install-extension markdown-it-extensible-vscode-1.1.0.vsix
```

### Option B: Symlink into VS Code Extensions Directory
```bash
ln -s $(pwd)/vscode-extension ~/.vscode/extensions/markdown-it-extensible-vscode
```

## Customization & Configuration Guide

You can dynamically define new syntax elements, container blocks, and inline directives without modifying the extension source code.

### How to Access and Change Configuration Settings

There are three ways for users to access and modify their syntax settings:

#### Method 1: Via VS Code Settings GUI (Graphical Interface)

1. Open Settings: Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux).
2. Search for **`extensibleMarkdown`** in the top search bar.
3. Edit settings visually:
   - **`Extensible Markdown: Block Containers`**: Click **Add Item** to add custom container blocks (e.g. `warning-box`).
   - **`Extensible Markdown: Inline Directives`**: Click **Add Item** to add custom inline tags (e.g. `badge`).

#### Method 2: Via `settings.json` (JSON Configuration File)

To configure elements via code or share configuration across a project team:

1. Open Command Palette: Press `Cmd + Shift + P` or `Ctrl + Shift + P`.
2. Select settings file:
   - For **Global User Settings**: Choose `Preferences: Open User Settings (JSON)`.
   - For **Project Workspace Settings**: Choose `Preferences: Open Workspace Settings (JSON)` (creates `.vscode/settings.json` in your workspace).
3. Add your custom JSON configuration:
   ```json
   {
     "extensibleMarkdown.blockContainers": [
       { "name": "warning-box", "className": "alert-warning" }
     ],
     "extensibleMarkdown.inlineDirectives": [
       { "name": "badge", "className": "badge-blue", "tag": "span" }
     ]
   }
   ```

#### Method 3: Linking Custom CSS Styles (`markdown.styles`)

To apply custom colors, borders, or dark mode themes to your custom syntax elements:

1. Create a CSS file in your workspace (e.g. `./styles/custom-preview.css`).
2. Write your custom CSS rules:
   ```css
   .alert-warning {
     background-color: #fffbe6;
     border-left: 4px solid #faad14;
     color: #521c00;
     padding: 12px 16px;
   }
   ```
3. Link the CSS file in VS Code settings (`settings.json`):
   ```json
   {
     "markdown.styles": [
       "./styles/custom-preview.css"
     ]
   }
   ```

#### Usage in Markdown Documents:

```markdown
::: warning-box [Important Note]
This is a custom warning box with a title.
:::

::: info-box
This is an info box without a title.
:::
```

#### Renders to the Following HTML:

```html
<div class="alert-warning custom-block">
  <div class="md-box__title">Important Note</div>
  <p>This is a custom warning box with a title.</p>
</div>
```

### 2. Define Custom CSS Styles (Colors, Borders & Themes)

To style custom containers (e.g. `.alert-warning`) in the VS Code Markdown preview, create or edit a custom CSS file:

#### Option A: Include in VS Code Settings (`settings.json`)
Add the path to your custom CSS file in VS Code Markdown preview settings:

```json
"markdown.styles": [
  "./styles/custom-preview.css"
]
```

#### Option B: Write Custom CSS Rules (`custom-preview.css`)

```css
/* Styling for custom container */
.alert-warning {
  background-color: #fffbe6;
  border-left: 4px solid #faad14;
  color: #521c00;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 16px 0;
}

/* Title styling inside container box */
.alert-warning .md-box__title {
  font-weight: 700;
  color: #d48806;
  margin-bottom: 6px;
  font-size: 0.95em;
  text-transform: uppercase;
}

/* Optional: VS Code Dark Mode Support */
.vscode-dark .alert-warning {
  background-color: #2b2111;
  border-left-color: #e6a23c;
  color: #f7d6a5;
}
.vscode-dark .alert-warning .md-box__title {
  color: #f5a06b;
}
```

### 3. Dynamic Config-Driven Editor Autocomplete & Snippets

The extension automatically generates dynamic editor autocomplete snippets for all block containers and inline directives configured in your settings!

- **Block Containers (`extensibleMarkdown.blockContainers`):**
  - Typing `::: <name>` or `s<name>` (e.g. `::: warning-box` or `swarningbox`) automatically suggests:
    ```markdown
    ::: warning-box [Title]
    Selected Text
    :::
    ```
- **Inline Directives (`extensibleMarkdown.inlineDirectives`):**
  - Typing `:<name>` or `s<name>` (e.g. `:badge` or `sbadge`) automatically suggests:
    ```markdown
    :badge[text]
    ```

Static fallback snippets for default elements can also be customized directly in [`snippets/markdown.json`](file:///Volumes/SanDisk1TB/proj/markdown-it-extensible/vscode-extension/snippets/markdown.json).

### 4. Integration of SVG Graphics and Icons

There are two recommended methods for integrating SVG graphics into the VS Code Markdown preview:

#### Option A: Automatic Box Icons via CSS Data-URL (`::before` / `::after`)
Ideal for attaching automatic icons to container boxes (such as the traffic sign icon in `::: important`):

```css
.custom-block.important {
  position: relative;
  padding-left: 4.5rem !important;
}

.custom-block.important::before {
  content: "" !important;
  position: absolute !important;
  left: 1rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 2.8rem !important;
  height: 2.8rem !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpolygon points='50,5 95,90 5,90' fill='%23ee2c30' stroke='%23ee2c30' stroke-width='4' stroke-linejoin='round'/%3E%3Cpolygon points='50,18 85,83 15,83' fill='%23ffffff'/%3E%3Cpath d='M50,32 L50,60' stroke='%23231f20' stroke-width='8' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='72' r='5' fill='%23231f20'/%3E%3C/svg%3E") !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
}
```

> **Important Data-URL Tips:**
> - Replace hex color code `#` symbols with `%23` (`fill='%23ee2c30'`).
> - Always specify explicit `width` and `height` properties on the pseudo-element (`width: 2.8rem; height: 2.8rem;`).

#### Option B: SVG Files inside Markdown Documents (`::: media`)
For embedding vector graphics and technical diagrams directly inside documents:

```markdown
::: media
![System Architecture](./diagrams/architecture.svg)
(Image source: [Details](/licenses))
:::
```

---
*Built according to "The Scholarly Synthesis" standards.*
