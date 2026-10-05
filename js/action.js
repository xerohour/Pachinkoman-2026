import { FPS } from "./util.js?v=6";

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
                const s = a.Sprite,
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
            const a = 0 === Math.floor(2 * Math.random()) && s.socialMessages[e.title] ? s.socialMessages[e.title] : s.socialMessages.generic; let t = a[Math.floor(Math.random() * a.length)];
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
        const n = s.questions[Math.floor(Math.random() * s.questions.length)];
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
            const r = this; let s = !0; const l = this.req.LevelManager.CurrentLevel; const c = this.req.PlayerManager.data;
            for (this.timeout > 0 && (this.timeout--, s = !1); s && i < n.length;) {
                let h = n[i++];
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
                        let d, u, m = [],
                            p = 0,
                            g = 0;
                        for (i--;
                            "randomlabel" == n[i].action;) {
                            let f = n[i].name,
                                A = n[i].weight || 1;
                            m.push({
                                name: f,
                                weight: A || 1
                            }), p += A, i++
                        }
                        d = Math.floor(Math.random() * p) + 1;
                        for (let b = 0; b < m.length && d >= b && !u; b++) d <= g + m[b].weight && (u = m[b].name), g += m[b].weight;
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
                        let k = l.sprites[h.sprite];
                        h.x && (k.x = h.x), h.y && (k.y = h.y);
                        break;
                    case "levelbounds":
                        h.left && (l.leftWall = h.left), h.right && (l.rightWall = h.right);
                        break;
                    case "death":
                        this.req.Dimmer.dim(15, 255), c.deathcount++, c.lastlevel = "cubicle", c.x = 230, c.y = 276, c.Sprite.status.ball = !1;
                        let y = h.epitaph,
                            O = h.sfx;
                        this.req.Audio.ChangeAudio("death", !1);
                        let R = [{
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
                        let N = e(l, c, h);
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
        for (let a = 0; a < n.length; a++)
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

export { ActionManager };
