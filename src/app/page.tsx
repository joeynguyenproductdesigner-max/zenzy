"use client";

import { Intro } from "@/components/intro/Intro";
import { MainScreen } from "@/components/main/MainScreen";
import { useLocalStorage } from "@/lib/use-local-storage";

export default function Home() {
  const [onboarded, setOnboarded] = useLocalStorage<boolean>(
    "zenzy:onboarded",
    false
  );
  const [, setName] = useLocalStorage<string>("zenzy:name", "");

  if (!onboarded) {
    return (
      <Intro
        onComplete={(name) => {
          setName(name);
          setOnboarded(true);
        }}
      />
    );
  }

  return <MainScreen />;
}
