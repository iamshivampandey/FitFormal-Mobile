import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Colors } from '../../utils/colors';
import StorageService from '../../services/storage.service';
import { GILROY_BOLD, GILROY_MEDIUM } from '../../utils/fonts';

export default function Splash(): React.JSX.Element {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('=== SPLASH: Checking authentication status ===');
      const token = await StorageService.getToken();
      const role = await StorageService.getRole();
      
      console.log('[Splash] Token exists:', !!token);
      console.log('[Splash] Role exists:', !!role);
      console.log('[Splash] Role value:', role);
      
      if (token && role) {
        console.log('✓ [Splash] Existing session found, role:', role);
        // Restore authentication state
        signIn(role as UserRole);
        setIsUserAuthenticated(true);
        console.log('✓ [Splash] Auth state restored in context');
      } else {
        console.log('✗ [Splash] No existing session found (token:', !!token, ', role:', !!role, ')');
        setIsUserAuthenticated(false);
      }
    } catch (error) {
      console.error('✗ [Splash] Error checking auth status:', error);
      setIsUserAuthenticated(false);
    } finally {
      setAuthChecked(true);
      console.log('=== SPLASH: Auth check complete ===');
    }
  };

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    // Continuous rotation animation for loading indicator
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();

    // Navigate after animations AND auth check is complete
    if (authChecked) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          console.log('→ Navigating from splash. isAuthenticated:', isUserAuthenticated);
          navigation.reset({
            index: 0,
            routes: [
              { name: (isUserAuthenticated ? 'TabBarNavigation' : 'AuthStackNavigation') as never },
            ],
          });
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [navigation, authChecked, isUserAuthenticated, fadeAnim, scaleAnim, slideAnim, rotateAnim, signIn]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Animated loading circle */}
        <Animated.View
          style={[
            styles.loadingCircle,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={styles.loadingCircleInner}>
            <Text style={styles.logoText}>FF</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>FitFormal</Text>
        <Text style={styles.subtitle}>Crafting Your Perfect Fit</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whiteColor,
    padding: 16,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.warmBrownColor,
    borderTopColor: 'transparent',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCircleInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.warmBrownColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.whiteColor,
    letterSpacing: 2,
    fontFamily: GILROY_BOLD,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginBottom: 12,
    letterSpacing: 1,
    fontFamily: GILROY_BOLD,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: GILROY_MEDIUM,
  },
});
