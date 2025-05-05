import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from "../(redux)/authSlice";
import ProtectedRoute from "../../components/ProtectedRoute";
import { 
  Text, 
  View, 
  ScrollView, 
  Alert, 
  Image, 
  BackHandler, 
  RefreshControl, 
  useWindowDimensions, 
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { layoutStyles, dashboardStyles as styles } from './style';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MobileDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [isSavingsVisible, setIsSavingsVisible] = useState(false);
  const [isSharesVisible, setIsSharesVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [activeLoanCategory, setActiveLoanCategory] = useState('Regular');
  const { user, loading, error } = useSelector((state) => state.auth);

  // Animation values
  const [scaleAnims] = useState(() => ({
    Profile: new Animated.Value(1),
    Savings: new Animated.Value(1),
    Shares: new Animated.Value(1),
    Loans: new Animated.Value(1),
  }));

  const tabs = [
    { 
      id: 'Profile', 
      label: 'Profile',
      color: '#0F172A'
    },
    { 
      id: 'Savings', 
      label: 'Savings',
      color: '#0F172A'
    },
    { 
      id: 'Shares', 
      label: 'Shares',
      color: '#0F172A'
    },
    { 
      id: 'Loans', 
      label: 'Loans',
      color: '#0F172A'
    },
  ];

  const loanCategories = [
    {
      id: 'Regular',
      icon: 'cash-multiple',
      label: 'Regular'
    },
    {
      id: 'Additional',
      icon: 'cash-plus',
      label: 'Additional'
    },
    {
      id: 'Appliances',
      icon: 'television',
      label: 'Appliances'
    },
    {
      id: 'Grocery',
      icon: 'cart',
      label: 'Grocery'
    },
    {
      id: 'Quick',
      icon: 'flash',
      label: 'Quick'
    },
    {
      id: 'Other',
      icon: 'dots-horizontal',
      label: 'Other'
    }
  ];

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Animate the pressed tab
    Animated.sequence([
      Animated.timing(scaleAnims[tabId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[tabId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadUser());
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh user data. Please try again.');
    }
    setRefreshing(false);
  }, [dispatch]);

  const userInfoMapping = {
    Fullname: user?.data?.[0]?.Username || user?.data?.[0]?.username || "No Data",
    Phone: isPhoneVisible 
      ? `+${user?.data?.[0]?.PhoneNumber || user?.data?.[0]?.phoneNumber || "No Data"}`
      : "• • • • • • • • • •",
    ...(user?.data?.[0]?.Empstatus !== 'n/a' && user?.data?.[0]?.empStatus !== 'n/a' && {
      EmpStatus: user?.data?.[0]?.Empstatus || user?.data?.[0]?.empStatus || "No Data"
    }),
    Department: user?.data?.[0]?.Department || user?.data?.[0]?.department || "No Data"
  };

  const getLoanAmount = (category) => {
    const loanData = user?.data?.[0];
    switch (category.toLowerCase()) {
      case 'regular':
        return parseFloat(loanData?.RegularLoan || "0.00");
      case 'additional':
        return parseFloat(loanData?.AdditionalLoan || "0.00");
      case 'appliances':
        return parseFloat(loanData?.AppliancesLoan || "0.00");
      case 'grocery':
        return parseFloat(loanData?.GroceryLoan || "0.00");
      case 'quick':
        return parseFloat(loanData?.QuickLoan || "0.00");
      case 'other':
        return parseFloat(loanData?.OthLoan || "0.00");
      default:
        return 0.00;
    }
  };

  const getLoanStatus = (category) => {
    const loanData = user?.data?.[0];
    switch (category.toLowerCase()) {
      case 'regular':
        return loanData?.Rstatus || "No Data";
      case 'additional':
        return loanData?.Astatus || "No Data";
      case 'appliances':
        return loanData?.Appstatus || "No Data";
      case 'grocery':
        return loanData?.Gstatus || "No Data";
      case 'quick':
        return loanData?.Qstatus || "No Data";
      case 'other':
        return loanData?.Othstatus || "No Data";
      default:
        return "No Data";
    }
  };

  const getLoanRemarks = (category) => {
    const loanData = user?.data?.[0];
    switch (category.toLowerCase()) {
      case 'regular':
        return loanData?.Regmark || "No Data";
      case 'additional':
        return loanData?.Addmark || "No Data";
      case 'appliances':
        return loanData?.Appmark || "No Data";
      case 'grocery':
        return loanData?.Gromark || "No Data";
      case 'quick':
        return loanData?.Quimark || "No Data";
      case 'other':
        return loanData?.Othmark || "No Data";
      default:
        return "No Data";
    }
  };

  const renderLoanDetails = (category) => {
    const loanAmount = getLoanAmount(category).toFixed(2);
    if (loanAmount === "0.00") {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cash" size={48} color="#94A3B8" />
          <Text style={styles.emptyStateText}>No active {category.toLowerCase()} loans</Text>
        </View>
      );
    }

    return (
      <View style={[styles.loanDetailsCard]}>
        <View style={[styles.loanDetailRow, {color: '#303481'}]}>
          <Text style={[styles.loanDetailLabel]}>Amount: </Text>
          <Text style={styles.loanDetailValue}>₱{getLoanRemarks(category)}</Text>
        </View>
      </View>
    );
  };

  const renderLoansContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.balanceCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={styles.balanceLabel}>Loan Balance</Text>
          {activeLoanCategory === 'Quick' && (
            <TouchableOpacity
              style={{
                padding: 4,
                borderRadius: 4,
                backgroundColor: '#303481',
              }}
              onPress={() => {
                try {
                  router.push({
                    pathname: '/(mobile)/Quickterm',
                  });
                } catch (err) {
                  Alert.alert('Navigation Error', 'Unable to view quick loan details at this time.');
                }
              }}
            >
              <MaterialCommunityIcons name="chart-bar" size={16} color="#F8FAFC" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.balanceRow}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceAmount}>₱{getLoanAmount(activeLoanCategory).toFixed(2)}</Text>
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentText}>Payment</Text>
            <Text style={styles.paymentValue}>{getLoanStatus(activeLoanCategory)}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        horizontal={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.loanCategoriesContainer}
      >
        {loanCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.loanCategoryButton,
              activeLoanCategory === category.id && styles.activeLoanCategory,
            ]}
            onPress={() => setActiveLoanCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon}
              size={24}
              style={[
                styles.loanCategoryIcon,
                activeLoanCategory === category.id && styles.activeLoanCategoryIcon,
              ]}
            />
            <Text style={[
              styles.loanCategoryText,
              activeLoanCategory === category.id && styles.activeLoanCategoryText,
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeLoanCategory} Loan Deductions: </Text>
        </View>
          {renderLoanDetails(activeLoanCategory)}
      </View>
    </View>
  );

  const renderProfileContent = () => (
    <View style={styles.profileSection}>
      <Image 
        source={require('../../assets/icon.png')} 
        style={styles.profileImage}
      />
      <View style={{ width: '100%' }}>
        {Object.entries(userInfoMapping).map(([key, value]) => (
          <View key={key} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{key}</Text>
            {key === 'Phone' ? (
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.infoValue}>{value}</Text>
                <TouchableOpacity 
                  onPress={() => setIsPhoneVisible(!isPhoneVisible)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={isPhoneVisible ? 'eye-off' : 'eye'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.infoValue}>{value}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSavingsContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.balanceCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <TouchableOpacity 
            onPress={() => setIsSavingsVisible(!isSavingsVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4 }}
          >
            <MaterialCommunityIcons
              name={isSavingsVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {isSavingsVisible ? `₱${user?.data?.[0]?.Savings || "0.00"}` : "₱ • • • • • •"}
          </Text>
          <Text style={styles.savingsStatus}>
             {user?.data?.[0]?.SVstatus || "No Data"}
          </Text>
        </View>
      </View>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Deposit: </Text>
        </View>
        <View style={styles.loanDetailsCard}>
          <View style={styles.loanDetailRow}>
            <Text style={styles.loanDetailLabel}>Amount</Text>
            <Text style={styles.loanDetailValue}>
              ₱{user?.data?.[0]?.Savingsmark || "No Data"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSharesContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.balanceCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <TouchableOpacity 
            onPress={() => setIsSharesVisible(!isSharesVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4 }}
          >
            <MaterialCommunityIcons
              name={isSharesVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {isSharesVisible ? `₱${user?.data?.[0]?.Shares || "0.00"}` : "₱ • • • • • •"}
          </Text>
          <Text style={styles.savingsStatus}>
            {user?.data?.[0]?.SHstatus || "No Data"}
          </Text>
        </View>
      </View>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shares Deposit: </Text>
        </View>
        <View style={styles.loanDetailsCard}>
          <View style={styles.loanDetailRow}>
            <Text style={styles.loanDetailLabel}>Amount</Text>
            <Text style={styles.loanDetailValue}>
              ₱{user?.data?.[0]?.Sharesmark || "No Data"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return renderProfileContent();
      case 'Savings':
        return renderSavingsContent();
      case 'Shares':
        return renderSharesContent();
      case 'Loans':
        return renderLoansContent();
      default:
        return renderProfileContent();
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(loadUser());
        global.selectedDrawerItem = 'Transaction';
        
        if (user?.data?.[0]?.change_pass === 1) {
          router.push('/ChangePassword');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load user data. Please try again.');
      }
    };

    loadData();  

    const backAction = () => {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit?",
        [
          { text: "Cancel", onPress: () => null, style: "cancel" },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [dispatch]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="loading" size={48} color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
        <Text style={{ color: '#EF4444', marginTop: 16 }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0F172A"
            />
          }
        >
          <View style={styles.headerSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <Animated.View
                key={tab.id}
                style={[
                  { transform: [{ scale: scaleAnims[tab.id] }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.activeTab,
                  ]}
                  onPress={() => handleTabPress(tab.id)}
                >
                  <Text style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel,
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={styles.mainCard}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
};

export default MobileDashboard;
