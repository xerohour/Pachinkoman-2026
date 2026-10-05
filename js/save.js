import { dcopy } from "./util.js?v=6";

function SaveManager() {
    function readCookie(e) {
        let a; let t; let n; const i = document.cookie.split(";");
        for (a = 0; a < i.length; a++)
            if (t = i[a].substr(0, i[a].indexOf("=")), n = i[a].substr(i[a].indexOf("=") + 1), t = t.replace(/^\s+|\s+$/g, ""), t == e) return unescape(n);
        return null
    }

    function readStore(name) {
        // Preferred storage is localStorage. A legacy cookie is imported once, then dropped.
        try {
            const v = window.localStorage.getItem("pachinkoman_" + name);
            if (null != v) return v
        } catch (err) {
            console.error("[pachinkoman] localStorage read failed: " + (err && err.message))
        }
        const legacy = readCookie("save" === name ? "pman" : "pman_settings");
        return null != legacy ? (writeStore(name, legacy), legacy) : null
    }

    function writeStore(name, val) {
        try {
            window.localStorage.setItem("pachinkoman_" + name, val)
        } catch (err) {
            console.error("[pachinkoman] localStorage write failed: " + (err && err.message))
        }
        // Stop sending the legacy cookie with every request.
        const legacy = "save" === name ? "pman" : "pman_settings";
        document.cookie = legacy + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    }

    function a(e) {
        for (var a = "", t = "0".charCodeAt(), n = "9".charCodeAt(), i = "a".charCodeAt(), o = "z".charCodeAt(), r = 0; r < e.length; r++) {
            let s = e.charCodeAt(r);
            a += s >= t && n >= s ? String.fromCharCode(t + (n - s)) : s >= i && o >= s ? String.fromCharCode(i + (o - s)) : e[r]
        }
        return a
    }
    this.needs = ["Input", "LevelManager", "PlayerManager", "Audio", "DialogueManager"], this.unlocked = {
        cage: !1,
        mirror: !1
    };
    var t = this;
    this.Load = function() {
        const t = readStore("save");
        if (null == t) return !1;
        try {
            this.req.PlayerManager.ResetPlayer();
            const n = JSON.parse(a(t)),
                i = this.req.PlayerManager.data;
            i.Sprite.status = n.status;
            for (const o in n.inventory)
                for (const r in n.inventory[o]) i.inventory[o][r] = n.inventory[o][r];
            return i.switches = dcopy(n.switches), i.cage = n.cage, i.mirror = n.mirror, i.deathcount = n.deathcount, this.req.LevelManager.GoToLevel(n.lastlevel, n.x, n.y), !0
        } catch (s) {
            console.error("[pachinkoman] ignoring corrupt save data: " + (s && s.message))
        }
    }, this.Save = function() {
        const e = this.req.PlayerManager.data,
            n = {
                x: e.Sprite.x,
                y: e.Sprite.y,
                status: e.Sprite.status,
                inventory: {},
                switches: e.switches,
                deathcount: e.deathcount,
                lastlevel: "baalroom" !== e.lastlevel ? e.lastlevel : "hallway",
                cage: e.cage,
                mirror: e.mirror
            };
        for (const i in e.inventory) n.inventory[i] = {
            owned: e.inventory[i].owned
        }, e.inventory[i].contents && (n.inventory[i].contents = e.inventory[i].contents);
        const r = a(JSON.stringify(n));
        writeStore("save", r), t.SaveSettings()
    }, this.SaveSettings = function() {
        const e = {
                volume: t.req.Audio.Volume(),
                textSpeed: t.req.DialogueManager.output.speed,
                wasd: t.req.Input.wasd,
                unlocked: t.unlocked,
                contrast: !!t.req.Input.highContrast,
                custom: !!t.req.Input.customKeys,
                keys: {
                    up: t.req.Input.getKey("up"), down: t.req.Input.getKey("down"),
                    left: t.req.Input.getKey("left"), right: t.req.Input.getKey("right"),
                    ok: t.req.Input.getKey("ok")
                }
            },
            i = a(JSON.stringify(e));
        writeStore("settings", i)
    }, this.LoadSettings = function() {
        const t = this,
            n = readStore("settings");
        if (null == n) return !1;
        try {
            const i = JSON.parse(a(n));
            t.req.DialogueManager.output.speed = i.textSpeed, t.req.Audio.ChangeVolume(i.volume), t.req.Input.useWasd(i.wasd), t.unlocked = i.unlocked || t.unlocked;
            i.contrast && (t.req.Input.highContrast = !0);
            if (i.custom && i.keys)
                for (const k in i.keys) t.req.Input.setKey(k, i.keys[k]), t.req.Input.customKeys = !0, t.req.Input.wasd = !1;
            return !0
        } catch (o) {
            console.error("[pachinkoman] ignoring corrupt settings data: " + (o && o.message))
        }
    }
}

export { SaveManager };
