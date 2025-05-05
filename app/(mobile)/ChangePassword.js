import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { changePIN } from '../(services)/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChangePassword = () => {
  const [oldPIN, setOldPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('old'); // 'old', 'new', 'confirm'
  const router = useRouter();

  const handleKeyPress = (key) => {
    Vibration.vibrate(30);

    if (step === 'old' && oldPIN.length < 4) {
      setOldPIN(oldPIN + key);
    } else if (step === 'new' && newPIN.length < 4) {
      setNewPIN(newPIN + key);
    } else if (step === 'confirm' && confirmPIN.length < 4) {
      setConfirmPIN(confirmPIN + key);
    }

    if (step === 'old' && oldPIN.length === 3) {
      setTimeout(() => handleNext(), 200);
    } else if (step === 'new' && newPIN.length === 3) {
      setTimeout(() => handleNext(), 200);
    }
  };

  const handleDelete = () => {
    Vibration.vibrate(30);
    
    if (step === 'old') {
      setOldPIN(oldPIN.slice(0, -1));
    } else if (step === 'new') {
      setNewPIN(newPIN.slice(0, -1));
    } else if (step === 'confirm') {
      setConfirmPIN(confirmPIN.slice(0, -1));
    }
  };

  const handleNext = () => {
    if (step === 'old' && oldPIN.length === 4) {
      Vibration.vibrate(50);
      setStep('new');
      setNewPIN('');
    } else if (step === 'new' && newPIN.length === 4) {
      Vibration.vibrate(50);
      setStep('confirm');
      setConfirmPIN('');
    } else if (step === 'confirm' && confirmPIN.length === 4) {
      Vibration.vibrate(50);
      handleChangePassword();
    }
  };

  const handleBack = () => {
    if (step === 'new') {
      setStep('old');
      setNewPIN('');
    } else if (step === 'confirm') {
      setStep('new');
      setConfirmPIN('');
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);

      if (newPIN !== confirmPIN) {
        Alert.alert('Error', 'New PINs do not match');
        setConfirmPIN('');
        return;
      }

      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      if (!phoneNumber) {
        Alert.alert('Error', 'Please login again');
        router.replace('/(mobile)/Login');
        return;
      }

      const response = await changePIN(phoneNumber, oldPIN, newPIN);

      if (response.success) {
        Alert.alert('Success', 'PIN changed successfully. Please login again.', [
          {
            text: 'OK',
            onPress: () => router.replace('/(mobile)/Login')
          }
        ]);
      } else {
        Alert.alert('Error', response.message);
        setStep('old');
        setOldPIN('');
        setNewPIN('');
        setConfirmPIN('');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPINDisplay = () => {
    const currentPIN = step === 'old' ? oldPIN : step === 'new' ? newPIN : confirmPIN;
    return (
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.pinInput,
              currentPIN.length > i && styles.pinInputFilled
            ]}
          >
            <Text style={styles.pinDot}>
              {currentPIN.length > i ? '•' : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backToSettings}
        onPress={() => router.replace('/(mobile)/Settings')}
      >
        <Ionicons name="arrow-back" size={24} color="#303481" />
      </TouchableOpacity>

      <Text style={styles.subtitle}>
        {step === 'old' ? 'Enter Current PIN' : 
         step === 'new' ? 'Enter New PIN' : 
         'Confirm New PIN'}
      </Text>

      {renderPINDisplay()}

      {!loading && (
        <>
          <View style={styles.keypadContainer}>
            <View style={styles.keypadHeader}>
              {step !== 'old' && (
                <TouchableOpacity 
                  style={[styles.headerButton, styles.backButton]} 
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.headerButton, 
                  styles.nextButton,
                  !((step === 'old' && oldPIN.length === 4) ||
                    (step === 'new' && newPIN.length === 4) ||
                    (step === 'confirm' && confirmPIN.length === 4)) && styles.disabledButton
                ]}
                onPress={handleNext}
                disabled={!((step === 'old' && oldPIN.length === 4) ||
                          (step === 'new' && newPIN.length === 4) ||
                          (step === 'confirm' && confirmPIN.length === 4))}
              >
                <Text style={styles.nextButtonText}>
                  {step === 'confirm' ? 'Change PIN' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.keypadGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.keypadButton}
                  onPress={() => handleKeyPress(num.toString())}
                >
                  <Text style={styles.keypadButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <View style={[styles.keypadButton, styles.emptyButton]} />
              <TouchableOpacity
                style={styles.keypadButton}
                onPress={() => handleKeyPress('0')}
              >
                <Text style={styles.keypadButtonText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.keypadButton]}
                onPress={handleDelete}
              >
                <Text style={styles.keypadButtonText}>⌫</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {loading && <ActivityIndicator size="large" color="#303481" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#303481',
    marginBottom: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 40,
  },
  pinInput: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#303481',
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  pinInputFilled: {
    backgroundColor: '#303481',
  },
  pinDot: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  keypadContainer: {
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#303481',
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#303481',
  },
  backButtonText: {
    color: '#303481',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  keypadButton: {
    width: 75,
    aspectRatio: 1,
    backgroundColor: '#303481',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    display: 'flex',
  },
  keypadButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  emptyButton: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    borderColor: '#A0A0A0',
  },
  backToSettings: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
});

export default ChangePassword;