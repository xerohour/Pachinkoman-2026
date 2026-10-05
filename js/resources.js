function ResourceManager() {
    function e(e, a) {
        const n = i[a][e];
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
        const n = i[a][e],
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

export { ResourceManager };
