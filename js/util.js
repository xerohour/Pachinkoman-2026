function each(obj, fn) {
    if (Array.isArray(obj)) obj.forEach(function(v, i) { fn(i, v); });
    else if (obj) Object.keys(obj).forEach(function(k) { fn(k, obj[k]); });
    return obj;
}

function keyCode(e) { return e.which || e.keyCode; }

function keyName(code) {
    if (code >= 65 && code <= 90) return String.fromCharCode(code);
    if (code >= 48 && code <= 57) return String.fromCharCode(code);
    switch (code) {
        case 8: return "Backspace"; case 9: return "Tab"; case 13: return "Enter";
        case 16: return "Shift"; case 17: return "Ctrl"; case 18: return "Alt";
        case 27: return "Esc"; case 32: return "Space";
        case 37: return "Left"; case 38: return "Up"; case 39: return "Right"; case 40: return "Down";
        default: return "Key " + code;
    }
}

const REMAP_ORDER = ["up", "down", "left", "right", "ok"];

const REMAP_LABELS = ["UP", "DOWN", "LEFT", "RIGHT", "OK"];

function mouseButton(e) { return e.which || (typeof e.button === "number" ? e.button + 1 : 0); }

function showFatalError(msg) {
    console.error("[pachinkoman] " + msg);
    const el = document.getElementById("fatal-error");
    if (el) { el.textContent = "Pachinko Man couldn't start: " + msg; el.style.display = "block"; }
}

function dcopy(e) {
    return typeof structuredClone === "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e))
}

const CANVAS_WIDTH = 600;

const CANVAS_HEIGHT = 400;

const ITEMBAR_HEIGHT = 80;

const FPS = 50;

const wasd = !1;

const CUTSCENE = "CUTSCENE";

const NORMAL = "NORMAL";

const DIALOGUE = "DIALOGUE";

const MENU = "MENU";

const ZONEDEBUG = !1;

const DEBUGLEVEL = "bathroom";

const DEBUGX = 100;

const DEBUGY = 238;

const OFFLINE = !1;

export { each, keyCode, keyName, REMAP_ORDER, REMAP_LABELS, mouseButton, showFatalError, dcopy, CANVAS_WIDTH, CANVAS_HEIGHT, ITEMBAR_HEIGHT, FPS, wasd, CUTSCENE, NORMAL, DIALOGUE, MENU, ZONEDEBUG, DEBUGLEVEL, DEBUGX, DEBUGY, OFFLINE };
