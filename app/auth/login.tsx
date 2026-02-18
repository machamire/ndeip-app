import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { NDEIP_COLORS } from "@/constants/Colors";
import {
  Typography,
  Spacing,
  Radii,
  Glass,
  Shadows,
} from "@/constants/ndeipBrandSystem";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);

    // Validate fields
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      // Authenticate — AuthGate will redirect to /(tabs) automatically
      await signIn(email, password);
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#141E1B", "#1A2522", "#141E1B"] as any}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Logo Area ─── */}
          <View style={styles.logoArea}>
            <Image
              source={require("../../assets/images/ndeip-logo.png")}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={styles.tagline}>Connect · Communicate · Create</Text>
          </View>

          {/* ─── Form Card ─── */}
          <View style={styles.formCard}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputWrap,
                  focused === "email" && styles.inputFocused,
                ]}
              >
                <FontAwesome
                  name="envelope-o"
                  size={15}
                  color={NDEIP_COLORS.gray[500]}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={NDEIP_COLORS.gray[600]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrap,
                  focused === "password" && styles.inputFocused,
                ]}
              >
                <FontAwesome
                  name="lock"
                  size={16}
                  color={NDEIP_COLORS.gray[500]}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={NDEIP_COLORS.gray[600]}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <FontAwesome
                    name={showPassword ? "eye" : "eye-slash"}
                    size={16}
                    color={NDEIP_COLORS.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => alert("Password reset feature coming soon")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <FontAwesome name="exclamation-circle" size={14} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.signInBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={NDEIP_COLORS.gradients.brand as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                <Text style={styles.signInText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ─── Footer ─── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/signup" as any)}
            >
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: 40,
  },
  // Logo
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 56,
  },
  tagline: {
    color: NDEIP_COLORS.gray[500],
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1.5,
    marginTop: 12,
  },
  // Form Card
  formCard: {
    backgroundColor: Glass.dark.background,
    borderRadius: Radii.cardLarge,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Glass.dark.borderSubtle,
    padding: 24,
    gap: 16,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  // Input Group
  inputGroup: { gap: 6 },
  inputLabel: {
    color: NDEIP_COLORS.gray[400],
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: Radii.input,
    borderWidth: 1.5,
    borderColor: "transparent",
    height: 48,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputFocused: {
    borderColor: "rgba(27,77,62,0.35)",
  },
  input: {
    flex: 1,
    color: "#F0F4F3",
    fontSize: 15,
  },
  // Forgot
  forgotRow: { alignItems: "flex-end" },
  forgotText: {
    color: NDEIP_COLORS.primaryTeal,
    fontSize: 13,
    fontWeight: "500",
  },
  // Sign In
  signInBtn: { marginTop: 4 },
  signInGradient: {
    height: 48,
    borderRadius: Radii.button,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,107,107,0.1)",
    borderRadius: Radii.input,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: NDEIP_COLORS.gray[500],
    fontSize: 14,
  },
  footerLink: {
    color: NDEIP_COLORS.electricBlue,
    fontSize: 14,
    fontWeight: "600",
  },
});
