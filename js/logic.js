import { CANVAS_HEIGHT, CANVAS_WIDTH, CUTSCENE, DIALOGUE, FPS, ITEMBAR_HEIGHT, MENU, NORMAL, REMAP_LABELS, REMAP_ORDER, each } from "./util.js?v=6";

function Logic() {
    function e(e, a) {
        for (var t = m.req.Input, n = m.req.SaveManager, i = null, o = 0; o < a.buttons.length; o++)
            if (a.buttons[o].selected = !1, "newfile" === a.buttons[o].press && n.unlocked.cage ? a.buttons[o].text = "New Game +" : ("newfile_cage" === a.buttons[o].press && !n.unlocked.cage || "newfile_mirror" === a.buttons[o].press && !n.unlocked.mirror) && (a.buttons[o].hide = !0), "controls" == a.buttons[o].press && (a.buttons[o].text = t.customKeys ? "Movement: Custom" : t.wasd ? "Movement: WASD" : "Movement: Arrow Keys"), "contrast" == a.buttons[o].press && (a.buttons[o].text = "High Contrast: " + (t.highContrast ? "On" : "Off")), "remap" == a.buttons[o].press && (a.buttons[o].text = null != t.remapIndex ? "Press key for " + REMAP_LABELS[t.remapIndex] + "... (Esc cancels)" : "Remap Keys"), "volume" == a.buttons[o].press && (a.buttons[o].text = "Volume: " + 100 * m.req.Audio.Volume() + "%"), "textspeed" == a.buttons[o].press) switch (m.req.DialogueManager.output.speed) {
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
                let r = a.buttons[o];
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
            case "contrast":
                t.highContrast = !t.highContrast, m.req.SaveManager.SaveSettings();
                break;
            case "remap":
                t.remapIndex = 0, t.remapCapture = function(code) {
                    if (27 === code) { t.remapCapture = null, t.remapIndex = null; return; }
                    t.setKey(REMAP_ORDER[t.remapIndex], code), t.remapIndex++,
                    t.remapIndex >= REMAP_ORDER.length && (t.remapCapture = null, t.remapIndex = null, t.customKeys = !0, t.wasd = !1, m.req.SaveManager.SaveSettings());
                };
                break;
            case "return":
                m.req.LevelManager.GoToLevel("RETURN", e.Sprite.x, e.Sprite.y)
        }
    }

    function a(e) {
        m.req.Dimmer.transitioning() || !m.req.Input.mousereleased && !m.req.Input.get("ok").released || m.req.LevelManager.GoToLevel(e.next, e.nextX, e.nextY)
    }

    function t(e, a) {
        const t = m.req.PlayerManager.HoverData;
        if (each(e.sprites, function(a, t) {
                t.offScreen = !s(t), c(t, e)
            }), !m.req.Dimmer.transitioning() && !a.frozen) {
            l(a, e);
            for (var n in e.sprites) {
                const h = e.sprites[n];
                h.collision_actions && r(a, o(h)) && !a.Sprite.frozen && !m.req.ActionManager.timeout && m.req.ActionManager.AddActions(h.collision_actions, n)
            }
            for (var n in e.zones) e.zones[n].collision_actions && r(a, e.zones[n]) && !a.Sprite.frozen && !m.req.ActionManager.timeout && m.req.ActionManager.AddActions(e.zones[n].collision_actions, n)
        }
        const d = m.req.Input;
        if (a.Sprite.homing && d.rmousereleased ? (a.Sprite.homing = !1, "walk" == a.Sprite.animation && u(a.Sprite, "stand")) : !a.Sprite.frozen && d.mouseY < CANVAS_HEIGHT - ITEMBAR_HEIGHT && d.rmouseclicked && -1 != d.mouseX && (d.mouseX < a.Sprite.x ? a.Sprite.direction = -1 : d.mouseX > a.Sprite.x && (a.Sprite.direction = 1), u(a.Sprite, "walk"), a.Sprite.homing = !0, t.text = "", t.show = !1), !a.Sprite.homing && !a.Sprite.frozen) {
            let g = null,
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
                        const A = g.item_actions && (g.item_actions[a.itemSelected] || g.item_actions.all);
                        g.item_actions && A ? m.req.ActionManager.AddActions(A, f) : m.req.ActionManager.AddActions(a.inventory[a.itemSelected].errorAction, f), a.itemSelected = null
                    }
                } else g.status.ball && m.req.ActionManager.AddActions(g.eightball_actions);
                else if (d.mousereleased)
                    if (a.itemSelected) m.req.ActionManager.AddActions(a.inventory[a.itemSelected].errorAction), a.itemSelected = null;
                    else if (p += 1, p > 5) {
                    const b = [{
                        action: "dialogue",
                        speaker: "BAAL",
                        text: "WHAT ON EARTH ARE YOU EVEN LOOKIN AT, FOOL",
                        portrait: "baal"
                    }];
                    m.req.ActionManager.AddActions(b)
                }
            } else if (!a.Sprite.homing) {
                let S = 0;
                each(a.inventory, function(e, t) {
                    if (t.owned) {
                        const n = {
                            left: 15 + 60 * S + 6 * S,
                            top: CANVAS_HEIGHT - ITEMBAR_HEIGHT + 10,
                            width: 60,
                            height: 60
                        };
                        i(d.mouseX, d.mouseY, n) && (g = t, d.mousereleased && (a.itemSelected = a.itemSelected && a.itemSelected == e ? null : e))
                    }
                    S++
                });
                const w = {
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
                    const E = [{
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
        const t = m.req.Input,
            n = m.req.DialogueManager;
        if (n.timer || "wait" != n.state || !t.get("ok").released && !t.mousereleased)
            if (n.timer || "output" != n.state || !t.get("ok").released && !t.mousereleased) {
                if ("options" == n.state) {
                    if (t.mouseY >= 40 && t.mouseY <= 40 + 25 * n.OptionCount() && t.mouseX >= 60) {
                        const i = Math.floor((t.mouseY - 40) / 25);
                        m.req.canvas.font = "12pt pixelmix";
                        const o = m.req.canvas.measureText(n.GetCurrentOption());
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
        const a = {
            left: e.x - e.width / 2,
            top: e.y - e.height / 2,
            width: e.width,
            height: e.height
        };
        return a
    }

    function r(e, a) {
        const t = e.Sprite;
        return t.x - t.width / 2 < a.left + a.width && t.x + t.width / 2 > a.left && t.y - t.height / 2 < a.top + a.height && t.y + t.height / 2 > a.top ? !0 : !1
    }

    function s(e) {
        const a = {
            left: -1 * e.width,
            top: -1 * e.height,
            width: CANVAS_WIDTH + 2 * e.width,
            height: CANVAS_HEIGHT + e.height
        };
        return i(e.x, e.y, a)
    }

    function l(e, a) {
        const t = e.Sprite,
            n = m.req.Input;
        t.homing ? -1 == t.direction && t.x < n.mouseX || 1 == t.direction && t.x > n.mouseX || t.x + t.direction * t.xspeed < a.leftWall || t.x + t.direction * t.xspeed > a.rightWall ? (t.homing = !1, u(t, "stand")) : t.x += t.direction * t.xspeed : ((n.get("left").released && t.moving && -1 == t.direction || n.get("right").released && t.moving && 1 == t.direction) && (t.moving = !1, u(t, "stand")), t.frozen && (t.moving = !1), 0 != t.moving || t.frozen || (n.get("left").pressed && (t.direction = -1, t.moving = !0, t.animation = "walk"), n.get("right").pressed && (t.direction = 1, t.moving = !0, t.animation = "walk")), 1 == t.moving && (t.x += t.direction * t.xspeed, t.x < a.leftWall && (t.x = a.leftWall), t.x > a.rightWall && (t.x = a.rightWall))), d(t)
    }

    function c(e) {
        e.animation && d(e), !e.paused && e.movement && h(e)
    }

    function h(e) {
        const a = e.movement,
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
                    const n = a.frame / a.duration;
                    e.x = a.sx - a.dx * n * (n - 2), e.y = a.sy - a.dy * n * (n - 2), a.frame++
                }
                break;
            case "jitter":
                a.cx && a.cy || (a.cx = e.x, a.cy = e.y, a.offsetx = a.offsety = 0), a.xspeed && (a.offsetx += a.xspeed, (a.offsetx >= a.xbound || a.offsetx <= -1 * a.xbound) && (a.xspeed *= -1), e.x = Math.floor(4 * (a.cx + a.offsetx)) / 4), a.yspeed && (a.offsety += a.yspeed, (a.offsety >= a.ybound || a.offsety <= -1 * a.ybound) && (a.yspeed *= -1), e.y = Math.floor(4 * (a.cy + a.offsety)) / 4)
        }
    }

    function d(e) {
        let a = e.animations[e.animation];
        null == a && (a = e.animations.stand), a.frames > 1 && (a.nextani ? (e.frame = e.frame + a.anispeed / FPS, e.frame >= a.frames && (e.animation = a.nextani, e.frame = 0)) : e.frame = (e.frame + a.anispeed / FPS) % a.frames)
    }

    function u(e, a) {
        e.animation = a, e.frame = 0
    }
    this.needs = ["Input", "DialogueManager", "Audio", "SaveManager", "LevelManager", "PlayerManager", "ActionManager", "Dimmer", "canvas", "freemium"];
    var m = this,
        p = 0;
    this.update = function() {
        const o = m.req.PlayerManager.data,
            r = m.req.LevelManager.CurrentLevel;
        m.req.Dimmer.transitioning() && m.req.Dimmer.updateTransition(), r.mode == CUTSCENE ? a(r) : r.mode == MENU ? e(o, r) : r.mode != NORMAL || m.req.Dimmer.transitioning() ? r.mode == DIALOGUE && n(r, o) : (t(r, o), p > 0 && (p -= 1 / FPS), m.req.ActionManager.RunActions());
        const s = m.req.freemium;
        if (s.enabled) {
            const l = m.req.Input;
            s.showBanner ? l.mousereleased && i(l.mouseX, l.mouseY, s.closeButton) && (s.showBanner = !1, s.bannerCooldown = 600) : s.bannerCooldown > 0 ? s.bannerCooldown-- : (s.bannerIndex = Math.floor(Math.random() * s.bannerCount), s.showBanner = !0, s.frame = 0)
        }
    }
}

export { Logic };
