import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, UserRole } from '@/types';
import { USERS } from '@/mocks/data';
import { AppState, AppStateStatus } from 'react-native';

const IDLE_TIMEOUT = 10 * 60 * 1000;

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lastActiveRef = useRef<number>(Date.now());

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('pos_user');
        if (stored) {
          const parsed = JSON.parse(stored) as User;
          setUser(parsed);
        }
      } catch (e) {
        console.log('Failed to load user', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active' && user) {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed > IDLE_TIMEOUT) {
          logout();
        }
      } else if (state === 'background') {
        lastActiveRef.current = Date.now();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [user]);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const found = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
    if (!found) {
      return { success: false, error: 'Email tidak ditemukan atau akun nonaktif' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password tidak valid' };
    }
    setUser(found);
    await AsyncStorage.setItem('pos_user', JSON.stringify(found));
    return { success: true };
  }, []);

  const loginWithPin = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    const found = USERS.find(u => u.pin === pin && u.isActive);
    if (!found) {
      return { success: false, error: 'PIN tidak valid atau akun nonaktif' };
    }
    setUser(found);
    await AsyncStorage.setItem('pos_user', JSON.stringify(found));
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem('pos_user');
  }, []);

  const hasAccess = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithEmail,
    loginWithPin,
    logout,
    hasAccess,
  };
});
