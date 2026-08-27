const fs = require('fs');
const path = require('path');
const container = require('markdown-it-container');

let cachedCss = '';
try {
  cachedCss = fs.readFileSync(path.join(__dirname, 'theme/payer-theme.css'), 'utf8');
} catch (e) {
  console.warn('markdown-it-extensible: Could not load theme/payer-theme.css', e.message);
}



const DEFAULT_BLOCK_CONTAINERS = [
  { name: 'grammar-box', className: 'grammar-box' },
  { name: 'grammarbox', className: 'grammar-box' },
  { name: 'grammar-box2', className: 'grammar-box2' },
  { name: 'grammarbox2', className: 'grammar-box2' },
  { name: 'media', className: 'media' },
  { name: 'center', className: 'center' },
  { name: 'metrik-schema', className: 'metrik-schema' },
  { name: 'metrikschema', className: 'metrik-schema' },
  { name: 'important', className: 'important' },
  { name: 'deleteme-box', className: 'deleteme-box' },
  { name: 'deletemebox', className: 'deleteme-box' },
  { name: 'literatur-box', className: 'literatur-box' },
  { name: 'literatur', className: 'literatur-box' },
  { name: 'note-box', className: 'note-box' },
  { name: 'notebox', className: 'note-box' },
  { name: 'laut-table', className: 'laut-table' },
  { name: 'lauttable', className: 'laut-table' },
  { name: 'indent', className: 'indent' },
  { name: 'compact', className: 'compact' },
  { name: 'no-header', className: 'no-header' },
  { name: 'noheader', className: 'no-header' },
  { name: 'gaga-box', className: 'gaga-box' }
];

const DEFAULT_INLINE_DIRECTIVES = [
  { name: 'sig', className: 'signalrot', tag: 'strong' },
  { name: 'mark', className: 'marker-yellow', tag: 'mark' }
];

function scholarlyPlugin(md, options = {}) {
  let configFromFile = {};
  try {
    const configPath = path.resolve(process.cwd(), "markdown-it-extensible.json");
    if (fs.existsSync(configPath)) {
      configFromFile = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (e) {
    console.warn('markdown-it-extensible: Invalid config file (markdown-it-extensible.json)', e.message);
  }

  const mergedOptions = Object.assign({}, configFromFile, options);
  options = mergedOptions; // Merge external configuration with provided options

  const injectStyles = options.injectStyles !== false;

  if (injectStyles && cachedCss) {
    md.core.ruler.push('extensible_styles_inject', (state) => {
      if (state.tokens.length > 0 && !state.env.__extensibleStylesInjected) {
        state.env.__extensibleStylesInjected = true;
        const styleToken = new state.Token('html_block', '', 0);
        styleToken.content = `<style>\n${cachedCss}\n</style>\n`;
        state.tokens.unshift(styleToken);
      }
    });
  }

  // 1. Custom Block Containers (dynamically configurable)
  const blockContainers = (options.blockContainers && options.blockContainers.length > 0) 
    ? options.blockContainers 
    : DEFAULT_BLOCK_CONTAINERS;

  blockContainers.forEach(containerOpt => {
    const box = containerOpt.name;
    const cssClass = containerOpt.className;
    const containerRe = new RegExp(`^\\s*${box}(?:\\s*(.*))?$`, 'i');

    md.use(container, box, {
      validate: (params) => params.match(containerRe),
      render: (tokens, idx) => {
        const m = tokens[idx].info.match(containerRe);
        if (tokens[idx].nesting === 1) {
          let titleHtml = '';
          if (m && m[1]) {
            const titleMatch = m[1].match(/^\[([^\]]+)\]/);
            if (titleMatch) {
              titleHtml = `<div class="md-box__title">${titleMatch[1]}</div>\n`;
            }
          }
          return `<div class="${cssClass} custom-block">\n${titleHtml}`;
        } else {
          return `</div>\n`;
        }
      }
    });
  });

  // 2. Fix for markdown-it-attrs tables tbody calculate error with markdown-it-multimd-table (safely handled)
  try {
    md.core.ruler.before('curly_attributes', 'table_meta_fix', (state) => {
      for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i];
        if (token.type === 'tbody_close') {
          token.type = 'tbody_close_temp';
        }
      }
    });

    md.core.ruler.after('curly_attributes', 'table_meta_restore', (state) => {
      for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i];
        if (token.type === 'tbody_close_temp') {
          token.type = 'tbody_close';
        }
      }
    });
  } catch (e) {
    // If curly_attributes rule is not registered in this markdown-it instance, safely skip
  }

  // 3. Dynamic Inline Directives (:sig[...], :mark[...], etc.) & Scholarly syntax (:br, :indent, ⟪Devanagari⟫)
  const inlineDirectives = (options.inlineDirectives && options.inlineDirectives.length > 0)
    ? options.inlineDirectives
    : DEFAULT_INLINE_DIRECTIVES;

  const directiveMap = new Map();
  inlineDirectives.forEach(dir => {
    directiveMap.set(dir.name, {
      className: dir.className || dir.name,
      tag: dir.tag || 'span'
    });
  });

  const scholarlyReTable = /([⟪《][^⟫⟩》]+[⟫⟩》](?:\s*\|\|?)?|(?<!:):[a-zA-Z0-9_-]+\[.*?\]|(?<!:):br|(?<!:):indent)/;
  const scholarlyReNormal = /([⟪《][^⟫⟩》]+[⟫⟩》](?:\s*\|\|?)?|(?<!:):[a-zA-Z0-9_-]+\[.*?\])/;
  const getScholarlyRe = (inTable = false) => inTable ? scholarlyReTable : scholarlyReNormal;

  md.core.ruler.after('linkify', 'scholarly_fixes', (state) => {
    let insideTable = false;

    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === 'table_open') {
        insideTable = true;
      } else if (token.type === 'table_close') {
        insideTable = false;
      }

      if (token.type !== 'inline') continue;

      let newChildren = [];
      token.children?.forEach(child => {
        if (child.type !== 'text') {
          newChildren.push(child);
          return;
        }

        if (!getScholarlyRe(insideTable).test(child.content)) {
          newChildren.push(child);
          return;
        }

        function processContent(content) {
          const parts = content.split(getScholarlyRe(insideTable));
          parts.forEach(part => {
            if (!part) return;

            // Sanskrit brackets: 《...》 or ⟪...⟫
            if (part.match(/^[⟪《].*[⟫⟩》](?:\s*\|\|?)?$/)) {
              let innerText = part.replace(/^[⟪《]|(?:[⟫⟩》](?:\s*\|\|?)?)$/g, '');
              let dandaHtml = '';

              const pipeMatchOutside = part.match(/[⟫⟩》](\s*)(\|\|?)$/);
              if (pipeMatchOutside) {
                const space = pipeMatchOutside[1];
                const pipe = pipeMatchOutside[2];
                const danda = pipe === '||' ? '॥' : '।';
                dandaHtml = `${space}${danda}`;
              } else {
                const pipeMatchInside = innerText.match(/(\s*)(\|\|?)$/);
                if (pipeMatchInside) {
                  const space = pipeMatchInside[1];
                  const pipe = pipeMatchInside[2];
                  const danda = pipe === '||' ? '॥' : '।';
                  dandaHtml = `${space}${danda}`;
                  innerText = innerText.slice(0, -pipeMatchInside[0].length);
                }
              }

              const span = new state.Token('html_inline', '', 0);
              span.content = `<span class="sanskrit-dev" translate="no" lang="sa">${innerText}${dandaHtml}</span>`;
              newChildren.push(span);
            } 
            // Configurable & Zero-Code Inline Directives: :sig[...], :mark[...], :custom[...]
            else if (part.match(/^:[a-zA-Z0-9_-]+\[.*\]$/)) {
              const colonPos = part.indexOf(':');
              const bracketPos = part.indexOf('[');
              const dirName = part.slice(colonPos + 1, bracketPos);
              const innerText = part.slice(bracketPos + 1, -1);

              const config = directiveMap.get(dirName) || { className: dirName, tag: 'span' };
              const tagName = config.tag || 'span';
              const className = config.className || dirName;

              const openTag = new state.Token('html_inline', '', 0);
              openTag.content = `<${tagName} class="${className}">`;
              newChildren.push(openTag);

              processContent(innerText);

              const closeTag = new state.Token('html_inline', '', 0);
              closeTag.content = `</${tagName}>`;
              newChildren.push(closeTag);
            } 
            // Intra-cell line break (table only)
            else if (part === ':br' && insideTable) {
              newChildren.push(new state.Token('hardbreak', 'br', 0));
            } 
            // Intra-cell indent (table only)
            else if (part === ':indent' && insideTable) {
              const span = new state.Token('html_inline', '', 0);
              span.content = '<span class="indent-inline"></span>';
              newChildren.push(span);
            } 
            else {
              const text = new state.Token('text', '', 0);
              text.content = part;
              newChildren.push(text);
            }
          });
        }

        processContent(child.content);
      });
      token.children = newChildren;
    }
  });
}

function getSyntaxHelp() {
  return {
    containers: DEFAULT_BLOCK_CONTAINERS.map(c => ({
      syntax: `::: ${c.name} [Titel]`,
      description: `Erstellt den Block-Container .${c.className}`
    })),
    inline: DEFAULT_INLINE_DIRECTIVES.map(d => ({
      syntax: `:${d.name}[Text]`,
      description: `Erzeugt <${d.tag || 'span'} class="${d.className}">Text</${d.tag || 'span'}>`
    })).concat([
      { syntax: '《Text》', description: 'Sanskrit Devanagari Auszeichnung' },
      { syntax: '《Text ||》', description: 'Sanskrit Devanagari mit Doppeldanda (॥)' },
      { syntax: ':br', description: 'Zeilenumbruch in Tabellenzellen' },
      { syntax: ':indent', description: 'Einrückung in Tabellenzellen' }
    ])
  };
}

scholarlyPlugin.DEFAULT_BLOCK_CONTAINERS = DEFAULT_BLOCK_CONTAINERS;
scholarlyPlugin.DEFAULT_INLINE_DIRECTIVES = DEFAULT_INLINE_DIRECTIVES;
scholarlyPlugin.getSyntaxHelp = getSyntaxHelp;

module.exports = scholarlyPlugin;

