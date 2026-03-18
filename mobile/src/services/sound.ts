import { Audio } from "expo-av";
import {
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av/build/Audio.types";

const FLAP_SOUND = require("../../assets/sounds/flap.mp3");
const BACKGROUND_MUSIC = require("../../assets/sounds/background_music.mp3");

let soundInstance: Audio.Sound | null = null;
let bgSoundInstance: Audio.Sound | null = null;
let isSfxMuted = false;
let isBgMuted = false;

export function getSfxMuted(): boolean {
  return isSfxMuted;
}

export function getBgMuted(): boolean {
  return isBgMuted;
}

export async function setSfxMuted(muted: boolean): Promise<void> {
  isSfxMuted = muted;
  try {
    if (soundInstance) {
      await soundInstance.setVolumeAsync(muted ? 0 : 1);
    }
  } catch {
    // ignore
  }
}

export async function setBgMuted(muted: boolean): Promise<void> {
  isBgMuted = muted;
  try {
    if (bgSoundInstance) {
      if (muted) await bgSoundInstance.pauseAsync();
      await bgSoundInstance.setVolumeAsync(muted ? 0 : 0.22);
    }
  } catch {
    // ignore
  }
}

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

    const { sound: bgSound } = await Audio.Sound.createAsync(
      BACKGROUND_MUSIC,
      {
        shouldPlay: false,
        volume: 0.22,
      }
    );
    bgSoundInstance = bgSound;
    try {
      await bgSoundInstance.setIsLoopingAsync(true);
    } catch {
      // some platforms might not support looping the same way
    }
  } catch (e) {
    console.warn("Failed to load flap sound", e);
  }
}

export async function playFlapSound(): Promise<void> {
  if (isSfxMuted) return;
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
  if (isSfxMuted) return;
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

export async function startBackgroundMusic(): Promise<void> {
  if (isBgMuted) return;
  if (!bgSoundInstance) return;
  try {
    await bgSoundInstance.setVolumeAsync(0.22);
    await bgSoundInstance.playAsync();
  } catch {
    // ignore
  }
}

export async function pauseBackgroundMusic(): Promise<void> {
  if (!bgSoundInstance) return;
  try {
    await bgSoundInstance.pauseAsync();
  } catch {
    // ignore
  }
}

export function disposeGameSound(): void {
  if (soundInstance) {
    soundInstance.unloadAsync().catch(() => {});
    soundInstance = null;
  }
  if (bgSoundInstance) {
    bgSoundInstance.unloadAsync().catch(() => {});
    bgSoundInstance = null;
  }
}
