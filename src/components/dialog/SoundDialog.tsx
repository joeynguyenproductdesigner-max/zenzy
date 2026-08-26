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

type Tab = "sounds" | "music";

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
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const stop = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return { isPlaying, play, stop, togglePlayback };
}

export function SoundDialog({ open }: { open: boolean }) {
  const [tab, setTab] = useState<Tab>("sounds");
  const [selectedSoundId, setSelectedSoundId] = useLocalStorage<string | null>(
    "zenzy:sound",
    null
  );
  const [selectedMusicId, setSelectedMusicId] = useLocalStorage<string | null>(
    "zenzy:music",
    null
  );
  const [soundVolume, setSoundVolume] = useLocalStorage<number>(
    "zenzy:sound-volume",
    0.7
  );
  const [musicVolume, setMusicVolume] = useLocalStorage<number>(
    "zenzy:music-volume",
    0.7
  );

  const sound = useLoopingAudio(soundVolume);
  const music = useLoopingAudio(musicVolume);

  if (!open) return null;

  const activeList: MediaItem[] = tab === "sounds" ? ambientSounds : musicTracks;
  const activeSelectedId = tab === "sounds" ? selectedSoundId : selectedMusicId;
  const setActiveSelectedId = tab === "sounds" ? setSelectedSoundId : setSelectedMusicId;
  const active = tab === "sounds" ? sound : music;

  const toggleItem = (item: MediaItem) => {
    if (activeSelectedId === item.id) {
      setActiveSelectedId(null);
      active.stop();
    } else {
      setActiveSelectedId(item.id);
      active.play(item.url);
    }
  };

  const shuffle = () => {
    const pool = activeList.filter((item) => item.id !== activeSelectedId);
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? activeList[0];
    setActiveSelectedId(pick.id);
    active.play(pick.url);
  };

  return (
    <DialogPanel>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-6 text-[32px]">
          <button
            type="button"
            onClick={() => setTab("sounds")}
            className={
              tab === "sounds"
                ? "font-black text-white underline"
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
                ? "font-black text-white underline"
                : "font-bold text-[#a0a5b5]"
            }
          >
            Music
          </button>
        </div>
        <div className="flex items-center gap-3">
          <DialogIconButton onClick={active.togglePlayback} label="Play/Pause">
            {active.isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </DialogIconButton>
          <DialogIconButton onClick={shuffle} label="Shuffle">
            <RefreshCw className="size-5" />
          </DialogIconButton>
        </div>
      </div>

      {tab === "sounds" ? (
        <div className="grid h-[448px] grid-cols-4 grid-rows-4 gap-3">
          {ambientSounds.map((item) => {
            const selected = selectedSoundId === item.id;
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleItem(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleItem(item);
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
                  <VolumeSlider value={soundVolume} onChange={setSoundVolume} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[448px] flex-col gap-3 overflow-y-auto p-1">
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
                  onClick={() => toggleItem(item)}
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
