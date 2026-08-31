"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RefreshCw } from "lucide-react";
import { ambientSounds, musicTracks, type MediaItem } from "../../../media-config";
import { useLocalStorage } from "@/lib/use-local-storage";
import { DialogIconButton, DialogPanel } from "./DialogPanel";
import { VolumeSlider } from "./VolumeSlider";

const SOUND_EMOJI: Record<string, string> = {
  "rain-with-thunderstorm": "⛈️",
  "gentle-rain": "🌧️",
  "wind-blowing": "🍃",
  "ocean-waves": "🌊",
  "city-hall-ambience": "🏛️",
  "fireplace-loop": "🔥",
  "library-ambience": "📚",
  "calming-rain": "🌦️",
  "light-rain": "💧",
  "old-train-interior": "🚂",
  "morning-birds": "🐦",
  "street-ambience": "🏙️",
  "cafe-noise": "☕",
  "airplane-cabin": "✈️",
};

const DEFAULT_VOLUME = 0.7;

type Tab = "sounds" | "music";

// Single-track player, used for Music — only one track plays at a time.
function useLoopingAudio(volume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Called directly from a click handler (never from an effect) so the
  // play() call stays inside the user gesture — Safari in particular
  // silently blocks audio.play() once it's a tick removed from the click.
  const play = (url: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    const audio = audioRef.current;
    audio.src = url;
    audio.volume = volume;
    // Set isPlaying optimistically instead of waiting on the play()
    // promise — that promise only resolves once playback actually
    // starts (enough data buffered), so on a slow connection the
    // button stayed stuck on "Play" even though audio.paused was
    // already false. Matches the same pattern useSoundMixer uses.
    audio.play().catch(() => {});
    setIsPlaying(true);
  };

  const stop = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.play().catch(() => {});
    setIsPlaying(true);
  };

  return { isPlaying, play, stop, pause, resume };
}

// Multi-track mixer, used for Sounds — any number of ambient sounds can
// play together, each with its own independent volume.
function useSoundMixer() {
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [activeIds, setActiveIds] = useLocalStorage<string[]>("zenzy:sounds", []);
  const [volumes, setVolumes] = useLocalStorage<Record<string, number>>(
    "zenzy:sound-volumes",
    {}
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audios = audiosRef.current;
    return () => {
      audios.forEach((audio) => audio.pause());
    };
  }, []);

  // Called directly from a click handler — see note on useLoopingAudio above.
  const toggle = (id: string, url: string) => {
    const existing = audiosRef.current.get(id);
    if (existing) {
      existing.pause();
      audiosRef.current.delete(id);
      setActiveIds((prev) => prev.filter((activeId) => activeId !== id));
      return;
    }
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volumes[id] ?? DEFAULT_VOLUME;
    audio.play().catch(() => {});
    audiosRef.current.set(id, audio);
    setActiveIds((prev) => [...prev, id]);
    setIsPlaying(true);
  };

  const setVolume = (id: string, volume: number) => {
    setVolumes((prev) => ({ ...prev, [id]: volume }));
    const audio = audiosRef.current.get(id);
    if (audio) audio.volume = volume;
  };

  const pauseAll = () => {
    audiosRef.current.forEach((audio) => audio.pause());
    setIsPlaying(false);
  };

  const resumeAll = () => {
    if (activeIds.length === 0) return;
    audiosRef.current.forEach((audio) => audio.play().catch(() => {}));
    setIsPlaying(true);
  };

  const clearAll = () => {
    audiosRef.current.forEach((audio) => audio.pause());
    audiosRef.current.clear();
    setActiveIds([]);
    setIsPlaying(false);
  };

  return { activeIds, volumes, toggle, setVolume, pauseAll, resumeAll, isPlaying, clearAll };
}

export function SoundDialog({ open }: { open: boolean }) {
  const [tab, setTab] = useState<Tab>("sounds");
  const [selectedMusicId, setSelectedMusicId] = useLocalStorage<string | null>(
    "zenzy:music",
    null
  );
  const [musicVolume, setMusicVolume] = useLocalStorage<number>(
    "zenzy:music-volume",
    DEFAULT_VOLUME
  );

  const soundMixer = useSoundMixer();
  const music = useLoopingAudio(musicVolume);

  if (!open) return null;

  const isPlaying = soundMixer.isPlaying || music.isPlaying;

  const togglePlayAll = () => {
    if (isPlaying) {
      soundMixer.pauseAll();
      music.pause();
    } else {
      soundMixer.resumeAll();
      music.resume();
    }
  };

  const toggleMusic = (item: MediaItem) => {
    if (selectedMusicId === item.id) {
      setSelectedMusicId(null);
      music.stop();
    } else {
      setSelectedMusicId(item.id);
      music.play(item.url);
    }
  };

  const clearAll = () => {
    soundMixer.clearAll();
    setSelectedMusicId(null);
    music.stop();
  };

  return (
    <DialogPanel>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-6 text-[28px]">
          <button
            type="button"
            onClick={() => setTab("sounds")}
            className={
              tab === "sounds"
                ? "font-black text-white"
                : "font-bold text-[#a0a5b5]"
            }
          >
            Sounds
          </button>
          <button
            type="button"
            onClick={() => setTab("music")}
            className={
              tab === "music"
                ? "font-black text-white"
                : "font-bold text-[#a0a5b5]"
            }
          >
            Music
          </button>
        </div>
        <div className="flex items-center gap-3">
          <DialogIconButton onClick={togglePlayAll} label="Play/Pause">
            {isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </DialogIconButton>
          <DialogIconButton onClick={clearAll} label="Clear all sounds">
            <RefreshCw className="size-5" />
          </DialogIconButton>
        </div>
      </div>

      {tab === "sounds" ? (
        <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-4 gap-3">
          {ambientSounds.map((item) => {
            const selected = soundMixer.activeIds.includes(item.id);
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => soundMixer.toggle(item.id, item.url)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    soundMixer.toggle(item.id, item.url);
                  }
                }}
                className={`flex cursor-pointer flex-col gap-2 rounded-xl bg-[#13131b]/50 px-3 py-2 transition ${
                  selected ? "justify-start ring-2 ring-[#5e3bee]" : "justify-center"
                }`}
              >
                <div className="flex h-[56px] w-full flex-col items-center justify-center gap-1">
                  <span className="shrink-0 text-[20px] leading-none">
                    {SOUND_EMOJI[item.id] ?? "🔊"}
                  </span>
                  <span className="line-clamp-2 shrink-0 text-center text-[12px] font-semibold leading-[14px] text-white">
                    {item.name}
                  </span>
                </div>
                {selected && (
                  <VolumeSlider
                    value={soundMixer.volumes[item.id] ?? DEFAULT_VOLUME}
                    onChange={(v) => soundMixer.setVolume(item.id, v)}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1">
          {musicTracks.map((item) => {
            const selected = selectedMusicId === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 rounded-xl border bg-[#13131b]/50 p-3 transition ${
                  selected ? "border-transparent ring-2 ring-[#5e3bee]" : "border-[#222430]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleMusic(item)}
                  className="flex flex-1 items-center gap-4 text-left"
                >
                  <div className="flex size-[56px] shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                    🎵
                  </div>
                  <p className="flex-1 truncate text-[16px] text-white">{item.name}</p>
                </button>
                {selected && (
                  <VolumeSlider value={musicVolume} onChange={setMusicVolume} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </DialogPanel>
  );
}
