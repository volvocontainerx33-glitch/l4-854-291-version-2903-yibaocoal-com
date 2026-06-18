document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get("q") || "";
  var pageSearch = document.querySelector("[data-page-search]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var resultLine = document.querySelector("[data-result-line]");
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var currentFilter = "all";

  if (pageSearch && queryValue) {
    pageSearch.value = queryValue;
  }

  function cardText(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-category") || ""
    ].join(" ").toLowerCase();
  }

  function updateCards() {
    var text = pageSearch ? pageSearch.value.trim().toLowerCase() : "";
    var visible = 0;

    cards.forEach(function (card) {
      var matchesText = !text || cardText(card).indexOf(text) !== -1;
      var matchesFilter = currentFilter === "all" || card.getAttribute("data-type") === currentFilter || card.getAttribute("data-category") === currentFilter;
      var show = matchesText && matchesFilter;
      card.classList.toggle("hidden-card", !show);
      if (show) {
        visible += 1;
      }
    });

    if (resultLine) {
      resultLine.textContent = "当前显示 " + visible + " 部影片";
    }
  }

  if (pageSearch) {
    pageSearch.addEventListener("input", updateCards);
    var form = pageSearch.closest("form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        updateCards();
      });
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      currentFilter = chip.getAttribute("data-filter") || "all";
      chips.forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });
      updateCards();
    });
  });

  if (cards.length && (pageSearch || chips.length || resultLine)) {
    updateCards();
  }
});
