(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobilePanel.classList.contains('open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === heroIndex);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var resultCount = document.querySelector('[data-result-count]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var activeFilter = 'all';

  function filterCards() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
      var isVisible = matchesKeyword && matchesFilter;
      card.classList.toggle('hidden-by-filter', !isVisible);

      if (isVisible) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visible + ' 部影片';
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', filterCards);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  if (cards.length) {
    filterCards();
  }
})();

function initMoviePlayer(url) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playerCover');
  var attached = false;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = url;
  }

  function start() {
    attach();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;
    var playAction = video.play();

    if (playAction && typeof playAction.catch === 'function') {
      playAction.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!attached) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
}
