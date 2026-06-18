(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        function next() {
            show(current + 1);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(next, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        root.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });
        root.addEventListener("mouseleave", restart);
        show(0);
        restart();
    }

    function setupSearch() {
        var input = document.querySelector("[data-search-input]");
        var year = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length || (!input && !year)) {
            return;
        }
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var y = year ? year.value.trim() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search-text") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matched = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y);
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    window.initVideoPlayer = function (sourceUrl, videoId, buttonId, overlayId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        if (!video || !sourceUrl) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach(playAfterAttach) {
            if (attached) {
                if (playAfterAttach) {
                    video.play().catch(function () {});
                }
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                if (playAfterAttach) {
                    video.play().catch(function () {});
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (playAfterAttach) {
                        video.play().catch(function () {});
                    }
                });
            } else {
                video.src = sourceUrl;
                if (playAfterAttach) {
                    video.play().catch(function () {});
                }
            }
        }

        function start() {
            attach(true);
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (overlay) {
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay || event.target.closest("#" + buttonId)) {
                    start();
                }
            });
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
