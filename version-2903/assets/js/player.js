(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var stream = shell.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }

      loaded = true;
      video.setAttribute('controls', 'controls');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
      video.load();
    }

    function start() {
      attach();
      shell.classList.add('is-playing');
      var playing = video.play();

      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(initPlayer);
})();
