import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Mail, Hash, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

type LoginMode = 'email' | 'pin';

export default function LoginScreen() {
  const { loginWithEmail, loginWithPin } = useAuth();
  const [mode, setMode] = useState<LoginMode>('email');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const pinRefs = useRef<(TextInput | null)[]>([]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleEmailLogin = useCallback(async () => {
    if (!email.trim()) {
      setError('Masukkan email');
      shake();
      return;
    }
    if (!password.trim()) {
      setError('Masukkan password');
      shake();
      return;
    }
    setIsLoading(true);
    setError('');
    const result = await loginWithEmail(email.trim(), password);
    setIsLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/dashboard' as any);
    } else {
      setError(result.error || 'Login gagal');
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [email, password, loginWithEmail, shake]);

  const handlePinLogin = useCallback(async (fullPin: string) => {
    if (fullPin.length < 4) return;
    setIsLoading(true);
    setError('');
    const result = await loginWithPin(fullPin);
    setIsLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/dashboard' as any);
    } else {
      setError(result.error || 'PIN salah');
      setPin('');
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [loginWithPin, shake]);

  const handlePinChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setPin(cleaned);
    setError('');
    if (cleaned.length >= 4) {
      handlePinLogin(cleaned);
    }
  }, [handlePinLogin]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <ShieldCheck size={32} color={Colors.white} />
                </View>
              </View>
              <Text style={styles.appName}>POS Pro Smart</Text>
              <Text style={styles.subtitle}>Sistem Kasir Profesional</Text>
            </View>

            <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'email' && styles.modeBtnActive]}
                  onPress={() => { setMode('email'); setError(''); }}
                  activeOpacity={0.7}
                >
                  <Mail size={16} color={mode === 'email' ? Colors.white : Colors.textSecondary} />
                  <Text style={[styles.modeBtnText, mode === 'email' && styles.modeBtnTextActive]}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'pin' && styles.modeBtnActive]}
                  onPress={() => { setMode('pin'); setError(''); }}
                  activeOpacity={0.7}
                >
                  <Hash size={16} color={mode === 'pin' ? Colors.white : Colors.textSecondary} />
                  <Text style={[styles.modeBtnText, mode === 'pin' && styles.modeBtnTextActive]}>PIN Kasir</Text>
                </TouchableOpacity>
              </View>

              {mode === 'email' ? (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputWrapper}>
                      <Mail size={18} color={Colors.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="nama@email.com"
                        placeholderTextColor={Colors.textMuted}
                        value={email}
                        onChangeText={(t) => { setEmail(t); setError(''); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        testID="email-input"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Lock size={18} color={Colors.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Masukkan password"
                        placeholderTextColor={Colors.textMuted}
                        value={password}
                        onChangeText={(t) => { setPassword(t); setError(''); }}
                        secureTextEntry={!showPassword}
                        testID="password-input"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} color={Colors.textMuted} /> : <Eye size={18} color={Colors.textMuted} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                    onPress={handleEmailLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    testID="login-btn"
                  >
                    <Text style={styles.loginBtnText}>{isLoading ? 'Masuk...' : 'Masuk'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pinForm}>
                  <Text style={styles.pinTitle}>Masukkan PIN Kasir</Text>
                  <Text style={styles.pinSubtitle}>4-6 digit PIN</Text>
                  <View style={styles.pinDotsRow}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <View key={i} style={[styles.pinDot, i < pin.length && styles.pinDotFilled]} />
                    ))}
                  </View>
                  <TextInput
                    style={styles.hiddenPinInput}
                    value={pin}
                    onChangeText={handlePinChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    testID="pin-input"
                  />
                </View>
              )}

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </Animated.View>

            <View style={styles.demoInfo}>
              <Text style={styles.demoTitle}>Demo Login:</Text>
              <Text style={styles.demoText}>Admin: admin@pospro.com (any pass)</Text>
              <Text style={styles.demoText}>Kasir PIN: 9012 atau 3456</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.accentLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: Colors.white,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  loginBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  pinForm: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  pinSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pinDotFilled: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  hiddenPinInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  demoInfo: {
    marginTop: 24,
    alignItems: 'center',
    gap: 4,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accentLight,
    marginBottom: 2,
  },
  demoText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
});
