(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            var open = navMenu.classList.toggle("is-open");
            navToggle.classList.toggle("is-open", open);
            navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === index);
        });
    }

    function queueSlide() {
        if (!slides.length) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(index + 1);
        }, 6200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide-to")) || 0);
            queueSlide();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(index - 1);
            queueSlide();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(index + 1);
            queueSlide();
        });
    }

    showSlide(0);
    queueSlide();

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        var target = document.querySelector(panel.getAttribute("data-target"));
        if (!target) {
            return;
        }

        var search = panel.querySelector(".js-search");
        var region = panel.querySelector(".js-filter-region");
        var year = panel.querySelector(".js-filter-year");
        var type = panel.querySelector(".js-filter-type");
        var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var q = normalize(search && search.value);
            var r = normalize(region && region.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category")
                ].join(" "));
                var ok = true;

                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && normalize(card.getAttribute("data-region")) !== r) {
                    ok = false;
                }
                if (y && normalize(card.getAttribute("data-year")) !== y) {
                    ok = false;
                }
                if (t && normalize(card.getAttribute("data-type")) !== t) {
                    ok = false;
                }

                card.classList.toggle("is-hidden", !ok);
            });
        }

        [search, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    });
})();
