import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  onSubmit: (name: string) => void;
};

export function NamePromptOverlay({ onSubmit }: Props) {
  const [name, setName] = useState("");

  const trimmed = useMemo(() => name.trim().slice(0, 20), [name]);
  const canSubmit = trimmed.length > 0;

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <Text style={styles.title}>Choose a name</Text>
        <Text style={styles.subtitle}>
          This will be used for the global leaderboard.
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your nickname"
          placeholderTextColor="#999"
          maxLength={20}
          autoFocus
          style={styles.input}
        />
        <Pressable
          onPress={() => onSubmit(trimmed)}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.button,
            !canSubmit && styles.buttonDisabled,
            pressed && canSubmit && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  panel: {
    width: "86%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#555",
    textAlign: "center",
  },
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111",
  },
  button: {
    marginTop: 14,
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});

