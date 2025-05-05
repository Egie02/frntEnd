import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert } from 'react-native';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'expo-router';
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginUser } from '../(services)/api/api';
import { loginAction } from "../(redux)/authSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pinstyle } from '../components/styles/mobilestyle';

export default function PinInput() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [pin, setPin] = useState(['', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const inputRefs = useRef([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [secureTextIndexes, setSecureTextIndexes] = useState([true, true, true, true]);

  const mutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"]
  });

  useEffect(() => {
    const getPhoneNumber = async () => {
      const phone = await AsyncStorage.getItem('tempPhone');
      setPhoneNumber(phone);
    };
    getPhoneNumber();
  }, []);

  const handlePinChange = (text, index) => {
    const newPin = [...pin];
    const newSecureIndexes = [...secureTextIndexes];
    newPin[index] = text;
    
    if (text) {
      // Temporarily show the number
      newSecureIndexes[index] = false;
      setSecureTextIndexes(newSecureIndexes);
      
      // Hide it after a short delay
      setTimeout(() => {
        setSecureTextIndexes(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, 100); // 200ms delay
    }

    setPin(newPin);

    if (text && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    if (newPin.every(digit => digit) && newPin.length === 4) {
      handleLogin(newPin.join(''));
    }
  };

  const handleKeyPress = (number) => {
    const currentIndex = pin.findIndex(digit => digit === '');
    if (currentIndex !== -1) {
      handlePinChange(number.toString(), currentIndex);
    }
  };

  const handleBackspace = () => {
    const lastFilledIndex = pin.map(digit => digit !== '').lastIndexOf(true);
    if (lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = '';
      setPin(newPin);
    }
  };

  const clearPin = () => {
    setPin(['', '', '', '']);
    inputRefs.current[0].focus();
  };

  const handleLogin = async (pinString) => {
    try {
      const response = await mutation.mutateAsync({
        PhoneNumber: phoneNumber,
        PIN: pinString
      });

      if (!response || !response.user) {
        throw new Error('Invalid response data');
      }

      await AsyncStorage.setItem('failedAttempts', '0');
      await AsyncStorage.removeItem('tempPhone');
      setFailedAttempts(0);
      dispatch(loginAction(response));
      router.replace("/(mobile)/MobileDashboard");
      
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      await AsyncStorage.setItem('failedAttempts', newAttempts.toString());
      clearPin();

      if (newAttempts >= 3) {
        await AsyncStorage.setItem('failedAttempts', '0');
        router.replace("/authmobile/Blocked");
      }
    }
  };

  return (
    <View style={pinstyle.container}>
      {mutation.isError && (
        <Text style={pinstyle.errorText}>
          {mutation.error?.response?.data?.message || 'Invalid PIN'}
        </Text>
      )}

      {failedAttempts > 0 && failedAttempts < 3 && (
        <Text style={pinstyle.attemptText}>
          Attempts remaining: {3 - failedAttempts}
        </Text>
      )}

      <Text style={pinstyle.headerText}>Enter PIN</Text>
      
      <View style={pinstyle.phoneContainer}>
        <TouchableOpacity
          style={pinstyle.backButton}
          onPress={() => router.back()}
        >
          <Text style={pinstyle.backButtonText}>Change Number</Text>
        </TouchableOpacity>
        <Text style={pinstyle.phoneText}>{phoneNumber}</Text>
      </View>

      <View style={pinstyle.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputRefs.current[index] = ref}
            style={pinstyle.pinInput}
            maxLength={1}
            keyboardType="number-pad"
            secureTextEntry={secureTextIndexes[index]}
            showSoftInputOnFocus={false}
            value={digit}
            onChangeText={(text) => handlePinChange(text, index)}
            onFocus={() => {
              if (pin.every(p => p === '')) {
                inputRefs.current[0].focus();
              }
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !digit) {
                if (index > 0) {
                  inputRefs.current[index - 1].focus();
                  const newPin = [...pin];
                  newPin[index - 1] = '';
                  setPin(newPin);
                }
              }
            }}
          />
        ))}
      </View>

      <View style={pinstyle.keypadContainer}>
        <View style={pinstyle.keypadRow}>
          {[1, 2, 3].map((number) => (
            <TouchableOpacity
              key={number}
              style={pinstyle.keypadButton}
              onPress={() => handleKeyPress(number)}
            >
              <Text style={pinstyle.keypadButtonText}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={pinstyle.keypadRow}>
          {[4, 5, 6].map((number) => (
            <TouchableOpacity
              key={number}
              style={pinstyle.keypadButton}
              onPress={() => handleKeyPress(number)}
            >
              <Text style={pinstyle.keypadButtonText}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={pinstyle.keypadRow}>
          {[7, 8, 9].map((number) => (
            <TouchableOpacity
              key={number}
              style={pinstyle.keypadButton}
              onPress={() => handleKeyPress(number)}
            >
              <Text style={pinstyle.keypadButtonText}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={pinstyle.keypadRow}>
          <TouchableOpacity
            style={[pinstyle.keypadButton, { opacity: 0 }]}
            disabled={true}
          >
            <Text style={pinstyle.keypadButtonText}></Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={pinstyle.keypadButton}
            onPress={() => handleKeyPress(0)}
          >
            <Text style={pinstyle.keypadButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={pinstyle.keypadButton}
            onPress={handleBackspace}
          >
            <Text style={pinstyle.keypadButtonText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 