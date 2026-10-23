const extensiblePlugin = require('markdown-it-extensible');
const vscode = require('vscode');

function logDebug(msg) {
    console.debug('markdown-it-extensible:', msg);
}

logDebug('Module src/index.js loaded');

function extendMarkdownIt(md) {
    logDebug('extendMarkdownIt called!');
    try {
        let blockContainers = [];
        let inlineDirectives = [];

        if (typeof vscode !== 'undefined' && vscode.workspace) {
            const config = vscode.workspace.getConfiguration('extensibleMarkdown');
            blockContainers = config.get('blockContainers') || [];
            inlineDirectives = config.get('inlineDirectives') || [];
            logDebug(`Config loaded: ${blockContainers.length} containers, ${inlineDirectives.length} directives`);
        } else {
            logDebug('vscode.workspace not available');
        }

        const res = md.use(extensiblePlugin, {
            blockContainers: blockContainers,
            inlineDirectives: inlineDirectives,
            configFile: false,
            injectStyles: false
        });
        logDebug('md.use(extensiblePlugin) returned successfully');
        return res;
    } catch (e) {
        logDebug('Error in extendMarkdownIt: ' + (e.stack || e));
        return md.use(extensiblePlugin, { configFile: false, injectStyles: false });
    }
}

function activate(context) {
    // Dynamischer Snippet-CompletionProvider für den VS Code Editor
    const provider = vscode.languages.registerCompletionItemProvider(
        'markdown',
        {
            provideCompletionItems(document, position, token, context) {
                const config = vscode.workspace.getConfiguration('extensibleMarkdown');
                const blockContainers = config.get('blockContainers') || [];
                const inlineDirectives = config.get('inlineDirectives') || [];

                const items = [];
                const seenShortcuts = new Set();

                // Ermittle getippte Doppelpunkte vor dem Cursor, um Verdopplung zu verhindern
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                const colonMatch = linePrefix.match(/:+$/);
                const colonCount = colonMatch ? colonMatch[0].length : 0;
                const colonRange = colonCount > 0
                    ? new vscode.Range(position.translate(0, -colonCount), position)
                    : undefined;

                // 1. Dynamische Block-Container Snippets (z. B. ::: warning-box oder swarningbox)
                blockContainers.forEach(containerOpt => {
                    if (!containerOpt || typeof containerOpt.name !== 'string' || !containerOpt.name.trim()) {
                        return;
                    }
                    const name = containerOpt.name.trim();

                    // Standard-Triggermatch: ::: <name>
                    const item = new vscode.CompletionItem(`::: ${name}`, vscode.CompletionItemKind.Snippet);
                    item.detail = `Extensible Block Container (::: ${name})`;
                    item.insertText = new vscode.SnippetString(`::: ${name} [\${1:Title}]\n\${0:\$TM_SELECTED_TEXT}\n:::`);
                    item.documentation = new vscode.MarkdownString(`Fügt den Block-Container \`::: ${name}\` ein.`);
                    if (colonRange) {
                        item.range = colonRange;
                    }
                    items.push(item);

                    // Kurztipp-Triggermatch: s<name> (z. B. swarningbox) - dedupliziert
                    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
                    if (cleanName) {
                        const shortcutKey = `s${cleanName}`;
                        if (!seenShortcuts.has(shortcutKey)) {
                            seenShortcuts.add(shortcutKey);
                            const shortcut = new vscode.CompletionItem(shortcutKey, vscode.CompletionItemKind.Snippet);
                            shortcut.detail = `Shortcut für ::: ${name}`;
                            shortcut.insertText = new vscode.SnippetString(`::: ${name} [\${1:Title}]\n\${0:\$TM_SELECTED_TEXT}\n:::`);
                            shortcut.documentation = new vscode.MarkdownString(`Fügt den Block-Container \`::: ${name}\` ein.`);
                            items.push(shortcut);
                        }
                    }
                });

                // 2. Dynamische Inline-Direktive Snippets (z. B. :mark oder smark)
                inlineDirectives.forEach(dir => {
                    if (!dir || typeof dir.name !== 'string' || !dir.name.trim()) {
                        return;
                    }
                    const name = dir.name.trim();

                    const item = new vscode.CompletionItem(`:${name}`, vscode.CompletionItemKind.Snippet);
                    item.detail = `Extensible Inline Directive (:${name}[...])`;
                    item.insertText = new vscode.SnippetString(`:${name}[\${1:text}]`);
                    item.documentation = new vscode.MarkdownString(`Fügt die Inline-Direktive \`:${name}[text]\` ein.`);
                    if (colonRange) {
                        item.range = colonRange;
                    }
                    items.push(item);

                    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
                    if (cleanName) {
                        const shortcutKey = `s${cleanName}`;
                        if (!seenShortcuts.has(shortcutKey)) {
                            seenShortcuts.add(shortcutKey);
                            const shortcut = new vscode.CompletionItem(shortcutKey, vscode.CompletionItemKind.Snippet);
                            shortcut.detail = `Shortcut für :${name}[...]`;
                            shortcut.insertText = new vscode.SnippetString(`:${name}[\${1:text}]`);
                            shortcut.documentation = new vscode.MarkdownString(`Fügt die Inline-Direktive \`:${name}[text]\` ein.`);
                            items.push(shortcut);
                        }
                    }
                });

                return items;
            }
        },
        ':' // Trigger nur bei Doppelpunkt ':' (z. B. ':::' oder ':directive')
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
