import React from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../Screen/HomeScreen';
import ShoppingBagScreen from '../Screen/ShoppingBagScreen';
const Tab = createBottomTabNavigator();

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const GREY = '#B5B5B5';

const DummyScreen = () => null;

const BottomTab = ({ signedInUser }: any) => {
  return (
    <Tab.Navigator
      initialRouteName = "Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Menu"
        component={DummyScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.openDrawer();
          },
        })}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name="menu"
              size={24}
              color={focused ? ORANGE : GREY}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: () => (
            <Image
              source={require('../ImgCopy/logo.png')}
              style={styles.homeLogo}
              resizeMode="contain"
            />
          ),
        }}
      >
        {(props) => (
          <HomeScreen
            {...props}
            signedInUser={signedInUser}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="My Cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name="cart"
              size={24}
              color={focused ? ORANGE : GREY}
            />
          ),
        }}
      >
        {(props) => (
          <ShoppingBagScreen
            {...props}
            signedInUser={signedInUser}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  tabLabel: {
    fontSize: 11,
    color: BLUE,
    fontFamily: 'Inter',
  },
  homeLogo: {
    width: 130,
    height: 130,
  },
});