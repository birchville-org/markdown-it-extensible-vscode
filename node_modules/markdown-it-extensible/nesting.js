/**
 * Container nesting normalization.
 *
 * markdown-it-container closes a container at the first fence line having at least as many
 * colons as the opening fence. Nesting containers with equal colon counts therefore closes the
 * outer container prematurely. This module rewrites the source so that every outer container
 * uses strictly more colons than any container nested inside it:
 *
 *   ::: note-box            :::: note-box
 *   ::: grammar-box    =>   ::: grammar-box
 *   :::                     :::
 *   :::                     ::::
 *
 * Opening and closing fences are paired with a LIFO stack and updated together.
 * Fenced code blocks (``` / ~~~) are skipped.
 */

const OPEN_RE = /^([ \t]*)(:{3,})([ \t]*)([a-zA-Z0-9_-]+)(.*)$/;
const CLOSE_RE = /^([ \t]*)(:{3,})[ \t]*$/;
const CODE_FENCE_OPEN_RE = /^[ \t]*(`{3,}|~{3,})/;
const CODE_FENCE_CLOSE_RE = /^[ \t]*(`{3,}|~{3,})[ \t]*$/;

/**
 * @param {string} src Markdown source
 * @param {{ names?: Iterable<string>, closeUnclosed?: boolean }} [options]
 *   names: if given, only these container names (case-insensitive) count as openers.
 *   closeUnclosed: append missing closing fences at the end of the document.
 * @returns {{ repaired: string, didRepair: boolean, adjustedCount: number }}
 */
function adjustContainerNesting(src, options = {}) {
  if (!src || src.indexOf(':::') === -1) {
    return { repaired: src, didRepair: false, adjustedCount: 0 };
  }

  const names = options.names
    ? new Set(Array.from(options.names, (n) => String(n).toLowerCase()))
    : null;

  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const hasTrailingNewline = src.endsWith(eol);
  const rawLines = src.split(eol);
  const lines =
    hasTrailingNewline && rawLines.length > 0 && rawLines[rawLines.length - 1] === ''
      ? rawLines.slice(0, -1)
      : rawLines.slice();

  const stack = [];
  const roots = [];
  const all = [];

  let fenceChar = '';
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
        fenceChar = '';
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
        space: om[3] || ' ',
        name: om[4],
        rest: om[5],
        closeIndent: om[1],
        target: om[2].length,
        children: [],
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
      3,
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
    const colons = ':'.repeat(b.target);
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
      lines.push(`${unclosed.indent}${':'.repeat(unclosed.target)}`);
    }
  }

  let repaired = lines.join(eol);
  if (hasTrailingNewline) {
    repaired += eol;
  }

  return { repaired, didRepair, adjustedCount };
}

module.exports = { adjustContainerNesting };
