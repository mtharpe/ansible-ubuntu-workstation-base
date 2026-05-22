import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Thin shim: copies impl.js to a unique tempfile each enable() and imports
// from there. GJS caches dynamic imports by URL path (ignoring ?query=), so
// a fresh path is what actually forces re-evaluation.
export default class SilentCycleExtension extends Extension {
    async enable() {
        const src = Gio.File.new_for_path(`${this.path}/impl.js`);
        const [, contents] = src.load_contents(null);
        const tmpPath = GLib.build_filenamev([GLib.get_tmp_dir(),
            `silent-cycle-impl-${Date.now()}-${Math.floor(Math.random() * 1e9)}.js`]);
        GLib.file_set_contents(tmpPath, contents);
        this._tmpPath = tmpPath;

        const mod = await import(`file://${tmpPath}`);
        this._impl = new mod.SilentCycleImpl();
        this._impl.enable(this.getSettings());
    }

    disable() {
        if (this._impl) {
            this._impl.disable();
            this._impl = null;
        }
        if (this._tmpPath) {
            try { GLib.unlink(this._tmpPath); } catch (_) {}
            this._tmpPath = null;
        }
    }
}
