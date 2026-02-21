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

// ─── Country Codes ─────────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+263', flag: '🇿🇼', label: 'ZW' },
  { code: '+27', flag: '🇿🇦', label: 'SA' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+234', flag: '🇳🇬', label: 'NG' },
  { code: '+254', flag: '🇰🇪', label: 'KE' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  { code: '+86', flag: '🇨🇳', label: 'CN' },
];

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setError(null);

    // Validate fields
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    // Phone validation (optional field)
    if (phone.trim()) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setError("Phone number must be 7-15 digits");
        return;
      }
    }

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // Authenticate — AuthGate will redirect to /(tabs) automatically
      const fullPhone = phone.trim() ? `${countryCode.code}${phone.replace(/\D/g, '')}` : '';
      await signUp(email, password, name, fullPhone);
    } catch (err: any) {
      setError(err?.message || "Failed to create account");
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

            {/* Phone (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number <Text style={{ color: NDEIP_COLORS.gray[600], fontWeight: '400' }}>(optional)</Text></Text>
              <View
                style={[
                  styles.inputWrap,
                  focused === "phone" && styles.inputFocused,
                ]}
              >
                <TouchableOpacity
                  onPress={() => setShowCountryCodes(!showCountryCodes)}
                  style={styles.countryCodeBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{countryCode.flag}</Text>
                  <Text style={styles.countryCodeText}>{countryCode.code}</Text>
                  <FontAwesome name="caret-down" size={12} color={NDEIP_COLORS.gray[500]} />
                </TouchableOpacity>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor={NDEIP_COLORS.gray[600]}
                  keyboardType="phone-pad"
                  style={[styles.input, { flex: 1 }]}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                />
              </View>
              {/* Country Code Picker */}
              {showCountryCodes && (
                <View style={styles.countryDropdown}>
                  {COUNTRY_CODES.map((cc) => (
                    <TouchableOpacity
                      key={cc.code}
                      onPress={() => { setCountryCode(cc); setShowCountryCodes(false); }}
                      style={[
                        styles.countryOption,
                        cc.code === countryCode.code && styles.countryOptionActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.countryFlag}>{cc.flag}</Text>
                      <Text style={styles.countryOptionText}>{cc.label} ({cc.code})</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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

            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <FontAwesome name="exclamation-circle" size={14} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.signUpBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient
                colors={NDEIP_COLORS.gradients.brand as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signUpGradient}
              >
                <Text style={styles.signUpText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our{" "}
              <Text style={styles.termsLink} onPress={() => router.push('/legal/terms' as any)}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink} onPress={() => router.push('/legal/terms' as any)}>Privacy Policy</Text>
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
  // Terms
  terms: {
    color: NDEIP_COLORS.gray[600],
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: { color: NDEIP_COLORS.primaryTeal },
  // Phone / Country Code
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  countryFlag: { fontSize: 18 },
  countryCodeText: { color: NDEIP_COLORS.gray[400], fontSize: 14, fontWeight: '500' as any },
  countryDropdown: {
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radii.input,
    borderWidth: 1,
    borderColor: 'rgba(27,77,62,0.2)',
    overflow: 'hidden',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  countryOptionActive: {
    backgroundColor: 'rgba(27,77,62,0.15)',
  },
  countryOptionText: { color: NDEIP_COLORS.gray[300], fontSize: 14 },
  // Footer
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: NDEIP_COLORS.gray[500], fontSize: 14 },
  footerLink: {
    color: NDEIP_COLORS.electricBlue,
    fontSize: 14,
    fontWeight: "600",
  },
});
