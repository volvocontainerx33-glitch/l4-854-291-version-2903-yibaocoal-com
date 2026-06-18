(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilters() {
        var grids = selectAll(".category-list");
        if (!grids.length) {
            return;
        }
        var textInput = document.querySelector(".local-filter");
        var yearSelect = document.querySelector(".year-filter");
        var typeSelect = document.querySelector(".type-filter");
        var cards = selectAll(".movie-card");

        function apply() {
            var term = textInput ? textInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                var okTerm = !term || haystack.indexOf(term) !== -1;
                var okYear = !year || card.getAttribute("data-year") === year;
                var okType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1 || (card.getAttribute("data-genre") || "").indexOf(type) !== -1;
                card.classList.toggle("hidden-by-filter", !(okTerm && okYear && okType));
            });
        }

        [textInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster\" href=\"" + movie.url + "\">" +
            "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>" +
            "<span class=\"poster-score\">" + escapeHtml(movie.score) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p class=\"movie-meta\">" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.genre) + "</p>" +
            "<p class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupSearchPage() {
        var results = document.getElementById("search-results");
        var input = document.getElementById("search-input");
        var title = document.getElementById("search-title");
        if (!results || !input || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function render(value) {
            var term = value.trim().toLowerCase();
            var source = window.SITE_MOVIES;
            var list = term ? source.filter(function (movie) {
                return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(term) !== -1;
            }) : source.slice(0, 36);
            results.innerHTML = list.slice(0, 240).map(movieCard).join("");
            if (title) {
                title.textContent = term ? "相关影片" : "精选影片";
            }
        }

        input.addEventListener("input", function () {
            render(input.value);
        });
        render(query);
    }

    window.initVideoPlayer = function (source) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("player-overlay");
        var startButton = document.querySelector(".player-start");
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (startButton) {
            startButton.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
    });
})();
