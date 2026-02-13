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
} from "@/constants/ndeipBrandSystem";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  // Password strength
  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;
  const strengthColor = [
    "transparent",
    NDEIP_COLORS.rose,
    NDEIP_COLORS.amber,
    NDEIP_COLORS.emerald,
  ];
  const strengthLabel = ["", "Weak", "Good", "Strong"];

  const handleSignup = async () => {
    // Validate fields
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email");
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // Authenticate — AuthGate will redirect to /(tabs) automatically
    await signUp(email, password, name);
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
          {/* ─── Logo ─── */}
          <View style={styles.logoArea}>
            <Image
              source={require("../../assets/images/ndeip-logo.png")}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          {/* ─── Form Card ─── */}
          <View style={styles.formCard}>
            {/* Display Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <View
                style={[
                  styles.inputWrap,
                  focused === "name" && styles.inputFocused,
                ]}
              >
                <FontAwesome
                  name="user-o"
                  size={15}
                  color={NDEIP_COLORS.gray[500]}
                />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="How should we call you?"
                  placeholderTextColor={NDEIP_COLORS.gray[600]}
                  style={styles.input}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

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
                  placeholder="Create a strong password"
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
              {/* Strength Bar */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthTrack}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          width: `${(strength / 3) * 100}%`,
                          backgroundColor: strengthColor[strength],
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      { color: strengthColor[strength] },
                    ]}
                  >
                    {strengthLabel[strength]}
                  </Text>
                </View>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.signUpBtn}
              onPress={handleSignup}
            >
              <LinearGradient
                colors={NDEIP_COLORS.gradients.brand as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signUpGradient}
              >
                <Text style={styles.signUpText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.7}
              onPress={() => signInWithGoogle()}
            >
              <FontAwesome
                name="google"
                size={18}
                color={NDEIP_COLORS.gray[400]}
              />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login" as any)}>
              <Text style={styles.footerLink}>Sign in</Text>
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
  logoArea: { alignItems: "center", marginBottom: 36 },
  logo: { width: 120, height: 48 },
  tagline: {
    color: NDEIP_COLORS.gray[400],
    fontSize: 15,
    fontWeight: "500",
    marginTop: 12,
  },
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
  inputFocused: { borderColor: "rgba(27,77,62,0.35)" },
  input: { flex: 1, color: "#F0F4F3", fontSize: 15 },
  // Strength
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  strengthTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
  },
  strengthBar: { height: 3, borderRadius: 2 },
  strengthText: { fontSize: 11, fontWeight: "600" },
  // Button
  signUpBtn: { marginTop: 4 },
  signUpGradient: {
    height: 48,
    borderRadius: Radii.button,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: NDEIP_COLORS.glass.border,
  },
  dividerText: { color: NDEIP_COLORS.gray[600], fontSize: 12 },
  // Google
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Glass.dark.border,
    gap: 10,
  },
  googleText: {
    color: NDEIP_COLORS.gray[300],
    fontSize: 15,
    fontWeight: "500",
  },
  // Terms
  terms: {
    color: NDEIP_COLORS.gray[600],
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: { color: NDEIP_COLORS.primaryTeal },
  // Footer
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: NDEIP_COLORS.gray[500], fontSize: 14 },
  footerLink: {
    color: NDEIP_COLORS.electricBlue,
    fontSize: 14,
    fontWeight: "600",
  },
});
