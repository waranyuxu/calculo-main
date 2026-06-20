import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  setAudioModeAsync,
  useAudioPlayer,
  type AudioPlayer,
} from "expo-audio";

type SoundEffect = "correct" | "incorrect" | "start";

type SoundEffectsContextValue = {
  playSound: (effect: SoundEffect) => void;
};

const correctSound = require("../../sound_effect/correct/dragon-studio-correct-472358.mp3");
const gameStartSound = require("../../sound_effect/game start/49447089-game-start-317318.mp3");
const incorrectSound = require("../../sound_effect/wrong/universfield-wrong-answer-129254.mp3");

const SoundEffectsContext = createContext<SoundEffectsContextValue>({
  playSound: () => {},
});

function replay(player: AudioPlayer) {
  void player
    .seekTo(0)
    .then(() => player.play())
    .catch(() => {
      try {
        player.play();
      } catch {
        // Sound effects should never block the UI.
      }
    });
}

export function SoundEffectsProvider({ children }: { children: ReactNode }) {
  const correctPlayer = useAudioPlayer(correctSound);
  const gameStartPlayer = useAudioPlayer(gameStartSound);
  const incorrectPlayer = useAudioPlayer(incorrectSound);

  useEffect(() => {
    void setAudioModeAsync({
      interruptionMode: "mixWithOthers",
      playsInSilentMode: true,
    }).catch(() => {});
  }, []);

  const players = useMemo(
    () => ({
      correct: correctPlayer,
      incorrect: incorrectPlayer,
      start: gameStartPlayer,
    }),
    [correctPlayer, gameStartPlayer, incorrectPlayer],
  );

  const playSound = useCallback(
    (effect: SoundEffect) => {
      replay(players[effect]);
    },
    [players],
  );

  useEffect(() => {
    const timer = setTimeout(() => playSound("start"), 250);

    return () => clearTimeout(timer);
  }, [playSound]);

  const value = useMemo(() => ({ playSound }), [playSound]);

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
    </SoundEffectsContext.Provider>
  );
}

export function useSoundEffects() {
  return useContext(SoundEffectsContext);
}
