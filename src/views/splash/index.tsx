import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../utils/colors';

export default function Splash(): React.JSX.Element {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

    // Navigate after animations
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        navigation.reset({
          index: 0,
          routes: [
            { name: (isAuthenticated ? 'TabBarNavigation' : 'AuthStackNavigation') as never },
          ],
        });
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated, fadeAnim, scaleAnim, slideAnim, rotateAnim]);

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
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
