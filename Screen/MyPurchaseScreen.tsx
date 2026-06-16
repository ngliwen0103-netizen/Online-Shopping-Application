import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

import {
  getOrdersByUserApi,
  updateOrderStatusApi,
  getReviewsByUserApi,
} from '../cloudApi';
import { getProductByColorId } from '../database';
import { imageMap } from '../imageMap';
import AppBackHeader from '../Components/AppBackHeader';
import AppModal from '../Components/AppModal';

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';
const DARK = '#1E1E1E';
const GREY_TEXT = '#8A8FA3';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const MyPurchaseScreen = ({ navigation, route, signedInUser }: any) => {
  const [activeTab, setActiveTab] = useState<'toReceive' | 'completed'>(
    route?.params?.tab || 'toReceive'
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [myReviews, setMyReviews] = useState<any[]>([]);

  const loadOrders = async () => {
    if (!signedInUser) return;

    try {
      const result = await getOrdersByUserApi(signedInUser.user_id);
      const reviewResult = await getReviewsByUserApi(signedInUser.user_id);
      setMyReviews(reviewResult);

      const fullOrders = await Promise.all(
        result.map(async (item: any) => {
          const productInfo = await getProductByColorId(item.product_color_id);

          return {
            ...item,
            ...productInfo,
          };
        })
      );

      setOrders(fullOrders);
    } catch (error) {
      console.log('Load orders error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [signedInUser])
  );

  const filteredOrders =
    activeTab === 'toReceive'
      ? orders.filter(item => item.status !== 'Completed')
      : orders.filter(item => item.status === 'Completed');

  const hasReviewed = (item: any) => {
    return myReviews.some(
      review =>
        review.order_id === item.order_id &&
        review.product_id === item.product_id
    );
  };

  const openProductDetail = (item: any) => {
    navigation.navigate('ProductDetail', {
      product: {
        product_id: item.product_id,
        product_name: item.product_name || item.name,
        name: item.name || item.product_name,
        price: item.price,
        image_url: item.product_image_url || item.color_image_url || item.image_url,
        description: item.description,
        details: item.details,
        category_id: item.category_id,
        brand_id: item.brand_id,
        category_name: item.category_name,
        brand_name: item.brand_name,
      },
    });
  };

  const handleBack = () => {
    if (route?.params?.fromCheckoutSuccess) {
      navigation.navigate('Checkout', {
        cartItems: [],
        showOrderSuccessAgain: true,
      });
    } else {
      navigation.goBack();
    }
  };

  const handleConfirmReceived = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatusApi(selectedOrder.order_id, 'Completed');
      setShowConfirmModal(false);
      setSelectedOrder(null);
      await loadOrders();
      setActiveTab('completed');
    } catch (error) {
      console.log('Update order status error:', error);
    }
  };

  const renderOrderItem = (item: any) => {
    const imageSource =
      imageMap[item.color_image_url] || imageMap[item.product_image_url];

    return (
      <TouchableOpacity
        key={`${item.order_id}-${item.product_color_id}`}
        style={styles.orderCard}
        activeOpacity={0.9}
        onPress={() => openProductDetail(item)}
      >
        <View style={styles.orderTopRow}>
          <Text style={styles.orderText}>Order # {item.order_id}</Text>

          {activeTab === 'toReceive' && item.order_date && (
            <Text style={styles.dateText}>
              Placed on:{' '}
              {new Date(item.order_date).toLocaleDateString('en-MY', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          )}

          {activeTab === 'completed' && item.received_date && (
            <Text style={styles.dateText}>
              Received on:{' '}
              {new Date(item.received_date).toLocaleDateString('en-MY', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>

        <View style={styles.productRow}>
          <View style={styles.imageBox}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.noImageText}>IMG</Text>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name || item.product_name || 'Product Name'}
            </Text>

            <Text style={styles.colorText}>
              {item.color_name || 'No color'}
            </Text>
          </View>

          <View style={styles.rightInfo}>
            <Text style={styles.qtyText}>x{item.quantity}</Text>

            <Text style={styles.totalText}>
              RM {Number(item.subtotal || 0).toFixed(2)}
            </Text>

            {activeTab === 'toReceive' ? (
              <TouchableOpacity
                style={styles.receivedButton}
                onPress={() => {
                  setSelectedOrder(item);
                  setShowConfirmModal(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.receivedText}>Received</Text>
              </TouchableOpacity>
            ) : hasReviewed(item) ? (
              <View style={styles.completedButton}>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() =>
                  navigation.navigate('RateProduct', {
                    orderItem: item,
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.rateText}>Rate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="My Purchases"
        onPressBack={handleBack}
      />

      <View style={styles.tabContainer}>
        <View style={styles.tabWrap}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'toReceive' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('toReceive')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'toReceive' && styles.activeTabText,
              ]}
            >
              To Receive
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'completed' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('completed')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'completed' && styles.activeTabText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon name="bag-handle-outline" size={36} color={GREY_TEXT} />
            <Text style={styles.emptyText}>No orders yet.</Text>
          </View>
        ) : (
          filteredOrders.map(renderOrderItem)
        )}
      </ScrollView>

      <AppModal
        visible={showConfirmModal}
        title="Confirm receipt of order?"
        message="The order status will show “Completed” after confirmation. In order to protect your after-sales rights, please confirm receipt after you have received all the items."
        iconName="cube-outline"
        primaryButtonText="Yes, I Received"
        onPrimaryPress={handleConfirmReceived}
        secondaryButtonText="Not Yet"
        onSecondaryPress={() => {
          setShowConfirmModal(false);
          setSelectedOrder(null);
        }}
      />
    </SafeAreaView>
  );
};

export default MyPurchaseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  tabWrap: {
    flexDirection: 'row',
    backgroundColor: '#EEF1F7',
    borderRadius: 16,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeTabButton: {
    backgroundColor: CARD_BG,
    ...SHADOW,
  },

  tabText: {
    fontSize: 14,
    color: BLUE,
    fontFamily: 'Inter',
    fontWeight: '600',
  },

  activeTabText: {
    fontWeight: '800',
    color: BLUE,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },

  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  orderCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
    ...SHADOW,
  },

  orderTopRow: {
    marginBottom: 10,
  },

  orderText: {
    fontSize: 13,
    color: BLUE,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  dateText: {
    fontSize: 11,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  imageBox: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  productImage: {
    width: '90%',
    height: '90%',
  },

  noImageText: {
    fontSize: 10,
    color: BLUE,
    fontFamily: 'Inter',
  },

  productInfo: {
    flex: 1,
    paddingRight: 10,
  },

  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  colorText: {
    fontSize: 12,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  rightInfo: {
    minWidth: 86,
    alignItems: 'flex-end',
  },

  qtyText: {
    fontSize: 12,
    color: BLUE,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 4,
  },

  totalText: {
    fontSize: 13,
    color: DARK,
    fontWeight: '800',
    fontFamily: 'Inter',
    marginBottom: 8,
  },

  receivedButton: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    minWidth: 82,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  receivedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  completedButton: {
    backgroundColor: '#EEF1F7',
    borderRadius: 12,
    minWidth: 82,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  completedText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  rateButton: {
    backgroundColor: BLUE,
    borderRadius: 12,
    minWidth: 82,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  rateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});