import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';

import SplashScreen from './Screen/SplashScreen';
import BottomTab from './Navigation/BottomTab';
import MenuScreen from './Screen/MenuScreen';
import FAQScreen from './Screen/FAQScreen';
import OrderDeliveryScreen from './Screen/OrderScreen';
import ReturnRefundScreen from './Screen/ReturnRefundScreen';
import SearchScreen from './Screen/SearchScreen';
import ProductDetailScreen from './Screen/ProductDetailScreen';
import CategoryScreen from './Screen/CategoryScreen';
import BrandScreen from './Screen/BrandScreen';
import ShopAllScreen from './Screen/ShopAllScreen';
import CheckoutScreen from './Screen/CheckoutScreen';
import SignInScreen from './Screen/SignInScreen';
import RegisterScreen from './Screen/RegisterScreen';
import MyAccountScreen from './Screen/MyAccountScreen';
import AddressSelectionScreen from './Screen/AddressSelectionScreen';
import AddAddressScreen from './Screen/AddAddressScreen';
import EditAddressScreen from './Screen/EditAddressScreen';
import MyPurchaseScreen from './Screen/MyPurchaseScreen';
import RateProductScreen from './Screen/RateProductScreen';
import MyReviewsScreen from './Screen/MyReviewScreen';
import ProductReviewsScreen from './Screen/ProductReviewScreen';
import ManageMyAccountScreen from './Screen/ManageMyAccountScreen';
import ChangePasswordScreen from './Screen/ChangePasswordScreen';
import TermsOfUseScreen from './Screen/TermsOfUseScreen';
import PrivacyPolicyScreen from './Screen/PrivacyPolicyScreen';
import ShoppingBagScreen from './Screen/ShoppingBagScreen';
import BestSellerScreen from './Screen/BestSellerScreen';

import { initializeDatabase } from './initDatabase';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <MenuScreen
        {...props}
        signedInUser={props.signedInUser}
        setSignedInUser={props.setSignedInUser}
      />
    </DrawerContentScrollView>
  );
};

const MainDrawer = ({ signedInUser, setSignedInUser }: any) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'front',
        swipeEdgeWidth: 30,
      }}
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          signedInUser={signedInUser}
          setSignedInUser={setSignedInUser}
        />
      )}
    >
      <Drawer.Screen name="MainTabs">
        {(props) => (
          <BottomTab
            {...props}
            signedInUser={signedInUser}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

const App = () => {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [signedInUser, setSignedInUser] = useState<any>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        console.log('Database initialized successfully');
        setDbReady(true);
      } catch (error: any) {
        console.log('Database initialization error:', error);
        setDbError(String(error));
      }
    };

    setupDatabase();
  }, []);

  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorText}>{dbError}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RootDrawer">
            {(props) => (
              <MainDrawer
                {...props}
                signedInUser={signedInUser}
                setSignedInUser={setSignedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="OrderDelivery" component={OrderDeliveryScreen} />
          <Stack.Screen name="ReturnRefund" component={ReturnRefundScreen} />
          <Stack.Screen name="Search">
            {(props) => (
              <SearchScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="ProductDetail">
            {(props) => (
              <ProductDetailScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Brand" component={BrandScreen} />
          <Stack.Screen name="ShopAll" component={ShopAllScreen} />
          <Stack.Screen name="BestSeller" component={BestSellerScreen} />
          <Stack.Screen name="Checkout">
            {(props) => (
              <CheckoutScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="SignIn">
            {(props) => (
              <SignInScreen
                {...props}
                setSignedInUser={setSignedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Register" component={RegisterScreen} />

          <Stack.Screen name="MyAccount">
            {(props) => (
              <MyAccountScreen
                {...props}
                signedInUser={signedInUser}
                setSignedInUser={setSignedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="AddressSelection">
            {(props) => (
              <AddressSelectionScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="AddAddress">
            {(props) => (
              <AddAddressScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="EditAddress" component={EditAddressScreen} />
          <Stack.Screen name="MyPurchase">
            {(props) => (
              <MyPurchaseScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="RateProduct">
            {(props) => (
              <RateProductScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="MyReviews">
            {(props) => (
              <MyReviewsScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>
         <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
          <Stack.Screen name="ManageMyAccount">
            {(props) => (
              <ManageMyAccountScreen
                {...props}
                signedInUser={signedInUser}
                setSignedInUser={setSignedInUser}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ChangePassword">
            {(props) => (
              <ChangePasswordScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="ShoppingBag">
            {(props) => (
              <ShoppingBagScreen
                {...props}
                signedInUser={signedInUser}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  drawerContent: {
    flex: 1,
    paddingTop: 0,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#272c78',
    marginBottom: 10,
    fontFamily: 'Inter',
  },

  errorText: {
    fontSize: 14,
    color: '#c94b4c',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});