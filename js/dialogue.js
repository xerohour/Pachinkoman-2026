import { CANVAS_HEIGHT, CANVAS_WIDTH, DIALOGUE, FPS, NORMAL } from "./util.js?v=6";

function DialogueManager() {
    function e() {
        if (a)
            if (a.noLoop) {
                if (a.doneAnimating) return void(s = a.frames - 1);
                s += a.anispeed / FPS, Math.floor(s) == a.frames - 1 && (a.doneAnimating = !0)
            } else s = (s + a.anispeed / FPS) % a.frames
    }
    this.needs = ["Resources", "Dimmer", "ActionManager"], this.state = "closed", this.output = {
        speed: 25,
        length: 0,
        counter: 0
    };
    var a, t = "",
        n = "",
        i = [],
        o = [],
        r = 0,
        s = 0,
        l = {
            speed: 10,
            acc: 1,
            max: 100,
            min: 5
        };
    this.timer = 0, this.variant = null;
    let c = -1 * CANVAS_HEIGHT;
    this.DrawInfo = function() {
        return {
            state: this.state,
            text: n,
            speaker: t,
            options: i,
            branches: o,
            optionIndex: r,
            portrait: a,
            pframe: s,
            offset: c,
            outputLength: this.output.length,
            variant: this.variant
        }
    }, this.StartDialogue = function(e, a, t) {
        const n = e.data;
        a.mode = DIALOGUE, n.Sprite.moving = n.Sprite.homing = !1, this.state = "opening", e.RestoreToIdle(), i = [], o = [], this.variant = t || null, "death" === t ? this.req.Dimmer.dim(10, 255) : this.req.Dimmer.dim(10, 60)
    }, this.AddDialogue = function(e, i, o, r, l, c) {
        const h = e.data,
            d = this;
        this.variant = c || null, l && (h.cage ? ~l.indexOf("pman_normal") || ~l.indexOf("pman_sweat") ? l += "_cage" : ~l.indexOf("pman_") && (l = "pman_normal_cage") : h.Sprite.status.wig && (~l.indexOf("pman_normal") || ~l.indexOf("pman_sweat") || ~l.indexOf("pman_happy") ? l += "_wig" : ~l.indexOf("pman_") && (l = "pman_normal_wig"))), i.mode != DIALOGUE ? d.StartDialogue(e, i, c) : d.state = "output", d.output.length = d.output.counter = 0, n = r, t = o, a = this.req.Resources.get("Portraits", l), s = 0, "timed" === c && (this.timer = 60)
    }, this.ResetDialogueOptions = function() {
        i = [], o = []
    }, this.AddDialogueOption = function(e, t, n, s) {
        const l = this;
        r = 0, t.mode != DIALOGUE ? l.StartDialogue(e, t) : "opening" != l.state && (l.state = "options"), i.length < 4 && (a = null, i.push(n), o.push(s))
    }, this.SetCurrentOption = function(e) {
        r = e
    }, this.GetCurrentOption = function() {
        return i[r]
    }, this.OptionCount = function() {
        return i.length
    }, this.GetCurrentBranch = function() {
        return o[r]
    }, this.MoveOptionIndex = function(e) {
        r = (r + e) % i.length, 0 > r && (r = i.length - 1)
    }, this.Update = function(t) {
        const o = this,
            r = o.output;
        switch (o.state) {
            case "opening":
                c += 2 + l.max * (-1 * c / CANVAS_WIDTH), c >= 0 && (c = 0, o.state = 0 == i.length ? "output" : "options");
                break;
            case "output":
                if (r.counter += 1 / FPS, r.counter >= 1 / r.speed) {
                    r.counter = 0, r.length++, " " == n[r.length] && r.length++;
                    const h = n[r.length - 2];
                    ("." == h || "!" == h || "?" == h || "*" == h || " " == h) && (r.counter -= -15 / FPS)
                }
                e(), r.length == n.length && (o.state = "wait", a && !a.alwaysAnimate && (s = a && a.lastFrame || 0));
                break;
            case "wait":
                r.length != n.length && (r.length = n.length), a && a.alwaysAnimate ? e() : s = a && a.lastFrame || 0;
                break;
            case "closing":
                c -= 2 + -1 * l.max * (c / CANVAS_WIDTH), -1 * CANVAS_WIDTH >= c && (c = -1 * CANVAS_WIDTH, o.state = "closed")
        }
        "closed" == o.state && (t.mode = NORMAL, this.req.ActionManager.timeout || this.req.Dimmer.dim(-10, 0))
    }
}

export { DialogueManager };
