import { DEBUGX, DEBUGY, dcopy, showFatalError } from "./util.js?v=6";

function LevelManager() {
    this.needs = ["ActionManager", "PlayerManager", "Audio", "Dimmer"];
    const e = this,
        a = {
            bg: "logo",
            mode: "CUTSCENE",
            next: "title",
            stopmusic: !0
        };
    this.CurrentLevel = !1;
    const t = {
        active: !0,
        levelToLoad: a,
        PausedLevel: null,
        newX: DEBUGX,
        newY: DEBUGY
    };
    this.SavePausedLevel = function() {
        t.PausedLevel = dcopy(e.CurrentLevel)
    }, this.GoToLevel = function(e, a, n) {
        const i = this.req.PlayerManager.data;
        t.active = !0, this.req.ActionManager.DisableActions = !0, "RETURN" == e ? t.levelToLoad = "RETURN" : fetch("levels/" + e + ".json?" + (new Date).getTime()).then(function(r) {
            if (!r.ok) throw new Error("level '" + e + "' could not be loaded (HTTP " + r.status + ")");
            return r.json()
        }).then(function(a) {
            a.title = e, t.levelToLoad = a
        }).catch(function(err) {
            showFatalError(err.message + " - the game data is missing or unreachable.")
        }), t.newX = a, t.newY = n, "RETURN" != e && "options" != e && (i.lastlevel = e), this.req.Dimmer.dim(9, 255)
    }, this.IsLoading = function() {
        return t.active && t.levelToLoad && this.req.Dimmer.getSpeed() <= 0
    }, this.LoadLevel = function() {
        const a = this.req.PlayerManager.data;
        if (this.req.PlayerManager.RestoreToIdle(), this.req.Dimmer.dim(-9, 0), "RETURN" != t.levelToLoad) {
            e.CurrentLevel = dcopy(t.levelToLoad);
            const n = e.CurrentLevel;
            t.levelToLoad = null, a.Sprite.x = t.newX, a.Sprite.y = t.newY, a.Sprite.alphabet = "gerog", n.music ? this.req.Audio.ChangeAudio(n.music.song, n.music.loop) : n.stopmusic && this.req.Audio.Stop(), this.req.ActionManager.DisableActions = !1, n.preload_actions && (this.req.ActionManager.AddActions(n.preload_actions), this.req.ActionManager.RunActions()), n.postload_actions && this.req.ActionManager.AddActions(n.postload_actions)
        } else e.CurrentLevel = dcopy(t.PausedLevel), e.CurrentLevel.bgDrawn = !1, t.PausedLevel = null, this.req.ActionManager.DisableActions = !1;
        t.active = !1
    }
}

export { LevelManager };
