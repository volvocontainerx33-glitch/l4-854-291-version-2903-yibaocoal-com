(function () {
    window.createMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var button = document.getElementById(config.buttonId);
        var hls = null;
        var started = false;

        if (!video || !overlay || !button || !config.url) {
            return;
        }

        function startVideo() {
            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;
            overlay.classList.add("is-hidden");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.url;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        hls = null;
                        video.src = config.url;
                        video.play().catch(function () {});
                    }
                });
                return;
            }

            video.src = config.url;
            video.play().catch(function () {});
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            startVideo();
        });

        overlay.addEventListener("click", function () {
            startVideo();
        });

        video.addEventListener("click", function () {
            if (started && video.paused) {
                video.play().catch(function () {});
            }
        });
    };
})();
