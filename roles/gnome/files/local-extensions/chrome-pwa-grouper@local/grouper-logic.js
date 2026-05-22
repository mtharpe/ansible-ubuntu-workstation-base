import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const PROFILE_RE = /^chrome-([a-zA-Z0-9]+)-Profile_\d+\.desktop$/;
const DEFAULT_RE = /^chrome-([a-zA-Z0-9]+)-Default\.desktop$/;
const LOG = '[chrome-pwa-grouper]';

function profileCrx(id) {
    const m = id && id.match(PROFILE_RE);
    return m ? m[1] : null;
}
function defaultCrx(id) {
    const m = id && id.match(DEFAULT_RE);
    return m ? m[1] : null;
}

// Dock-grouping only. Alt-Tab presentation is handled by a separate extension.
// We override just enough to make one dock entry per chrome PWA (regardless of
// profile) and have clicking that entry activate the right window.
export class GrouperImpl {
    enable() {
        const trackerProto = Shell.WindowTracker.prototype;
        const appSysProto = Shell.AppSystem.prototype;
        const appProto = Shell.App.prototype;

        this._orig = {
            getWindowApp: trackerProto.get_window_app,
            lookupApp: appSysProto.lookup_app,
            getRunning: appSysProto.get_running,
            getWindows: appProto.get_windows,
            activate: appProto.activate,
        };
        const orig = this._orig;

        appSysProto.lookup_app = function(id) {
            const crx = profileCrx(id);
            if (crx) {
                const r = orig.lookupApp.call(this, `chrome-${crx}-Default.desktop`);
                if (r) return r;
            }
            return orig.lookupApp.call(this, id);
        };

        trackerProto.get_window_app = function(window) {
            const app = orig.getWindowApp.call(this, window);
            if (!app) return app;
            const crx = profileCrx(app.get_id());
            if (!crx) return app;
            return orig.lookupApp.call(Shell.AppSystem.get_default(), `chrome-${crx}-Default.desktop`) || app;
        };

        appSysProto.get_running = function() {
            const list = orig.getRunning.call(this);
            const filtered = [];
            const seenCrx = new Set();
            for (const app of list) {
                const id = app.get_id();
                if (profileCrx(id)) continue;
                const dc = defaultCrx(id);
                if (dc) seenCrx.add(dc);
                filtered.push(app);
            }
            const defaultsToAdd = new Map();
            for (const app of list) {
                const crx = profileCrx(app.get_id());
                if (!crx || seenCrx.has(crx)) continue;
                if (defaultsToAdd.has(crx)) continue;
                const defaultApp = orig.lookupApp.call(this, `chrome-${crx}-Default.desktop`);
                if (defaultApp) defaultsToAdd.set(crx, defaultApp);
            }
            for (const a of defaultsToAdd.values()) filtered.push(a);
            return filtered;
        };

        appProto.get_windows = function() {
            const own = orig.getWindows.call(this);
            const crx = defaultCrx(this.get_id());
            if (!crx) return own;
            const all = orig.getRunning.call(Shell.AppSystem.get_default());
            const merged = own.slice();
            for (const a of all) {
                if (profileCrx(a.get_id()) === crx) {
                    for (const w of orig.getWindows.call(a)) {
                        if (!merged.includes(w)) merged.push(w);
                    }
                }
            }
            return merged;
        };

        appProto.activate = function() {
            if (defaultCrx(this.get_id())) {
                const windows = appProto.get_windows.call(this);
                if (windows.length > 0) {
                    const focused = windows.find(w => w.has_focus());
                    const mru = windows.slice().sort((a, b) => b.get_user_time() - a.get_user_time())[0];
                    const target = focused || mru;
                    Main.activateWindow(target, global.get_current_time());
                    return;
                }
            }
            return orig.activate.call(this);
        };

        console.log(`${LOG} enabled (dock-grouping only)`);
    }

    disable() {
        if (!this._orig) return;
        Shell.WindowTracker.prototype.get_window_app = this._orig.getWindowApp;
        Shell.AppSystem.prototype.lookup_app = this._orig.lookupApp;
        Shell.AppSystem.prototype.get_running = this._orig.getRunning;
        Shell.App.prototype.get_windows = this._orig.getWindows;
        Shell.App.prototype.activate = this._orig.activate;
        this._orig = null;
        console.log(`${LOG} disabled`);
    }
}
