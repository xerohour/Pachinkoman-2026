import { ActionManager } from "./action.js?v=6";
import { AudioManager } from "./audio.js?v=6";
import { DialogueManager } from "./dialogue.js?v=6";
import { Dimmer } from "./dimmer.js?v=6";
import { Graphics } from "./graphics.js?v=6";
import { InputObj, setupTouchControls } from "./input.js?v=6";
import { LevelManager } from "./level.js?v=6";
import { Logic } from "./logic.js?v=6";
import { PlayerManager } from "./player.js?v=6";
import { ResourceManager } from "./resources.js?v=6";
import { SaveManager } from "./save.js?v=6";
import { FPS } from "./util.js?v=6";

document.addEventListener("DOMContentLoaded", function() {
    function e() {
        const e = ["ok", "left", "right", "up", "down"],
            a = new InputObj(e, n);
        return a.useWasd(!1), a
    }

    function a() {
        const tab = document.getElementById("credits_tab"),
            credits = document.getElementById("credits");
        tab && (tab.style.display = "none");
        credits && tab && credits.addEventListener("click", function() {
            tab.style.display = "none" === tab.style.display ? "" : "none"
        })
    }

    function t() {
        const disp = document.querySelector(".tip-display");
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
    for (const s in o)
        if (o[s].needs) {
            o[s].req = {};
            for (let l = 0, c = o[s].needs.length; c > l; l++) {
                let h = o[s].needs[l];
                o[s].req[h] = o[h]
            }
        } o.SaveManager.LoadSettings();
    const d = function() {
        if (!o.Error.stop) try {
            o.LevelManager.IsLoading() && o.LevelManager.LoadLevel(), o.Resources.loaded() ? (o.Logic.update(), o.Graphics.draw()) : o.Graphics.DrawLoadingScreen(o.Resources), o.Audio.UpdateAudio(), o.Input.clear()
        } catch (e) {
            console.error("ERROR!"), e.message && console.error(e.message), e.stack && console.error(e.stack), o.Error.stop = !0
        }
    };
    setupTouchControls(o.Input, n);
    let lastTick = 0; let tickAcc = 0; const tickStep = 1e3 / FPS;
    requestAnimationFrame(function loop(now) {
        requestAnimationFrame(loop);
        lastTick || (lastTick = now);
        let dt = now - lastTick;
        lastTick = now;
        dt > 250 && (dt = 250);
        for (tickAcc += dt; tickAcc >= tickStep; tickAcc -= tickStep) d()
    }), a();
    var u = ["The monster with three heads likes two kinds of food - make sure you're carrying both!", "Having trouble getting past the title screen? Hold down the LEFT MOUSE BUTTON to play like a pro.", "The Eight Ball may hold the secret to Tennis Dragon's defeat.", "The floating Eyeball Menace can only be defeated by a Special Item hidden in your cubicle.", "If you meet Pinball Man, try asking about his hair. He likes it when people do that. I thought you'd like to know!", "PINBALL MAN can run faster and jump higher, but also allows emotion and xenophobia to shape his opinions.", "The guard to the lair of the Dragon King can help you find his greatest weakness.", "Egypt Devil likes certain type of ghost!", "In the last dungeon, use the Crowbar on the Giant Head to give yourself some extra time.", "Hold down all the switches in Mask Goblin's hideout to make a secret entrance appear.", "Winners don't ingest harmful toxins.", "Light all the lanterns in Skeleton Forest for a special surprise.", "That trickster Baal hid a P.A. system in every room - see if you can find them all!", "The Antidote Shop appears in the Swamp Level - but only on certain days of the month!", "Try using the Lens of Wisdom on Pachinko Man!", "The Banchee's Balloon may help you reach areas and secrets you previously missed.", "The Fire Boss BEELZOTEN hails from Manitoba. He once rode a barrel over a waterfall.", "Remember to take breaks every 20 minutes & eat plenty of snacks. We worry about you.", "The Badminton Snakes on the second floor are afraid of loud music.", "Use the GROUND POUND to enter secret codes inside the giant sandcastle.", "Do not remove your SD Card while the game is saving. It's just common courtesy, okay?", "If the game becomes an undulating rainbow pouring from the borders of your screen, please consult a doctor.", "If the game's audio is suddenly replaced with wailing and gnashing of teeth, don't worry - this is expected behavior.", "Please check your browser settings if the game ever appears to not be fun. (This is a known issue.)", "Invest in your retirement.", "Each item in the vending machine has a different effect - try to buy them all!", "Remember to charge the FIERY GARBAGE BALL powerup between uses.", "The ICE PENDANT will protect you from enemies in Fire World. No, the EYES PENDANT won't work, smartass."];
    t();
    const tipLoad = document.querySelector(".tip-load");
    tipLoad && tipLoad.addEventListener("click", t);
    document.querySelectorAll(".close-button, .open-game-info").forEach(function(el) {
        el.addEventListener("click", function() {
            document.querySelectorAll("#gameInfo, .open-game-info").forEach(function(x) {
                x.classList.toggle("inactive")
            })
        })
    }); window.cheat = function(e) {
        const a = o.PlayerManager.data,
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
