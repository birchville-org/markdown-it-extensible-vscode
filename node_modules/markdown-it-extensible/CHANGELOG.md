# Changelog — markdown-it-extensible

All notable changes to `markdown-it-extensible` will be documented in this file.

---

## [1.3.1] - 2026-10-10

### Sicherheit & Sandbox
- **RegExp-Injection-Schutz:** Escape dynamischer Containernamen via `escapeRegex()` in `index.js`, um ReDoS und unerwünschte Regex-Injektionen in der Validierungs-Regel zu verhindern.
- **XSS-Härtung (Sanskrit Markup):** Sanskrit-Klammerparser (`《...》`) ersetzt rohe HTML-Injektion (`html_inline`) durch Markdown-It Token-Streaming (`span_open`, `text`, `span_close`), wodurch injizierter HTML-Code sicher escaped wird.

### Datenintegrität & Kernfunktionen
- **Code-Fence Regex Trap Behoben:** `nesting.js` Matcher für Codefences (`CODE_FENCE_REGEX`) korrigiert, sodass einzeilige Inline-Codeblöcke mit Backticks nicht mehr versehentlich bis zum nächsten Codeblock das gesamte Dokument verschlucken.
- **Verschachtelte Klammern in Inline-Direktiven:** `:[name][...]` unterstützt nun verschachtelte eckige Klammern im Inhalt (`\[(?:[^\[\]]|\[[^\[\]]*\])*\]`).

### Plattform- & Backend-Stabilität
- **TypeScript Typ-Korrektur:** Veralteten und in Markdown-It v14/v15 nicht mehr existenten Import `PluginWithParams` aus `index.d.ts` entfernt und durch saubere Funktions- und Export-Deklarationen ersetzt.
- **Repository-URL Normalisierung:** Format in `package.json` bereinigt.

### Dokumentation
- **VitePress Dokumentation:** Integrierte Benutzer- und Entwicklerdokumentation im `docs/`-Verzeichnis nach dem Birchville „Scholarly Synthesis“ Standard (Warmes Elfenbein, Midnight Navy, Frosted Glass, Wappen-Integration).
- **GitHub Pages CI/CD:** Automatisierter Deployment-Workflow für Dokumentation via GitHub Actions (`.github/workflows/deploy-docs.yml`).

---

## [1.3.0] - 2026-10-03

### Added
- **Container Nesting Normalization (`nesting.js`):** Standalone module with `adjustContainerNesting()` function that automatically rewrites Markdown sources so that outer container fences always have strictly more colons than any container nested inside them. Prevents premature container closure in `markdown-it-container`.
- **Core Rule `container_nesting` (`autoNesting`):** Integrated automatic core rule in `index.js` executing before `normalize` (or before `block`). Enabled by default via `options.autoNesting: true`, with support for custom options (`names`, `closeUnclosed`) or disabling via `options.autoNesting: false`.
- **TypeScript Definitions:** Added `ContainerNestingOptions`, `ContainerNestingResult`, `autoNesting` plugin option, and `adjustContainerNesting` function signatures to `index.d.ts`.
- **Package Export (`markdown-it-extensible/nesting`):** Direct export of `adjustContainerNesting` via package entry point.

### Fixed
- **Container Margin Stacking:** Suppressed `margin-top` on `:first-child` and `margin-bottom` on `:last-child` for all `.custom-block` containers to prevent unnecessary vertical gaps when titles are omitted.
- **Empty Title and Paragraph Suppression:** Suppressed display and margins for empty titles (`.md-box__title:empty`, `.custom-block-title:empty`) and whitespace-only paragraphs (`p:empty`) inside containers.
- **Nested Container Spacing:** Normalized margins/paddings when containers such as `center`, `no-header`, and `indent` are nested inside parent containers.

---

## [1.2.2] - 2026-09-19

### Fixed
- **Container Prefix Collision:** Sorted block containers longest-first and fixed container validation regex to prevent prefix containers (e.g. `grammar-box`) from falsely matching and shadowing more specific containers (e.g. `grammar-box2`).

---

## [1.1.0] - 2026-07-25

### Added
- **Dynamic Configurable Inline Directives (`inlineDirectives`):** Introduced full dynamic configuration for inline syntax `:<name>[<content>]`. Pass array definitions in `options.inlineDirectives` to register custom tags and classNames without editing JavaScript parser code.
- **Native Yellow Highlighter (`:mark[...]`):** Added pre-configured `:mark[Text]` directive rendering `<mark class="marker-yellow">Text</mark>`.
- **Zero-Code Inline Fallback:** Any unregistered inline directive `:<name>[Text]` automatically renders `<span class="<name>">Text</span>`, allowing new inline styles to be added purely by writing CSS.

### Changed
- Refactored `index.js` scholarly inline regex to dynamically match any valid `:[a-zA-Z0-9_-]+[...]` directive while preserving backward compatibility with `:sig[...]`, `:br`, `:indent`, and Sanskrit `《...》`.
- Updated `package.json` version to `1.1.0`.
