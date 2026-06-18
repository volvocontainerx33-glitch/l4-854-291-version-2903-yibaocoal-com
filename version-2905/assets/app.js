(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function(img) {
    img.addEventListener("error", function() {
      img.classList.add("is-empty");
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
    var scope = panel.parentElement || document;
    var input = panel.querySelector("[data-search-input]");
    var type = panel.querySelector("[data-filter-type]");
    var region = panel.querySelector("[data-filter-region]");
    var grid = scope.querySelector("[data-movie-grid]") || document.querySelector("[data-movie-grid]");
    var empty = scope.querySelector("[data-empty-state]");

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

    function match(card, value, attr) {
      if (!value) {
        return true;
      }
      return (card.getAttribute(attr) || "").indexOf(value) !== -1;
    }

    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      var regionValue = region ? region.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var searchText = card.getAttribute("data-search") || "";
        var keywordMatch = !keyword || searchText.indexOf(keyword) !== -1;
        var typeMatch = match(card, typeValue, "data-type");
        var regionMatch = match(card, regionValue, "data-region");
        var shouldShow = keywordMatch && typeMatch && regionMatch;

        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, type, region].forEach(function(control) {
      if (control) {
        control.addEventListener("input", filter);
        control.addEventListener("change", filter);
      }
    });

    filter();
  });
}());
