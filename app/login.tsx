import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';

import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { DEV_MODE, DEV_PHONES } from "@/lib/devAuth";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"user" | "coach" | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = phone.length >= 10;

  // Load selected role (set in select-role screen)
  useEffect(() => {
    AsyncStorage.getItem("selectedRole").then((value) => {
      if (value === "user" || value === "coach") {
        setRole(value);
      }
    });
  }, []);

  const sendOtp = async () => {
    if (!isValid || loading) return;

    setLoading(true);

    const formattedPhone = `+91${phone}`;

    // store phone for verify screen
    await AsyncStorage.setItem("auth_phone", formattedPhone);

    /* -------------------------------
     🧪 DEV OTP MODE (NO SMS)
  -------------------------------- */
    if (DEV_MODE && DEV_PHONES.includes(formattedPhone)) {
      setLoading(false);
      router.push("/verify");
      return;
    }

    /* -------------------------------
     🔐 REAL OTP (SMS)
  -------------------------------- */
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/verify");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#64748b" />
        </Pressable>

        {role && (
          <Text style={styles.roleBadge}>
            CONTINUING AS {role.toUpperCase()}
          </Text>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>
          We’ll send a one-time verification code to this number.
        </Text>

        <View style={styles.inputRow}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/\D/g, ""))}
            placeholder="XXXXXXXXXX"
            style={styles.input}
            keyboardType="phone-pad"
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => Keyboard.dismiss()}
            autoFocus
          />
        </View>

        <Text style={styles.helper}>
          Standard message and data rates may apply.
        </Text>
      </View>

      {/* Primary Action */}
      <View style={styles.footer}>
        <Pressable
          disabled={!isValid || loading}
          onPress={sendOtp}
          style={[
            styles.button,
            isValid ? styles.buttonActive : styles.buttonDisabled,
          ]}
        >
          <Text style={[styles.buttonText, !isValid && { color: "#cbd5f5" }]}>
            {loading ? "Sending..." : "Send OTP"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  roleBadge: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#64748b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 32,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "#e2e8f0",
    paddingVertical: 12,
    gap: 12,
  },
  countryCode: {
    fontSize: 20,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  helper: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 12,
  },
  footer: {
    paddingBottom: 16,
  },
  button: {
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: "#0f172a",
  },
  buttonDisabled: {
    backgroundColor: "#f1f5f9",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
});
