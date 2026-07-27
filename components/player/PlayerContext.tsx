"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Track = {
  slug: string;
  title: string;
  subtitle?: string | null;
  src: string;
  cover_url?: string | null;
};

type PlayerState = {
  track: Track | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  visible: boolean;
  loading: boolean;
  error: string | null;
};

type Ctx = PlayerState & {
  play: (t: Track) => void;
  toggle: () => void;
  seek: (sec: number) => void;
  close: () => void;
  setVolume: (v: number) => void;
};

const PlayerCtx = createContext<Ctx | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazily create the single <audio> element
  const getAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "metadata";
      a.addEventListener("play", () => setPlaying(true));
      a.addEventListener("pause", () => setPlaying(false));
      a.addEventListener("ended", () => setPlaying(false));
      a.addEventListener("timeupdate", () => setCurrentTime(a.currentTime || 0));
      a.addEventListener("loadedmetadata", () => setDuration(a.duration || 0));
      a.addEventListener("waiting", () => setLoading(true));
      a.addEventListener("canplay", () => setLoading(false));
      a.addEventListener("playing", () => setLoading(false));
      a.addEventListener("error", () => {
        setLoading(false);
        setError("خطا در پخش فایل صوتی");
      });
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const play = useCallback(
    (t: Track) => {
      const a = getAudio();
      if (!a) return;
      setError(null);
      setVisible(true);
      // If same track, just resume
      if (track?.slug === t.slug && a.src) {
        a.play().catch(() => setError("امکان پخش وجود ندارد"));
        return;
      }
      setTrack(t);
      setCurrentTime(0);
      setDuration(0);
      setLoading(true);
      a.src = t.src;
      a.play().catch(() => {
        setLoading(false);
        setError("امکان پخش وجود ندارد");
      });

      // Fire-and-forget play counter
      fetch(`/api/podcasts/${encodeURIComponent(t.slug)}/play`, { method: "POST" }).catch(() => {});
    },
    [getAudio, track?.slug]
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (a.paused) {
      a.play().catch(() => setError("امکان پخش وجود ندارد"));
    } else {
      a.pause();
    }
  }, [track]);

  const seek = useCallback((sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(sec, a.duration || sec));
  }, []);

  const close = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
    setVisible(false);
    setPlaying(false);
    setTrack(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const setVolume = useCallback((v: number) => {
    const a = audioRef.current;
    if (a) a.volume = Math.max(0, Math.min(1, v));
  }, []);

  // Cleanup on unmount — fully release the audio element
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load(); // Release the media resource
      }
      audioRef.current = null;
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      track,
      playing,
      currentTime,
      duration,
      visible,
      loading,
      error,
      play,
      toggle,
      seek,
      close,
      setVolume,
    }),
    [track, playing, currentTime, duration, visible, loading, error, play, toggle, seek, close, setVolume]
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

export function usePlayer(): Ctx {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
