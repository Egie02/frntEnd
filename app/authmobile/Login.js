import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert, Image } from 'react-native';
import React, { useEffect, useState } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginstyle } from '../components/styles/mobilestyle';

// Validation schema for phone number
const PhoneSchema = Yup.object().shape({
  PhoneNumber: Yup.string()
    .matches(/^[0-9]{9}$/, "Invalid Phone Number")
    .required("Required"),
});

export default function Login() {
  const router = useRouter();
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Load failed attempts from storage on component mount
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

  const handlePhoneSubmit = async (values) => {
    try {
      // Add 639 prefix to the phone number
      const fullPhoneNumber = `639${values.PhoneNumber}`;
      await AsyncStorage.setItem('tempPhone', fullPhoneNumber);
      router.push("/authmobile/PinInput");
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const NumericButton = ({ number, onPress }) => (
    <TouchableOpacity 
      style={loginstyle.numericButton} 
      onPress={onPress}
    >
      <Text style={loginstyle.numericButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  const handleNumericInput = (formikProps, num) => {
    if (formikProps.values.PhoneNumber.length < 10) {
      formikProps.setFieldValue(
        "PhoneNumber",
        formikProps.values.PhoneNumber + num
      );
    }
  };

  const handleBackspace = (formikProps) => {
    formikProps.setFieldValue(
      "PhoneNumber",
      formikProps.values.PhoneNumber.slice(0, -1)
    );
  };

  return (
    <View style={loginstyle.container}>
      <View style={loginstyle.logoContainer}>
        <Image 
          source={require('../../assets/icon.png')}
          style={loginstyle.logo}
          resizeMode="contain"
        />
      </View>

      <View style={loginstyle.welcomeContainer}>
        <Text style={loginstyle.welcomeText}>Login</Text>
      </View>

      <Formik
        initialValues={{ PhoneNumber: "" }}
        validationSchema={PhoneSchema}
        onSubmit={handlePhoneSubmit}
      >
        {(formikProps) => (
          <>
            {formikProps.errors.PhoneNumber && formikProps.touched.PhoneNumber && (
              <Text style={loginstyle.errorText}>{formikProps.errors.PhoneNumber}</Text>
            )}
            
            <View style={loginstyle.phoneInputContainer}>
              <Text style={loginstyle.countryCode}>+639</Text>
              <View style={loginstyle.inputWrapper}>
                <TextInput
                  style={loginstyle.input}
                  value={formikProps.values.PhoneNumber}
                  editable={false}
                  placeholder="XXXXXXXXX"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
            </View>

            <View style={[loginstyle.cardContainer, { marginTop: 20 }]}>
              <View style={loginstyle.form}>
                <View style={loginstyle.keypadContainer}>
                  <View style={loginstyle.keypadRow}>
                    <NumericButton number="1" onPress={() => handleNumericInput(formikProps, "1")} />
                    <NumericButton number="2" onPress={() => handleNumericInput(formikProps, "2")} />
                    <NumericButton number="3" onPress={() => handleNumericInput(formikProps, "3")} />
                  </View>
                  <View style={loginstyle.keypadRow}>
                    <NumericButton number="4" onPress={() => handleNumericInput(formikProps, "4")} />
                    <NumericButton number="5" onPress={() => handleNumericInput(formikProps, "5")} />
                    <NumericButton number="6" onPress={() => handleNumericInput(formikProps, "6")} />
                  </View>
                  <View style={loginstyle.keypadRow}>
                    <NumericButton number="7" onPress={() => handleNumericInput(formikProps, "7")} />
                    <NumericButton number="8" onPress={() => handleNumericInput(formikProps, "8")} />
                    <NumericButton number="9" onPress={() => handleNumericInput(formikProps, "9")} />
                  </View>
                  <View style={loginstyle.keypadRow}>
                    <TouchableOpacity 
                      style={loginstyle.numericButton}
                      onPress={() => handleBackspace(formikProps)}
                    >
                      <Text style={loginstyle.numericButtonText}>⌫</Text>
                    </TouchableOpacity>
                    <NumericButton number="0" onPress={() => handleNumericInput(formikProps, "0")} />
                    <TouchableOpacity 
                      style={[loginstyle.numericButton, loginstyle.loginButton]}
                      onPress={formikProps.handleSubmit}
                    >
                      <Text style={[loginstyle.numericButtonText, loginstyle.loginButtonText]}>➔</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </Formik>
    </View>
  );
}
