function Dimmer() {
    this.alpha = 255;
    let e = -5,
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

export { Dimmer };
