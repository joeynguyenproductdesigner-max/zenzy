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

function useLoopingAudio(url: string | null, volume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    const audio = audioRef.current;
    if (url) {
      audio.src = url;
      audio.volume = volume;
      audio.play().catch(() => setIsPlaying(false));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflects the outcome of the play() call kicked off just above, not derivable during render
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
    return () => {
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- volume is applied by the effect below without restarting playback
  }, [url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !url) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return { isPlaying, togglePlayback };
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

  const soundUrl = ambientSounds.find((s) => s.id === selectedSoundId)?.url ?? null;
  const musicUrl = musicTracks.find((m) => m.id === selectedMusicId)?.url ?? null;

  const sound = useLoopingAudio(soundUrl, soundVolume);
  const music = useLoopingAudio(musicUrl, musicVolume);

  if (!open) return null;

  const activeList: MediaItem[] = tab === "sounds" ? ambientSounds : musicTracks;
  const activeSelectedId = tab === "sounds" ? selectedSoundId : selectedMusicId;
  const setActiveSelectedId = tab === "sounds" ? setSelectedSoundId : setSelectedMusicId;
  const active = tab === "sounds" ? sound : music;

  const toggleItem = (id: string) => {
    setActiveSelectedId((current) => (current === id ? null : id));
  };

  const shuffle = () => {
    const pool = activeList.filter((item) => item.id !== activeSelectedId);
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? activeList[0];
    setActiveSelectedId(pick.id);
  };

  return (
    <DialogPanel>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-6 text-[20px]">
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
                className={`flex flex-col gap-2 rounded-xl bg-[#13131b]/50 px-3 py-2 transition ${
                  selected ? "ring-2 ring-[#5e3bee]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full flex-1 flex-col items-center justify-center gap-2"
                >
                  <span className="text-xl">{SOUND_EMOJI[item.id] ?? "🔊"}</span>
                  <span className="line-clamp-2 text-center text-[12px] font-semibold text-white">
                    {item.name}
                  </span>
                </button>
                {selected && (
                  <VolumeSlider value={soundVolume} onChange={setSoundVolume} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[448px] flex-col gap-3 overflow-y-auto">
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
                  onClick={() => toggleItem(item.id)}
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
