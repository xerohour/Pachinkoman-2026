import { CANVAS_WIDTH, keyCode, mouseButton } from "./util.js?v=6";

function setupTouchControls(input, canvas) {
    const isTouch = "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;
    if (!isTouch || !canvas || !input) return;
    document.body.classList.add("touch");

    /* Haptics: a light buzz on control presses (Android). */
    function buzz(ms) {
        try { navigator.vibrate && navigator.vibrate(ms || 10); } catch (e) {}
    }
    /* Keep the screen awake while playing (phones). */
    function keepAwake() {
        try {
            "wakeLock" in navigator && navigator.wakeLock.request("screen").catch(function() {});
        } catch (e) {}
    }
    document.addEventListener("visibilitychange", function() {
        document.visibilityState === "visible" && keepAwake();
    });
    keepAwake();

    function toGame(e) {
        const t = e.changedTouches[0],
            r = canvas.getBoundingClientRect();
        return {
            x: (t.clientX - r.left) * (canvas.width / r.width),
            y: (t.clientY - r.top) * (canvas.height / r.height)
        };
    }
    canvas.addEventListener("touchstart", function(e) {
        e.preventDefault();
        const p = toGame(e);
        input.mouseX = p.x; input.mouseY = p.y;
        input.mouseclicked = !0; input.mousereleased = !1;
    }, { passive: !1 });
    canvas.addEventListener("touchmove", function(e) {
        e.preventDefault();
        const p = toGame(e);
        input.mouseX = p.x; input.mouseY = p.y;
    }, { passive: !1 });
    function endTouch(e) {
        e.preventDefault();
        input.mouseclicked = !1; input.mousereleased = !0;
    }
    canvas.addEventListener("touchend", endTouch, { passive: !1 });
    canvas.addEventListener("touchcancel", endTouch, { passive: !1 });

    /* D-pad: four discrete direction buttons. A tap sets pressed directly on
     * the button state; the next frame consumes it exactly once (one menu
     * step), then Input.clear() resets it. No per-frame re-assert, so holding
     * can never spray presses at 50 Hz. Holding still walks: movement latches
     * on pressed and stops on released, like a held arrow key. */
    ["up", "down", "left", "right"].forEach(function(dir) {
        const btn = document.getElementById("dbtn-" + dir);
        if (!btn) return;
        let touchId = null;
        btn.addEventListener("touchstart", function(e) {
            e.preventDefault(); e.stopPropagation();
            if (touchId !== null) return; // one finger per button
            touchId = e.changedTouches[0].identifier;
            input.get(dir).pressed = !0; // consumed by the next frame, exactly once
            btn.classList.add("active");
            buzz(12);
        }, { passive: !1 });
        function release(e) {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++)
                if (e.changedTouches[i].identifier === touchId) {
                    touchId = null;
                    input.get(dir).released = !0;
                    btn.classList.remove("active");
                }
        }
        btn.addEventListener("touchend", release, { passive: !1 });
        btn.addEventListener("touchcancel", release, { passive: !1 });
    });

    /* Action button: drives the "ok" button (spacebar) — advances dialogue,
     * confirms menu choices. */
    const abtn = document.getElementById("action-btn");
    if (abtn) {
        let abtnId = null;
        abtn.addEventListener("touchstart", function(e) {
            e.preventDefault(); e.stopPropagation();
            abtnId = e.changedTouches[0].identifier;
            input.touchOk = !0; input.touchOkRel = !1;
            abtn.classList.add("active");
            buzz(12);
        }, { passive: !1 });
        function abtnEnd(e) {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++)
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

function InputObj(e, a) {
    function t(e) {
        this.key = null, this.action = e, this.pressed = !1, this.released = !1
    }

    function n(e) {
        for (let a = 0; a < s.buttons.length; a++)
            if (s.buttons[a].action == e) return a;
        return -1
    }

    function i(e) {
        for (let a = 0; a < s.buttons.length; a++)
            if (s.buttons[a].key == e) return s.buttons[a].action;
        return -1
    }

    function o(e) {
        const a = n(e); - 1 != a && (s.buttons[a].pressed = !0, s.buttons[a].released = !1)
    }

    function r(e) {
        const a = n(e); - 1 != a && (s.buttons[a].pressed = !1, s.buttons[a].released = !0)
    }
    this.needs = ["PlayerManager"];
    var s = this;
    this.buttons = [], this.canvas = a, this.mouseclicked = !1, this.mousereleased = !1, this.rmouseclicked = !1, this.rmousereleased = !1, this.wasd = !1, this.touchOk = !1, this.touchOkRel = !1, this.highContrast = !1, this.customKeys = !1, this.remapIndex = null, this.remapCapture = null;
    var s = this;
    this.useWasd = function(e) {
        this.wasd = e, this.customKeys = !1, this.setKeys(e ? [32, 65, 68, 87, 83] : [32, 37, 39, 38, 40])
    };
    for (let l = 0; l < e.length; l++) this.buttons.push(new t(e[l]));
    document.addEventListener("keydown", function(e) {
        const code = keyCode(e);
        if (s.remapCapture) { s.remapCapture(code); e.preventDefault(); return; }
        const a = i(code); - 1 != a && o(a)
    });
    document.addEventListener("keyup", function(e) {
        const a = i(keyCode(e)); - 1 != a && r(a)
    });
    document.addEventListener("mousemove", function(e) {
        if (!s.canvas) return;
        const rect = s.canvas.getBoundingClientRect(),
            sx = s.canvas.width / rect.width,
            sy = s.canvas.height / rect.height;
        s.mouseX = (e.clientX - rect.left) * sx, s.mouseY = (e.clientY - rect.top) * sy;
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
        for (let a = 0; a < e.length; a++) s.buttons[a].key = e[a]
    }, this.get = function(e) {
        const a = n(e);
        return -1 == a ? new t(null) : this.buttons[a]
    }, this.setKey = function(action, code) {
        const a = n(action); - 1 != a && (s.buttons[a].key = code)
    }, this.getKey = function(action) {
        const a = n(action); return -1 == a ? null : s.buttons[a].key
    }, this.clear = function() {
        for (let e = 0; e < this.buttons.length; e++) this.buttons[e].pressed = !1, this.buttons[e].released = !1;
        this.mouseclicked = !1, this.mousereleased = !1, this.rmouseclicked = !1, this.rmousereleased = !1;
        // action button: re-assert "ok" while held (D-pad drives directions directly)
        this.touchOk && (this.get("ok").pressed = !0);
        this.touchOkRel && (this.get("ok").released = !0, this.touchOkRel = !1)
    }
}

export { setupTouchControls, InputObj };
