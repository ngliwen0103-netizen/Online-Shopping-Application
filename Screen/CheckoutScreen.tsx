import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { imageMap } from '../imageMap';
import { createOrderApi, deleteCartItemApi } from '../cloudApi';
import AppBackHeader from '../Components/AppBackHeader';
import AppModal from '../Components/AppModal';

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';
const DARK = '#1E1E1E';
const GREY_TEXT = '#8A8FA3';
const GREY = '#AFAFAF';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const CheckoutScreen = ({ navigation, route, signedInUser }: any) => {
  const cartItems = route.params?.cartItems || [];
  const [showBackModal, setShowBackModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');

  const SHIPPING_FEE = 5;
  const passedAddress = route?.params?.selectedAddress;

  React.useEffect(() => {
    if (passedAddress) {
      setSelectedAddress(passedAddress);
    }
  }, [passedAddress]);

  React.useEffect(() => {
    if (route?.params?.showOrderSuccessAgain) {
      setShowOrderModal(true);
    }
  }, [route?.params?.showOrderSuccessAgain]);

  const merchandiseSubtotal = useMemo(() => {
    return cartItems.reduce((total: number, item: any) => {
      return total + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const totalPayment = merchandiseSubtotal + SHIPPING_FEE;

  const canPlaceOrder =
    selectedAddress !== null &&
    !!selectedPayment &&
    cartItems.length > 0;

  const showAppMessage = (title: string, message: string) => {
    setMessageTitle(title);
    setMessageText(message);
    setShowMessageModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showAppMessage('Notice', 'Please select a delivery address.');
      return;
    }

    if (!selectedPayment) {
      showAppMessage('Notice', 'Please select a payment method.');
      return;
    }

    if (cartItems.length === 0) {
      showAppMessage('Notice', 'No item available for checkout.');
      return;
    }

    if (!signedInUser) {
      showAppMessage('Error', 'Please sign in before placing order.');
      return;
    }

    try {
      await createOrderApi({
        user_id: signedInUser.user_id,
        total_amount: totalPayment,
        payment_method: selectedPayment,
        items: cartItems.map((item: any) => ({
          product_color_id: item.product_color_id,
          quantity: item.quantity,
          price_each: item.price,
          subtotal: Number(item.price) * Number(item.quantity),
        })),
      });

      await Promise.all(
        cartItems.map((item: any) =>
          deleteCartItemApi(Number(item.cart_id))
        )
      );

      setShowOrderModal(true);
    } catch (error) {
      console.log('Place order error:', error);
      showAppMessage('Error', 'Unable to place order.');
    }
  };

  const renderItem = (item: any, index: number) => {
    const imageSource =
      imageMap[item.color_image_url] || imageMap[item.product_image_url];

    return (
      <View key={`${item.product_id}-${index}`} style={styles.itemCard}>
        <View style={styles.itemLeft}>
          <View style={styles.imageFrame}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.itemImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.noImageText}>IMG</Text>
            )}
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemPrice}>RM {Number(item.price).toFixed(2)}</Text>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product_name || item.name}
            </Text>

            <View style={styles.colorRow}>
              <Text style={styles.itemColor}>
                {item.color_name || item.selected_color_name || 'No color selected'}
              </Text>

              <Text style={styles.itemQty}>
                QTY {item.quantity || 1}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentOption = (label: string) => {
    const selected = selectedPayment === label;

    return (
      <TouchableOpacity
        style={[styles.paymentRow, selected && styles.paymentRowSelected]}
        activeOpacity={0.85}
        onPress={() => setSelectedPayment(label)}
      >
        <View style={styles.paymentLeft}>
          <Icon
            name={selected ? 'radio-button-on' : 'radio-button-off'}
            size={18}
            color={selected ? ORANGE : GREY_TEXT}
          />
          <Text style={[styles.paymentText, selected && styles.paymentTextSelected]}>
            {label}
          </Text>
        </View>

        {selected && <Icon name="checkmark" size={16} color={ORANGE} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="Checkout"
        onPressBack={() => setShowBackModal(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Items</Text>
        {cartItems.map(renderItem)}

        <Text style={styles.sectionTitle}>Delivery</Text>

        <TouchableOpacity
          style={styles.addressBox}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('AddressSelection', {
              from: 'checkout',
              cartItems,
            })
          }
        >
          <View style={styles.addressIconWrap}>
            <Icon name="location-outline" size={20} color={ORANGE} />
          </View>

          <View style={styles.addressContent}>
            {selectedAddress ? (
              <>
                <View style={styles.addressTopRow}>
                  <Text style={styles.addressName}>
                    {selectedAddress.recipient_name}
                  </Text>
                  <Text style={styles.addressPhone}>
                    {selectedAddress.phone}
                  </Text>
                </View>

                <Text style={styles.addressFullText}>
                  {selectedAddress.address_line1}, {selectedAddress.address_line2},{' '}
                  {selectedAddress.postcode}, {selectedAddress.city},{' '}
                  {selectedAddress.state}
                </Text>
              </>
            ) : (
              <Text style={styles.addressPlaceholder}>
                Please fill in address
              </Text>
            )}
          </View>

          <Icon name="chevron-forward" size={18} color={ORANGE} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Payment Methods</Text>

        <View style={styles.paymentCard}>
          {renderPaymentOption('Apple Pay')}
          {renderPaymentOption('Credit Cards')}
          {renderPaymentOption('PayPal')}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.paymentDetailsWrapper}>
          <Text style={styles.paymentDetailsTitle}>Payment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchandise Subtotal</Text>
            <Text style={styles.detailValue}>RM {merchandiseSubtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shipping Subtotal</Text>
            <Text style={styles.detailValue}>RM {SHIPPING_FEE.toFixed(2)}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalValue}>RM {totalPayment.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            !canPlaceOrder && styles.placeOrderButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handlePlaceOrder}
          disabled={!canPlaceOrder}
        >
          <Text
            style={[
              styles.placeOrderText,
              !canPlaceOrder && styles.placeOrderTextDisabled,
            ]}
          >
            Place Order
          </Text>
        </TouchableOpacity>
      </View>

      <AppModal
        visible={showBackModal}
        title="Leave Checkout?"
        message="Order is not placed. Do you want to leave checkout?"
        iconName="alert-circle-outline"
        primaryButtonText="Leave"
        onPrimaryPress={() => {
          setShowBackModal(false);
          navigation.goBack();
        }}
        secondaryButtonText="Cancel"
        onSecondaryPress={() => setShowBackModal(false)}
      />

      <AppModal
        visible={showOrderModal}
        title="Order Confirmed"
        message="Thank you for your order. You can check your order status in My Purchases."
        iconName="checkmark-circle-outline"
        primaryButtonText="Return to Home Page"
        onPrimaryPress={() => {
          setShowOrderModal(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'RootDrawer' }],
          });
        }}
        secondaryButtonText="View My Order"
        onSecondaryPress={() => {
          setShowOrderModal(false);
          navigation.navigate('MyPurchase', {
            tab: 'toReceive',
            fromCheckoutSuccess: true,
          });
        }}
      />

      <AppModal
        visible={showMessageModal}
        title={messageTitle}
        message={messageText}
        iconName="information-circle-outline"
        primaryButtonText="OK"
        onClose={() => setShowMessageModal(false)}
      />
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 180,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  itemCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
    ...SHADOW,
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageFrame: {
    width: 78,
    height: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  itemImage: {
    width: '88%',
    height: '88%',
  },

  noImageText: {
    fontSize: 10,
    color: BLUE,
    fontFamily: 'Inter',
  },

  itemInfo: {
    flex: 1,
  },

  itemPrice: {
    fontSize: 14,
    color: BLUE,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  itemName: {
    fontSize: 13,
    color: DARK,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'Inter',
  },

  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemColor: {
    fontSize: 12,
    color: GREY_TEXT,
    fontFamily: 'Inter',
    flex: 1,
    marginRight: 8,
  },

  itemQty: {
    fontSize: 12,
    color: BLUE,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 16,
    ...SHADOW,
  },

  addressIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF3F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  addressContent: {
    flex: 1,
    paddingRight: 10,
  },

  addressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK,
    fontFamily: 'Inter',
    marginRight: 8,
  },

  addressPhone: {
    fontSize: 12,
    color: BLUE,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  addressFullText: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 18,
    fontFamily: 'Inter',
  },

  addressPlaceholder: {
    fontSize: 13,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  paymentCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 16,
    ...SHADOW,
  },

  paymentRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  paymentRowSelected: {
    backgroundColor: '#FFF9F8',
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentText: {
    fontSize: 14,
    color: DARK,
    marginLeft: 10,
    fontFamily: 'Inter',
  },

  paymentTextSelected: {
    color: BLUE,
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },

  paymentDetailsWrapper: {
    marginBottom: 14,
  },

  paymentDetailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 10,
    fontFamily: 'Inter',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  detailLabel: {
    fontSize: 13,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  detailValue: {
    fontSize: 13,
    color: DARK,
    fontFamily: 'Inter',
    fontWeight: '600',
  },

  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },

  totalLabel: {
    fontSize: 15,
    color: BLUE,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  totalValue: {
    fontSize: 16,
    color: ORANGE,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  placeOrderButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },

  placeOrderButtonDisabled: {
    backgroundColor: GREY,
  },

  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  placeOrderTextDisabled: {
    color: '#F4F4F4',
  },
});