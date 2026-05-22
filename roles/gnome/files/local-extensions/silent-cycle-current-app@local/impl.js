import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as AltTab from 'resource:///org/gnome/shell/ui/altTab.js';

const WM_SCHEMA = 'org.gnome.desktop.wm.keybindings';
const LOG = '[silent-cycle]';

export class SilentCycleImpl {
    enable(settings) {
        this._wmSettings = new Gio.Settings({schema_id: WM_SCHEMA});
        this._savedForward = this._wmSettings.get_strv('switch-group');
        this._savedBackward = this._wmSettings.get_strv('switch-group-backward');
        this._wmSettings.set_strv('switch-group', []);
        this._wmSettings.set_strv('switch-group-backward', []);

        this._settings = settings;
        const mode = Shell.ActionMode.NORMAL;
        const flags = Meta.KeyBindingFlags.NONE;
        Main.wm.addKeybinding('cycle-forward', this._settings, flags, mode,
            () => this._cycle(false));
        Main.wm.addKeybinding('cycle-backward', this._settings, flags, mode,
            () => this._cycle(true));

        // _select: drop any window arg so the thumbnail picker timer never
        // starts. Pass forceAppFocus=true so _select doesn't queue thumbnails.
        this._origAppSwitcherSelect = AltTab.AppSwitcherPopup.prototype._select;
        const origSelect = this._origAppSwitcherSelect;
        AltTab.AppSwitcherPopup.prototype._select = function (app, _window, _forceAppFocus) {
            return origSelect.call(this, app, null, true);
        };

        // _finish: use Main.activateWindow on the app's most-recent window
        // directly. The stock _finish goes through Shell.App.activate_window,
        // which doesn't reliably switch workspaces for Chrome PWAs whose
        // app_ids are rewritten by chrome-pwa-grouper.
        this._origAppSwitcherFinish = AltTab.AppSwitcherPopup.prototype._finish;
        AltTab.AppSwitcherPopup.prototype._finish = function (timestamp) {
            const appIcon = this._items[this._selectedIndex];
            const target = appIcon?.cachedWindows?.[0];
            if (target)
                Main.activateWindow(target, timestamp);
            this.fadeAndDestroy();
        };

        // _init: zero per-app multi-window arrow indicators. AppSwitcher
        // class isn't exported, but every AppSwitcherPopup builds one in its
        // _init and stows it as _switcherList — patch arrows there.
        this._origAppSwitcherPopupInit = AltTab.AppSwitcherPopup.prototype._init;
        const origInit = this._origAppSwitcherPopupInit;
        AltTab.AppSwitcherPopup.prototype._init = function () {
            origInit.call(this);
            if (this._switcherList && this._switcherList._arrows) {
                for (const a of this._switcherList._arrows)
                    a.opacity = 0;
            }
        };

        console.log(`${LOG} enabled (cycle + app-only alt+tab, no multi-window arrows)`);
    }

    disable() {
        if (this._origAppSwitcherPopupInit) {
            AltTab.AppSwitcherPopup.prototype._init = this._origAppSwitcherPopupInit;
            this._origAppSwitcherPopupInit = null;
        }

        if (this._origAppSwitcherFinish) {
            AltTab.AppSwitcherPopup.prototype._finish = this._origAppSwitcherFinish;
            this._origAppSwitcherFinish = null;
        }

        if (this._origAppSwitcherSelect) {
            AltTab.AppSwitcherPopup.prototype._select = this._origAppSwitcherSelect;
            this._origAppSwitcherSelect = null;
        }

        Main.wm.removeKeybinding('cycle-forward');
        Main.wm.removeKeybinding('cycle-backward');
        this._settings = null;

        if (this._wmSettings) {
            this._wmSettings.set_strv('switch-group', this._savedForward);
            this._wmSettings.set_strv('switch-group-backward', this._savedBackward);
            this._wmSettings = null;
        }

        console.log(`${LOG} disabled`);
    }

    _cycle(backward) {
        const focusedWindow = global.display.focus_window;
        if (!focusedWindow) return;

        const app = Shell.WindowTracker.get_default().get_window_app(focusedWindow);
        if (!app) return;

        // All windows of the app, across workspaces. Sort by stable_sequence
        // (creation-order id) — Shell.App.get_windows() returns MRU order,
        // which reorders on every activation and traps the cycle between two
        // windows.
        const windows = app.get_windows()
            .filter(w => !w.is_skip_taskbar())
            .sort((a, b) => a.get_stable_sequence() - b.get_stable_sequence());

        if (windows.length < 2) return;

        const idx = windows.indexOf(focusedWindow);
        if (idx === -1) return;

        const next = backward
            ? windows[(idx - 1 + windows.length) % windows.length]
            : windows[(idx + 1) % windows.length];

        Main.activateWindow(next, global.get_current_time());
    }
}
