import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../Screen/HomeScreen';
import SearchScreen from '../Screen/SearchScreen';
import ProductDetailScreen from '../Screen/ProductDetailScreen';
import CategoryScreen from '../Screen/CategoryScreen';
import BrandScreen from '../Screen/BrandScreen';
import ShopAllScreen from '../Screen/ShopAllScreen';
import BestSellerScreen from '../Screen/BestSellerScreen';
import FAQScreen from '../Screen/FAQScreen';
import OrderDeliveryScreen from '../Screen/OrderScreen';
import ReturnRefundScreen from '../Screen/ReturnRefundScreen';

const Stack = createStackNavigator();

const HomeStack = ({ signedInUser }: any) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {(props) => <HomeScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="Search">
        {(props) => <SearchScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="ProductDetail">
        {(props) => <ProductDetailScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Brand" component={BrandScreen} />
      <Stack.Screen name="ShopAll" component={ShopAllScreen} />
      <Stack.Screen name="BestSeller" component={BestSellerScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="OrderDelivery" component={OrderDeliveryScreen} />
      <Stack.Screen name="ReturnRefund" component={ReturnRefundScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;