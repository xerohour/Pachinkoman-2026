import { dcopy } from "./util.js?v=6";

function PlayerManager() {
    const e = this,
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
        const a = e.data;
        a.Sprite.moving = !1, a.Sprite.homing = !1, a.itemSelected = null, this.HoverData.text = "", "walk" == a.Sprite.animation && (a.Sprite.animation = "stand"), a.Sprite.frame = 0
    }, this.Freeze = function() {
        this.data.Sprite.frozen = !0, this.RestoreToIdle()
    }, this.Unfreeze = function() {
        this.data.Sprite.frozen = !1
    }
}

export { PlayerManager };
