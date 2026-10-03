var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/markdown-it-container/index.js
var require_markdown_it_container = __commonJS({
  "node_modules/markdown-it-container/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function container_plugin(md, name, options) {
      function validateDefault(params) {
        return params.trim().split(" ", 2)[0] === name;
      }
      function renderDefault(tokens, idx, _options, env, slf) {
        if (tokens[idx].nesting === 1) {
          tokens[idx].attrJoin("class", name);
        }
        return slf.renderToken(tokens, idx, _options, env, slf);
      }
      options = options || {};
      var min_markers = 3, marker_str = options.marker || ":", marker_char = marker_str.charCodeAt(0), marker_len = marker_str.length, validate = options.validate || validateDefault, render = options.render || renderDefault;
      function container(state, startLine, endLine, silent) {
        var pos, nextLine, marker_count, markup, params, token, old_parent, old_line_max, auto_closed = false, start = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
        if (marker_char !== state.src.charCodeAt(start)) {
          return false;
        }
        for (pos = start + 1; pos <= max; pos++) {
          if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
            break;
          }
        }
        marker_count = Math.floor((pos - start) / marker_len);
        if (marker_count < min_markers) {
          return false;
        }
        pos -= (pos - start) % marker_len;
        markup = state.src.slice(start, pos);
        params = state.src.slice(pos, max);
        if (!validate(params, markup)) {
          return false;
        }
        if (silent) {
          return true;
        }
        nextLine = startLine;
        for (; ; ) {
          nextLine++;
          if (nextLine >= endLine) {
            break;
          }
          start = state.bMarks[nextLine] + state.tShift[nextLine];
          max = state.eMarks[nextLine];
          if (start < max && state.sCount[nextLine] < state.blkIndent) {
            break;
          }
          if (marker_char !== state.src.charCodeAt(start)) {
            continue;
          }
          if (state.sCount[nextLine] - state.blkIndent >= 4) {
            continue;
          }
          for (pos = start + 1; pos <= max; pos++) {
            if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
              break;
            }
          }
          if (Math.floor((pos - start) / marker_len) < marker_count) {
            continue;
          }
          pos -= (pos - start) % marker_len;
          pos = state.skipSpaces(pos);
          if (pos < max) {
            continue;
          }
          auto_closed = true;
          break;
        }
        old_parent = state.parentType;
        old_line_max = state.lineMax;
        state.parentType = "container";
        state.lineMax = nextLine;
        token = state.push("container_" + name + "_open", "div", 1);
        token.markup = markup;
        token.block = true;
        token.info = params;
        token.map = [startLine, nextLine];
        state.md.block.tokenize(state, startLine + 1, nextLine);
        token = state.push("container_" + name + "_close", "div", -1);
        token.markup = state.src.slice(start, pos);
        token.block = true;
        state.parentType = old_parent;
        state.lineMax = old_line_max;
        state.line = nextLine + (auto_closed ? 1 : 0);
        return true;
      }
      md.block.ruler.before("fence", "container_" + name, container, {
        alt: ["paragraph", "reference", "blockquote", "list"]
      });
      md.renderer.rules["container_" + name + "_open"] = render;
      md.renderer.rules["container_" + name + "_close"] = render;
    };
  }
});

// node_modules/markdown-it-extensible/nesting.js
var require_nesting = __commonJS({
  "node_modules/markdown-it-extensible/nesting.js"(exports2, module2) {
    var OPEN_RE = /^([ \t]*)(:{3,})([ \t]*)([a-zA-Z0-9_-]+)(.*)$/;
    var CLOSE_RE = /^([ \t]*)(:{3,})[ \t]*$/;
    var CODE_FENCE_OPEN_RE = /^[ \t]*(`{3,}|~{3,})/;
    var CODE_FENCE_CLOSE_RE = /^[ \t]*(`{3,}|~{3,})[ \t]*$/;
    function adjustContainerNesting(src, options = {}) {
      if (!src || src.indexOf(":::") === -1) {
        return { repaired: src, didRepair: false, adjustedCount: 0 };
      }
      const names = options.names ? new Set(Array.from(options.names, (n) => String(n).toLowerCase())) : null;
      const eol = src.includes("\r\n") ? "\r\n" : "\n";
      const hasTrailingNewline = src.endsWith(eol);
      const rawLines = src.split(eol);
      const lines = hasTrailingNewline && rawLines.length > 0 && rawLines[rawLines.length - 1] === "" ? rawLines.slice(0, -1) : rawLines.slice();
      const stack = [];
      const roots = [];
      const all = [];
      let fenceChar = "";
      let fenceLen = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!fenceChar) {
          const fm = line.match(CODE_FENCE_OPEN_RE);
          if (fm) {
            fenceChar = fm[1][0];
            fenceLen = fm[1].length;
            continue;
          }
        } else {
          const fm = line.match(CODE_FENCE_CLOSE_RE);
          if (fm && fm[1][0] === fenceChar && fm[1].length >= fenceLen) {
            fenceChar = "";
            fenceLen = 0;
            continue;
          }
          continue;
        }
        const om = line.match(OPEN_RE);
        if (om && (!names || names.has(om[4].toLowerCase()))) {
          const block = {
            openLine: i,
            closeLine: null,
            closeColons: 0,
            indent: om[1],
            colons: om[2].length,
            space: om[3] || " ",
            name: om[4],
            rest: om[5],
            closeIndent: om[1],
            target: om[2].length,
            children: []
          };
          if (stack.length) stack[stack.length - 1].children.push(block);
          else roots.push(block);
          stack.push(block);
          all.push(block);
          continue;
        }
        const cm = line.match(CLOSE_RE);
        if (cm && stack.length) {
          const top = stack.pop();
          top.closeLine = i;
          top.closeIndent = cm[1];
          top.closeColons = cm[2].length;
        }
      }
      const compute = (block) => {
        let maxChild = 0;
        for (const child of block.children) {
          maxChild = Math.max(maxChild, compute(child));
        }
        block.target = Math.max(
          block.colons,
          block.children.length ? maxChild + 1 : 3,
          3
        );
        return block.target;
      };
      roots.forEach(compute);
      let didRepair = false;
      let adjustedCount = 0;
      for (const b of all) {
        const openChanged = b.target !== b.colons;
        const closeChanged = b.closeLine !== null && b.closeColons !== b.target;
        if (!openChanged && !closeChanged) continue;
        didRepair = true;
        adjustedCount++;
        const colons = ":".repeat(b.target);
        lines[b.openLine] = `${b.indent}${colons}${b.space}${b.name}${b.rest}`;
        if (b.closeLine !== null) {
          lines[b.closeLine] = `${b.closeIndent}${colons}`;
        }
      }
      if (options.closeUnclosed && stack.length) {
        didRepair = true;
        while (stack.length) {
          const unclosed = stack.pop();
          adjustedCount++;
          lines.push(`${unclosed.indent}${":".repeat(unclosed.target)}`);
        }
      }
      let repaired = lines.join(eol);
      if (hasTrailingNewline) {
        repaired += eol;
      }
      return { repaired, didRepair, adjustedCount };
    }
    module2.exports = { adjustContainerNesting };
  }
});

// node_modules/markdown-it-extensible/index.js
var require_markdown_it_extensible = __commonJS({
  "node_modules/markdown-it-extensible/index.js"(exports2, module2) {
    var fs2 = require("fs");
    var path = require("path");
    var container = require_markdown_it_container();
    var { adjustContainerNesting } = require_nesting();
    var cachedCss = "";
    try {
      cachedCss = fs2.readFileSync(path.join(__dirname, "theme/payer-theme.css"), "utf8");
    } catch (e) {
      console.warn("markdown-it-extensible: Could not load theme/payer-theme.css", e.message);
    }
    var DEFAULT_BLOCK_CONTAINERS = [
      { name: "grammar-box", className: "grammar-box" },
      { name: "grammarbox", className: "grammar-box" },
      { name: "grammar-box2", className: "grammar-box2" },
      { name: "grammarbox2", className: "grammar-box2" },
      { name: "media", className: "media" },
      { name: "center", className: "center" },
      { name: "metrik-schema", className: "metrik-schema" },
      { name: "metrikschema", className: "metrik-schema" },
      { name: "important", className: "important" },
      { name: "deleteme-box", className: "deleteme-box" },
      { name: "deletemebox", className: "deleteme-box" },
      { name: "literatur-box", className: "literatur-box" },
      { name: "literatur", className: "literatur-box" },
      { name: "note-box", className: "note-box" },
      { name: "notebox", className: "note-box" },
      { name: "laut-table", className: "laut-table" },
      { name: "lauttable", className: "laut-table" },
      { name: "indent", className: "indent" },
      { name: "compact", className: "compact" },
      { name: "no-header", className: "no-header" },
      { name: "noheader", className: "no-header" },
      { name: "gaga-box", className: "gaga-box" }
    ];
    var DEFAULT_INLINE_DIRECTIVES = [
      { name: "sig", className: "signalrot", tag: "strong" },
      { name: "mark", className: "marker-yellow", tag: "mark" }
    ];
    function scholarlyPlugin(md, options = {}) {
      let configFromFile = {};
      try {
        const configPath = path.resolve(process.cwd(), "markdown-it-extensible.json");
        if (fs2.existsSync(configPath)) {
          configFromFile = JSON.parse(fs2.readFileSync(configPath, "utf8"));
        }
      } catch (e) {
        console.warn("markdown-it-extensible: Invalid config file (markdown-it-extensible.json)", e.message);
      }
      const mergedOptions = Object.assign({}, configFromFile, options);
      options = mergedOptions;
      const injectStyles = options.injectStyles !== false;
      if (injectStyles && cachedCss) {
        md.core.ruler.push("extensible_styles_inject", (state) => {
          if (state.tokens.length > 0 && !state.env.__extensibleStylesInjected) {
            state.env.__extensibleStylesInjected = true;
            const styleToken = new state.Token("html_block", "", 0);
            styleToken.content = `<style>
${cachedCss}
</style>
`;
            state.tokens.unshift(styleToken);
          }
        });
      }
      const blockContainers = (options.blockContainers && options.blockContainers.length > 0 ? options.blockContainers : DEFAULT_BLOCK_CONTAINERS).slice().sort((a, b) => b.name.length - a.name.length);
      if (options.autoNesting !== false) {
        const nestingOpts = typeof options.autoNesting === "object" && options.autoNesting !== null ? options.autoNesting : {};
        const STANDARD_CONTAINERS = ["tip", "warning", "danger", "details", "info", "note"];
        let containerNames;
        if (nestingOpts.names !== void 0) {
          containerNames = nestingOpts.names ? new Set(Array.from(nestingOpts.names, (n) => String(n).toLowerCase())) : null;
        } else {
          containerNames = /* @__PURE__ */ new Set([
            ...blockContainers.map((c) => c.name.toLowerCase()),
            ...STANDARD_CONTAINERS
          ]);
        }
        const nestingRule = (state) => {
          const res = adjustContainerNesting(state.src, {
            names: containerNames,
            closeUnclosed: nestingOpts.closeUnclosed || false
          });
          if (res.didRepair) {
            state.src = res.repaired;
          }
        };
        try {
          md.core.ruler.before("normalize", "container_nesting", nestingRule);
        } catch (e) {
          try {
            md.core.ruler.before("block", "container_nesting", nestingRule);
          } catch (e2) {
            md.core.ruler.push("container_nesting", nestingRule);
          }
        }
      }
      blockContainers.forEach((containerOpt) => {
        const box = containerOpt.name;
        const cssClass = containerOpt.className;
        const containerRe = new RegExp(`^\\s*${box}(?:\\s+(.*)|(?=\\[)(.*))?$`, "i");
        md.use(container, box, {
          validate: (params) => params.match(containerRe),
          render: (tokens, idx) => {
            const m = tokens[idx].info.match(containerRe);
            if (tokens[idx].nesting === 1) {
              let titleHtml = "";
              const rawTitle = m ? m[1] || m[2] : "";
              if (rawTitle) {
                const titleMatch = rawTitle.match(/^\[([^\]]+)\]/);
                if (titleMatch && titleMatch[1].trim()) {
                  titleHtml = `<div class="md-box__title">${titleMatch[1]}</div>
`;
                }
              }
              return `<div class="${cssClass} custom-block">
${titleHtml}`;
            } else {
              return `</div>
`;
            }
          }
        });
      });
      try {
        md.core.ruler.before("curly_attributes", "table_meta_fix", (state) => {
          for (let i = 0; i < state.tokens.length; i++) {
            const token = state.tokens[i];
            if (token.type === "tbody_close") {
              token.type = "tbody_close_temp";
            }
          }
        });
        md.core.ruler.after("curly_attributes", "table_meta_restore", (state) => {
          for (let i = 0; i < state.tokens.length; i++) {
            const token = state.tokens[i];
            if (token.type === "tbody_close_temp") {
              token.type = "tbody_close";
            }
          }
        });
      } catch (e) {
      }
      const inlineDirectives = options.inlineDirectives && options.inlineDirectives.length > 0 ? options.inlineDirectives : DEFAULT_INLINE_DIRECTIVES;
      const directiveMap = /* @__PURE__ */ new Map();
      inlineDirectives.forEach((dir) => {
        directiveMap.set(dir.name, {
          className: dir.className || dir.name,
          tag: dir.tag || "span"
        });
      });
      const scholarlyReTable = /([⟪《][^⟫⟩》]+[⟫⟩》](?:\s*\|\|?)?|(?<!:):[a-zA-Z0-9_-]+\[.*?\]|(?<!:):br|(?<!:):indent)/;
      const scholarlyReNormal = /([⟪《][^⟫⟩》]+[⟫⟩》](?:\s*\|\|?)?|(?<!:):[a-zA-Z0-9_-]+\[.*?\])/;
      const getScholarlyRe = (inTable = false) => inTable ? scholarlyReTable : scholarlyReNormal;
      md.core.ruler.after("linkify", "scholarly_fixes", (state) => {
        let insideTable = false;
        for (let i = 0; i < state.tokens.length; i++) {
          const token = state.tokens[i];
          if (token.type === "table_open") {
            insideTable = true;
          } else if (token.type === "table_close") {
            insideTable = false;
          }
          if (token.type !== "inline") continue;
          let newChildren = [];
          token.children?.forEach((child) => {
            if (child.type !== "text") {
              newChildren.push(child);
              return;
            }
            if (!getScholarlyRe(insideTable).test(child.content)) {
              newChildren.push(child);
              return;
            }
            function processContent(content) {
              const parts = content.split(getScholarlyRe(insideTable));
              parts.forEach((part) => {
                if (!part) return;
                if (part.match(/^[⟪《].*[⟫⟩》](?:\s*\|\|?)?$/)) {
                  let innerText = part.replace(/^[⟪《]|(?:[⟫⟩》](?:\s*\|\|?)?)$/g, "");
                  let dandaHtml = "";
                  const pipeMatchOutside = part.match(/[⟫⟩》](\s*)(\|\|?)$/);
                  if (pipeMatchOutside) {
                    const space = pipeMatchOutside[1];
                    const pipe = pipeMatchOutside[2];
                    const danda = pipe === "||" ? "\u0965" : "\u0964";
                    dandaHtml = `${space}${danda}`;
                  } else {
                    const pipeMatchInside = innerText.match(/(\s*)(\|\|?)$/);
                    if (pipeMatchInside) {
                      const space = pipeMatchInside[1];
                      const pipe = pipeMatchInside[2];
                      const danda = pipe === "||" ? "\u0965" : "\u0964";
                      dandaHtml = `${space}${danda}`;
                      innerText = innerText.slice(0, -pipeMatchInside[0].length);
                    }
                  }
                  const span = new state.Token("html_inline", "", 0);
                  span.content = `<span class="sanskrit-dev" translate="no" lang="sa">${innerText}${dandaHtml}</span>`;
                  newChildren.push(span);
                } else if (part.match(/^:[a-zA-Z0-9_-]+\[.*\]$/)) {
                  const colonPos = part.indexOf(":");
                  const bracketPos = part.indexOf("[");
                  const dirName = part.slice(colonPos + 1, bracketPos);
                  const innerText = part.slice(bracketPos + 1, -1);
                  const config = directiveMap.get(dirName) || { className: dirName, tag: "span" };
                  const tagName = config.tag || "span";
                  const className = config.className || dirName;
                  const openTag = new state.Token("html_inline", "", 0);
                  openTag.content = `<${tagName} class="${className}">`;
                  newChildren.push(openTag);
                  processContent(innerText);
                  const closeTag = new state.Token("html_inline", "", 0);
                  closeTag.content = `</${tagName}>`;
                  newChildren.push(closeTag);
                } else if (part === ":br" && insideTable) {
                  newChildren.push(new state.Token("hardbreak", "br", 0));
                } else if (part === ":indent" && insideTable) {
                  const span = new state.Token("html_inline", "", 0);
                  span.content = '<span class="indent-inline"></span>';
                  newChildren.push(span);
                } else {
                  const text = new state.Token("text", "", 0);
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
        containers: DEFAULT_BLOCK_CONTAINERS.map((c) => ({
          syntax: `::: ${c.name} [Titel]`,
          description: `Erstellt den Block-Container .${c.className}`
        })),
        inline: DEFAULT_INLINE_DIRECTIVES.map((d) => ({
          syntax: `:${d.name}[Text]`,
          description: `Erzeugt <${d.tag || "span"} class="${d.className}">Text</${d.tag || "span"}>`
        })).concat([
          { syntax: "\u300AText\u300B", description: "Sanskrit Devanagari Auszeichnung" },
          { syntax: "\u300AText ||\u300B", description: "Sanskrit Devanagari mit Doppeldanda (\u0965)" },
          { syntax: ":br", description: "Zeilenumbruch in Tabellenzellen" },
          { syntax: ":indent", description: "Einr\xFCckung in Tabellenzellen" }
        ])
      };
    }
    scholarlyPlugin.DEFAULT_BLOCK_CONTAINERS = DEFAULT_BLOCK_CONTAINERS;
    scholarlyPlugin.DEFAULT_INLINE_DIRECTIVES = DEFAULT_INLINE_DIRECTIVES;
    scholarlyPlugin.getSyntaxHelp = getSyntaxHelp;
    scholarlyPlugin.adjustContainerNesting = adjustContainerNesting;
    module2.exports = scholarlyPlugin;
  }
});

// src/index.js
var extensiblePlugin = require_markdown_it_extensible();
var vscode = require("vscode");
var fs = require("fs");
function logDebug(msg) {
  console.debug("markdown-it-extensible:", msg);
}
logDebug("Module src/index.js loaded");
function extendMarkdownIt(md) {
  logDebug("extendMarkdownIt called!");
  try {
    let blockContainers = [];
    let inlineDirectives = [];
    if (typeof vscode !== "undefined" && vscode.workspace) {
      const config = vscode.workspace.getConfiguration("extensibleMarkdown");
      blockContainers = config.get("blockContainers") || [];
      inlineDirectives = config.get("inlineDirectives") || [];
      logDebug(`Config loaded: ${blockContainers.length} containers, ${inlineDirectives.length} directives`);
    } else {
      logDebug("vscode.workspace not available");
    }
    const res = md.use(extensiblePlugin, {
      blockContainers,
      inlineDirectives
    });
    logDebug("md.use(extensiblePlugin) returned successfully");
    return res;
  } catch (e) {
    logDebug("Error in extendMarkdownIt: " + (e.stack || e));
    return md.use(extensiblePlugin);
  }
}
function activate(context) {
  const provider = vscode.languages.registerCompletionItemProvider(
    "markdown",
    {
      provideCompletionItems(document, position, token, context2) {
        const config = vscode.workspace.getConfiguration("extensibleMarkdown");
        const blockContainers = config.get("blockContainers") || [];
        const inlineDirectives = config.get("inlineDirectives") || [];
        const items = [];
        blockContainers.forEach((containerOpt) => {
          const name = containerOpt.name;
          const item = new vscode.CompletionItem(`::: ${name}`, vscode.CompletionItemKind.Snippet);
          item.detail = `Extensible Block Container (::: ${name})`;
          item.insertText = new vscode.SnippetString(`::: ${name} [\${1:Title}]
\${0:$TM_SELECTED_TEXT}
:::`);
          item.documentation = new vscode.MarkdownString(`F\xFCgt den Block-Container \`::: ${name}\` ein.`);
          items.push(item);
          const shortcut = new vscode.CompletionItem(`s${name.replace(/[^a-zA-Z0-9]/g, "")}`, vscode.CompletionItemKind.Snippet);
          shortcut.detail = `Shortcut f\xFCr ::: ${name}`;
          shortcut.insertText = new vscode.SnippetString(`::: ${name} [\${1:Title}]
\${0:$TM_SELECTED_TEXT}
:::`);
          shortcut.documentation = new vscode.MarkdownString(`F\xFCgt den Block-Container \`::: ${name}\` ein.`);
          items.push(shortcut);
        });
        inlineDirectives.forEach((dir) => {
          const name = dir.name;
          const item = new vscode.CompletionItem(`:${name}`, vscode.CompletionItemKind.Snippet);
          item.detail = `Extensible Inline Directive (:${name}[...])`;
          item.insertText = new vscode.SnippetString(`:${name}[\${1:text}]`);
          item.documentation = new vscode.MarkdownString(`F\xFCgt die Inline-Direktive \`:${name}[text]\` ein.`);
          items.push(item);
          const shortcut = new vscode.CompletionItem(`s${name.replace(/[^a-zA-Z0-9]/g, "")}`, vscode.CompletionItemKind.Snippet);
          shortcut.detail = `Shortcut f\xFCr :${name}[...]`;
          shortcut.insertText = new vscode.SnippetString(`:${name}[\${1:text}]`);
          shortcut.documentation = new vscode.MarkdownString(`F\xFCgt die Inline-Direktive \`:${name}[text]\` ein.`);
          items.push(shortcut);
        });
        return items;
      }
    },
    ":",
    "s"
    // Trigger bei Eintippen von ':' oder 's'
  );
  if (context && context.subscriptions) {
    context.subscriptions.push(provider);
  }
  return {
    extendMarkdownIt
  };
}
module.exports = {
  activate,
  extendMarkdownIt
};
