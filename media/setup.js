// VSCode injects this script into the webview for the Markdown preview.
// We add the 'vp-doc' class to the document element immediately, and to the body once loaded,
// so that the VitePress/Payer CSS rules (.vp-doc ...) apply properly without timing issues.
document.documentElement.classList.add('vp-doc');
if (document.body) {
    document.body.classList.add('vp-doc');
} else {
    window.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('vp-doc');
    });
}
