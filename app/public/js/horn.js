!function () {
    "use strict";
    var e, n, t;
    e = function () {
        var e, n, t, i = !1, o = window.AudioContext || window.webkitAudioContext, a = this;
        void 0 !== o ? o = new o : (i = !0,
            e = document.createElement("audio"));
        var s = function (n) {
            if (n = n || function () { }
                ,
                i)
                e.src = "sounds/airhorn.mp3";
            else if (o.resume(),
                1 != !!t) {
                var a = new XMLHttpRequest;
                a.onload = function () {
                    o.decodeAudioData(a.response, function (e) {
                        n(e)
                    })
                }
                    ,
                    a.open("GET", "sounds/airhorn.mp3"),
                    a.responseType = "arraybuffer",
                    a.send()
            } else
                n(t)
        };
        this.start = function (t) {
            var r = t.loop;
            if (i)
                return e.loop = r,
                    e.currentTime = 0,
                    void e.play();
            s(function (e) {
                (n = o.createBufferSource()).connect(o.destination),
                    n.buffer = e,
                    n.onended = function () {
                        a.stop()
                    }
                    ,
                    n.start(0),
                    n.loop = r,
                    n.loopStart = .24,
                    n.loopEnd = .34
            })
        }
            ,
            this.stop = function () {
                !0 == !!n && (n.loop = !1),
                    i && (e.loop = !1,
                        e.pause()),
                    this.onstopped()
            }
            ,
            this.onstopped = function () { }
            ,
            s(function (e) {
                t = e
            })
    }
        ,
        n = function (e) {
            var n, t = function (t) {
                n && (n.prompt(),
                    n.userChoice.then(function (t) {
                        n = null,
                            e.classList.remove("available")
                    }).catch(function (t) {
                        n = null,
                            e.classList.remove("available")
                    }))
            };
            window.addEventListener("beforeinstallprompt", function (t) {
                return (n = t).preventDefault(),
                    e.classList.add("available"),
                    !1
            }),
                window.addEventListener("appinstalled", function (t) {
                    n = null,
                        e.classList.remove("available")
                }),
                e.addEventListener("click", t.bind(this)),
                e.addEventListener("touchend", t.bind(this))
        }
        ,
        t = function (n) {
            var t = n.querySelector(".horn")
                , i = new e;
            "clearAppBadge" in navigator && navigator.clearAppBadge();
            var o = 0
                , a = function (e) {
                    if (1 == !!e && (0 == r && e.preventDefault(),
                        e.touches && e.touches.length > 1))
                        return !1;
                    this.start({
                        loop: !0
                    })
                }
                , s = function (e) {
                    1 == !!e && e.preventDefault(),
                        this.stop()
                };
            this.start = function (e) {
                t.classList.add("horning"),
                    t.setAttribute("aria-pressed", "true"),
                    i.start(e),
                    "setAppBadge" in navigator && (99 === o && (o = 0),
                        navigator.setAppBadge(++o)),
                    i.onstopped = function () {
                        t.classList.remove("horning"),
                            t.setAttribute("aria-pressed", "false")
                    }
            }
                ,
                this.stop = function () {
                    t.classList.remove("horning"),
                        i.stop()
                }
                ;
            var r = !1;
            try {
                var d = Object.defineProperty({}, "passive", {
                    get: function () {
                        r = !0
                    }
                });
                window.addEventListener("testPassive", null, d),
                    window.removeEventListener("testPassive", null, d)
            } catch (e) { }
            t.addEventListener("mousedown", a.bind(this), !!r && {
                passive: !0
            }),
                t.addEventListener("touchstart", a.bind(this), !!r && {
                    passive: !0
                });
            var c = !1;
            t.addEventListener("keydown", function (e) {
                0 == c && ["Space", "Enter", "SoftCenter", "Digit5"].includes(e.code) && (e.preventDefault(),
                    a.call(this),
                    c = !0)
            }
                .bind(this), !1),
                document.documentElement.addEventListener("mouseup", s.bind(this)),
                document.documentElement.addEventListener("touchend", s.bind(this)),
                document.documentElement.addEventListener("keyup", function () {
                    1 == c && (s.call(this),
                        c = !1)
                }
                    .bind(this))
        }
        ,
        window.addEventListener("load", function () {
            var e = document.getElementById("airhorn")
                , i = document.getElementById("installer")
                , o = new t(e);
            if (new n(i),
                Comlink && window.opener) {
                var a = new MessageChannel
                    , s = a.port1;
                Comlink.expose(o, s),
                    opener.postMessage({
                        cmd: "READY"
                    }, "*", [a.port2])
            }
            navigator.presentation && navigator.presentation.receiver && navigator.presentation.receiver.connectionList.then(function (e) {
                e.connections.forEach(function (e) {
                    Comlink.expose(o, MessageChannelAdapter.wrap(e))
                }),
                    e.onconnectionavailable = function (e) {
                        Comlink.expose(o, MessageChannelAdapter.wrap(e.connection))
                    }
            }),
                "#instant" == location.hash && o.start({
                    loop: !1
                }),
                window.addEventListener("hashchange", function () {
                    "#instant" == location.hash && o.start({
                        loop: !1
                    })
                }),
                document.addEventListener("visibilitychange", function () {
                    document.hidden && o.stop()
                })
        })
}();
