document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  function loadLibrary(done) {
    if (window.Hls) {
      done();
      return;
    }

    var current = document.querySelector("script[data-hls-lib]");
    if (current) {
      current.addEventListener("load", done, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-lib", "true");
    script.addEventListener("load", done, { once: true });
    document.head.appendChild(script);
  }

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var poster = player.querySelector(".player-poster");
    var button = player.querySelector(".player-start");
    var source = player.getAttribute("data-source");
    var started = false;

    function playVideo() {
      if (!video || !source) {
        return;
      }

      player.classList.add("is-ready");
      video.controls = true;

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      loadLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      });
    }

    if (poster) {
      poster.addEventListener("click", playVideo);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        playVideo();
      });
    }
  });
});
