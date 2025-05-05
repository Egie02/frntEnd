import { Text, View, Animated, Image, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useRouter, Link } from 'expo-router';
import { indexStyle } from './components/styles/style';

const Index = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]),
      // Hold for 1 second
      Animated.delay(1000),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Check platform and navigate accordingly
      if (Platform.OS === 'web') {
        router.push("/authweb/Login");
      } else {
        router.push("/authmobile/Login");
      }
    });
  }, []);

  return (
    <View style={indexStyle.container}>
      <Animated.View
        style={[
          indexStyle.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image 
          source={require('../assets/adaptive-icon.png')}
          style={indexStyle.logo}
        />
        <Text style={indexStyle.title}>iQuery MMPC</Text>
      </Animated.View>
    </View>
  );
}

export default Index;