import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { logoutAction } from '../(redux)/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const CustomDrawerContent = React.memo((props) => {
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const dispatch = useDispatch();
  const [fadeAnim] = useState(new Animated.Value(0));

  const getIconColor = (itemName) => {
    return selectedItem === itemName ? '#fff' : '#303481';
  };

  const icons = {
    Profile: (isSelected) => <Ionicons name="person-circle" size={24} color={getIconColor('Dashboard')} />,
    Settings: (isSelected) => <Ionicons name="settings-sharp" size={24} color={getIconColor('Settings')} />,
    Logout: (isSelected) => <Ionicons name="log-out" size={24} color={getIconColor('Logout')} />,
    Icon: <Ionicons name="menu" size={30} color="#fff" style={{ marginLeft: 10 }} />,
  };
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getSelectedStyle = (itemName) => {
    return {
      style: selectedItem === itemName ? styles.selectedItem : null,
      labelStyle: [
        styles.drawerItemLabel,
        selectedItem === itemName ? styles.selectedItemLabel : null
      ]
    };
  };

  const handleItemPress = async (item) => {
    setSelectedItem(item);
    if (item === 'Dashboard') {
      router.push('/MobileDashboard');
    } else if (item === 'Settings') {
      router.push('/Settings');
    } else if (item === 'Logout') {
      handleLogout();
    }
  };

  useEffect(() => {
    const currentRoute = props.state?.routeNames[props.state.index];
    if (currentRoute?.includes('Dashboard')) {
      setSelectedItem('Dashboard');
    } else if (currentRoute?.includes('Settings')) {
      setSelectedItem('Settings');
    }
  }, [props.state]);

  const handleLogout = () => {
    dispatch(logoutAction());
    AsyncStorage.removeItem("userInfo");
    router.replace("/Login");
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContentContainer}>
      <LinearGradient
        colors={['#303481', '#4A4D9B']}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
          <View style={styles.profileImageContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
          </View>
          <Text style={styles.username}>Welcome</Text>
        </Animated.View>
      </LinearGradient>
      
      <View style={styles.menuContainer}>
        <DrawerItem
          icon={() => icons.Profile()}
          label="Dashboard"
          labelStyle={getSelectedStyle('Dashboard').labelStyle}
          onPress={() => handleItemPress('Dashboard')}
          style={[styles.drawerItem, getSelectedStyle('Dashboard').style]}
        />
        
        <DrawerItem
          icon={() => icons.Settings()}
          label="Settings"
          labelStyle={getSelectedStyle('Settings').labelStyle}
          onPress={() => handleItemPress('Settings')}
          style={[styles.drawerItem, getSelectedStyle('Settings').style]}
        />

        <DrawerItem
          icon={() => icons.Logout()}
          label="Logout"
          labelStyle={getSelectedStyle('Logout').labelStyle}
          onPress={() => handleItemPress('Logout')}
          style={[styles.drawerItem, getSelectedStyle('Logout').style]}
        />
      </View>
    </DrawerContentScrollView>
  );
});

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: '#303481',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        drawerStyle: styles.drawerStyle,
        drawerActiveBackgroundColor: 'transparent',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#303481',
        headerShown: true,
        swipeEdgeWidth: 100,
        drawerType: 'slide',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="MobileDashboard"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard",
          headerTitleAlign: 'center',
        }}
      />
      <Drawer.Screen
        name="Settings"
        options={{
          drawerLabel: "Settings",
          title: "Settings",
          headerTitleAlign: 'center',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContentContainer: {
    flex: 1,
    backgroundColor: '#B2EBF2',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#B2EBF2',
  },
  drawerItem: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#303481',
  },
  selectedItem: {
    backgroundColor: '#4A4D9B',
    transform: [{ scale: 1.02 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedItemLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  drawerStyle: {
    backgroundColor: '#0F172A',
    width: 250,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 20,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
