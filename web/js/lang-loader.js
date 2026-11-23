// Only load languages that actually have translation files on the server.
// Avoid blasting 50+ 404 network requests for missing files.
window.LANG_CODES = [
    'zh'
];

window.loadLanguageFiles = function() {
    return Promise.resolve();
};
