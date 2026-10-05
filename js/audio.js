function AudioManager() {
        this.needs = ["Resources"];
        let e = null,
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
    }

export { AudioManager };
