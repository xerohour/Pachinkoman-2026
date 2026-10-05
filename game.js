/* ============================================================================
 * PACHINKO MAN - 2026 refresh
 * De-minified, dependency-free rebuild of the original Punch The Moon engine.
 *
 * Improvements over the 2015 original:
 *  - jQuery removed entirely (vanilla DOM, events, and fetch)
 *  - Save data migrated from cookies to localStorage (legacy cookies are
 *    imported once, then deleted)
 *  - Level loads use fetch with real error reporting instead of hanging on
 *    a black screen when a level file is missing
 *  - requestAnimationFrame game loop with fixed 50 Hz logic steps
 *  - Broken images no longer stall the loading gate forever (onerror counts
 *    down and logs); audio loads in the background without blocking
 *  - Corrupt save data is logged instead of silently swallowed
 *  - Google Analytics snippet removed
 * Original game (c) Punch The Moon - see README.md for credits.
 * ========================================================================== */


/* Small vanilla replacements for the jQuery helpers the original used. */
function each(obj, fn) {
    if (Array.isArray(obj)) obj.forEach(function(v, i) { fn(i, v); });
    else if (obj) Object.keys(obj).forEach(function(k) { fn(k, obj[k]); });
    return obj;
}
function keyCode(e) { return e.which || e.keyCode; }
function mouseButton(e) { return e.which || (typeof e.button === "number" ? e.button + 1 : 0); }
function showFatalError(msg) {
    console.error("[pachinkoman] " + msg);
    var el = document.getElementById("fatal-error");
    if (el) { el.textContent = "Pachinko Man couldn't start: " + msg; el.style.display = "block"; }
}

function dcopy(e) {
    return typeof structuredClone === "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e))
}


/* ---------------------------------------------------------------------------
 * Touch controls (phones/tablets).
 *  - Tap the canvas = left-click (interact / talk / select / advance dialogue)
 *  - Virtual joystick (bottom-left, touch devices only) = movement, replacing
 *    "hold right-click to move", which phones don't have.
 * The joystick drives the same "left"/"right"/"up"/"down" button states as the
 * arrow keys, so all existing movement/menu logic works unchanged.
 * ------------------------------------------------------------------------- */
function setupTouchControls(input, canvas) {
    var isTouch = "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;
    if (!isTouch || !canvas || !input) return;
    document.body.classList.add("touch");

    function toGame(e) {
        var t = e.changedTouches[0],
            r = canvas.getBoundingClientRect();
        return { x: t.clientX - r.left, y: t.clientY - r.top };
    }
    canvas.addEventListener("touchstart", function(e) {
        e.preventDefault();
        var p = toGame(e);
        input.mouseX = p.x; input.mouseY = p.y;
        input.mouseclicked = !0; input.mousereleased = !1;
    }, { passive: !1 });
    canvas.addEventListener("touchmove", function(e) {
        e.preventDefault();
        var p = toGame(e);
        input.mouseX = p.x; input.mouseY = p.y;
    }, { passive: !1 });
    function endTouch(e) {
        e.preventDefault();
        input.mouseclicked = !1; input.mousereleased = !0;
    }
    canvas.addEventListener("touchend", endTouch, { passive: !1 });
    canvas.addEventListener("touchcancel", endTouch, { passive: !1 });

    var joy = document.getElementById("joystick"),
        stick = document.getElementById("stick");
    if (!joy || !stick) return;
    var joyId = null, cx = 0, cy = 0;
    var RADIUS = 44, DEAD = 10;

    function setDir(dx, dy) {
        var left = dx < -DEAD, right = dx > DEAD,
            up = dy < -DEAD, down = dy > DEAD;
        if (input.touchLeft && !left) input.touchLeftRel = !0;
        if (input.touchRight && !right) input.touchRightRel = !0;
        if (input.touchUp && !up) input.touchUpRel = !0;
        if (input.touchDown && !down) input.touchDownRel = !0;
        input.touchLeft = left; input.touchRight = right;
        input.touchUp = up; input.touchDown = down;
        var dist = Math.min(RADIUS, Math.sqrt(dx * dx + dy * dy)),
            ang = Math.atan2(dy, dx);
        stick.style.transform = "translate(" + (Math.cos(ang) * dist).toFixed(1) + "px," + (Math.sin(ang) * dist).toFixed(1) + "px)";
    }
    function clearJoy() {
        joyId = null;
        setDir(0, 0);
        stick.style.transform = "translate(0px,0px)";
    }
    joy.addEventListener("touchstart", function(e) {
        e.preventDefault(); e.stopPropagation();
        var t = e.changedTouches[0],
            r = joy.getBoundingClientRect();
        joyId = t.identifier;
        cx = r.left + r.width / 2; cy = r.top + r.height / 2;
        setDir(t.clientX - cx, t.clientY - cy);
    }, { passive: !1 });
    joy.addEventListener("touchmove", function(e) {
        e.preventDefault(); e.stopPropagation();
        for (var i = 0; i < e.changedTouches.length; i++) {
            var t = e.changedTouches[i];
            if (t.identifier === joyId) setDir(t.clientX - cx, t.clientY - cy);
        }
    }, { passive: !1 });
    function joyEnd(e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++)
            if (e.changedTouches[i].identifier === joyId) clearJoy();
    }
    joy.addEventListener("touchend", joyEnd, { passive: !1 });
    joy.addEventListener("touchcancel", joyEnd, { passive: !1 });

    /* Action button: drives the "ok" button (spacebar) — advances dialogue,
     * confirms menu choices. */
    var abtn = document.getElementById("action-btn");
    if (abtn) {
        var abtnId = null;
        abtn.addEventListener("touchstart", function(e) {
            e.preventDefault(); e.stopPropagation();
            abtnId = e.changedTouches[0].identifier;
            input.touchOk = !0; input.touchOkRel = !1;
            abtn.classList.add("active");
        }, { passive: !1 });
        function abtnEnd(e) {
            e.preventDefault();
            for (var i = 0; i < e.changedTouches.length; i++)
                if (e.changedTouches[i].identifier === abtnId) {
                    abtnId = null;
                    if (input.touchOk) input.touchOkRel = !0;
                    input.touchOk = !1;
                    abtn.classList.remove("active");
                }
        }
        abtn.addEventListener("touchend", abtnEnd, { passive: !1 });
        abtn.addEventListener("touchcancel", abtnEnd, { passive: !1 });
    }
}

function Dimmer() {
    this.alpha = 255;
    var e = -5,
        a = 0,
        t = 255;
    this.transitioning = function() {
        return 0 !== e
    }, this.getSpeed = function() {
        return e
    }, this.dim = function(n, i) {
        n || (n = i > this.alpha ? 5 : -5), (0 > n && i > this.alpha || n > 0 && i < this.alpha) && (n *= -1), e = n, n > 0 && (t = i), 0 > n && (a = i)
    }, this.updateTransition = function() {
        this.alpha += e, e > 0 && this.alpha >= t && (this.alpha = t, e = 0, t = 255), 0 > e && this.alpha <= a && (this.alpha = a, e = 0, a = 0)
    }
}

function SaveManager() {
    function readCookie(e) {
        var a, t, n, i = document.cookie.split(";");
        for (a = 0; a < i.length; a++)
            if (t = i[a].substr(0, i[a].indexOf("=")), n = i[a].substr(i[a].indexOf("=") + 1), t = t.replace(/^\s+|\s+$/g, ""), t == e) return unescape(n);
        return null
    }

    function readStore(name) {
        // Preferred storage is localStorage. A legacy cookie is imported once, then dropped.
        try {
            var v = window.localStorage.getItem("pachinkoman_" + name);
            if (null != v) return v
        } catch (err) {
            console.error("[pachinkoman] localStorage read failed: " + (err && err.message))
        }
        var legacy = readCookie("save" === name ? "pman" : "pman_settings");
        return null != legacy ? (writeStore(name, legacy), legacy) : null
    }

    function writeStore(name, val) {
        try {
            window.localStorage.setItem("pachinkoman_" + name, val)
        } catch (err) {
            console.error("[pachinkoman] localStorage write failed: " + (err && err.message))
        }
        // Stop sending the legacy cookie with every request.
        var legacy = "save" === name ? "pman" : "pman_settings";
        document.cookie = legacy + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    }

    function a(e) {
        for (var a = "", t = "0".charCodeAt(), n = "9".charCodeAt(), i = "a".charCodeAt(), o = "z".charCodeAt(), r = 0; r < e.length; r++) {
            var s = e.charCodeAt(r);
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
        var t = readStore("save");
        if (null == t) return !1;
        try {
            this.req.PlayerManager.ResetPlayer();
            var n = JSON.parse(a(t)),
                i = this.req.PlayerManager.data;
            i.Sprite.status = n.status;
            for (var o in n.inventory)
                for (var r in n.inventory[o]) i.inventory[o][r] = n.inventory[o][r];
            return i.switches = dcopy(n.switches), i.cage = n.cage, i.mirror = n.mirror, i.deathcount = n.deathcount, this.req.LevelManager.GoToLevel(n.lastlevel, n.x, n.y), !0
        } catch (s) {
            console.error("[pachinkoman] ignoring corrupt save data: " + (s && s.message))
        }
    }, this.Save = function() {
        var e = this.req.PlayerManager.data,
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
        for (var i in e.inventory) n.inventory[i] = {
            owned: e.inventory[i].owned
        }, e.inventory[i].contents && (n.inventory[i].contents = e.inventory[i].contents);
        var r = a(JSON.stringify(n));
        writeStore("save", r), t.SaveSettings()
    }, this.SaveSettings = function() {
        var e = {
                volume: t.req.Audio.Volume(),
                textSpeed: t.req.DialogueManager.output.speed,
                wasd: t.req.Input.wasd,
                unlocked: t.unlocked
            },
            i = a(JSON.stringify(e));
        writeStore("settings", i)
    }, this.LoadSettings = function() {
        var t = this,
            n = readStore("settings");
        if (null == n) return !1;
        try {
            var i = JSON.parse(a(n));
            return t.req.DialogueManager.output.speed = i.textSpeed, t.req.Audio.ChangeVolume(i.volume), t.req.Input.useWasd(i.wasd), t.unlocked = i.unlocked || t.unlocked, !0
        } catch (o) {
            console.error("[pachinkoman] ignoring corrupt settings data: " + (o && o.message))
        }
    }
}

function InputObj(e, a) {
    function t(e) {
        this.key = null, this.action = e, this.pressed = !1, this.released = !1
    }

    function n(e) {
        for (var a = 0; a < s.buttons.length; a++)
            if (s.buttons[a].action == e) return a;
        return -1
    }

    function i(e) {
        for (var a = 0; a < s.buttons.length; a++)
            if (s.buttons[a].key == e) return s.buttons[a].action;
        return -1
    }

    function o(e) {
        var a = n(e); - 1 != a && (s.buttons[a].pressed = !0, s.buttons[a].released = !1)
    }

    function r(e) {
        var a = n(e); - 1 != a && (s.buttons[a].pressed = !1, s.buttons[a].released = !0)
    }
    this.needs = ["PlayerManager"];
    var s = this;
    this.buttons = [], this.canvas = a, this.mouseclicked = !1, this.mousereleased = !1, this.rmouseclicked = !1, this.rmousereleased = !1, this.wasd = !1, this.touchLeft = !1, this.touchRight = !1, this.touchUp = !1, this.touchDown = !1, this.touchLeftRel = !1, this.touchRightRel = !1, this.touchUpRel = !1, this.touchDownRel = !1, this.touchOk = !1, this.touchOkRel = !1;
    var s = this;
    this.useWasd = function(e) {
        this.wasd = e, this.setKeys(e ? [32, 65, 68, 87, 83] : [32, 37, 39, 38, 40])
    };
    for (var l = 0; l < e.length; l++) this.buttons.push(new t(e[l]));
    document.addEventListener("keydown", function(e) {
        var a = i(keyCode(e)); - 1 != a && o(a)
    });
    document.addEventListener("keyup", function(e) {
        var a = i(keyCode(e)); - 1 != a && r(a)
    });
    document.addEventListener("mousemove", function(e) {
        if (!s.canvas) return;
        var rect = s.canvas.getBoundingClientRect();
        s.mouseX = e.clientX - rect.left, s.mouseY = e.clientY - rect.top;
        (s.mouseX < 0 || s.mouseY < 0 || s.mouseX > s.canvas.width || s.mouseY > s.canvas.height) && (s.mouseX = s.mouseY = -1);
        s.req.PlayerManager.data.mirror && -1 !== s.mouseX && (s.mouseX = CANVAS_WIDTH - s.mouseX)
    });
    document.addEventListener("mousedown", function(e) {
        -1 != s.mouseX && -1 != s.mouseY && (1 == mouseButton(e) ? (s.mouseclicked = !0, s.mousereleased = !1) : 3 == mouseButton(e) && (s.rmouseclicked = !0, s.rmousereleased = !1))
    });
    document.addEventListener("mouseup", function(e) {
        -1 != s.mouseX && -1 != s.mouseY && (1 == mouseButton(e) ? (s.mouseclicked = !1, s.mousereleased = !0) : 3 == mouseButton(e) && (s.rmouseclicked = !1, s.rmousereleased = !0))
    });
    document.addEventListener("contextmenu", function(e) {
        -1 != s.mouseX && -1 != s.mouseY && e.preventDefault()
    });
    document.addEventListener("mouseout", function(e) {
        e.relatedTarget || (s.mouseX = s.mouseY = -1)
    });
    this.setKeys = function(e) {
        for (var a = 0; a < e.length; a++) s.buttons[a].key = e[a]
    }, this.get = function(e) {
        var a = n(e);
        return -1 == a ? new t(null) : this.buttons[a]
    }, this.clear = function() {
        for (var e = 0; e < this.buttons.length; e++) this.buttons[e].pressed = !1, this.buttons[e].released = !1;
        this.mouseclicked = !1, this.mousereleased = !1, this.rmouseclicked = !1, this.rmousereleased = !1;
        // virtual joystick: re-assert held directions every frame (arrow-key equivalent)
        this.touchLeft && (this.get("left").pressed = !0);
        this.touchRight && (this.get("right").pressed = !0);
        this.touchUp && (this.get("up").pressed = !0);
        this.touchDown && (this.get("down").pressed = !0);
        this.touchOk && (this.get("ok").pressed = !0);
        this.touchLeftRel && (this.get("left").released = !0, this.touchLeftRel = !1);
        this.touchRightRel && (this.get("right").released = !0, this.touchRightRel = !1);
        this.touchUpRel && (this.get("up").released = !0, this.touchUpRel = !1);
        this.touchDownRel && (this.get("down").released = !0, this.touchDownRel = !1);
        this.touchOkRel && (this.get("ok").released = !0, this.touchOkRel = !1)
    }
}

function LevelManager() {
    this.needs = ["ActionManager", "PlayerManager", "Audio", "Dimmer"];
    var e = this,
        a = {
            bg: "logo",
            mode: "CUTSCENE",
            next: "title",
            stopmusic: !0
        };
    this.CurrentLevel = !1;
    var t = {
        active: !0,
        levelToLoad: a,
        PausedLevel: null,
        newX: DEBUGX,
        newY: DEBUGY
    };
    this.SavePausedLevel = function() {
        t.PausedLevel = dcopy(e.CurrentLevel)
    }, this.GoToLevel = function(e, a, n) {
        var i = this.req.PlayerManager.data;
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
        var a = this.req.PlayerManager.data;
        if (this.req.PlayerManager.RestoreToIdle(), this.req.Dimmer.dim(-9, 0), "RETURN" != t.levelToLoad) {
            e.CurrentLevel = dcopy(t.levelToLoad);
            var n = e.CurrentLevel;
            t.levelToLoad = null, a.Sprite.x = t.newX, a.Sprite.y = t.newY, a.Sprite.alphabet = "gerog", n.music ? this.req.Audio.ChangeAudio(n.music.song, n.music.loop) : n.stopmusic && this.req.Audio.Stop(), this.req.ActionManager.DisableActions = !1, n.preload_actions && (this.req.ActionManager.AddActions(n.preload_actions), this.req.ActionManager.RunActions()), n.postload_actions && this.req.ActionManager.AddActions(n.postload_actions)
        } else e.CurrentLevel = dcopy(t.PausedLevel), e.CurrentLevel.bgDrawn = !1, t.PausedLevel = null, this.req.ActionManager.DisableActions = !1;
        t.active = !1
    }
}

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
    var c = -1 * CANVAS_HEIGHT;
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
        var n = e.data;
        a.mode = DIALOGUE, n.Sprite.moving = n.Sprite.homing = !1, this.state = "opening", e.RestoreToIdle(), i = [], o = [], this.variant = t || null, "death" === t ? this.req.Dimmer.dim(10, 255) : this.req.Dimmer.dim(10, 60)
    }, this.AddDialogue = function(e, i, o, r, l, c) {
        var h = e.data,
            d = this;
        this.variant = c || null, l && (h.cage ? ~l.indexOf("pman_normal") || ~l.indexOf("pman_sweat") ? l += "_cage" : ~l.indexOf("pman_") && (l = "pman_normal_cage") : h.Sprite.status.wig && (~l.indexOf("pman_normal") || ~l.indexOf("pman_sweat") || ~l.indexOf("pman_happy") ? l += "_wig" : ~l.indexOf("pman_") && (l = "pman_normal_wig"))), i.mode != DIALOGUE ? d.StartDialogue(e, i, c) : d.state = "output", d.output.length = d.output.counter = 0, n = r, t = o, a = this.req.Resources.get("Portraits", l), s = 0, "timed" === c && (this.timer = 60)
    }, this.ResetDialogueOptions = function() {
        i = [], o = []
    }, this.AddDialogueOption = function(e, t, n, s) {
        var l = this;
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
        var o = this,
            r = o.output;
        switch (o.state) {
            case "opening":
                c += 2 + l.max * (-1 * c / CANVAS_WIDTH), c >= 0 && (c = 0, o.state = 0 == i.length ? "output" : "options");
                break;
            case "output":
                if (r.counter += 1 / FPS, r.counter >= 1 / r.speed) {
                    r.counter = 0, r.length++, " " == n[r.length] && r.length++;
                    var h = n[r.length - 2];
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

function ActionManager() {
    function e(e, a, t) {
        {
            var n, i, r;
            t.operant
        }
        switch (t.type) {
            case "always":
                return t.jumpto;
            case "itemOwned":
                n = a.inventory[t.item].owned;
                break;
            case "spriteDistance":
                n = Math.abs(a.Sprite.x - e.sprites[t.sprite].x), i = t.distance;
                break;
            case "switchValue":
                n = a.switches[t.which], i = t.value;
                break;
            case "playerAnimation":
                n = a.Sprite.animation, i = t.animation;
                break;
            case "spriteAnimation":
                n = e.sprites[t.sprite].animation, i = t.animation;
                break;
            case "deathcount":
                n = a.deathcount, i = t.value;
                break;
            case "playerStatus":
                n = a.Sprite.status[t.which], i = t.value;
                break;
            case "playerField":
                n = a[t.which];
                break;
            case "itemFieldValue":
                n = a.inventory[t.item][t.field], i = t.value;
                break;
            case "spriteFieldValue":
                n = e.sprites[t.sprite][t.field], i = t.value;
                break;
            case "level":
                n = e.title, i = t.value;
                break;
            case "target":
                n = o, i = t.value;
                break;
            case "insideZone":
                var s = a.Sprite,
                    l = e.zones[t.zone],
                    c = t.offset || 0;
                n = s.x >= l.left - c && s.x <= l.left + l.width + c
        }
        switch (t.operant) {
            case "yn":
                r = n;
                break;
            case "equals":
                r = n == i;
                break;
            case "notequal":
                r = n != i;
                break;
            case "greater":
                r = n > i;
                break;
            case "less":
                r = i > n;
                break;
            case "greaterOrEqual":
                r = n >= i;
                break;
            case "lesserOrEqual":
                r = i >= n
        }
        return r ? t.yes : t.no
    }

    function a() {
        return r[Math.floor(Math.random() * r.length)]
    }

    function t(e) {
        if (0 !== Math.floor(3 * Math.random())) {
            var a = 0 === Math.floor(2 * Math.random()) && s.socialMessages[e.title] ? s.socialMessages[e.title] : s.socialMessages.generic,
                t = a[Math.floor(Math.random() * a.length)];
            return t = t.replace("USER", s.usernames[Math.floor(Math.random() * s.usernames.length)]), t = t.replace("RANDOMNUM", 5 + Math.floor(300 * Math.random())), [{
                action: "dialogue",
                text: t,
                speaker: "Social Newsfeed",
                variant: "social"
            }, {
                action: "end",
                disableFreemium: !0
            }]
        }
        var n = s.questions[Math.floor(Math.random() * s.questions.length)];
        return [{
            action: "dialogue",
            text: n,
            speaker: "Baal",
            portrait: "baal"
        }, {
            action: "option",
            text: "Yes",
            label: "noskip"
        }, {
            action: "option",
            text: "No",
            label: "skip"
        }, {
            action: "label",
            name: "noskip"
        }, {
            action: "wait",
            frames: 40
        }, {
            action: "dialogue",
            text: "ERROR - UNABLE TO CONNECT \n Unable to connect to PACHINKONET server. \n Make sure you are playing on an authorized Ouya or Palm Pilot device and try again.",
            variant: "social"
        }, {
            action: "label",
            name: "skip"
        }, {
            action: "end",
            disableFreemium: !0
        }]
    }
    this.needs = ["LevelManager", "PlayerManager", "SaveManager", "DialogueManager", "Audio", "Dimmer", "freemium"];
    var n = [],
        i = 0,
        o = null;
    this.DisableActions = !1, this.timeout = 0, this.AddActions = function(e, a) {
        return o = a || null, this.timeout > 0 ? !1 : (n = e.slice(), void(i = 0))
    }, this.ActionsLeft = function() {
        return i < n.length
    }, this.RunActions = function() {
        if (!this.DisableActions) {
            var r = this,
                s = !0,
                l = this.req.LevelManager.CurrentLevel,
                c = this.req.PlayerManager.data;
            for (this.timeout > 0 && (this.timeout--, s = !1); s && i < n.length;) {
                var h = n[i++];
                switch (h.action) {
                    case "dialogue":
                        h.text = h.text.replace("[DEATHS]", c.deathcount), h.cage && c.cage ? h.text = h.cage : "PACHINKO MAN" == h.speaker && c.cage && (h.text = a()), this.req.DialogueManager.AddDialogue(this.req.PlayerManager, l, h.speaker, h.text, h.portrait, h.variant), s = !1;
                        break;
                    case "option":
                        for (this.req.DialogueManager.ResetDialogueOptions(), this.req.DialogueManager.AddDialogueOption(this.req.PlayerManager, l, h.text, h.label);
                            "option" == n[i].action;) h = n[i], this.req.DialogueManager.AddDialogueOption(c, l, h.text, h.label), i++;
                        s = !1;
                        break;
                    case "randomlabel":
                        var d, u, m = [],
                            p = 0,
                            g = 0;
                        for (i--;
                            "randomlabel" == n[i].action;) {
                            var f = n[i].name,
                                A = n[i].weight || 1;
                            m.push({
                                name: f,
                                weight: A || 1
                            }), p += A, i++
                        }
                        d = Math.floor(Math.random() * p) + 1;
                        for (var b = 0; b < m.length && d >= b && !u; b++) d <= g + m[b].weight && (u = m[b].name), g += m[b].weight;
                        r.BranchToLabel(u);
                        break;
                    case "wait":
                        "closed" != this.req.DialogueManager.state && (this.req.DialogueManager.state = "closing"), this.timeout = h.seconds ? h.seconds * FPS : h.frames || 0, s = !1;
                        break;
                    case "attractsprite":
                        var S = l.sprites[h.sprite],
                            w = "PLAYER" == h.target.toUpperCase() ? c.Sprite : l.sprites[h.target],
                            T = h.offsetx || 0,
                            E = h.offsety || 0,
                            I = h.seconds ? h.seconds * FPS : h.frames;
                        S.movement = {
                            type: "easeto",
                            duration: I,
                            tx: w.x + T,
                            ty: w.y + E
                        };
                        break;
                    case "spritewalk":
                        var S = l.sprites[h.sprite];
                        S.movement = {
                            type: "walk",
                            xspeed: h.speed
                        };
                        break;
                    case "background":
                        l.bg = h.bg;
                        break;
                    case "dim":
                        h.percentage && (h.opacity = 255 * h.percentage), this.req.Dimmer.dim(h.speed, h.opacity);
                        break;
                    case "freeze":
                        this.req.PlayerManager.Freeze();
                        break;
                    case "unfreeze":
                        this.req.PlayerManager.Unfreeze();
                        break;
                    case "getitem":
                        c.inventory[h.item].owned = !0;
                        break;
                    case "setitemfield":
                        c.inventory[h.item][h.field] = h.value;
                        break;
                    case "setspritefield":
                        c.Level.spites[h.sprite][h.field] = h.value;
                        break;
                    case "useitemactions":
                        this.AddActions(c.inventory[h.item].errorAction);
                        break;
                    case "usedefaultactions":
                        o && l.sprites[o] && l.sprites[o].default_actions && this.AddActions(l.sprites[o].default_actions);
                        break;
                    case "setswitch":
                        h.increment ? c.switches[h.which] += h.increment : h.decrement ? c.switches[h.which] -= h.increment : c.switches[h.which] = h.value;
                        break;
                    case "gotolevel":
                        h.x || (h.x = c.Sprite.x), h.y || (h.y = c.Sprite.y), this.req.LevelManager.GoToLevel(h.level, h.x, h.y), i = n.length;
                        break;
                    case "spriteani":
                        var S = l.sprites[h.sprite],
                            v = h.animation;
                        S.animation = v, S.frame = 0;
                        break;
                    case "playerani":
                        var S = c.Sprite,
                            v = h.animation;
                        S.animation = v, S.frame = 0;
                        break;
                    case "spritefield":
                        l.sprites[h.sprite][h.field] = h.value;
                        break;
                    case "playerfield":
                        c[h.field] = h.value;
                        break;
                    case "playerdirection":
                        "left" == h.direction ? c.Sprite.direction = -1 : "right" == h.direction && (c.Sprite.direction = 1);
                        break;
                    case "statusfx":
                        c.Sprite.status[h.which] = h.value;
                        break;
                    case "moveplayer":
                        h.x && (c.Sprite.x = h.x), h.y && (c.Sprite.y = h.y);
                        break;
                    case "movesprite":
                        var k = l.sprites[h.sprite];
                        h.x && (k.x = h.x), h.y && (k.y = h.y);
                        break;
                    case "levelbounds":
                        h.left && (l.leftWall = h.left), h.right && (l.rightWall = h.right);
                        break;
                    case "death":
                        this.req.Dimmer.dim(15, 255), c.deathcount++, c.lastlevel = "cubicle", c.x = 230, c.y = 276, c.Sprite.status.ball = !1;
                        var y = h.epitaph,
                            O = h.sfx;
                        this.req.Audio.ChangeAudio("death", !1);
                        var R = [{
                            action: "dialogue",
                            text: O,
                            variant: "death"
                        }, {
                            action: "dialogue",
                            text: y,
                            speaker: "BAAL",
                            portrait: "baal"
                        }, {
                            action: "dialogue",
                            text: "WELP! LOOKS LIKE YOU'VE DIED. READY TO THROW IN THE TOWEL?",
                            speaker: "BAAL",
                            portrait: "baal"
                        }, {
                            action: "playerani",
                            animation: "stand"
                        }, {
                            action: "option",
                            text: "Continue",
                            label: "Continue"
                        }, {
                            action: "option",
                            text: "Give Up The Ghost",
                            label: "Quit"
                        }, {
                            action: "label",
                            name: "Quit"
                        }, {
                            action: "moveplayer",
                            x: 230,
                            y: 276
                        }, {
                            action: "savegame"
                        }, {
                            action: "gotolevel",
                            level: "title"
                        }, {
                            action: "end"
                        }, {
                            action: "label",
                            name: "Continue"
                        }, {
                            action: "gotolevel",
                            level: "cubicle",
                            x: 230,
                            y: 276
                        }, {
                            action: "end"
                        }];
                        r.AddActions(R);
                        break;
                    case "pausesprite":
                        l.sprites[h.sprite].paused = !0;
                        break;
                    case "unpausesprite":
                        l.sprites[h.sprite].paused = !1;
                        break;
                    case "killsprite":
                        delete l.sprites[h.sprite];
                        break;
                    case "branch":
                        var N = e(l, c, h);
                        r.BranchToLabel(N);
                        break;
                    case "savegame":
                        this.req.SaveManager.Save();
                        break;
                    case "unlock":
                        this.req.SaveManager.unlocked[h.which] = !0, this.req.SaveManager.SaveSettings();
                        break;
                    case "music":
                        h.restore ? this.req.Audio.ChangeAudio(l.music.song, l.music.loop) : this.req.Audio.ChangeAudio(h.song, h.loop);
                        break;
                    case "stopmusic":
                        this.req.Audio.Stop();
                        break;
                    case "end":
                        this.req.freemium.enabled && "closed" !== this.req.DialogueManager.state && !h.disableFreemium ? (i = 0, this.AddActions(t(l))) : ("closed" !== this.req.DialogueManager.state && (this.req.DialogueManager.state = "closing"), i = n.length)
                }
            }
            i == n.length && (n = [])
        }
    }, this.BranchToLabel = function(e) {
        for (var a = 0; a < n.length; a++)
            if ("label" == n[a].action && n[a].name == e) return void(i = a)
    };
    var r = ["I'M A VAMPIRE!", "Whaddya say we cut the chit-chat, A-HOLE.", "HOW'D IT GET BURNED?", "Am I getting THROUGH to you?", "It's you... you're the rocket man.", "You wanna know who really killed JFK?", "Hey, where's that chocolate cake?", "Ahh, it's a HOEDOWN!!", "I'm gonna steal the Declaration of Independence.", "I AM THE GREATEEEST!", "NOT THE BEES!", "Well HALLELUJAH man, the JOKER'S WILD!", "TA-DAAAA~!", "FEVEEEEER!", "PACHINKO."],
        s = {
            usernames: ["DarthSlagar", "SSJ3Blade", "Vegetallo", "Visser46", "MWilson_WholeFoods", "SailorMoonB0b", "CpnDaFragulator", "420StRaiGhtEgjj", "GTABlacKOpz", "mr staby", "d8vid da kn0me", "-=BubsyPro=-", "ristarIsUnderrated", "XxCowToolsxX", "bOltCruShEr94", "InfiniteStairs", "RomPoll", "USING_THE_CAT_BRUSH", "GokuMan5000", "ViolinBow39", "Xx_SOADfan4Life_xX", "FablesofFaubus45", "Repairmanman69", "HashtagHashtagLol", "b4rrelroolEternal", "C0ckyLittleFr33k", "married2reshiram", "CagedNickels", "fartlicka", "laxpie777", "turkalmechanic", "BUTTCHEESE_PERSON", "anime_otaku_2004", "edtivirusky", "willdrumbacon", "homes7uckZim", "F0odChainz", "VOLVIC-MINIRAL-BREKFIST"],
            socialMessages: {
                generic: ["USER rated PACHINKO MAN 5 Stars on the App Store!", "USER has purchased a Puzzle Solution from the PACHINKO MART!", "Woohoo! USER liked PACHINKO MAN on Facebook. They earned 10 PACHINKO POINTS!", "USER reblogged PACHINKO MAN on Tumblr. They earned 12 PACHINKO POINTS!", "USER retweeted PACHINKO MAN. They unearthed a new PACHINKO GEM!", "USER pinned PACHINKO MAN on Pinterest. They uncovered a new PACHINKO GEM!", "USER used the LENGTH OF ROPE RANDOMNUM times today. Can you beat their top score?", "USER has purchased RANDOMNUM Pachinko Points. They're #1 on their PACHINKO MAN Friends List!", "Wow, USER just subscribed to our mailing list! Plenty of exciting tips and offers are on their way.", "USER shared this level with a friend! They earned 50 PACHINKO POINTS.", "USER has shared this game with their entire contacts list! They've earned another hour of game time."],
                cubicle: ['mimecraftdude left a comment: \n "stuck pls help"', 'CagedNickles left a comment: \n "any1 LFG? cant get past demon guard instance"', 'married2reshiram left a comment: \n "this game isnt scarrey!"', 'SailorMoonB0b left a comment: \n "need 100k gems to buy the Elite Stapler pls"', 'turkalmechanic left a comment: \n "lame"', "USER favorited Inconsolable PC!"],
                alley: ["USER favorited MORVEN!", "USER favorited DEMON GUARD!", 'mimecraftdude left a comment: \n "stuck"', 'RomPoll left a comment: \n "they say funny things if you click on them lol"', 'kramer23 left a comment: \n "gems ran out, how do I buy timer refill?"'],
                watercooler: ["USER favorited PINBALL MAN!", 'InfiniteStairs left a comment: \n "where do I farm gems? cant afford sephiroth costume"', 'molebog left a comment: \n "br??"', 'USER unlocked a new achievement: \n "Discount Shavings"'],
                hallway: ["USER favorited the WOMEN'S RESTROOM!", 'XxCowToolsxX left a comment: \n "elefator wont work, lol programing fail"', 'GTABlacKOpz left a comment: \n "WHERE ARE GUNS ONN THIS FLOOR"', 'RomPoll left a comment: \n "canot find where to use the rope, help???"', 'USER unlocked a new achievement: \n "ELEVATOR BUTTON-MASHER"'],
                presentation: ['homes7uckZim left a comment: \n "part 31 of my fanfic SPHEROID HEARTS now online! (baalzoten shipping, pg-13)"', "USER favorited MURMUR!", "USER favorited BEELZOTEN!", 'USER unlocked a new achievement: \n "THE SECRET OF HOWRSE - REVEALED!"'],
                bathroom: ["USER favorited MELISSA!", "USER favorited the Periodic Table joke!", 'USER unlocked a new achievement: \n "A HOWRSE OF A DIFFERENT COLOR"', 'USER unlocked a new achievement: \n "FEAR OF A BLOOD PLANET"', 'GokuMan5000 left a comment: \n "mystery lens is from zedla, **** ripoff"', 'kramer23 left a comment: \n "HELP! I BUY WIG UPGRADE FROM THE INGAME STORE AND MY HAIRS STUCK IN THE WALLS"'],
                cavern: ['GTABlacKOpz left a comment: \n "I DIED WTF. WHWHERE IS LIFE"', 'FablesofFaubus45 left a comment: \n "does cerabulus have rare drops? can\'t find it on the wiki"', '-=BubsyPro=- left a comment: \n "cant get past celbraus. im at pachinkopoint level 53, should I grind?"'],
                lobby: ['g4rt7r left a comment: \n "i hate fishes"', 'homes7uckZim left a comment: \n "looking for pre readers for ch. 87 of my Dr. Who/Pman Crossover fic!"', 'd8vid da kn0me left a comment: \n "ghost needs nerfed"', 'USER unlocked a new achievement: \n "EXECUTIVE SUITE LIFE"', "USER favorited VENDINGHEIST!", "USER favorited ORIGAMI-TAN!"],
                dragon: ['FablesofFaubus45 left a comment: \n "dragonrow is OP. wait for patch"', "USER favorited NETFEAR ROUTER!"],
                thiefsden: ["USER has spent RANDOMNUM hours solving this puzzle. Think you can top their score?", 'b4rrelroolEternal left a comment: \n "only noobs solve puzzles lol, buy the puzzle solution season pack and skip to ending"']
            },
            questions: ["WOULD YOU LIKE TO RATE PACHINKO MAN 5 STARS IN THE APP STORE FOR A FREE PACHINKO GEM?", "HEY, HOW ABOUT UPVOTING THIS GAME ON A SOCIAL MEDIA PLATFORM, PAL? YOU CAN EARN POINTS AND GEMS!", "WOULD YOU LIKE TO REGISTER YOUR CONTACTS LIST FOR OUR SPECIAL MAILING LIST? LOTS OF EXCITING DEALS AND OFFERS, EVERY HOUR!", "FEELING STUCK? YOU CAN PURCHASE A PUZZLE SOLUTION FROM OUR IN-APP STORE! HOW'S ABOUT IT, CHAMP?", "YOU MIGHT BE RUNNING LOW ON GAME TIME! WANT TO FILL YOUR METER TO THE BRIM OVER AT OUR IN-APP STORE?", "YOU CAN BUY EXTRA COSTUMES AND ITEMS IN OUR IN-APP STORE! WANT TO GO DO THAT THING I JUST SAID?", "YOU CAN PURCHASE A VERSION OF THIS GAME WITH NO BUGS AT OUR IN-APP STORE! WANT TO DO THAT NOW?", "YOU HAVEN'T REVIEWED THIS GAME ON YELP! WOULD YOU LIKE TO TAKE A BREAK AND DO THAT, SPORT?", "WOULD YOU LIKE TO ADD THIS DIALOGUE EXCHANGE TO YOUR FAVORITES LIST?", "YOU EARN MORE PACHINKO GEMS IF YOU WATCH MORE SPONSORED CONTENT! WOULD YOU LIKE TO ENABLE MORE ADS?"]
        }
}

function ResourceManager() {
    function e(e, a) {
        var n = i[a][e];
        i[a][e] = new Image;
        i[a][e].onload = function() {
            t--
        };
        i[a][e].onerror = function() {
            t--, console.error("[pachinkoman] image failed to load: " + n)
        };
        i[a][e].src = n, t++
    }

    function a(e, a) {
        // Audio loads in the background and never blocks the loading gate.
        var n = i[a][e],
            snd = new Audio();
        snd.addEventListener("error", function() {
            console.error("[pachinkoman] audio failed to load: " + n)
        });
        snd.src = n;
        i[a][e] = snd
    }
    var t = 0,
        n = 0,
        i = {
            Backgrounds: {
                logo: "img/CS_logo.gif",
                title: "img/CS_title.gif",
                intro1: "img/bg_intro1.gif",
                intro2: "img/bg_intro2.gif",
                intro3: "img/bg_intro3.gif",
                howto: "img/CS_howtoplay.png",
                mainmenu: "img/menubg.png",
                options: "img/optionsbg.png",
                cubicle: "img/bg_cubicle.gif",
                alley: "img/bg_alley.gif",
                watercooler: "img/bg_watercooler.gif",
                hallway: "img/bg_hallway.gif",
                bathroom: "img/bg_bathroom.gif",
                presentation: "img/bg_presentation.gif",
                cavern: "img/bg_cavern.gif",
                lobby: "img/bg_lobby.gif",
                office: "img/bg_office.gif",
                morvencubicle: "img/bg_morven.gif",
                thiefsden: "img/thiefsden.gif",
                baalroom: "img/bg_baalroom.gif",
                elevator: "img/CS_elevator.gif",
                kickstarter: "img/kickstarter.gif",
                cutscene_ex: "img/CS_example.png",
                test: "img/testbg.png",
                badend: "img/cs_badend.gif",
                goodend1: "img/cs_end1.gif",
                goodend2: "img/cs_end2.gif",
                goodend3: "img/cs_end3.gif",
                credits1: "img/cs_credits1.gif",
                credits2: "img/cs_credits2.gif",
                credits3: "img/cs_credits3.gif",
                credits4: "img/cs_credits4.gif",
                the_end: "img/cs_the_end.gif",
                the_end_bad: "img/bg_badend.gif",
                cage_end_bad: "img/bg_badend_cage.gif",
                cage_the_end: "img/bg_goodend_cage.gif"
            },
            Spritesheets: {
                pachinkoman: "img/ss_pachinkoman.png",
                pachinko_wig: "img/ss_pachinkoman_wig.png",
                scissors: "img/ss_scissors.png",
                stapler: "img/ss_stapler.png",
                chair: "img/ss_chair.png",
                demonguard: "img/ss_demonguard.png",
                morven: "img/ss_morven.png",
                tinymorven: "img/ss_tinymorven.png",
                pinballman: "img/ss_pinballman.png",
                murmur: "img/ss_murmur.png",
                gregorie: "img/ss_gregorie.gif",
                slideshow: "img/ss_slideshow.png",
                cryingdevil: "img/ss_cryingdevil.gif",
                projector: "img/ss_projector.gif",
                itguy: "img/ss_itguy.png",
                melissa: "img/ss_melissa.png",
                cerballus: "img/ss_cerballus.png",
                janitor: "img/ss_janitor.png",
                bossdoor: "img/ss_bossdoor.gif",
                origamitan: "img/ss_origamitan.png",
                ghost: "img/ss_ghost.png",
                dragon: "img/ss_dragon.png",
                itguy_cage: "img/ss_itguycage.png",
                compyfx: "img/ss_compyfx.png",
                rope: "img/ss_rope.png",
                wig: "img/ss_wig.png",
                bathroomblood: "img/ss_bloodroom.png",
                eightball: "img/ss_8ball.png",
                ankh: "img/ss_ankh.png",
                monitors: "img/ss_monitors.png",
                printerpaper: "img/ss_printerpaper.png",
                wires: "img/ss_wires.png",
                thiefobstacles: "img/ss_thiefobstacles.png",
                crowbar: "img/ss_crowbar.png",
                doomsphere: "img/ss_doomsphere.png",
                trapdoor: "img/ss_trapdoor.png",
                elevator: "img/ss_elevator.png",
                baal: "img/ss_baal.png",
                hand: "img/ss_hand.png",
                p_pachinkoman: "img/p_pachinkoman.png",
                p_pinballman: "img/p_pinballman.png",
                p_baal: "img/p_baal.png",
                p_pinballman_shaved: "img/p_pinballman_shaved.png",
                p_morven: "img/p_morven.png",
                p_murmur: "img/p_murmur.png",
                p_gregorie: "img/p_gregorie.png",
                p_bioten: "img/p_bioten.png",
                p_melissa: "img/p_melissa.png",
                p_cerballus: "img/p_cerballus.png",
                p_janitor: "img/p_janitor.png",
                p_origamitan: "img/p_origamitan.png",
                p_dragon: "img/p_dragon.png",
                p_dragonmad: "img/p_dragonmad.png",
                p_dragonattack: "img/p_dragonattack.png",
                p_itguy: "img/p_itguy.png",
                p_ankh: "img/p_ankh.png",
                p_ankh_unleashed: "img/p_ankh_unleashed.png",
                p_monitors: "img/p_monitors.png",
                items: "img/item_sprites.png",
                banner_close: "img/banner-close.png",
                banner_1: "img/banner-1.png",
                banner_2: "img/banner-2.png",
                banner_3: "img/banner-3.png",
                banner_4: "img/banner-4.png",
                banner_5: "img/banner-5.png",
                banner_6: "img/banner-6.png",
                banner_7: "img/banner-7.png"
            },
            Songs: {
                title: "snd/title.ogg",
                opening: "snd/opening.ogg",
                demo: "snd/demo.ogg",
                lobby: "snd/lobby.ogg",
                death: "snd/death.ogg",
                fakeout: "snd/fakeout.ogg",
                thunder: "snd/thunder-FX.ogg",
                ankh: "snd/ankhtheme.ogg",
                showdown: "snd/showdown.ogg",
                fall: "snd/fall.ogg",
                crisis: "snd/crisis.ogg",
                elevator: "snd/elevator-FX.ogg",
                glass: "snd/glass-FX.ogg"
            },
            Portraits: {
                pman_normal: {
                    spritesheet: "p_pachinkoman",
                    width: 142,
                    height: 150,
                    row: 10,
                    frames: 5,
                    anispeed: 8,
                    lastFrame: 4
                },
                pman_sarcastic: {
                    spritesheet: "p_pachinkoman",
                    width: 142,
                    height: 150,
                    row: 0,
                    frames: 10,
                    anispeed: 8,
                    lastFrame: 7
                },
                pman_sweat: {
                    spritesheet: "p_pachinkoman",
                    width: 142,
                    height: 150,
                    row: 1,
                    frames: 4,
                    anispeed: 8
                },
                pman_happy: {
                    spritesheet: "p_pachinkoman",
                    width: 142,
                    height: 150,
                    row: 2,
                    frames: 5,
                    anispeed: 8,
                    lastFrame: 3,
                    lastFrame: 4
                },
                pman_accuse: {
                    spritesheet: "p_pachinkoman",
                    width: 142,
                    height: 150,
                    row: 3,
                    frames: 5,
                    anispeed: 12
                },
                pman_twitch: {
                    spritesheet: "p_pachinkoman",
                    width: 142,
                    height: 150,
                    row: 4,
                    frames: 5,
                    anispeed: 12
                },
                pman_normal_wig: {
                    spritesheet: "p_pachinkoman",
                    width: 170,
                    height: 150,
                    row: 11,
                    frames: 4,
                    anispeed: 8,
                    lastFrame: 3
                },
                pman_sarcastic_wig: {
                    spritesheet: "p_pachinkoman",
                    width: 170,
                    height: 150,
                    row: 5,
                    frames: 10,
                    anispeed: 8,
                    lastFrame: 7
                },
                pman_sweat_wig: {
                    spritesheet: "p_pachinkoman",
                    width: 170,
                    height: 150,
                    row: 6,
                    frames: 4,
                    anispeed: 8
                },
                pman_happy_wig: {
                    spritesheet: "p_pachinkoman",
                    width: 170,
                    height: 150,
                    row: 7,
                    frames: 5,
                    anispeed: 8,
                    lastFrame: 2
                },
                pman_normal_cage: {
                    spritesheet: "p_pachinkoman",
                    width: 144,
                    height: 150,
                    row: 8,
                    frames: 4,
                    anispeed: 12
                },
                pman_sweat_cage: {
                    spritesheet: "p_pachinkoman",
                    width: 144,
                    height: 150,
                    row: 9,
                    frames: 4,
                    anispeed: 8
                },
                baal: {
                    spritesheet: "p_baal",
                    width: 192,
                    height: 150,
                    row: 0,
                    frames: 5,
                    anispeed: 11,
                    skipfirst: !0
                },
                pinball_steady: {
                    spritesheet: "p_pinballman",
                    width: 180,
                    height: 150,
                    row: 0,
                    frames: 1,
                    anispeed: 12
                },
                pinball_chat: {
                    spritesheet: "p_pinballman",
                    width: 180,
                    height: 150,
                    row: 1,
                    frames: 2,
                    anispeed: 8
                },
                pinball_flag: {
                    spritesheet: "p_pinballman",
                    width: 180,
                    height: 150,
                    row: 2,
                    frames: 9,
                    anispeed: 13,
                    alwaysAnimate: !0
                },
                pinball_shaved_steady: {
                    spritesheet: "p_pinballman_shaved",
                    width: 180,
                    height: 150,
                    row: 0,
                    frames: 1,
                    anispeed: 12
                },
                pinball_shaved_chat: {
                    spritesheet: "p_pinballman_shaved",
                    width: 181,
                    height: 150,
                    row: 1,
                    frames: 2,
                    anispeed: 8
                },
                pinball_shaved_flag: {
                    spritesheet: "p_pinballman_shaved",
                    width: 181,
                    height: 150,
                    row: 2,
                    frames: 2,
                    anispeed: 8,
                    alwaysAnimate: !0
                },
                morven_steady: {
                    spritesheet: "p_morven",
                    width: 150,
                    height: 150,
                    row: 0,
                    frames: 1,
                    anispeed: 0
                },
                morven_chat: {
                    spritesheet: "p_morven",
                    width: 144,
                    height: 150,
                    row: 1,
                    frames: 4,
                    anispeed: 15
                },
                morven_unmasked: {
                    spritesheet: "p_morven",
                    width: 142,
                    height: 150,
                    row: 2,
                    frames: 8,
                    anispeed: 12
                },
                morven_unmasking: {
                    spritesheet: "p_morven",
                    width: 150,
                    height: 150,
                    row: 3,
                    frames: 16,
                    anispeed: 15,
                    noLoop: !0,
                    alwaysAnimate: !0,
                    offsetx: 8
                },
                gregorie: {
                    spritesheet: "p_gregorie",
                    width: 174,
                    height: 148,
                    row: 0,
                    frames: 4,
                    anispeed: 15
                },
                gregorie_glitch: {
                    spritesheet: "p_gregorie",
                    width: 185,
                    height: 150,
                    row: 0,
                    rowStartY: 148,
                    frames: 4,
                    anispeed: 12
                },
                murmur_mug: {
                    spritesheet: "p_murmur",
                    width: 166,
                    height: 150,
                    row: 0,
                    frames: 1,
                    anispeed: 15
                },
                murmur_drink: {
                    spritesheet: "p_murmur",
                    width: 166,
                    height: 150,
                    row: 2,
                    frames: 2,
                    anispeed: 3,
                    alwaysAnimate: !0
                },
                murmur_nomug: {
                    spritesheet: "p_murmur",
                    width: 158,
                    height: 150,
                    row: 0,
                    frames: 6,
                    anispeed: 9,
                    rowStartY: 776,
                    lastFrame: 2
                },
                beelzoten: {
                    spritesheet: "p_bioten",
                    width: 136,
                    height: 150,
                    row: 0,
                    frames: 5,
                    anispeed: 9
                },
                melissa: {
                    spritesheet: "p_melissa",
                    width: 148,
                    height: 146,
                    row: 0,
                    frames: 2,
                    anispeed: 9
                },
                cerballus: {
                    spritesheet: "p_cerballus",
                    width: 210,
                    height: 150,
                    row: 0,
                    frames: 4,
                    anispeed: 8
                },
                janitor: {
                    spritesheet: "p_janitor",
                    width: 162,
                    height: 150,
                    row: 0,
                    frames: 4,
                    anispeed: 8
                },
                origamitan: {
                    spritesheet: "p_origamitan",
                    width: 162,
                    height: 150,
                    row: 0,
                    frames: 4,
                    anispeed: 7
                },
                dragon: {
                    spritesheet: "p_dragon",
                    width: 162,
                    height: 150,
                    row: 0,
                    frames: 7,
                    anispeed: 8
                },
                dragonmad: {
                    spritesheet: "p_dragonmad",
                    width: 162,
                    height: 150,
                    row: 0,
                    frames: 4,
                    anispeed: 8,
                    alwaysAnimate: !0
                },
                dragonattack: {
                    spritesheet: "p_dragonattack",
                    width: 158,
                    height: 134,
                    row: 0,
                    frames: 4,
                    anispeed: 8,
                    alwaysAnimate: !0
                },
                itguy: {
                    spritesheet: "p_itguy",
                    width: 162,
                    height: 150,
                    row: 0,
                    frames: 4,
                    anispeed: 8
                },
                itguy_happy: {
                    spritesheet: "p_itguy",
                    width: 158,
                    height: 150,
                    row: 1,
                    frames: 4,
                    anispeed: 8,
                    offsetX: 2
                },
                ankh: {
                    spritesheet: "p_ankh",
                    width: 162,
                    height: 150,
                    anispeed: 9,
                    row: 0,
                    frames: 4
                },
                ankh_unleashed: {
                    spritesheet: "p_ankh_unleashed",
                    width: 162,
                    height: 150,
                    anispeed: 9,
                    row: 0,
                    frames: 3,
                    alwaysAnimate: !0
                },
                shanty: {
                    spritesheet: "p_monitors",
                    frames: 4,
                    anispeed: 12,
                    width: 156,
                    height: 134
                },
                blandy: {
                    spritesheet: "p_monitors",
                    rowStartY: 134,
                    frames: 4,
                    anispeed: 12,
                    width: 134,
                    height: 128
                },
                mandy: {
                    spritesheet: "p_monitors",
                    rowStartY: 262,
                    frames: 4,
                    anispeed: 12,
                    width: 134,
                    height: 130
                },
                baal_tanaka: {
                    spritesheet: "p_baal",
                    rowStartY: 150,
                    frames: 4,
                    anispeed: 11,
                    width: 162,
                    height: 146
                },
                baal_happy: {
                    spritesheet: "p_baal",
                    rowStartY: 300,
                    frames: 4,
                    anispeed: 11,
                    width: 158,
                    height: 146
                },
                baal_mad: {
                    spritesheet: "p_baal",
                    rowStartY: 448,
                    frames: 4,
                    anispeed: 11,
                    width: 158,
                    height: 146
                },
                baal_neutral: {
                    spritesheet: "p_baal",
                    rowStartY: 596,
                    frames: 4,
                    anispeed: 11,
                    width: 158,
                    height: 146
                }
            }
        };
    this.get = function(e, a) {
        return i[e][a]
    }, this.loaded = function() {
        return 0 === t
    }, this.loadPercentage = function() {
        return 100 - Math.floor(100 * (t / n))
    };
    for (var o in i.Backgrounds) e(o, "Backgrounds");
    for (var o in i.Spritesheets) e(o, "Spritesheets");
    for (var o in i.Songs) a(o, "Songs");
    n = t
}

function Graphics(e) {
    function a() {
        e.clearRect(0, 0, 2 * CANVAS_WIDTH, 2 * CANVAS_HEIGHT)
    }

    function t(a) {
        if (e.fillStyle = "rgba(255, 0, 0, 0.3)", null != a.zones)
            for (var t in a.zones) {
                var n = a.zones[t];
                e.fillRect(n.left, n.top, n.width, n.height)
            }
    }

    function n() {
        e.fillStyle = "rgba(0, 0, 0, " + A.req.Dimmer.alpha / 255 + ")", e.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    function i(a) {
        for (var t = 0; t < a.buttons.length; t++) {
            var n = a.buttons[t];
            if (!n.hide) {
                e.lineWidth = 4, e.strokeStyle = "rgb(255,255,255)", e.strokeRect(100, n.top, CANVAS_WIDTH - 200, 50), e.fillStyle = n.selected ? "rgb(100,100,100)" : "rgb(55,55,55)", e.fillRect(100, n.top, CANVAS_WIDTH - 200, 50), e.font = "bold 12pt pixelmix";
                var i = e.measureText(n.text);
                e.fillStyle = "rgb(255,255,255)", e.fillText(n.text, 300 - i.width / 2, n.top + 30)
            }
        }
    }

    function o(e) {
        e.mode == CUTSCENE || e.mode == MENU ? e.bgDrawn && e.bg == S || (S = e.bg, b.style.background = "url('" + A.req.Resources.get("Backgrounds", e.bg).src + "') no-repeat", e.bgDrawn = !0) : e.bgDrawn && e.bg == S || (S = e.bg, S ? b.style.background = "url('" + A.req.Resources.get("Backgrounds", e.bg).src + "') no-repeat" : b.style.background = "none", e.bgDrawn = !0)
    }

    function r(e, a) {
        each(e.sprites, function(e, t) {
            if (t.z <= 0 || t.y < a.Sprite.y && !t.offScreen) {
                var n = A.req.Resources.get("Spritesheets", t.spritesheet);
                s(t, n)
            }
        }), e.monologue || s(a.Sprite, A.req.Resources.get("Spritesheets", a.Sprite.spritesheet), !0), each(e.sprites, function(e, t) {
            if (t.z > 0 || t.y >= a.Sprite.y && !t.offScreen) {
                var n = A.req.Resources.get("Spritesheets", t.spritesheet);
                s(t, n)
            }
        })
    }

    function s(a, t, n) {
        var i = a.direction;
        if (n && (i *= -1), a.alpha && (e.globalAlpha = a.alpha), -1 == i && (e.save(), e.translate(a.x, 0), e.scale(-1, 1), e.translate(-1 * a.x, 0)), a.rotatePerPx && a.originalX && (e.save(), e.translate(a.x, a.y), e.rotate((a.x - a.originalX + (a.initrotate || 0)) * a.rotatePerPx * Math.PI / 180), e.translate(-1 * a.x, -1 * a.y)), a.animation) {
            var o = a.animations[a.animation];
            if (n) {
                var r = a.animation;
                a.status.wig && (r += "_wig"), a.status.ball && (r += "_8ball"), A.req.PlayerManager.data.cage && a.animations[r + "_cage"] && (r += "_cage"), o = a.animations[r]
            }
            a.frame || (a.frame = 0);
            var s = o.frameWidth ? o.frameWidth : a.width,
                l = o.frameHeight ? o.frameHeight : a.height,
                c = void 0 != o.rowStartX ? o.rowStartX + s * Math.floor(a.frame) : s * Math.floor(a.frame),
                h = void 0 != o.rowStartY ? o.rowStartY : a.height * o.sheetRow,
                d = a.x - s / 2,
                u = a.y - l / 2;
            o.offsetX && (d += o.offsetX), o.offsetY && (u += o.offsetY), o.rowStartX && (c += o.rowStartX);
            try {
                e.drawImage(t, c, h, s, l, parseInt(d), parseInt(u), s, l)
            } catch (m) {
                console.warn(a.spritesheet + ", " + c + ", " + h + ", " + s + ", " + l + ", " + d + ", " + u)
            }
        } else e.drawImage(A.req.Resources.get("Spritesheets", a.spritesheet), 0, 0, a.width, a.height, Math.floor(a.x) - a.width / 2, Math.floor(a.y) - a.height / 2, a.width, a.height); - 1 == i && e.restore(), a.rotatePerPx && a.originalX && e.restore(), e.globalAlpha = 1
    }

    function l(a) {
        var t = A.req.PlayerManager.HoverData;
        e.fillStyle = "rgb(50, 50, 50)", e.fillRect(0, 320, CANVAS_WIDTH, ITEMBAR_HEIGHT), e.lineWidth = 2, e.strokeStyle = "rgb(0,0,0)", e.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - ITEMBAR_HEIGHT), e.strokeRect(0, CANVAS_HEIGHT - ITEMBAR_HEIGHT, CANVAS_WIDTH, ITEMBAR_HEIGHT), c(a.inventory, a.itemSelected), h(0, "Menu", t.menuSelected), h(32, "Quit", t.quitSelected)
    }

    function c(a, t) {
        var n = 0;
        each(a, function(i, o) {
            if (o.owned) {
                t && t === i ? (e.fillStyle = "rgb(135,100,100)", e.fillRect(10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60)) : (e.fillStyle = "rgb(100,100,100)", e.fillRect(10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60));
                var r = 0,
                    s = 0;
                if ("mug" == i) {
                    var l = a.mug.contents;
                    "onlytears" == l ? r += 60 : "onlyblood" == l || "bloodmix" == l ? (r += 60, s += 60) : "ink" == l && (r += 60, s += 120)
                }
                e.drawImage(A.req.Resources.get("Spritesheets", "items"), 60 * n + s, 0 + r, 60, 60, 10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60)
            } else e.fillStyle = "rgb(70, 70, 70)", e.fillRect(10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60);
            n++
        })
    }

    function h(a, t, n) {
        e.lineWidth = 4, e.strokeStyle = "rgb(75,75,75)", e.strokeRect(540, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 12 + a, 50, 25), e.fillStyle = n ? "rgb(125,85,85)" : "rgb(55,55,55)", e.fillRect(540, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 12 + a, 50, 25), e.font = "9pt pixelmix";
        var i = e.measureText(t);
        e.fillStyle = "rgb(255,255,255)", e.fillText(t, 566 - i.width / 2, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 29 + a)
    }

    function d(a) {
        e.fillStyle = "rgb(255, 255, 255)", e.lineWidth = 3, e.strokeStyle = "rgb(0,0,0)", e.font = "bold 14px verdana", e.strokeText(a.text, A.req.Input.mouseX - 10, A.req.Input.mouseY - 10), e.fillText(a.text, A.req.Input.mouseX - 10, A.req.Input.mouseY - 10)
    }

    function u() {
        w || (w = e.createLinearGradient(0, 20, 0, 180), w.addColorStop(0, "#999999"), w.addColorStop(1, "#292929")), T || (T = e.createLinearGradient(0, 20, 0, 180), T.addColorStop(0, "#9ad0fa"), T.addColorStop(1, "#1643c3"));
        var a = A.req.DialogueManager.DrawInfo();
        m(a), a.portrait && "options" != a.state && p(a), "output" == a.state || "wait" == a.state ? g(a) : "options" == a.state && f(a)
    }

    function m(a) {
        e.fillStyle = "social" === a.variant ? "white" : "rgb(240,240,240)", e.strokeStyle = "rgb(50,50,50)", e.lineWidth = 1, e.fillRect(10 + a.offset, 20, CANVAS_WIDTH - 20, 150), e.strokeRect(10 + a.offset, 20, CANVAS_WIDTH - 20, 150), e.fillStyle = "rgb(130,130,130)", e.fillStyle = "social" === a.variant ? T : w, e.fillRect(20 + a.offset, 30, 560, 130), e.strokeRect(20 + a.offset, 30, 560, 130)
    }

    function p(a) {
        var t = a.portrait,
            n = A.req.Resources.get("Spritesheets", t.spritesheet);
        e.drawImage(n, t.width * Math.floor(a.pframe), (t.row || 0) * (t.height || 150) + (t.rowStartY || 0), t.width, t.height, CANVAS_WIDTH - (t.width + 50) - a.offset + (t.offsetx || 0), CANVAS_HEIGHT - ITEMBAR_HEIGHT - t.height - 1, t.width, t.height)
    }

    function g(a) {
        var t = 60,
            n = 35,
            i = 25;
        e.font = "social" === a.variant ? "bold 12pt Helvetica" : "bold 12pt pixelmix", a.speaker ? (e.fillStyle = "rgb(50,50,50)", e.fillText(a.speaker + ":", n + 2, t + 2), e.fillStyle = "rgb(255,255,255)", e.fillText(a.speaker + ":", n, t)) : t -= i, e.font = "social" === a.variant ? "14pt Helvetica" : "12pt pixelmix";
        var o = a.text.substr(0, a.outputLength).split(" "),
            r = "";
        t += i + 5, n += 10;
        for (var s = 0; s < o.length; s++) {
            var l = r + o[s] + " ",
                c = e.measureText(l),
                h = c.width;
            h > CANVAS_WIDTH - n - 20 || "\n" == o[s] ? ("\n" == o[s] && s++, e.fillStyle = "rgb(50,50,50)", e.fillText(r, n + 2, t + 2), e.fillStyle = "rgb(255,255,255)", e.fillText(r, n, t), r = o[s] + " ", t += i) : r = l
        }
        e.fillStyle = "rgb(50,50,50)", e.fillText(r, n + 2, t + 2), e.fillStyle = "rgb(255,255,255)", e.fillText(r, n, t)
    }

    function f(a) {
        var t = 60,
            n = 60,
            i = 25;
        e.font = "12pt pixelmix";
        for (var o = 0; o < a.options.length; o++) o == a.optionIndex && (e.save(), e.fillStyle = "rgb(255,255,255)", e.beginPath(), e.moveTo(n - 25, t - i / 2), e.lineTo(n - 10, t - i / 4), e.lineTo(n - 25, t), e.lineTo(n - 25, t - i / 2), e.closePath(), e.fill(), e.restore()), e.fillStyle = "rgb(50,50,50)", e.fillText(a.options[o], n + 2, t + 2), e.fillStyle = "rgb(255,255,255)", e.fillText(a.options[o], n, t), t += i
    }
    this.needs = ["Input", "DialogueManager", "LevelManager", "PlayerManager", "Resources", "Dimmer", "freemium"];
    var A = this,
        e = e,
        b = document.getElementById("canvas"),
        S = null;
    this.draw = function() {
        var s = this.req.LevelManager.CurrentLevel,
            c = this.req.PlayerManager.data;
        switch (a(), s.mode) {
            case CUTSCENE:
                o(s), n();
                break;
            case MENU:
                o(s), i(s), n();
                break;
            default:
                o(s), ZONEDEBUG && t(s), r(s, c), s.monologue || l(c), s.mode == NORMAL && !s.monologue && A.req.PlayerManager.HoverData.show && d(A.req.PlayerManager.HoverData), n(), s.mode == DIALOGUE && u()
        }
        var h = A.req.freemium;
        if (h.showBanner) {
            var m = h.closeButton,
                p = h.banner,
                g = A.req.Resources.get("Spritesheets", "banner_" + (h.bannerIndex + 1)),
                f = Math.floor(g.width / p.width);
            h.frame = (h.frame + (h.animationSpeed[h.bannerIndex] || .5) / FPS) % f, e.drawImage(g, Math.floor(h.frame) * p.width, 0, p.width, p.height, p.left, p.top, p.width, p.height), e.drawImage(A.req.Resources.get("Spritesheets", "banner_close"), 0, 0, m.width, m.height, m.left, m.top, m.width, m.height)
        }
        A.req.PlayerManager.data.mirror && "MENU" !== s.mode ? b.classList.add("mirror") : b.classList.remove("mirror")
    }, this.DrawLoadingScreen = function() {
        e.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        var a = A.req.Resources.loadPercentage();
        10 > a && (a = " " + a);
        var t = "Loading... (" + a + "%)";
        e.font = "bold 16pt pixelmix";
        var n = e.measureText(t);
        e.fillStyle = "rgb(255,255,255)", e.fillText(t, CANVAS_WIDTH / 2 - n.width / 2, 190)
    };
    var w, T
}

function Logic() {
    function e(e, a) {
        for (var t = m.req.Input, n = m.req.SaveManager, i = null, o = 0; o < a.buttons.length; o++)
            if (a.buttons[o].selected = !1, "newfile" === a.buttons[o].press && n.unlocked.cage ? a.buttons[o].text = "New Game +" : ("newfile_cage" === a.buttons[o].press && !n.unlocked.cage || "newfile_mirror" === a.buttons[o].press && !n.unlocked.mirror) && (a.buttons[o].hide = !0), "controls" == a.buttons[o].press && (a.buttons[o].text = t.wasd ? "Movement: WASD" : "Movement: Arrow Keys"), "volume" == a.buttons[o].press && (a.buttons[o].text = "Volume: " + 100 * m.req.Audio.Volume() + "%"), "textspeed" == a.buttons[o].press) switch (m.req.DialogueManager.output.speed) {
                case 25:
                    a.buttons[o].text = "Text Speed: Normal";
                    break;
                case 60:
                    a.buttons[o].text = "Text Speed: Fast";
                    break;
                case 18:
                    a.buttons[o].text = "Text Speed: Slow"
            }
        if (t.mouseX >= 100 && t.mouseX <= 500)
            for (var o = 0; o < a.buttons.length; o++) {
                var r = a.buttons[o];
                t.mouseY >= r.top && t.mouseY <= r.top + 50 && (r.selected = !0, i = r)
            }
        if (i && t.mousereleased) switch (t.mousereleased = !1, i.press) {
            case "newfile":
                n.unlocked.cage || n.unlocked.mirror ? m.req.LevelManager.GoToLevel("newfile-menu", 0, 0) : (m.req.PlayerManager.ResetPlayer(), m.req.LevelManager.GoToLevel("intro", 0, 0));
                break;
            case "newfile_normal":
                m.req.PlayerManager.ResetPlayer(), m.req.LevelManager.GoToLevel("intro", 0, 0);
                break;
            case "newfile_cage":
                m.req.PlayerManager.ResetPlayer(), m.req.PlayerManager.data.cage = !0, m.req.LevelManager.GoToLevel("cubicle", 230, 276);
                break;
            case "newfile_mirror":
                n.unlocked.mirror && (m.req.PlayerManager.ResetPlayer(), m.req.PlayerManager.data.mirror = !0, m.req.LevelManager.GoToLevel("intro", 0, 0));
                break;
            case "loadfile":
                n.Load() && m.req.Audio.ChangeAudio("demo", !0);
                break;
            case "help":
                m.req.LevelManager.GoToLevel("help", 0, 0);
                break;
            case "options":
                m.req.LevelManager.SavePausedLevel(), m.req.LevelManager.GoToLevel("options", e.Sprite.x, e.Sprite.y);
                break;
            case "controls":
                t.useWasd(!t.wasd), m.req.SaveManager.SaveSettings();
                break;
            case "volume":
                m.req.Audio.ToggleVolume(), m.req.SaveManager.SaveSettings();
                break;
            case "textspeed":
                switch (m.req.DialogueManager.output.speed) {
                    case 25:
                        m.req.DialogueManager.output.speed = 60;
                        break;
                    case 60:
                        m.req.DialogueManager.output.speed = 18;
                        break;
                    case 18:
                        m.req.DialogueManager.output.speed = 25
                }
                m.req.SaveManager.SaveSettings();
                break;
            case "return":
                m.req.LevelManager.GoToLevel("RETURN", e.Sprite.x, e.Sprite.y)
        }
    }

    function a(e) {
        m.req.Dimmer.transitioning() || !m.req.Input.mousereleased && !m.req.Input.get("ok").released || m.req.LevelManager.GoToLevel(e.next, e.nextX, e.nextY)
    }

    function t(e, a) {
        var t = m.req.PlayerManager.HoverData;
        if (each(e.sprites, function(a, t) {
                t.offScreen = !s(t), c(t, e)
            }), !m.req.Dimmer.transitioning() && !a.frozen) {
            l(a, e);
            for (var n in e.sprites) {
                var h = e.sprites[n];
                h.collision_actions && r(a, o(h)) && !a.Sprite.frozen && !m.req.ActionManager.timeout && m.req.ActionManager.AddActions(h.collision_actions, n)
            }
            for (var n in e.zones) e.zones[n].collision_actions && r(a, e.zones[n]) && !a.Sprite.frozen && !m.req.ActionManager.timeout && m.req.ActionManager.AddActions(e.zones[n].collision_actions, n)
        }
        var d = m.req.Input;
        if (a.Sprite.homing && d.rmousereleased ? (a.Sprite.homing = !1, "walk" == a.Sprite.animation && u(a.Sprite, "stand")) : !a.Sprite.frozen && d.mouseY < CANVAS_HEIGHT - ITEMBAR_HEIGHT && d.rmouseclicked && -1 != d.mouseX && (d.mouseX < a.Sprite.x ? a.Sprite.direction = -1 : d.mouseX > a.Sprite.x && (a.Sprite.direction = 1), u(a.Sprite, "walk"), a.Sprite.homing = !0, t.text = "", t.show = !1), !a.Sprite.homing && !a.Sprite.frozen) {
            var g = null,
                f = null;
            if (t.quitSelected = t.menuSelected = !1, d.mouseY < CANVAS_HEIGHT - ITEMBAR_HEIGHT) {
                if (a.Sprite.status.ball && i(d.mouseX, d.mouseY, o(a.Sprite)) && (g = a.Sprite), null == g && null != e.sprites)
                    for (var n in e.sprites) i(d.mouseX, d.mouseY, o(e.sprites[n])) && (e.sprites[n].ignore || (g = e.sprites[n], f = n));
                if (null == g && null != e.zones)
                    for (var n in e.zones) i(d.mouseX, d.mouseY, e.zones[n]) && (g = e.zones[n], f = n);
                if (null == g && i(d.mouseX, d.mouseY, o(a.Sprite)) && (g = a.Sprite, f = n), g && d.mousereleased)
                    if (!a.itemSelected && g.default_actions) m.req.ActionManager.AddActions(g.default_actions, f);
                    else if (a.itemSelected || "Pachinko Man" != g.label) {
                    if (a.itemSelected) {
                        var A = g.item_actions && (g.item_actions[a.itemSelected] || g.item_actions.all);
                        g.item_actions && A ? m.req.ActionManager.AddActions(A, f) : m.req.ActionManager.AddActions(a.inventory[a.itemSelected].errorAction, f), a.itemSelected = null
                    }
                } else g.status.ball && m.req.ActionManager.AddActions(g.eightball_actions);
                else if (d.mousereleased)
                    if (a.itemSelected) m.req.ActionManager.AddActions(a.inventory[a.itemSelected].errorAction), a.itemSelected = null;
                    else if (p += 1, p > 5) {
                    var b = [{
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "WHAT ON EARTH ARE YOU EVEN LOOKIN AT, FOOL",
                        portrait: "baal"
                    }];
                    m.req.ActionManager.AddActions(b)
                }
            } else if (!a.Sprite.homing) {
                var S = 0;
                each(a.inventory, function(e, t) {
                    if (t.owned) {
                        var n = {
                            left: 15 + 60 * S + 6 * S,
                            top: CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10,
                            width: 60,
                            height: 60
                        };
                        i(d.mouseX, d.mouseY, n) && (g = t, d.mousereleased && (a.itemSelected = a.itemSelected && a.itemSelected == e ? null : e))
                    }
                    S++
                });
                var w = {
                        left: 540,
                        top: CANVAS_HEIGHT - ITEMBAR_HEIGHT + 42,
                        width: 50,
                        height: 25
                    },
                    T = {
                        left: 540,
                        top: CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10,
                        width: 50,
                        height: 25
                    };
                if (i(d.mouseX, d.mouseY, w) && !m.req.Dimmer.transitioning() && (t.quitSelected = !0, d.mousereleased)) {
                    var E = [{
                        action: "option",
                        text: "Save & Quit",
                        label: "SaveQuit"
                    }, {
                        action: "option",
                        text: "Quit Without Saving",
                        label: "Quit"
                    }, {
                        action: "option",
                        text: "Cancel",
                        label: "Cancel"
                    }, {
                        action: "label",
                        name: "SaveQuit"
                    }, {
                        action: "savegame"
                    }, {
                        action: "gotolevel",
                        level: "title"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Quit"
                    }, {
                        action: "gotolevel",
                        level: "title"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Cancel"
                    }, {
                        action: "end"
                    }];
                    m.req.ActionManager.AddActions(E)
                }
                i(d.mouseX, d.mouseY, T) && !m.req.Dimmer.transitioning() && (t.menuSelected = !0, d.mousereleased && (m.req.LevelManager.SavePausedLevel(), m.req.LevelManager.GoToLevel("options", a.Sprite.x, a.Sprite.y)))
            }
            a.Sprite.homing && (g = !1, a.itemSelected = null), t.show = !1, g && g.label && (t.show = !0, t.text = g.label, "Pachinko Man" == g.label && a.Sprite.status.ball && (t.text = "Ask the Eight Ball")), a.itemSelected && d.mouseY < CANVAS_HEIGHT - ITEMBAR_HEIGHT && (g && g.label ? t.text = "Use " + a.inventory[a.itemSelected].label + " on " + m.req.PlayerManager.HoverData.text : (t.show = !0, t.text = "Use " + a.inventory[a.itemSelected].label))
        }
    }

    function n(e, a) {
        var t = m.req.Input,
            n = m.req.DialogueManager;
        if (n.timer || "wait" != n.state || !t.get("ok").released && !t.mousereleased)
            if (n.timer || "output" != n.state || !t.get("ok").released && !t.mousereleased) {
                if ("options" == n.state) {
                    if (t.mouseY >= 40 && t.mouseY <= 40 + 25 * n.OptionCount() && t.mouseX >= 60) {
                        var i = Math.floor((t.mouseY - 40) / 25);
                        m.req.canvas.font = "12pt pixelmix";
                        var o = m.req.canvas.measureText(n.GetCurrentOption());
                        t.mouseX <= 60 + o.width && (n.SetCurrentOption(i), t.mousereleased && (m.req.ActionManager.BranchToLabel(n.GetCurrentBranch()), m.req.ActionManager.RunActions()))
                    }
                    t.get("ok").released ? (m.req.ActionManager.BranchToLabel(n.GetCurrentBranch()), m.req.ActionManager.RunActions()) : t.get("up").pressed ? n.MoveOptionIndex(-1) : t.get("down").pressed && n.MoveOptionIndex(1)
                }
            } else n.state = "wait";
        else m.req.ActionManager.ActionsLeft() && m.req.ActionManager.RunActions(), m.req.ActionManager.ActionsLeft() || (n.state = "closing");
        n.timer && "wait" == n.state && --n.timer <= 0 && (m.req.ActionManager.ActionsLeft() && m.req.ActionManager.RunActions(), m.req.ActionManager.ActionsLeft() || (n.state = "closing")), n.Update(e), each(e.sprites, function(e, a) {
            s(a) && c(a)
        }), d(a.Sprite)
    }

    function i(e, a, t) {
        return e >= t.left && e <= t.left + t.width && a >= t.top && a <= t.top + t.height ? !0 : !1
    }

    function o(e) {
        var a = {
            left: e.x - e.width / 2,
            top: e.y - e.height / 2,
            width: e.width,
            height: e.height
        };
        return a
    }

    function r(e, a) {
        var t = e.Sprite;
        return t.x - t.width / 2 < a.left + a.width && t.x + t.width / 2 > a.left && t.y - t.height / 2 < a.top + a.height && t.y + t.height / 2 > a.top ? !0 : !1
    }

    function s(e) {
        var a = {
            left: -1 * e.width,
            top: -1 * e.height,
            width: CANVAS_WIDTH + 2 * e.width,
            height: CANVAS_HEIGHT + e.height
        };
        return i(e.x, e.y, a)
    }

    function l(e, a) {
        var t = e.Sprite,
            n = m.req.Input;
        t.homing ? -1 == t.direction && t.x < n.mouseX || 1 == t.direction && t.x > n.mouseX || t.x + t.direction * t.xspeed < a.leftWall || t.x + t.direction * t.xspeed > a.rightWall ? (t.homing = !1, u(t, "stand")) : t.x += t.direction * t.xspeed : ((n.get("left").released && t.moving && -1 == t.direction || n.get("right").released && t.moving && 1 == t.direction) && (t.moving = !1, u(t, "stand")), t.frozen && (t.moving = !1), 0 != t.moving || t.frozen || (n.get("left").pressed && (t.direction = -1, t.moving = !0, t.animation = "walk"), n.get("right").pressed && (t.direction = 1, t.moving = !0, t.animation = "walk")), 1 == t.moving && (t.x += t.direction * t.xspeed, t.x < a.leftWall && (t.x = a.leftWall), t.x > a.rightWall && (t.x = a.rightWall))), d(t)
    }

    function c(e) {
        e.animation && d(e), !e.paused && e.movement && h(e)
    }

    function h(e) {
        var a = e.movement,
            t = m.req.LevelManager.CurrentLevel;
        switch (e.rotatePerPx && "undefined" == typeof e.originalX && (e.originalX = e.x), a.type) {
            case "walk":
                if (t.mode !== NORMAL) break;
                switch (e.x += e.direction * (a.xspeed || 0), e.y += a.yspeed || 0, a.bounce) {
                    case "walls":
                        (e.x <= t.leftWall || e.x >= t.rightWall) && (e.direction *= -1);
                        break;
                    case "walkaround":
                        a.cx || (a.cx = e.x), (e.x <= a.cx - a.radius || e.x >= a.cx + a.radius) && (e.direction *= -1)
                }
                break;
            case "hover":
                a.theta = (a.theta + a.speed / FPS) % 360, a.theta <= 0 && (a.theta += 360), e.y = a.cy + a.radius * Math.sin(a.theta);
                break;
            case "circle":
                a.theta = (a.theta + a.speed / FPS) % 360, a.theta <= 0 && (a.theta += 360), e.x = a.cx + a.radius * Math.cos(a.theta), e.y = a.cy + a.radius * Math.sin(a.theta);
                break;
            case "easeto":
                if (a.init || (a.sx = e.x, a.sy = e.y, a.dx = a.tx - e.x, a.dy = a.ty - e.y, a.frame = 0, a.init = !0), a.frame < a.duration) {
                    var n = a.frame / a.duration;
                    e.x = a.sx - a.dx * n * (n - 2), e.y = a.sy - a.dy * n * (n - 2), a.frame++
                }
                break;
            case "jitter":
                a.cx && a.cy || (a.cx = e.x, a.cy = e.y, a.offsetx = a.offsety = 0), a.xspeed && (a.offsetx += a.xspeed, (a.offsetx >= a.xbound || a.offsetx <= -1 * a.xbound) && (a.xspeed *= -1), e.x = Math.floor(4 * (a.cx + a.offsetx)) / 4), a.yspeed && (a.offsety += a.yspeed, (a.offsety >= a.ybound || a.offsety <= -1 * a.ybound) && (a.yspeed *= -1), e.y = Math.floor(4 * (a.cy + a.offsety)) / 4)
        }
    }

    function d(e) {
        var a = e.animations[e.animation];
        null == a && (a = e.animations.stand), a.frames > 1 && (a.nextani ? (e.frame = e.frame + a.anispeed / FPS, e.frame >= a.frames && (e.animation = a.nextani, e.frame = 0)) : e.frame = (e.frame + a.anispeed / FPS) % a.frames)
    }

    function u(e, a) {
        e.animation = a, e.frame = 0
    }
    this.needs = ["Input", "DialogueManager", "Audio", "SaveManager", "LevelManager", "PlayerManager", "ActionManager", "Dimmer", "canvas", "freemium"];
    var m = this,
        p = 0;
    this.update = function() {
        var o = m.req.PlayerManager.data,
            r = m.req.LevelManager.CurrentLevel;
        m.req.Dimmer.transitioning() && m.req.Dimmer.updateTransition(), r.mode == CUTSCENE ? a(r) : r.mode == MENU ? e(o, r) : r.mode != NORMAL || m.req.Dimmer.transitioning() ? r.mode == DIALOGUE && n(r, o) : (t(r, o), p > 0 && (p -= 1 / FPS), m.req.ActionManager.RunActions());
        var s = m.req.freemium;
        if (s.enabled) {
            var l = m.req.Input;
            s.showBanner ? l.mousereleased && i(l.mouseX, l.mouseY, s.closeButton) && (s.showBanner = !1, s.bannerCooldown = 600) : s.bannerCooldown > 0 ? s.bannerCooldown-- : (s.bannerIndex = Math.floor(Math.random() * s.bannerCount), s.showBanner = !0, s.frame = 0)
        }
    }
}
var AudioManager = function() {
        this.needs = ["Resources"];
        var e = null,
            a = null,
            t = !0,
            n = 1;
        this.UpdateAudio = function() {}, this.Volume = function() {
            return n
        }, this.ToggleVolume = function() {
            this.ChangeVolume(n > 0 ? n - .25 : 1)
        }, this.ChangeVolume = function(a) {
            n = a, e && (e.volume = a)
        }, this.Stop = function() {
            null !== e && e.pause(), e = null, a = null
        }, this.ChangeAudio = function(i, o) {
            a === i && o || (null !== e && (e.currentTime = 0, e.pause()), e = this.req.Resources.get("Songs", i), e.currentTime = 0, e.volume = n, t = o, a = i, e.play(), e.onended = function() {
                e.currentTime = 0, t ? e.play() : (e = null, a = null)
            })
        }
    },
    CANVAS_WIDTH = 600,
    CANVAS_HEIGHT = 400,
    ITEMBAR_HEIGHT = 80,
    FPS = 50,
    wasd = !1,
    CUTSCENE = "CUTSCENE",
    NORMAL = "NORMAL",
    DIALOGUE = "DIALOGUE",
    MENU = "MENU",
    ZONEDEBUG = !1,
    DEBUGLEVEL = "bathroom",
    DEBUGX = 100,
    DEBUGY = 238,
    OFFLINE = !1;
document.addEventListener("DOMContentLoaded", function() {
    function e() {
        var e = ["ok", "left", "right", "up", "down"],
            a = new InputObj(e, n);
        return a.useWasd(!1), a
    }

    function a() {
        var tab = document.getElementById("credits_tab"),
            credits = document.getElementById("credits");
        tab && (tab.style.display = "none");
        credits && tab && credits.addEventListener("click", function() {
            tab.style.display = "none" === tab.style.display ? "" : "none"
        })
    }

    function t() {
        var disp = document.querySelector(".tip-display");
        disp && (disp.textContent = u[Math.floor(Math.random() * u.length)])
    }
    var n = document.getElementById("canvas"),
        i = n.getContext("2d"),
        o = {
            canvas: i,
            Input: e(),
            Logic: new Logic,
            Graphics: new Graphics(i),
            LevelManager: new LevelManager,
            ActionManager: new ActionManager,
            PlayerManager: new PlayerManager,
            SaveManager: new SaveManager,
            DialogueManager: new DialogueManager,
            Audio: new AudioManager,
            Dimmer: new Dimmer,
            Resources: new ResourceManager,
            freemium: {
                enabled: !!window.location && !!window.location.search && ~window.location.search.indexOf("f2p"),
                showBanner: !1,
                bannerCooldown: 100,
                bannerIndex: 0,
                bannerCount: 7,
                banner: {
                    left: 66,
                    top: 10,
                    width: 468,
                    height: 60
                },
                closeButton: {
                    left: 505,
                    top: 15,
                    width: 22,
                    height: 22
                },
                animationSpeed: [0, 0, 0, 8, 8, 1, 0]
            },
            Error: {
                stop: !1
            }
        },
        r = new Date;
    3 === r.getMonth() && 1 === r.getDate() && (o.freemium.enabled = !0);
    for (var s in o)
        if (o[s].needs) {
            o[s].req = {};
            for (var l = 0, c = o[s].needs.length; c > l; l++) {
                var h = o[s].needs[l];
                o[s].req[h] = o[h]
            }
        } o.SaveManager.LoadSettings();
    var d = function() {
        if (!o.Error.stop) try {
            o.LevelManager.IsLoading() && o.LevelManager.LoadLevel(), o.Resources.loaded() ? (o.Logic.update(), o.Graphics.draw()) : o.Graphics.DrawLoadingScreen(o.Resources), o.Audio.UpdateAudio(), o.Input.clear()
        } catch (e) {
            console.error("ERROR!"), e.message && console.error(e.message), e.stack && console.error(e.stack), o.Error.stop = !0
        }
    };
    setupTouchControls(o.Input, n);
    var lastTick = 0,
        tickAcc = 0,
        tickStep = 1e3 / FPS;
    requestAnimationFrame(function loop(now) {
        requestAnimationFrame(loop);
        lastTick || (lastTick = now);
        var dt = now - lastTick;
        lastTick = now;
        dt > 250 && (dt = 250);
        for (tickAcc += dt; tickAcc >= tickStep; tickAcc -= tickStep) d()
    }), a();
    var u = ["The monster with three heads likes two kinds of food - make sure you're carrying both!", "Having trouble getting past the title screen? Hold down the LEFT MOUSE BUTTON to play like a pro.", "The Eight Ball may hold the secret to Tennis Dragon's defeat.", "The floating Eyeball Menace can only be defeated by a Special Item hidden in your cubicle.", "If you meet Pinball Man, try asking about his hair. He likes it when people do that. I thought you'd like to know!", "PINBALL MAN can run faster and jump higher, but also allows emotion and xenophobia to shape his opinions.", "The guard to the lair of the Dragon King can help you find his greatest weakness.", "Egypt Devil likes certain type of ghost!", "In the last dungeon, use the Crowbar on the Giant Head to give yourself some extra time.", "Hold down all the switches in Mask Goblin's hideout to make a secret entrance appear.", "Winners don't ingest harmful toxins.", "Light all the lanterns in Skeleton Forest for a special surprise.", "That trickster Baal hid a P.A. system in every room - see if you can find them all!", "The Antidote Shop appears in the Swamp Level - but only on certain days of the month!", "Try using the Lens of Wisdom on Pachinko Man!", "The Banchee's Balloon may help you reach areas and secrets you previously missed.", "The Fire Boss BEELZOTEN hails from Manitoba. He once rode a barrel over a waterfall.", "Remember to take breaks every 20 minutes & eat plenty of snacks. We worry about you.", "The Badminton Snakes on the second floor are afraid of loud music.", "Use the GROUND POUND to enter secret codes inside the giant sandcastle.", "Do not remove your SD Card while the game is saving. It's just common courtesy, okay?", "If the game becomes an undulating rainbow pouring from the borders of your screen, please consult a doctor.", "If the game's audio is suddenly replaced with wailing and gnashing of teeth, don't worry - this is expected behavior.", "Please check your browser settings if the game ever appears to not be fun. (This is a known issue.)", "Invest in your retirement.", "Each item in the vending machine has a different effect - try to buy them all!", "Remember to charge the FIERY GARBAGE BALL powerup between uses.", "The ICE PENDANT will protect you from enemies in Fire World. No, the EYES PENDANT won't work, smartass."];
    t();
    var tipLoad = document.querySelector(".tip-load");
    tipLoad && tipLoad.addEventListener("click", t);
    document.querySelectorAll(".close-button, .open-game-info").forEach(function(el) {
        el.addEventListener("click", function() {
            document.querySelectorAll("#gameInfo, .open-game-info").forEach(function(x) {
                x.classList.toggle("inactive")
            })
        })
    }); window.cheat = function(e) {
        var a = o.PlayerManager.data,
            t = a.inventory;
        switch (e) {
            case "glittering prizes":
                t.stapler.owned = t.scissors.owned = t.mug.owned = t.rope.owned = t.lens.owned = t.ankh.owned = t.hatemail.owned = t.crowbar.owned = !0;
                break;
            case "tigerlily":
                o.LevelManager.GoToLevel("hallway", 370, 270);
                break;
            case "power overwhelming":
                a.cage = !a.cage;
                break;
            case "there can be only one":
                o.LevelManager.GoToLevel("good-end", 370, 270);
                break;
            case "sally shears":
                a.mirror = !a.mirror;
                break;
            case "black sheep wall":
                a.Sprite.status.ball = a.Sprite.status.wig = !0;
                break;
            case "operation cwal":
                t.stapler.upgrade = !0, t.scissors.upgrade = !0, t.mug.contents = "ink";
                break;
            case "ucla":
                console.log("go bruins!")
        }
        return "Cheat enabled!"
    }
});
var PlayerManager = function() {
    var e = this,
        a = {
            Sprite: {
                x: 100,
                y: 100,
                moving: !1,
                homing: !1,
                homingPt: 0,
                frozen: !1,
                direction: 1,
                xspeed: 2.8,
                width: 78,
                height: 93,
                spritesheet: "pachinkoman",
                animations: {
                    stand: {
                        rowStartY: 0,
                        frames: 1,
                        anispeed: 0,
                        frameWidth: 74,
                        frameHeight: 94
                    },
                    walk: {
                        rowStartY: 94,
                        frames: 4,
                        anispeed: 9,
                        frameWidth: 74,
                        frameHeight: 94
                    },
                    stand_wig: {
                        rowStartY: 188,
                        frames: 1,
                        anispeed: 0,
                        frameWidth: 92,
                        frameHeight: 110,
                        offsetX: 9,
                        offsetY: -8
                    },
                    walk_wig: {
                        rowStartY: 298,
                        frames: 4,
                        anispeed: 9,
                        frameWidth: 92,
                        frameHeight: 110,
                        offsetX: 9,
                        offsetY: -8
                    },
                    stand_8ball: {
                        rowStartY: 408,
                        frames: 1,
                        anispeed: 0,
                        frameWidth: 68,
                        frameHeight: 154,
                        offsetY: -30,
                        offsetX: 3
                    },
                    walk_8ball: {
                        rowStartY: 562,
                        frames: 4,
                        anispeed: 9,
                        frameWidth: 68,
                        frameHeight: 154,
                        offsetX: 3,
                        offsetY: -30
                    },
                    stand_wig_8ball: {
                        rowStartY: 716,
                        frames: 1,
                        anispeed: 0,
                        frameWidth: 86,
                        frameHeight: 154,
                        offsetX: 6,
                        offsetY: -30
                    },
                    walk_wig_8ball: {
                        rowStartY: 870,
                        frames: 4,
                        anispeed: 9,
                        frameWidth: 86,
                        frameHeight: 154,
                        offsetX: 6,
                        offsetY: -30
                    },
                    ankhsummon: {
                        rowStartY: 1024,
                        frames: 11,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 112,
                        frameHeight: 136,
                        offsetX: -19,
                        offsetY: -25,
                        nextani: "ankhopen"
                    },
                    ankhopen: {
                        rowStartY: 1160,
                        frames: 6,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 122,
                        frameHeight: 164,
                        offsetX: -24,
                        offsetY: -39
                    },
                    ankhsummon_wig: {
                        rowStartY: 1324,
                        frames: 11,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 130,
                        frameHeight: 136,
                        offsetY: -23,
                        offsetX: -10,
                        nextani: "wig_ankhopen"
                    },
                    ankhopen_wig: {
                        rowStartY: 1460,
                        frames: 6,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 140,
                        frameHeight: 164,
                        offsetX: -15,
                        offsetY: -37
                    },
                    ankhsummon_cage: {
                        rowStartY: 2430,
                        frames: 11,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 112,
                        frameHeight: 136,
                        offsetX: -19,
                        offsetY: -25,
                        nextani: "ankhopen"
                    },
                    ankhopen_cage: {
                        rowStartY: 2566,
                        frames: 6,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 122,
                        frameHeight: 164,
                        offsetX: -24,
                        offsetY: -39
                    },
                    ankhsummon_wig_cage: {
                        rowStartY: 2730,
                        frames: 11,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 130,
                        frameHeight: 136,
                        offsetX: -10,
                        offsetY: -25,
                        nextani: "ankhopen"
                    },
                    ankhopen_wig_cage: {
                        rowStartY: 2866,
                        frames: 6,
                        anispeed: 9,
                        sheetRow: 0,
                        frameWidth: 140,
                        frameHeight: 164,
                        offsetX: -15,
                        offsetY: -39
                    },
                    wipeout: {
                        rowStartY: 1624,
                        frames: 4,
                        anispeed: 6,
                        sheetRow: 0,
                        frameWidth: 80,
                        frameHeight: 84
                    },
                    stand_cage: {
                        rowStartY: 1708,
                        frames: 1,
                        anispeed: 3,
                        sheetRow: 0,
                        frameWidth: 74,
                        frameHeight: 98,
                        offsetY: -6
                    },
                    walk_cage: {
                        rowStartY: 1806,
                        frames: 4,
                        anispeed: 4,
                        sheetRow: 0,
                        frameWidth: 74,
                        frameHeight: 100,
                        offsetY: -6
                    },
                    stand_wig_cage: {
                        rowStartY: 1906,
                        frames: 1,
                        anispeed: 3,
                        sheetRow: 0,
                        frameWidth: 92,
                        frameHeight: 108,
                        offsetX: 9,
                        offsetY: -11
                    },
                    walk_wig_cage: {
                        rowStartY: 2014,
                        frames: 4,
                        anispeed: 4,
                        sheetRow: 0,
                        frameWidth: 92,
                        frameHeight: 110,
                        offsetX: 9,
                        offsetY: -11
                    },
                    stand_8ball_cage: {
                        rowStartY: 2124,
                        frames: 1,
                        anispeed: 3,
                        sheetRow: 0,
                        frameWidth: 68,
                        frameHeight: 152,
                        offsetX: 6,
                        offsetY: -36
                    },
                    walk_8ball_cage: {
                        rowStartY: 2276,
                        frames: 4,
                        anispeed: 3,
                        sheetRow: 0,
                        frameWidth: 68,
                        frameHeight: 154,
                        offsetX: 6,
                        offsetY: -36
                    },
                    stand_wig_8ball_cage: {
                        rowStartY: 2430,
                        frames: 1,
                        anispeed: 3,
                        sheetRow: 0,
                        frameWidth: 86,
                        frameHeight: 152,
                        offsetX: 9,
                        offsetY: -36
                    },
                    walk_wig_8ball_cage: {
                        rowStartY: 2582,
                        frames: 4,
                        anispeed: 3,
                        sheetRow: 0,
                        frameWidth: 86,
                        frameHeight: 154,
                        offsetX: 9,
                        offsetY: -36
                    }
                },
                animation: "stand",
                frame: 0,
                status: {
                    wig: !1,
                    ball: !1
                },
                label: "Pachinko Man",
                item_actions: {
                    stapler: [{
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "OW!",
                        portrait: "pman_normal"
                    }],
                    scissors: [{
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "These scissors aren't sharp enough to break my metal skin. I suppose I'm grateful.",
                        portrait: "pman_normal"
                    }],
                    rope: [{
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "DON'T EVEN TRY IT! ANYONE WHO HANGS THEMSELVES IN MY PLACE OF BUSINESS? I'LL KILL 'EM MYSELF.",
                        portrait: "baal"
                    }],
                    mug: [{
                        action: "branch",
                        type: "itemFieldValue",
                        item: "mug",
                        field: "contents",
                        value: "ink",
                        operant: "equals",
                        yes: "Ink"
                    }, {
                        action: "branch",
                        type: "itemFieldValue",
                        item: "mug",
                        field: "contents",
                        value: "empty",
                        operant: "equals",
                        yes: "Empty"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Down the hatch?",
                        portrait: "pman_sweat"
                    }, {
                        action: "death",
                        sfx: "*gulp* Ugh. UGH. AAAARRGHHH!!",
                        epitaph: "YOU HAVE POISONED YOURSELF. OBVIOUSLY. MAN, WHAT GAVE YOU THE IDEA TO DRINK THAT STUFF? WEIRDO."
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Empty"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "WHAT AN UGLY MUG, HUH? HA. HAHA. AHAHAHAHA! YOU'LL NEVER GUESS WHAT I WAS SECRETLY ALLUDING TO. HINT: IT'S ON TOP OF YOUR NECK.",
                        portrait: "baal"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "My necktie?",
                        portrait: "pman_normal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Ink"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "HA! YOU POISONED YOURSELF. MAN, WHAT GAVE YOU THE IDEA TO DRINK THAT STUFF?",
                        portrait: "baal"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Squid's ink isn't poisonous. In fact, it's a common fixture in the cuisine of many -",
                        portrait: "pman_normal"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "GEE, THANKS EVER SO MUCH FOR THAT NUGGET OF WISDOM, ALTON BROWN.",
                        portrait: "baal"
                    }, {
                        action: "end"
                    }],
                    lens: [{
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Wow, so this is what it's like to read your own mind!",
                        cage: "I'M A VAMPIRE!",
                        portrait: "pman_normal"
                    }, {
                        action: "dialogue",
                        speaker: "LENS OF INSIGHT",
                        text: "Wow, so this is what it's like to read your own mind!",
                        cage: "I'M A VAMPIRE!"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Wow, so this is what it's like to read your- \n Wow, so this is what it's like to read your- \n Wow, so this is what it's like to read your-",
                        cage: "I'M A VAMPIRE! \n I'M A VAMPIRE! \n I'M A VAMPIRE!",
                        portrait: "pman_sweat"
                    }, {
                        action: "music",
                        song: "fakeout",
                        loop: !0
                    }, {
                        action: "dialogue",
                        speaker: "LENS OF INSIGHT",
                        text: "Wow, so this is Wow, so this is Wow, so this is \n Wow, so this is Wow, so this is Wow, so this is \n Wow, so this is Wow, so this is Wow, so this is",
                        cage: "I'M A VAMPIRE! \n I'M A VAMPIRE! \n I'M A VAMPIRE!"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "WOW WOW WOW WOW WOW WOW WOW WOW WOW WOW \n WOW WOW WOW WOW WOW WOW WOW WOW WOW WOW \n WOW WOW WOW WOW WOW WOW WOW WOW WOW WOW",
                        cage: "I'M A VAMPIRE! \n I'M A VAMPIRE! \n I'M A VAMPIRE!",
                        portrait: "pman_sweat"
                    }, {
                        action: "death",
                        sfx: "No... what's h-happening to... AACK!!",
                        epitaph: "YOU'VE TRAPPED YOUR OWN MIND IN AN INFINITE LOOP - AND IN DOING SO, DESTROYED IT! NO GREAT LOSS, IF YOU ASK ME."
                    }]
                },
                eightball_actions: [{
                    action: "branch",
                    type: "level",
                    value: "cavern",
                    operant: "equals",
                    yes: "InCavern"
                }, {
                    action: "dialogue",
                    speaker: "PACHINKO MAN",
                    text: "How about it, Eight Ball? Should I leave you here?",
                    cage: "Do you like the Elton John song, Rocket Man?",
                    portrait: "pman_normal"
                }, {
                    action: "branch",
                    type: "level",
                    value: "bathroom",
                    operant: "equals",
                    yes: "InBathroom"
                }, {
                    action: "branch",
                    type: "level",
                    value: "morvencubicle",
                    operant: "equals",
                    yes: "InCubicle"
                }, {
                    action: "label",
                    name: "RandomSet"
                }, {
                    action: "randomlabel",
                    name: "Random1"
                }, {
                    action: "randomlabel",
                    name: "Random2"
                }, {
                    action: "randomlabel",
                    name: "Random3"
                }, {
                    action: "randomlabel",
                    name: "Random4"
                }, {
                    action: "randomlabel",
                    name: "Random5"
                }, {
                    action: "label",
                    name: "Random1"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "SIGNS POINT TO NO. PLEASE TRY A DIFFERENT ROOM."
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "Random2"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "OUTLOOK HAZY. TRY AGAIN ELSEWHERE."
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "Random3"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "MY SOURCES SAY... DEFINITELY NOT HERE."
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "Random4"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "AS I SEE IT... PROBABLY NOT."
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "Random5"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "YOU MAY RELY ON IT... NOT BEING THIS ROOM."
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "InCavern"
                }, {
                    action: "branch",
                    type: "switchValue",
                    which: "bathroom",
                    value: "finished",
                    operant: "equals",
                    yes: "RandomSet"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "EVENTUALLY, YOU'RE GOING TO CARRY ME AWAY FROM THIS ROOM... BUT IF YOU'D LIKE, I COULD WAIT HERE FOR NOW."
                }, {
                    action: "option",
                    text: "Embrace destiny",
                    label: "Take"
                }, {
                    action: "option",
                    text: "Forestall fate",
                    label: "Leave"
                }, {
                    action: "label",
                    name: "Take"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "I KNEW I COULD COUNT ON YOU. LITERALLY KNEW."
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "Leave"
                }, {
                    action: "dim",
                    opacity: 254,
                    speed: 9
                }, {
                    action: "wait",
                    frames: "20"
                }, {
                    action: "statusfx",
                    which: "ball",
                    value: !1
                }, {
                    action: "gotolevel",
                    level: "cavern"
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "InBathroom"
                }, {
                    action: "branch",
                    type: "switchValue",
                    which: "bathroom",
                    value: "finished",
                    operant: "equals",
                    yes: "RandomSet"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "MY SOURCES SAY... THE HOLE I'M DESTINED TO FILL IS SOMEWHERE NEARBY!!"
                }, {
                    action: "end"
                }, {
                    action: "label",
                    name: "InCubicle"
                }, {
                    action: "dialogue",
                    speaker: "TRAGIC EIGHT BALL",
                    text: "SIGNS POINT TO... AN IMPORTANT LOCATION SOMEWHERE NEARBY. YOU SHOULD FIND A PLACE TO SET ME DOWN!"
                }, {
                    action: "end"
                }]
            },
            inventory: {
                stapler: {
                    label: "Stapler",
                    owned: !1,
                    errorAction: [{
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "When all you have is a stapler, everything looks 8.5 x 11.",
                        portrait: "pman_normal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "baalStatus",
                        value: "default",
                        operant: "equals",
                        no: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "M-my facility with paperwork doesn't seem to be of much use here...!",
                        portrait: "pman_sweat"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "Please place all company supplies in a designated bin before resuming your duties. Thank you.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "end"
                    }]
                },
                rope: {
                    label: "Length Of Rope",
                    owned: !1,
                    errorAction: [{
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Hmm... I think I'd better hold on to this in case I really need it.",
                        portrait: "pman_normal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "baalStatus",
                        value: "default",
                        operant: "equals",
                        no: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "The time has come... \n Length of rope! Do your stuff!",
                        portrait: "pman_sweat"
                    }, {
                        action: "setitemfield",
                        item: "rope",
                        field: "owned",
                        value: !1
                    }, {
                        action: "dialogue",
                        text: "\n * TOSS *"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "D-DID YOU JUST THROW A LENGTH OF ROPE AT ME?"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "YOU KNOW WHAT, I JUST FEEL SORRY FOR YOU NOW. NOT ENOUGH TO NOT KILL YOU, BUT..."
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "TAKE THIS THING BACK, OKAY? MAYBE YOU'LL NEED IT LATER. AFTER I CRUSH YOU."
                    }, {
                        action: "setitemfield",
                        item: "rope",
                        field: "owned",
                        value: !0
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "Please return all lengths of rope to Nautical R&D before resuming your duties. Thank you.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "end"
                    }]
                },
                scissors: {
                    label: "Scissors",
                    owned: !1,
                    errorAction: [{
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "ANY DAMAGE INFLICTED ON COMPANY PROPERTY WILL BE INFLICTED TENFOLD UPON YOUR HEAD!",
                        portrait: "baal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "baalStatus",
                        value: "default",
                        operant: "equals",
                        no: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "M-my facility with paperwork doesn't seem to be of much use here...!",
                        portrait: "pman_sweat"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "Please place all company supplies in a designated bin before resuming your duties. Thank you.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "end"
                    }]
                },
                mug: {
                    label: "Murmur's Mug",
                    owned: !1,
                    contents: "empty",
                    errorAction: [{
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "HEY! QUIT MEAN MUGGIN'!",
                        portrait: "baal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "baalStatus",
                        value: "default",
                        operant: "equals",
                        no: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "INK, HUH? THAT REMINDS ME OF A RIDDLE. WHAT'S BLACK, AND GRAY, AND RED ALL OVER? AFTER I'M DONE SMOOSHING IT?"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Y-your copy of the daily news? After you're done smooshing it?",
                        portrait: "pman_sweat"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "WOW, GOOD GUESS! YOUR REWARD IS DEATH."
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "Please place all company supplies in a designated bin before resuming your duties. Thank you.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "end"
                    }]
                },
                lens: {
                    label: "Lens of Insight",
                    owned: !1,
                    errorAction: [{
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "IS THAT A POTENT PSYCHIC ARTIFACT, OR PART OF A SHERLOCK HOLMES COSTUME? NEITHER IS PERMITTED BY OUR DRESS CODE!",
                        portrait: "baal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "baalStatus",
                        value: "default",
                        operant: "equals",
                        no: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "YO SHERLOCK, HERE'S A CLUE. YOU'RE DOOMED! BAZAMBA."
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Bazamba?",
                        portrait: "pman_normal"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "OH, SORRY. I FIGURED I'D TRY OUT SOME NEW CATCHPHRASES ON YOU. WHAT WITH YOU GETTING CRUSHED IN A FEW SECONDS, AND ALL."
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "The Lens of Insight is, in fact, not even a working magnifying glass.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "Any psychic insights conferred were induced by the Placebo Effect and wishful dreamery.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "end"
                    }]
                },
                ankh: {
                    label: "Soul Ankh",
                    owned: !1,
                    errorAction: [{
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "ghost",
                        value: "gone",
                        operant: "equals",
                        yes: "AlreadyUsed"
                    }, {
                        action: "freeze"
                    }, {
                        action: "playerani",
                        animation: "ankhsummon"
                    }, {
                        action: "wait",
                        seconds: "0.5"
                    }, {
                        action: "music",
                        song: "thunder",
                        loop: !1
                    }, {
                        action: "wait",
                        seconds: "2.5"
                    }, {
                        action: "music",
                        song: "ankh",
                        loop: !0
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Ahhhh... befouled air fills my lungs... dark energies course through my veins... I am recalled to life!",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Who dares to summon me from the Red Sleep? Be you god? Demon? Some dark sorceror, seeking the obliteration of his foes?",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKOMAN",
                        text: "I'm... a Pachinko Man.",
                        cage: "Uhh, you think you're Wotan...?",
                        portrait: "pman_sweat"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Really? Wow. REALLY. This is who wound up posessing my Cursed Ankh? Some piddling ball-shaped mortal FOOL?!",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "OHHH SNAP! YOU ARE SUCH THE FOOLISH MORTAL. TOTES HAS YOU PEGGED.",
                        portrait: "baal"
                    }, {
                        action: "randomlabel",
                        name: "Random1"
                    }, {
                        action: "randomlabel",
                        name: "Random2"
                    }, {
                        action: "randomlabel",
                        name: "Random3"
                    }, {
                        action: "randomlabel",
                        name: "Random4"
                    }, {
                        action: "label",
                        name: "Random1"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "I know that voice... \n Baal, you bloodless worm!",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "How dare you speak in the presence of a true Dark God? Shouldn't you be running Cube Purgatory, or whatever it is you do?",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "ER... SORRY, THIS IS A RECORDED MESSAGE! BAAL ISN'T HERE RIGHT NOW. PLEASE DIRECT ALL WRATH TO THE PIDDLING MORTAL...",
                        portrait: "baal"
                    }, {
                        action: "branch",
                        type: "always",
                        jumpto: "endrandom"
                    }, {
                        action: "label",
                        name: "Random2"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "I know that voice... \n Baal, you spineless insect!",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "You dare call yourself a demon still? Last I'd heard, you were an inconsolable wreck over being edited out of Dante's Inferno.",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "THAT SWINDLER TOLD ME BALL HELL WOULD GET ITS OWN CANTO! THERE WAS GONNA BE THIS WHOLE JUGGLING SUBPLOT -",
                        portrait: "baal"
                    }, {
                        action: "branch",
                        type: "always",
                        jumpto: "endrandom"
                    }, {
                        action: "label",
                        name: "Random3"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "I know that voice... \n Baal, you piteous organ grinder's monkey!",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "You must have a lot of gall to appear in my presence. We've still not forgiven you for swiping Moloch's Stapler, you know.",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "U-UM... BAAL? WHO'S THAT? I'M JUST A HARMLESS PA SYSTEM!",
                        portrait: "baal"
                    }, {
                        action: "branch",
                        type: "always",
                        jumpto: "endrandom"
                    }, {
                        action: "label",
                        name: "Random4"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "I know that voice... \n Baal, you gutless toad!",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "I assumed your gross incompetence had gotten you demoted to some kind of inverse cherub thousands of years ago.",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "W-WE'VE NEVER MET! YOU MUST BE THINKING OF MY COUSIN BILL. YEAH, THAT'S IT. HE RUNS THIS SOFTWARE COMPANY IN REDMOND -",
                        portrait: "baal"
                    }, {
                        action: "label",
                        name: "endrandom"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Silence! I'll deal with you later. For now... I must feed! Let's see what innocent soul this Pachinko Man has offered up to me...",
                        portrait: "ankh"
                    }, {
                        action: "branch",
                        type: "level",
                        value: "lobby",
                        operant: "equals",
                        no: "BadRoom"
                    }, {
                        action: "branch",
                        type: "target",
                        value: "Origamitan",
                        operant: "equals",
                        yes: "Origamitan"
                    }, {
                        action: "branch",
                        type: "target",
                        value: "Janitor",
                        operant: "equals",
                        yes: "Janitor"
                    }, {
                        action: "branch",
                        type: "target",
                        value: "Ghost",
                        operant: "equals",
                        yes: "Vendingheist"
                    }, {
                        action: "label",
                        name: "InLobby"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Mmm... I can sense innocence nearby! But you've not specified an innocent soul to claim. Which means I get my pick of the litter, right?",
                        portrait: "ankh"
                    }, {
                        action: "branch",
                        type: "always",
                        jumpto: "Failure"
                    }, {
                        action: "label",
                        name: "BadRoom"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Hmph! I sense only damned and demonic spirits here - not the innocent souls I crave. With one exception...",
                        portrait: "ankh"
                    }, {
                        action: "label",
                        name: "Failure"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Pachinko Man! Has anyone ever told you what a good person you are? DELECTABLY, MOUTH-WATERINGLY GOOD?",
                        portrait: "ankh_unleashed"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "N-no, wait! I swear, I have a gambling problem!",
                        cage: "I AM THE GREATEEEST!",
                        portrait: "pman_sweat"
                    }, {
                        action: "unfreeze"
                    }, {
                        action: "death",
                        sfx: "KA-KRUCH! Sloooorp....",
                        epitaph: "THE ANKH ENTITY CRACKS YOU LIKE A SOFT-SHELL CRAB AND SUCKS OUT YOUR SOUL. WHEW! BETTER YOU THAN ME, PAL."
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Origamitan"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "otan",
                        value: "cut",
                        operant: "equals",
                        yes: "InLobby"
                    }, {
                        action: "dialogue",
                        speaker: "ORIGAMI-TAN",
                        text: "Hi there, Mr. Doombeast~! Would you like to make an appointment?",
                        portrait: "origamitan"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Mm, yes... that's the intoxicating fragrance of innocence, alright! But wait - what's that sour note I detect?",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "ORIGAMI-TAN",
                        text: "Oh, like, that's probably all the embezzlement and tax fraud Mr. Drachenroe makes me help with. Tee-hee~",
                        portrait: "origamitan"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Bah! Perhaps I was sensing another innocent soul nearby. I wonder...",
                        portrait: "ankh"
                    }, {
                        action: "branch",
                        type: "always",
                        jumpto: "Failure"
                    }, {
                        action: "label",
                        name: "Janitor"
                    }, {
                        action: "dialogue",
                        speaker: "TONY",
                        text: "I ain't no innocent, son. I've seen 'n done things that could make your head spin. More than demon's heads usually do, I mean.",
                        portrait: "janitor"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Ha! I like this guy. Unfortunately, I can't eat him. But I'm positive that there's an innocent soul nearby...",
                        portrait: "ankh"
                    }, {
                        action: "branch",
                        type: "always",
                        jumpto: "Failure"
                    }, {
                        action: "label",
                        name: "Vendingheist"
                    }, {
                        action: "dialogue",
                        speaker: "VENDINGHEIST",
                        text: "Tum de tum ~ \n Whipped cream dollop, chocolate glaze \n Swirling in my frosted haze ~"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Sweet merciless hells! I've never seen an innocent soul this plump and sugary before. Time to tuck in!",
                        portrait: "ankh_unleashed"
                    }, {
                        action: "dim",
                        opacity: 255,
                        speed: 20
                    }, {
                        action: "wait",
                        frames: 20
                    }, {
                        action: "playerani",
                        animation: "stand"
                    }, {
                        action: "music",
                        song: "thunder",
                        loop: !1
                    }, {
                        action: "killsprite",
                        sprite: "Ghost"
                    }, {
                        action: "dim",
                        opacity: 0,
                        speed: 20
                    }, {
                        action: "wait",
                        seconds: 2
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "Ahh... I couldn't eat another bite. Thanks for the treat, Pachinko Man! I'll have to remember never to kill you.",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "TONY",
                        text: "Well, heck! Looks like the vending machine's up and running. Looks like I can finally check up on that bum elevator...",
                        portrait: "janitor"
                    }, {
                        action: "dim",
                        opacity: 255,
                        speed: 20
                    }, {
                        action: "wait",
                        frames: 20
                    }, {
                        action: "music",
                        restore: !0
                    }, {
                        action: "unfreeze"
                    }, {
                        action: "killsprite",
                        sprite: "Janitor"
                    }, {
                        action: "dim",
                        opacity: 0,
                        speed: 20
                    }, {
                        action: "setswitch",
                        which: "ghost",
                        value: "gone"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "AlreadyUsed"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "*snrk*... zzZZZzzz...",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "It appears he's enjoying an after-dinner nap...",
                        portrait: "pman_normal"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "YEAH, YOU BETTER SLEEP, YA ELITIST JERK! \n ...Y-YOU ARE SURE HE'S ASLEEP, RIGHT?",
                        portrait: "baal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "baalStatus",
                        value: "default",
                        operant: "equals",
                        no: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "PACHINKO MAN",
                        text: "Ankh Spirit! You've got to help me defeat Baal!!",
                        portrait: "pman_sweat"
                    }, {
                        action: "dialogue",
                        speaker: "ANKH SPIRIT",
                        text: "No. No I don't. I need to continue ignoring you. \n In any case, that thing over there? That's not Baal.",
                        portrait: "ankh"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "UM. ANKH SPIRITS ARE KNOWN FOR THEIR POOR EYESIGHT. THEY ARE LEGENDS IN THE FIELD OF CRPYTO-OPTOMETRY."
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "The Ankh Spirit was conjured up by top-notch hologram theatrics, previously employed in Anime Stage Shows and Dead Rapper Comebacks.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "Please deposit it in the designated holo-bin before resuming duties.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "end"
                    }]
                },
                hatemail: {
                    label: "Hate Mail",
                    owned: !1,
                    errorAction: [{
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "mail",
                        value: "over",
                        operant: "equals",
                        yes: "QuestFinished"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "HEY, THIS ISN'T A POST OFFICE, PAL! IT'S A PLACE OF BUSINESS. THERE ARE RULES.",
                        portrait: "baal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "QuestFinished"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "YOU KNOW THERE'S NO REASON FOR YOU TO BE CARRYING THAT ANYMORE, RIGHT? THAT AND LIKE, HALF OF YOUR INVENTORY.",
                        portrait: "baal"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "YOU HAVE AN ITEM HORDING PROBLEM, OKAY? THERE MUST BE SOME KIND OF REALITY SHOW THAT WILL HELP YOU WITH THAT.",
                        portrait: "baal"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "branch",
                        type: "switchValue",
                        which: "baalStatus",
                        value: "default",
                        operant: "equals",
                        no: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "NOT DIGNIFYING THAT WITH A RESPONSE. NOPE! ONLY THE SMOOSHING."
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "Tanaka"
                    }, {
                        action: "dialogue",
                        speaker: "TANAKA-SAN",
                        text: "Please postmark and submit all mail to the designated mail room and return to your duties. Thank you.",
                        portrait: "baal_tanaka"
                    }, {
                        action: "end"
                    }]
                },
                crowbar: {
                    label: "Crowbar",
                    owned: !1,
                    errorAction: [{
                        action: "dialogue",
                        text: "\n Tony the Janitor's voice \n echoed through your mind..."
                    }, {
                        action: "branch",
                        type: "level",
                        value: "baalroom",
                        operant: "equals",
                        yes: "VsBaal"
                    }, {
                        action: "dialogue",
                        speaker: "TONY",
                        text: "Kid! There's a time and a place to use the crowbar's awesome power! But now now.",
                        portrait: "janitor"
                    }, {
                        action: "end"
                    }, {
                        action: "label",
                        name: "VsBaal"
                    }, {
                        action: "dialogue",
                        speaker: "TONY",
                        text: "Kid! The crowbar can come through in a pinch! Don't underestimate it!",
                        portrait: "janitor"
                    }, {
                        action: "dialogue",
                        speaker: "TONY",
                        text: "Coulda prolly come through for me in a few situations. If you had left it with me. Just sayin'.",
                        portrait: "janitor"
                    }, {
                        action: "end"
                    }]
                }
            },
            itemSelected: null,
            switches: {
                startedGame: !1,
                chairStatus: "down",
                onChair: !1,
                morven: "default",
                guard: "default",
                pinball: "default",
                watercooler: "unseen",
                bathroom: "locked",
                melissa: 1,
                gregorie: 0,
                beelzoten: "default",
                cerballus: "default",
                eightball: "default",
                lobby: "default",
                otan: "default",
                ghost: "default",
                janitor: "default",
                dragon: "default",
                itguy: "default",
                mail: "default",
                thiefsden: "default",
                visitsToDen: 0,
                firstwire: !1,
                secondwire: !1,
                greenwire: !1,
                inkfilled: !1,
                thiefsDenMode: "default",
                baalStatus: "default"
            },
            cage: !1,
            mirror: !1,
            lastlevel: "cubicle",
            deathcount: 0
        };
    this.data = dcopy(a), this.HoverData = {
        text: "",
        show: !1,
        quitSelected: !1,
        menuSelected: !1
    }, this.ResetPlayer = function() {
        e.data = dcopy(a)
    }, this.RestoreToIdle = function() {
        var a = e.data;
        a.Sprite.moving = !1, a.Sprite.homing = !1, a.itemSelected = null, this.HoverData.text = "", "walk" == a.Sprite.animation && (a.Sprite.animation = "stand"), a.Sprite.frame = 0
    }, this.Freeze = function() {
        this.data.Sprite.frozen = !0, this.RestoreToIdle()
    }, this.Unfreeze = function() {
        this.data.Sprite.frozen = !1
    }
};