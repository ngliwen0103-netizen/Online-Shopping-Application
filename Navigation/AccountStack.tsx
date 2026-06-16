import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MyAccountScreen from '../Screen/MyAccountScreen';
import MyPurchaseScreen from '../Screen/MyPurchaseScreen';
import MyReviewsScreen from '../Screen/MyReviewScreen';
import ProductReviewsScreen from '../Screen/ProductReviewScreen';
import FAQScreen from '../Screen/FAQScreen';
import OrderDeliveryScreen from '../Screen/OrderScreen';
import ReturnRefundScreen from '../Screen/ReturnRefundScreen';

const Stack = createStackNavigator();

const AccountStack = ({ signedInUser, setSignedInUser }: any) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyAccountMain">
        {(props) => (
          <MyAccountScreen
            {...props}
            signedInUser={signedInUser}
            setSignedInUser={setSignedInUser}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="MyPurchase">
        {(props) => <MyPurchaseScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="MyReviews">
        {(props) => <MyReviewsScreen {...props} signedInUser={signedInUser} />}
      </Stack.Screen>

      <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="OrderDelivery" component={OrderDeliveryScreen} />
      <Stack.Screen name="ReturnRefund" component={ReturnRefundScreen} />
    </Stack.Navigator>
  );
};

export default AccountStack;