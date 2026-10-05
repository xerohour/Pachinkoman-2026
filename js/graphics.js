import { CANVAS_HEIGHT, CANVAS_WIDTH, CUTSCENE, DIALOGUE, FPS, ITEMBAR_HEIGHT, MENU, NORMAL, ZONEDEBUG, each } from "./util.js?v=6";

function Graphics(e) {
    function a() {
        e.clearRect(0, 0, 2 * CANVAS_WIDTH, 2 * CANVAS_HEIGHT)
    }

    function t(a) {
        if (e.fillStyle = "rgba(255, 0, 0, 0.3)", null != a.zones)
            for (const t in a.zones) {
                const n = a.zones[t];
                e.fillRect(n.left, n.top, n.width, n.height)
            }
    }

    function n() {
        e.fillStyle = "rgba(0, 0, 0, " + A.req.Dimmer.alpha / 255 + ")", e.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    function i(a) {
        for (let t = 0; t < a.buttons.length; t++) {
            let n = a.buttons[t];
            if (!n.hide) {
                e.lineWidth = 4, e.strokeStyle = "rgb(255,255,255)", e.strokeRect(100, n.top, CANVAS_WIDTH - 200, 50), e.fillStyle = n.selected ? "rgb(100,100,100)" : "rgb(55,55,55)", e.fillRect(100, n.top, CANVAS_WIDTH - 200, 50), e.font = "bold 12pt pixelmix";
                let i = e.measureText(n.text);
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
                const n = A.req.Resources.get("Spritesheets", t.spritesheet);
                s(t, n)
            }
        }), e.monologue || s(a.Sprite, A.req.Resources.get("Spritesheets", a.Sprite.spritesheet), !0), each(e.sprites, function(e, t) {
            if (t.z > 0 || t.y >= a.Sprite.y && !t.offScreen) {
                const n = A.req.Resources.get("Spritesheets", t.spritesheet);
                s(t, n)
            }
        })
    }

    function s(a, t, n) {
        let i = a.direction;
        if (n && (i *= -1), a.alpha && (e.globalAlpha = a.alpha), -1 == i && (e.save(), e.translate(a.x, 0), e.scale(-1, 1), e.translate(-1 * a.x, 0)), a.rotatePerPx && a.originalX && (e.save(), e.translate(a.x, a.y), e.rotate((a.x - a.originalX + (a.initrotate || 0)) * a.rotatePerPx * Math.PI / 180), e.translate(-1 * a.x, -1 * a.y)), a.animation) {
            let o = a.animations[a.animation];
            if (n) {
                let r = a.animation;
                a.status.wig && (r += "_wig"), a.status.ball && (r += "_8ball"), A.req.PlayerManager.data.cage && a.animations[r + "_cage"] && (r += "_cage"), o = a.animations[r]
            }
            a.frame || (a.frame = 0);
            const s = o.frameWidth ? o.frameWidth : a.width; const l = o.frameHeight ? o.frameHeight : a.height; let c = void 0 != o.rowStartX ? o.rowStartX + s * Math.floor(a.frame) : s * Math.floor(a.frame); const h = void 0 != o.rowStartY ? o.rowStartY : a.height * o.sheetRow; let d = a.x - s / 2; let u = a.y - l / 2;
            o.offsetX && (d += o.offsetX), o.offsetY && (u += o.offsetY), o.rowStartX && (c += o.rowStartX);
            try {
                e.drawImage(t, c, h, s, l, parseInt(d), parseInt(u), s, l)
            } catch (m) {
                console.warn(a.spritesheet + ", " + c + ", " + h + ", " + s + ", " + l + ", " + d + ", " + u)
            }
        } else e.drawImage(A.req.Resources.get("Spritesheets", a.spritesheet), 0, 0, a.width, a.height, Math.floor(a.x) - a.width / 2, Math.floor(a.y) - a.height / 2, a.width, a.height); - 1 == i && e.restore(), a.rotatePerPx && a.originalX && e.restore(), e.globalAlpha = 1
    }

    function l(a) {
        const t = A.req.PlayerManager.HoverData;
        e.fillStyle = "rgb(50, 50, 50)", e.fillRect(0, 320, CANVAS_WIDTH, ITEMBAR_HEIGHT), e.lineWidth = 2, e.strokeStyle = "rgb(0,0,0)", e.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - ITEMBAR_HEIGHT), e.strokeRect(0, CANVAS_HEIGHT - ITEMBAR_HEIGHT, CANVAS_WIDTH, ITEMBAR_HEIGHT), c(a.inventory, a.itemSelected), h(0, "Menu", t.menuSelected), h(32, "Quit", t.quitSelected)
    }

    function c(a, t) {
        let n = 0;
        each(a, function(i, o) {
            if (o.owned) {
                t && t === i ? (e.fillStyle = "rgb(135,100,100)", e.fillRect(10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60)) : (e.fillStyle = "rgb(100,100,100)", e.fillRect(10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60));
                let r = 0,
                    s = 0;
                if ("mug" == i) {
                    const l = a.mug.contents;
                    "onlytears" == l ? r += 60 : "onlyblood" == l || "bloodmix" == l ? (r += 60, s += 60) : "ink" == l && (r += 60, s += 120)
                }
                e.drawImage(A.req.Resources.get("Spritesheets", "items"), 60 * n + s, 0 + r, 60, 60, 10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60)
            } else e.fillStyle = "rgb(70, 70, 70)", e.fillRect(10 + 60 * n + 6 * n, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10, 60, 60);
            n++
        })
    }

    function h(a, t, n) {
        e.lineWidth = 4, e.strokeStyle = "rgb(75,75,75)", e.strokeRect(540, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 12 + a, 50, 25), e.fillStyle = n ? "rgb(125,85,85)" : "rgb(55,55,55)", e.fillRect(540, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 12 + a, 50, 25), e.font = "9pt pixelmix";
        const i = e.measureText(t);
        e.fillStyle = "rgb(255,255,255)", e.fillText(t, 566 - i.width / 2, CANVAS_HEIGHT - ITEMBAR_HEIGHT + 29 + a)
    }

    function d(a) {
        e.fillStyle = "rgb(255, 255, 255)", e.lineWidth = 3, e.strokeStyle = "rgb(0,0,0)", e.font = "bold 14px verdana", e.strokeText(a.text, A.req.Input.mouseX - 10, A.req.Input.mouseY - 10), e.fillText(a.text, A.req.Input.mouseX - 10, A.req.Input.mouseY - 10)
    }

    function u() {
        w || (w = e.createLinearGradient(0, 20, 0, 180), w.addColorStop(0, "#999999"), w.addColorStop(1, "#292929")), T || (T = e.createLinearGradient(0, 20, 0, 180), T.addColorStop(0, "#9ad0fa"), T.addColorStop(1, "#1643c3"));
        const a = A.req.DialogueManager.DrawInfo();
        m(a), a.portrait && "options" != a.state && p(a), "output" == a.state || "wait" == a.state ? g(a) : "options" == a.state && f(a)
    }

    function m(a) {
        const hc = A.req.Input.highContrast;
        e.fillStyle = hc ? "rgb(0,0,0)" : "social" === a.variant ? "white" : "rgb(240,240,240)", e.strokeStyle = hc ? "rgb(255,255,255)" : "rgb(50,50,50)", e.lineWidth = 1, e.fillRect(10 + a.offset, 20, CANVAS_WIDTH - 20, 150), e.strokeRect(10 + a.offset, 20, CANVAS_WIDTH - 20, 150), e.fillStyle = "rgb(130,130,130)", e.fillStyle = hc ? "rgb(0,0,0)" : "social" === a.variant ? T : w, e.fillRect(20 + a.offset, 30, 560, 130), e.strokeRect(20 + a.offset, 30, 560, 130)
    }

    function p(a) {
        const t = a.portrait,
            n = A.req.Resources.get("Spritesheets", t.spritesheet);
        e.drawImage(n, t.width * Math.floor(a.pframe), (t.row || 0) * (t.height || 150) + (t.rowStartY || 0), t.width, t.height, CANVAS_WIDTH - (t.width + 50) - a.offset + (t.offsetx || 0), CANVAS_HEIGHT - ITEMBAR_HEIGHT - t.height - 1, t.width, t.height)
    }

    function g(a) {
        let t = 60; let n = 35; const i = 25;
        const hc = A.req.Input.highContrast;
        e.font = "social" === a.variant ? "bold 12pt Helvetica" : "bold 12pt pixelmix", a.speaker ? (e.fillStyle = hc ? "rgb(0,0,0)" : "rgb(50,50,50)", e.fillText(a.speaker + ":", n + 2, t + 2), e.fillStyle = hc ? "rgb(255,255,0)" : "rgb(255,255,255)", e.fillText(a.speaker + ":", n, t)) : t -= i, e.font = "social" === a.variant ? "14pt Helvetica" : "12pt pixelmix";
        const o = a.text.substr(0, a.outputLength).split(" "); let r = "";
        t += i + 5, n += 10;
        for (let s = 0; s < o.length; s++) {
            let l = r + o[s] + " ",
                c = e.measureText(l),
                h = c.width;
            h > CANVAS_WIDTH - n - 20 || "\n" == o[s] ? ("\n" == o[s] && s++, e.fillStyle = hc ? "rgb(0,0,0)" : "rgb(50,50,50)", e.fillText(r, n + 2, t + 2), e.fillStyle = hc ? "rgb(255,255,0)" : "rgb(255,255,255)", e.fillText(r, n, t), r = o[s] + " ", t += i) : r = l
        }
        e.fillStyle = hc ? "rgb(0,0,0)" : "rgb(50,50,50)", e.fillText(r, n + 2, t + 2), e.fillStyle = hc ? "rgb(255,255,0)" : "rgb(255,255,255)", e.fillText(r, n, t)
    }

    function f(a) {
        let t = 60; const n = 60; const i = 25;
        e.font = "12pt pixelmix";
        const hc2 = A.req.Input.highContrast;
        for (let o = 0; o < a.options.length; o++) o == a.optionIndex && (e.save(), e.fillStyle = hc2 ? "rgb(255,255,0)" : "rgb(255,255,255)", e.beginPath(), e.moveTo(n - 25, t - i / 2), e.lineTo(n - 10, t - i / 4), e.lineTo(n - 25, t), e.lineTo(n - 25, t - i / 2), e.closePath(), e.fill(), e.restore()), e.fillStyle = hc2 ? "rgb(0,0,0)" : "rgb(50,50,50)", e.fillText(a.options[o], n + 2, t + 2), e.fillStyle = hc2 ? "rgb(255,255,0)" : "rgb(255,255,255)", e.fillText(a.options[o], n, t), t += i
    }
    this.needs = ["Input", "DialogueManager", "LevelManager", "PlayerManager", "Resources", "Dimmer", "freemium"];
    var A = this,
        e = e,
        b = document.getElementById("canvas"),
        S = null;
    this.draw = function() {
        const s = this.req.LevelManager.CurrentLevel,
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
        const h = A.req.freemium;
        if (h.showBanner) {
            const m = h.closeButton,
                p = h.banner,
                g = A.req.Resources.get("Spritesheets", "banner_" + (h.bannerIndex + 1)),
                f = Math.floor(g.width / p.width);
            h.frame = (h.frame + (h.animationSpeed[h.bannerIndex] || .5) / FPS) % f, e.drawImage(g, Math.floor(h.frame) * p.width, 0, p.width, p.height, p.left, p.top, p.width, p.height), e.drawImage(A.req.Resources.get("Spritesheets", "banner_close"), 0, 0, m.width, m.height, m.left, m.top, m.width, m.height)
        }
        A.req.PlayerManager.data.mirror && "MENU" !== s.mode ? b.classList.add("mirror") : b.classList.remove("mirror")
    }, this.DrawLoadingScreen = function() {
        e.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        let a = A.req.Resources.loadPercentage();
        10 > a && (a = " " + a);
        const t = "Loading... (" + a + "%)";
        e.font = "bold 16pt pixelmix";
        const n = e.measureText(t);
        e.fillStyle = "rgb(255,255,255)", e.fillText(t, CANVAS_WIDTH / 2 - n.width / 2, 190)
    };
    var w, T
}

export { Graphics };
