import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { quickTermStyles as styles } from './style';
import { useSelector } from 'react-redux';

const Quickterm = () => {
  const user = useSelector((state) => state.auth.user.data[0]);
  const router = useRouter();
  const { quickLoanData } = useLocalSearchParams();

  // Parse quick loan data from params
  let parsedQuickLoan = null;
  try {
    parsedQuickLoan = quickLoanData ? JSON.parse(quickLoanData) : null;
  } catch (error) {
    console.error('Error parsing quick loan data:', error);
  }

  // Get loan terms from user data
  const terms = [
    { label: '1st loan', value: user?.First || "0.00" },
    { label: '2nd loan', value: user?.Second || "0.00" },
    { label: '3rd loan', value: user?.Third || "0.00" },
    { label: '4th loan', value: user?.Fourth || "0.00" },
    { label: '5th loan', value: user?.Fifth || "0.00" },
  ].map(term => ({
    ...term,
    value: parseFloat(term.value).toFixed(2)
  }));

  // Calculate total balance
  const totalBalance = terms.reduce((sum, term) => sum + parseFloat(term.value), 0).toFixed(2);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/(mobile)/MobileDashboard')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={[styles.contentContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No loan data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.replace('/(mobile)/MobileDashboard')}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.cardsGrid}>
          {terms.slice(0, 4).map((term, index) => (
            <View key={index} style={styles.paymentCard}>
              <Text style={styles.paymentLabel}>{term.label}</Text>
              <Text style={styles.paymentValue}>
                ₱{parseFloat(term.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
          <View style={[styles.paymentCard, styles.fullWidthCard]}>
            <Text style={styles.paymentLabel}>{terms[4].label}</Text>
            <Text style={styles.paymentValue}>
              ₱{parseFloat(terms[4].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Quick Loan Balance</Text>
          <Text style={styles.totalAmount}>
            ₱{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Quickterm;