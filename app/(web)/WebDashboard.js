import React, { useEffect, useState, useCallback } from 'react';
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
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { layoutStyles, dashboardStyles as styles, getPlatformStyles } from './style';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WebDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [isSavingsVisible, setIsSavingsVisible] = useState(false);
  const [isSharesVisible, setIsSharesVisible] = useState(false);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [activeLoanCategory, setActiveLoanCategory] = useState('Regular');
  const { user, loading, error } = useSelector((state) => state.auth);

  // Platform detection
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');

  // Window dimensions state
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window')
  });

  // Platform and device detection
  const detectDevice = useCallback(() => {
    const { width, height } = dimensions.window;
    
    // Check if it's Windows
    const isWindows = Platform.OS === 'web' && /Windows/.test(navigator.userAgent);
    
    // Detect device type based on dimensions
    if (width <= 425 && height <= 735) {
      setDeviceType('mobile');
    } else if (width <= 768) {
      setDeviceType('tablet');
    } else {
      setDeviceType(isWindows ? 'windows' : 'desktop');
    }

    // Detect orientation
    setOrientation(width > height ? 'landscape' : 'portrait');
  }, [dimensions]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (Platform.OS === 'web') {
      setDimensions({
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    }
  }, []);

  // Set up resize listener
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.addEventListener('resize', handleResize);
      detectDevice();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [handleResize, detectDevice]);

  // Update device detection when dimensions change
  useEffect(() => {
    detectDevice();
  }, [dimensions, detectDevice]);

  // Animation values
  const [scaleAnims] = useState(() => ({
    Profile: new Animated.Value(1),
    Savings: new Animated.Value(1),
    Shares: new Animated.Value(1),
    Loans: new Animated.Value(1),
  }));

  // // Adjust the number of visible loan categories based on screen size
  // const getVisibleLoanCategories = () => {
  //   return loanCategories.length; // Show all categories on all platforms
  // };

  const tabs = [
    { 
      id: 'Profile', 
      label: 'Profile',
      icon: 'account',
      color: '#0F172A'
    },
    { 
      id: 'Savings', 
      label: 'Savings',
      icon: 'piggy-bank',
      color: '#0F172A'
    },
    { 
      id: 'Shares', 
      label: 'Shares',
      icon: 'chart-pie',
      color: '#0F172A'
    },
    { 
      id: 'Loans', 
      label: 'Loans',
      icon: 'cash-multiple',
      color: '#0F172A'
    },
  ];

  const loanCategories = [
    {
      id: 'Regular',
      icon: 'cash-multiple',
      label: 'Regular',
      color: '#4CAF50' // Added theme color
    },
    {
      id: 'Additional',
      icon: 'cash-plus',
      label: 'Additional',
      color: '#2196F3'
    },
    {
      id: 'Appliances',
      icon: 'television-classic',
      label: 'Appliances',
      color: '#9C27B0'
    },
    {
      id: 'Grocery',
      icon: 'cart-outline',
      label: 'Grocery',
      color: '#FF9800'
    },
    {
      id: 'Quick',
      icon: 'flash-outline',
      label: 'Quick',
      color: '#F44336'
    },
    {
      id: 'Other',
      icon: 'dots-horizontal-circle-outline',
      label: 'Other',
      color: '#607D8B'
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

  // const getLoanTerms = (category) => {
  //   const loanData = user?.data?.[0];
  //   switch (category.toLowerCase()) {
  //     case 'regular':
  //       return loanData?.Terms || "No Data";
  //     case 'additional':
  //       return loanData?.Terms || "No Data";
  //     case 'appliances':
  //       return loanData?.Terms || "No Data";
  //     case 'grocery':
  //       return loanData?.Terms || "No Data";
  //     case 'quick':
  //       return loanData?.Terms || "No Data";
  //     case 'other':
  //       return loanData?.Terms || "No Data";
  //     default:
  //       return "No Data";
  //   }
  // };

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
      <View style={styles.loanDetailsCard}>
        <View style={styles.loanDetailRow}>
          <Text style={styles.loanDetailLabel}>Payments:</Text>
          <Text style={styles.loanDetailValue}>{getLoanStatus(category)}</Text>
        </View>
        <View style={styles.loanDetailRow}>
          <Text style={styles.loanDetailLabel}>Deductions:</Text>
          <Text style={styles.loanDetailValue}>{getLoanRemarks(category)}</Text>
        </View>
      </View>
    );
  };

  const terms = [
    { label: '1st loan', value: user?.data?.[0]?.First ? parseFloat(user.data?.[0]?.First).toFixed(2) : '0.00' },
    { label: '2nd loan', value: user?.data?.[0]?.Second ? parseFloat(user.data?.[0]?.Second).toFixed(2) : '0.00' },
    { label: '3rd loan', value: user?.data?.[0]?.Third ? parseFloat(user.data?.[0]?.Third).toFixed(2) : '0.00' },
    { label: '4th loan', value: user?.data?.[0]?.Fourth ? parseFloat(user.data?.[0]?.Fourth).toFixed(2) : '0.00' },
    { label: '5th loan', value: user?.data?.[0]?.Fifth ? parseFloat(user.data?.[0]?.Fifth).toFixed(2) : '0.00' },
  ];

  const renderLoansContent = () => (
    <View style={styles.contentContainer}>
      <View style={[
        styles.balanceCard,
        Platform.OS === 'web' && {
          ...(deviceType === 'mobile' && {
            padding: dimensions.window.width <= 320 ? 8 : 12,
            marginBottom: 8,
          }),
          ...(deviceType === 'tablet' && {
            padding: 14,
            marginBottom: 10,
          })
        }
      ]}>
        <View style={[
          styles.gridContainer,
          Platform.OS === 'web' && {
            ...(deviceType === 'mobile' && {
              gap: dimensions.window.width <= 320 ? 6 : 8,
            }),
            ...(deviceType === 'tablet' && {
              gap: 6,
            })
          }
        ]}>
          {/* Total Balance Row */}
          <View style={[
            styles.gridRow,
            Platform.OS === 'web' && deviceType === 'mobile' && {
              marginBottom: dimensions.window.width <= 320 ? 8 : 12,
              borderBottomWidth: 1,
              borderBottomColor: '#E2E8F0',
              paddingBottom: dimensions.window.width <= 320 ? 6 : 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }
          ]}>
            <View style={[
              Platform.OS === 'web' && deviceType === 'mobile' && {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: dimensions.window.width <= 320 ? 4 : 8,
              }
            ]}>
              <Text style={[
                styles.balanceLabel,
                Platform.OS === 'web' && {
                  ...(deviceType === 'mobile' && {
                    fontSize: dimensions.window.width <= 320 ? 12 : 14,
                    fontWeight: '600',
                  }),
                  ...(deviceType === 'tablet' && {
                    width: '100%',
                    marginBottom: 6,
                    textAlign: 'left',
                  })
                }
              ]}>Total Loan Balance</Text>
              <Text style={[
                styles.balanceAmount,
                Platform.OS === 'web' && {
                  ...(deviceType === 'mobile' && {
                    fontSize: dimensions.window.width <= 320 ? 12 : 14,
                    fontWeight: '700',
                  }),
                  ...(deviceType === 'tablet' && {
                    width: '100%',
                    marginBottom: 6,
                    textAlign: 'left',
                    fontSize: 24,
                  })
                }
              ]}>₱{getLoanAmount(activeLoanCategory).toFixed(2)}</Text>
            </View>
            {activeLoanCategory === 'Quick' && (
              <TouchableOpacity
                style={[
                  styles.chartButton,
                  Platform.OS === 'web' && {
                    ...(deviceType === 'mobile' && {
                      padding: dimensions.window.width <= 320 ? 2 : 4,
                    }),
                    ...(deviceType === 'tablet' && {
                      position: 'absolute',
                      right: 0,
                      top: 0,
                    })
                  }
                ]}
                onPress={() => setIsTermsVisible(!isTermsVisible)}
              >
                <MaterialCommunityIcons 
                  name={isTermsVisible ? "eye-off" : "eye"} 
                  size={dimensions.window.width <= 320 ? 18 : 20} 
                  color="#1E2167" 
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Terms Grid */}
          {activeLoanCategory === 'Quick' && isTermsVisible && (
            <View style={[
              Platform.OS === 'web' && deviceType === 'mobile' && {
                width: '100%',
              }
            ]}>
              {terms.map((term, index) => (
                <View 
                  key={index}
                  style={[
                    styles.gridRow,
                    Platform.OS === 'web' && deviceType === 'mobile' && {
                      justifyContent: 'space-between',
                      paddingVertical: dimensions.window.width <= 320 ? 4 : 6,
                      borderBottomWidth: index !== terms.length - 1 ? 1 : 0,
                      borderBottomColor: '#E2E8F0',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }
                  ]}
                >
                  <Text style={[
                    styles.balanceLabel,
                    Platform.OS === 'web' && {
                      ...(deviceType === 'mobile' && {
                        fontSize: dimensions.window.width <= 320 ? 11 : 13,
                        flex: 1,
                        textAlign: 'left',
                        color: '#64748B',
                        paddingRight: dimensions.window.width <= 320 ? 4 : 8,
                      })
                    }
                  ]}>
                    {term.label}
                  </Text>
                  <Text style={[
                    styles.balanceAmount,
                    Platform.OS === 'web' && {
                      ...(deviceType === 'mobile' && {
                        fontSize: dimensions.window.width <= 320 ? 11 : 13,
                        flex: 1,
                        textAlign: 'right',
                        fontWeight: '600',
                        paddingLeft: dimensions.window.width <= 320 ? 4 : 8,
                      })
                    }
                  ]}>
                    ₱{term.value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={[
        styles.loanCategoriesContainer,
        Platform.OS === 'web' && {
          ...(deviceType === 'mobile' && getPlatformStyles('mobile').loanCategoriesContainer),
          ...(deviceType === 'tablet' && getPlatformStyles('tablet').loanCategoriesContainer),
          ...(deviceType === 'windows' && getPlatformStyles('windows').loanCategoriesContainer),
        }
      ]}>
        {loanCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.loanCategoryButton,
              activeLoanCategory === category.id && styles.activeLoanCategory,
              Platform.OS === 'web' && {
                ...(deviceType === 'mobile' && { width: '32%' }),
                ...(deviceType === 'tablet' && { width: '31%' }),
                ...(deviceType === 'windows' && { width: '31%' }),
              }
            ]}
            onPress={() => setActiveLoanCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon}
              size={deviceType === 'mobile' ? 18 : 24}
              style={[
                styles.loanCategoryIcon,
                activeLoanCategory === category.id && styles.activeLoanCategoryIcon,
                { color: activeLoanCategory === category.id ? '#FFFFFF' : category.color }
              ]}
            />
            <Text 
              style={[
                styles.loanCategoryText,
                activeLoanCategory === category.id && styles.activeLoanCategoryText,
                deviceType === 'mobile' && { fontSize: 11 }
              ]}
              numberOfLines={1}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeLoanCategory} Loan Details</Text>
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
      <View style={styles.contentContainer}>
        {Object.entries(userInfoMapping).map(([key, value]) => (
          <View key={key} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{key}</Text>
            {key === 'Phone' ? (
              <View style={styles.phoneContainer}>
                <Text style={styles.infoValue}>{value}</Text>
                <TouchableOpacity 
                  onPress={() => setIsPhoneVisible(!isPhoneVisible)}
                  style={styles.visibilityButton}
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
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {isSavingsVisible ? `₱${user?.data?.[0]?.Savings || "0.00"}` : "₱ • • • • • •"}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsSavingsVisible(!isSavingsVisible)}
            style={styles.visibilityButton}
          >
            <MaterialCommunityIcons
              name={isSavingsVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.savingsStatus}>
          {user?.data?.[0]?.SVstatus || "No Data"}
        </Text>
      </View>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Details</Text>
        </View>
        <View style={styles.loanDetailsCard}>
          <View style={styles.loanDetailRow}>
            <Text style={styles.loanDetailLabel}>Monthly Deposit</Text>
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
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {isSharesVisible ? `₱${user?.data?.[0]?.Shares || "0.00"}` : "₱ • • • • • •"}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsSharesVisible(!isSharesVisible)}
            style={styles.visibilityButton}
          >
            <MaterialCommunityIcons
              name={isSharesVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.savingsStatus}>
          {user?.data?.[0]?.SHstatus || "No Data"}
        </Text>
      </View>

      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shares Details</Text>
        </View>
        <View style={styles.loanDetailsCard}>
          <View style={styles.loanDetailRow}>
            <Text style={styles.loanDetailLabel}>Monthly Deposit</Text>
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
      <View style={[
        styles.container,
        Platform.OS === 'web' && {
          ...(deviceType === 'mobile' && getPlatformStyles('mobile').container),
          ...(deviceType === 'tablet' && getPlatformStyles('tablet').container),
          ...(deviceType === 'windows' && getPlatformStyles('windows').container),
        }
      ]}>
        <ScrollView
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === 'web' && { 
              height: 'auto',
              paddingHorizontal: deviceType === 'mobile' ? 8 : 16
            }
          ]}
          style={Platform.OS === 'web' ? { height: '100%', overflow: 'auto' } : {}}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0F172A"
            />
          }
        >
          <View style={styles.headerSection}>
            <Text style={[
              styles.welcomeText,
              deviceType === 'mobile' && { fontSize: 20 }
            ]}>Welcome back!</Text>
            <Text style={[
              styles.dateText,
              deviceType === 'mobile' && { fontSize: 11 }
            ]}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          <View style={[
            styles.tabsContainer,
            Platform.OS === 'web' && {
              ...(deviceType === 'mobile' && getPlatformStyles('mobile').tabsContainer),
              ...(deviceType === 'tablet' && getPlatformStyles('tablet').tabsContainer),
              ...(deviceType === 'windows' && getPlatformStyles('windows').tabsContainer),
            }
          ]}>
            {tabs.map((tab) => (
              <Animated.View
                key={tab.id}
                style={[
                  { transform: [{ scale: scaleAnims[tab.id] }] },
                  deviceType === 'mobile' && { flex: 1, minWidth: '23%' }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.activeTab,
                    deviceType === 'mobile' && {
                      paddingVertical: 6,
                      paddingHorizontal: 2
                    }
                  ]}
                  onPress={() => handleTabPress(tab.id)}
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={deviceType === 'mobile' ? 20 : 24}
                    style={[
                      styles.tabIcon,
                      activeTab === tab.id && styles.activeTabIcon,
                    ]}
                  />
                  <Text style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel,
                    deviceType === 'mobile' && { fontSize: 12 }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={[
            styles.mainCard,
            Platform.OS === 'web' && {
              ...(deviceType === 'mobile' && getPlatformStyles('mobile').mainCard),
              ...(deviceType === 'tablet' && getPlatformStyles('tablet').mainCard),
              ...(deviceType === 'windows' && getPlatformStyles('windows').mainCard),
            }
          ]}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
};

export default WebDashboard;
