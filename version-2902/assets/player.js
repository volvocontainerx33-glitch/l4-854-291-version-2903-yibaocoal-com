
(function () {
  var hlsLoader = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function beginPlayback(frame, video, stream) {
    if (!video || !stream) {
      return;
    }

    frame.classList.add('is-loading');

    if (video.dataset.ready === '1') {
      frame.classList.add('is-ready');
      video.play().catch(function () {});
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = '1';
      frame.classList.add('is-ready');
      video.play().catch(function () {});
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.dataset.ready = '1';
        frame.classList.add('is-ready');
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
        video.dataset.ready = '1';
        frame.classList.add('is-ready');
        video.play().catch(function () {});
      }
    }).catch(function () {
      frame.classList.remove('is-loading');
    });
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-play-trigger]');
    if (!trigger) {
      return;
    }

    var frame = trigger.closest('.player-frame');
    var video = frame && frame.querySelector('.movie-video');
    var stream = video && video.getAttribute('data-stream');
    beginPlayback(frame, video, stream);
  });

  document.addEventListener('click', function (event) {
    var video = event.target.closest('.movie-video');
    if (!video || video.dataset.ready === '1') {
      return;
    }

    var frame = video.closest('.player-frame');
    var stream = video.getAttribute('data-stream');
    beginPlayback(frame, video, stream);
  });
})();
