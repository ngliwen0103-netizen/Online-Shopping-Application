import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ShoppingBagScreen from '../Screen/ShoppingBagScreen';
import MyPurchaseScreen from '../Screen/MyPurchaseScreen';
import ProductDetailScreen from '../Screen/ProductDetailScreen';
import ProductReviewsScreen from '../Screen/ProductReviewScreen';

const Stack = createStackNavigator();

const CartStack = ({ signedInUser }: any) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShoppingBagMain">
        {(props) => <ShoppingBagScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="MyPurchase">
        {(props) => <MyPurchaseScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="ProductDetail">
        {(props) => <ProductDetailScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
    </Stack.Navigator>
  );
};

export default CartStack;