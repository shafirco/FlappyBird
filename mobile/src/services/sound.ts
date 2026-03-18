import { Audio } from "expo-av";
import {
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av/build/Audio.types";

const FLAP_SOUND = require("../../assets/sounds/flap.mp3");

let soundInstance: Audio.Sound | null = null;

export async function initGameSound(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    });
    const { sound } = await Audio.Sound.createAsync(FLAP_SOUND, {
      shouldPlay: false,
      volume: 1,
    });
    soundInstance = sound;
  } catch (e) {
    console.warn("Failed to load flap sound", e);
  }
}

export async function playFlapSound(): Promise<void> {
  if (!soundInstance) return;
  try {
    await soundInstance.setPositionAsync(0);
    await soundInstance.setVolumeAsync(1);
    await soundInstance.setRateAsync(1, false);
    await soundInstance.playAsync();
  } catch (e) {
    console.warn("Failed to play flap sound", e);
  }
}

export async function playPointSound(score: number): Promise<void> {
  if (!soundInstance) return;
  try {
    await soundInstance.setPositionAsync(0);
    await soundInstance.setVolumeAsync(0.7);
    await soundInstance.setRateAsync(score >= 10 ? 1.35 : 1, false);
    await soundInstance.playAsync();
  } catch (e) {
    console.warn("Failed to play point sound", e);
  }
}

export function disposeGameSound(): void {
  if (soundInstance) {
    soundInstance.unloadAsync().catch(() => {});
    soundInstance = null;
  }
}
