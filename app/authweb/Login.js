import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert, Image } from 'react-native';
import React, { useEffect, useState, useRef } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginUser } from '../(services)/api/api';
import { loginAction } from "../(redux)/authSlice";

// Validation schema for phone number and PIN
const LoginSchema = Yup.object().shape({
  PhoneNumber: Yup.string()
    .matches(/^[0-9]{9}$/, "Invalid Phone Number")
    .required("Required"),
  PIN: Yup.string()
    .matches(/^[0-9]{4}$/, "PIN must be 4 digits")
    .required("Required"),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 10,
    textAlign: 'center',
  },
  attemptText: {
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    height: 45,
    lineHeight: 45,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 45,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  pinInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    marginTop: 15,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    height: 45,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [failedAttempts, setFailedAttempts] = useState(0);

  const mutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"]
  });

  useEffect(() => {
    const loadFailedAttempts = async () => {
      try {
        const storedAttempts = await AsyncStorage.getItem('failedAttempts');
        if (storedAttempts) {
          const attempts = parseInt(storedAttempts);
          setFailedAttempts(attempts);
          if (attempts >= 3) {
            router.replace("/authmobile/Blocked");
          }
        }
      } catch (error) {
        console.error('Error loading failed attempts:', error);
      }
    };
    loadFailedAttempts();
  }, []);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit?",
        [
          { text: "Cancel", onPress: () => null, style: "cancel" },
          { text: "YES", onPress: () => BackHandler.exitApp() }
        ]
      );
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  const handleSubmit = async (values) => {
    try {
      const fullPhoneNumber = `639${values.PhoneNumber}`;
      const response = await mutation.mutateAsync({
        PhoneNumber: fullPhoneNumber,
        PIN: values.PIN
      });

      if (!response || !response.user) {
        throw new Error('Invalid response data');
      }

      await AsyncStorage.setItem('failedAttempts', '0');
      setFailedAttempts(0);
      dispatch(loginAction(response));
      router.replace("/(web)/WebDashboard");
      
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      await AsyncStorage.setItem('failedAttempts', newAttempts.toString());

      if (newAttempts >= 3) {
        await AsyncStorage.setItem('failedAttempts', '0');
        router.replace("/authweb/Blocked");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Login</Text>
      </View>

      {mutation.isError && (
        <Text style={styles.errorText}>
          {mutation.error?.response?.data?.message || 'Invalid credentials'}
        </Text>
      )}

      {failedAttempts > 0 && failedAttempts < 3 && (
        <Text style={styles.attemptText}>
          Attempts remaining: {3 - failedAttempts}
        </Text>
      )}

      <Formik
        initialValues={{ PhoneNumber: "", PIN: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <View style={styles.inputContainer}>
            {formikProps.errors.PhoneNumber && formikProps.touched.PhoneNumber && (
              <Text style={styles.errorText}>{formikProps.errors.PhoneNumber}</Text>
            )}
            
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+639</Text>
              <TextInput
                style={styles.input}
                value={formikProps.values.PhoneNumber}
                onChangeText={(text) => formikProps.setFieldValue('PhoneNumber', text)}
                placeholder="XXXXXXXXX"
                placeholderTextColor="#A0A0A0"
                keyboardType="number-pad"
                maxLength={9}
              />
            </View>

            {formikProps.errors.PIN && formikProps.touched.PIN && (
              <Text style={styles.errorText}>{formikProps.errors.PIN}</Text>
            )}

            <TextInput
              style={styles.pinInput}
              value={formikProps.values.PIN}
              onChangeText={(text) => formikProps.setFieldValue('PIN', text)}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#A0A0A0"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={true}
            />

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={formikProps.handleSubmit}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}
