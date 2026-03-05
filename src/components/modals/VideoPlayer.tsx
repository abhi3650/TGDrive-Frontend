import { useEffect, useMemo, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture2, Subtitles, RotateCcw, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { SubtitleTrack } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  title: string;
  subtitles?: SubtitleTrack[];
  onClose: () => void;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function VideoPlayer({ src, title, subtitles = [], onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeSubtitle, setActiveSubtitle] = useState(subtitles.findIndex((s) => s.default) || 0);

  const speeds = useMemo(() => [0.5, 0.75, 1, 1.25, 1.5, 2], []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration || Infinity));
  };

  const changeSubtitleTrack = (index: number) => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = Array.from(video.textTracks);
    tracks.forEach((track, i) => {
      track.mode = i === index ? "showing" : "disabled";
    });
    setActiveSubtitle(index);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    video.volume = volume;
    video.muted = muted;
  }, [speed, volume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => setCurrentTime(video.currentTime);
    const onMeta = () => {
      setDuration(video.duration || 0);
      if (subtitles.length > 0) changeSubtitleTrack(Math.max(activeSubtitle, 0));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowLeft") seekBy(-10);
      if (e.key === "ArrowRight") seekBy(10);
      if (e.key.toLowerCase() === "m") setMuted((v) => !v);
      if (e.key.toLowerCase() === "f") video.requestFullscreen?.();
    };

    window.addEventListener("keydown", onKeydown);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onClose, subtitles.length, activeSubtitle]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
      >
        <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium truncate max-w-[60vw]">{title}</p>
            <p className="text-zinc-400 text-xs">Space: Play/Pause · ←/→: Seek · M: Mute · F: Fullscreen</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="aspect-video bg-black">
          <video ref={videoRef} autoPlay playsInline crossOrigin="anonymous" className="w-full h-full object-contain" src={src}>
            {subtitles.map((track) => (
              <track
                key={`${track.src}-${track.label}`}
                src={track.src}
                kind="subtitles"
                srcLang={track.srclang}
                label={track.label}
                default={track.default}
              />
            ))}
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="p-3 md:p-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = val;
              setCurrentTime(val);
            }}
            className="w-full accent-cyan-400"
          />

          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-zinc-200">
            <button onClick={togglePlay} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
            <button onClick={() => seekBy(-10)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"><RotateCcw size={16} /></button>
            <button onClick={() => seekBy(10)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"><RotateCw size={16} /></button>
            <button onClick={() => setMuted((v) => !v)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 accent-cyan-400"
            />

            <span className="text-xs md:text-sm text-zinc-400 min-w-[110px]">{formatTime(currentTime)} / {formatTime(duration)}</span>

            <div className="ml-auto flex items-center gap-2">
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 rounded-lg text-xs px-2 py-1"
                title="Playback speed"
              >
                {speeds.map((rate) => (
                  <option key={rate} value={rate}>{rate}x</option>
                ))}
              </select>

              {subtitles.length > 0 && (
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1">
                  <Subtitles size={14} className="text-zinc-400" />
                  <select
                    value={activeSubtitle}
                    onChange={(e) => changeSubtitleTrack(Number(e.target.value))}
                    className="bg-transparent text-xs"
                    title="Subtitle tracks"
                  >
                    {subtitles.map((track, index) => (
                      <option key={`${track.label}-${index}`} value={index}>{track.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <button onClick={() => videoRef.current?.requestPictureInPicture?.()} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700" title="Picture in Picture">
                <PictureInPicture2 size={16} />
              </button>
              <button onClick={() => videoRef.current?.requestFullscreen?.()} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700" title="Fullscreen">
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
