import { useEffect, useRef } from "react";
import Hls from "hls.js";

const VIDEO_URL =
  "https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8";

function BackgroundVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    let hls;

    video.addEventListener("loadedmetadata", () => {
      console.log("✅ Video metadata loaded");
      video.play().catch((err) => {
        console.error("❌ Autoplay error:", err);
      });
    });

    video.addEventListener("error", (event) => {
      console.error("❌ Video error:", event);
    });

    if (Hls.isSupported()) {
      console.log("✅ HLS.js supported");

      hls = new Hls();

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ HLS manifest loaded");

        video
          .play()
          .then(() => console.log("▶️ Video playing"))
          .catch((err) => console.error("❌ Play error:", err));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("❌ HLS error:", data);
      });

      hls.loadSource(VIDEO_URL);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("✅ Native HLS supported");

      video.src = VIDEO_URL;
    } else {
      console.error("❌ HLS is not supported");
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <video
  ref={videoRef}
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
/>
    </div>
  );
}

export default BackgroundVideo;