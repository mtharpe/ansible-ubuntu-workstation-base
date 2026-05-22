import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Thin shim: dynamically (re)imports grouper-logic.js on every enable() so
// edits to that file take effect on disable+enable WITHOUT a full Shell restart.
// The query string makes each import URL unique → bypasses GJS's ESM cache.
export default class ChromePWAGrouperExtension extends Extension {
    async enable() {
        const url = `file://${this.path}/grouper-logic.js?t=${Date.now()}`;
        const mod = await import(url);
        this._impl = new mod.GrouperImpl();
        this._impl.enable();
    }

    disable() {
        if (this._impl) {
            this._impl.disable();
            this._impl = null;
        }
    }
}
