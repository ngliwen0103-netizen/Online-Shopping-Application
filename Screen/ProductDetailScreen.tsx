import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { imageMap } from '../imageMap';
import { getColorsByProductId, getRandomProducts } from '../database';
import { addToCartApi, getProductReviewSummaryApi, getSoldCountApi } from '../cloudApi';

const BLUE = '#272C78';
const ORANGE = '#C94B4C';
const BG = '#F6F7FB';
const GREY = '#666666';
const DARK = '#1E1E1E';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';
const SOFT_TEXT = '#8A8FA3';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const ProductDetailScreen = ({ route, navigation, signedInUser }: any) => {
  const { product } = route.params;

  const [colors, setColors] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [soldCount, setSoldCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showAddToBag, setShowAddToBag] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const selectedStock = Number(selectedColor?.stock_qty || 0);
  const isOutOfStock = selectedStock <= 0;
  const [reviewSummary, setReviewSummary] = useState({
    average_rating: 0,
    review_count: 0,
  });

  useEffect(() => {
    loadColors();
    loadSoldCount();
    loadRelatedProducts();
    loadReviewSummary();
  }, []);

  const loadColors = async () => {
    try {
      const colorList = await getColorsByProductId(product.product_id);
      setColors(colorList);

      if (colorList.length > 0) {
        setSelectedColor(colorList[0]);
      }
    } catch (error) {
      console.log('Error loading colors:', error);
    }
  };

  const loadSoldCount = async () => {
    try {
      const colors = await getColorsByProductId(product.product_id);
      const colorIds = colors.map((color: any) => color.product_color_id);
      const count = await getSoldCountApi(colorIds);
      setSoldCount(count);
    } catch (error) {
      console.log('Error loading sold count:', error);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const productList = await getRandomProducts();
      const filteredList = productList.filter(
        (item: any) => item.product_id !== product.product_id,
      );
      setRelatedProducts(filteredList.slice(0, 4));
    } catch (error) {
      console.log('Error loading related products:', error);
    }
  };

  const loadReviewSummary = async () => {
    try {
      const result = await getProductReviewSummaryApi(product.product_id);
      setReviewSummary(result);
    } catch (error) {
      console.log('Load review summary error:', error);
    }
  };

  const handleAddToCart = () => {
    if (!signedInUser) {
      navigation.navigate('SignIn', {
        onSignInSuccess: () => {},
      });
      return;
    }

    if (!selectedColor) return;

    setQuantity(1);
    setShowAddToBag(true);
    slideAnim.setValue(300);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseAddToBag = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowAddToBag(false);
    });
  };

  const displayImage =
    selectedColor && imageMap[selectedColor.image_url]
      ? imageMap[selectedColor.image_url]
      : imageMap[product.image_url];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Icon name="chevron-back" size={22} color={BLUE} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageCard}>
          {displayImage ? (
            <Image
              source={displayImage}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholderText}>No Image</Text>
          )}
        </View>

        <View style={styles.infoWrap}>
          <View style={styles.priceSoldRow}>
            <Text style={styles.price}>RM {Number(product.price).toFixed(2)}</Text>
            <Text style={styles.soldInline}>{soldCount} sold</Text>
          </View>

          <Text style={styles.productName}>
            {product.product_name || product.name}
          </Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>COLORS</Text>

          <View style={styles.colorRow}>
            {colors.length > 0 ? (
              colors.map((item) => {
                const isSelected =
                  selectedColor?.product_color_id === item.product_color_id;

                return (
                  <TouchableOpacity
                    key={item.product_color_id}
                    style={[
                      styles.colorButton,
                      isSelected && styles.selectedColorButton,
                      Number(item.stock_qty || 0) <= 0 && styles.disabledColorButton,
                    ]}
                    disabled={Number(item.stock_qty || 0) <= 0}
                    onPress={() => setSelectedColor(item)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.colorButtonText,
                        isSelected && styles.selectedColorButtonText,
                        Number(item.stock_qty || 0) <= 0 && styles.disabledColorText,
                      ]}
                    >
                      {item.color_name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noColorText}>No color options available</Text>
            )}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
          <Text style={styles.specText}>
            {product.details || product.description}
          </Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>RATINGS & REVIEWS</Text>

          {reviewSummary.review_count > 0 ? (
            <>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingMain}>
                  ★ {Number(reviewSummary.average_rating || 0).toFixed(1)}
                </Text>
                <Text style={styles.ratingSub}>
                  ({reviewSummary.review_count})
                </Text>
                <Text style={styles.ratingDivider}>|</Text>
                <Text style={styles.ratingInfo}>
                  {reviewSummary.review_count} reviews
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProductReviews', {
                    productId: product.product_id,
                    productName: product.product_name || product.name,
                  })
                }
              >
                <Text style={styles.reviewLink}>READ REVIEWS</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingMain}>★ 0.0</Text>
                <Text style={styles.ratingSub}>(0)</Text>
                <Text style={styles.ratingDivider}>|</Text>
                <Text style={styles.ratingInfo}>No reviews yet</Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProductReviews', {
                    productId: product.product_id,
                    productName: product.product_name || product.name,
                  })
                }
              >
                <Text style={styles.reviewLink}>READ REVIEWS</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>YOU MAY ALSO LIKE</Text>

          <View style={styles.relatedContainer}>
            {relatedProducts.map((item: any) => {
              const relatedImage = imageMap[item.image_url];

              return (
                <TouchableOpacity
                  key={item.product_id}
                  style={styles.relatedCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.push('ProductDetail', { product: item })}
                >
                  <View style={styles.relatedImageWrap}>
                    {relatedImage ? (
                      <Image
                        source={relatedImage}
                        style={styles.relatedImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.likeText}>No Image</Text>
                    )}
                  </View>

                  <Text style={styles.relatedPrice}>
                    RM {Number(item.price).toFixed(2)}
                  </Text>

                  <Text style={styles.relatedName} numberOfLines={2}>
                    {item.product_name || item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Icon name="cart-outline" size={18} color="#FFFFFF" style={styles.cartIcon} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAddToBag}
        transparent
        animationType="none"
        onRequestClose={handleCloseAddToBag}
      >
        <Pressable style={styles.overlay} onPress={handleCloseAddToBag}>
          <Animated.View
            style={[
              styles.addToBagSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Pressable>
              <View style={styles.addToBagHeader}>
                <Text style={styles.addToBagTitle}>ADDED TO BAG</Text>

                <TouchableOpacity onPress={handleCloseAddToBag}>
                  <Icon name="close" size={18} color={ORANGE} />
                </TouchableOpacity>
              </View>

              <View style={styles.addToBagContent}>
                <View style={styles.addToBagImageBox}>
                  {displayImage ? (
                    <Image
                      source={displayImage}
                      style={styles.addToBagImage}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>

                <View style={styles.addToBagInfo}>
                  <Text style={styles.addToBagPrice}>
                    RM {Number(product.price).toFixed(2)}
                  </Text>

                  <Text style={styles.addToBagName} numberOfLines={2}>
                    {product.product_name || product.name}
                  </Text>

                  <Text style={styles.addToBagColor}>
                    COLOR: {selectedColor?.color_name || '-'}
                  </Text>

                  <Text
                    style={[
                      styles.stockText,
                      isOutOfStock && styles.outOfStockText,
                    ]}
                  >
                    {isOutOfStock ? 'Out of Stock' : `Stock Available: ${selectedStock}`}
                  </Text>

                  <View style={styles.modalQuantityRow}>
                    <TouchableOpacity
                      style={styles.modalQtyButton}
                      onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                    >
                      <Text style={styles.modalQtyButtonText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.modalQtyText}>{quantity}</Text>

                    <TouchableOpacity
                      style={[
                        styles.modalQtyButton,
                        quantity >= selectedStock && styles.disabledQtyButton,
                      ]}
                      disabled={quantity >= selectedStock || isOutOfStock}
                      onPress={() => setQuantity(prev => Math.min(selectedStock, prev + 1))}
                    >
                      <Text style={styles.modalQtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.viewBagButton,
                  isOutOfStock && styles.viewBagButtonDisabled,
                ]}
                disabled={isOutOfStock}
                activeOpacity={0.8}
                onPress={async () => {
                  try {
                    await addToCartApi(
                      signedInUser.user_id,
                      selectedColor.product_color_id,
                      quantity,
                    );

                    handleCloseAddToBag();
                    navigation.navigate('ShoppingBag');
                  } catch (error) {
                    console.log('Add to cart error:', error);
                  }
                }}
              >
                <Text style={styles.viewBagText}>View Bag</Text>
                <Icon name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  headerRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: BG,
  },

  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 96,
  },

  imageCard: {
    width: '100%',
    height: 292,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW,
  },

  productImage: {
    width: '92%',
    height: '88%',
  },

  placeholderText: {
    fontSize: 14,
    color: GREY,
    fontFamily: 'Inter',
  },

  infoWrap: {
    marginBottom: 18,
  },

  priceSoldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  price: {
    fontSize: 22,
    fontWeight: '800',
    color: ORANGE,
    fontFamily: 'Inter',
  },

  soldInline: {
    fontSize: 12,
    color: SOFT_TEXT,
    fontFamily: 'Inter',
  },

  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: BLUE,
    fontFamily: 'Inter',
  },

  sectionBlock: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  colorButton: {
    borderWidth: 1,
    borderColor: '#C9D0E3',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },

  selectedColorButton: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  colorButtonText: {
    fontSize: 13,
    color: '#222222',
    fontFamily: 'Inter',
    fontWeight: '600',
  },

  selectedColorButtonText: {
    color: '#FFFFFF',
  },

  disabledColorButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#CCCCCC',
  },

  disabledColorText: {
    color: '#999999',
  },

  noColorText: {
    fontSize: 13,
    color: GREY,
    fontFamily: 'Inter',
  },

  specText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 25,
    fontFamily: 'Inter',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ratingMain: {
    fontSize: 14,
    color: '#F3A000',
    fontWeight: '700',
    fontFamily: 'Inter',
    marginRight: 4,
  },

  ratingSub: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    marginRight: 8,
  },

  ratingDivider: {
    fontSize: 14,
    color: '#B0B0B0',
    marginRight: 8,
  },

  ratingInfo: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },

  noReviewText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  reviewLink: {
    fontSize: 12,
    color: ORANGE,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  relatedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  relatedCard: {
    width: '48%',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW,
  },

  relatedImageWrap: {
    width: '100%',
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  relatedImage: {
    width: '100%',
    height: '100%',
  },

  relatedPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  relatedName: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'Inter',
    lineHeight: 17,
  },

  likeText: {
    fontSize: 12,
    color: '#444444',
    fontFamily: 'Inter',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  addToCartButton: {
    backgroundColor: ORANGE,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...SHADOW,
  },

  cartIcon: {
    marginRight: 8,
  },

  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },

  addToBagSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },

  addToBagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  addToBagTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ORANGE,
    fontFamily: 'Inter',
    letterSpacing: 0.4,
  },

  addToBagContent: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  addToBagImageBox: {
    width: 82,
    height: 82,
    borderWidth: 1,
    borderColor: '#D9E3F5',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  addToBagImage: {
    width: '88%',
    height: '88%',
  },

  addToBagInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  addToBagPrice: {
    fontSize: 13,
    color: BLUE,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  addToBagName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  addToBagColor: {
    fontSize: 11,
    color: '#666666',
    fontFamily: 'Inter',
  },

  stockText: {
    fontSize: 11,
    color: BLUE,
    marginTop: 4,
    fontFamily: 'Inter',
  },

  outOfStockText: {
    color: ORANGE,
    fontWeight: '700',
  },

  modalQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  modalQtyButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalQtyButtonText: {
    color: ORANGE,
    fontSize: 17,
    fontWeight: '700',
  },

  modalQtyText: {
    minWidth: 34,
    textAlign: 'center',
    fontSize: 14,
    color: BLUE,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  disabledQtyButton: {
    borderColor: '#CCCCCC',
    backgroundColor: '#EEEEEE',
  },

  viewBagButton: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  viewBagButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },

  viewBagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
});