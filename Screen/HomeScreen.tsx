import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  getAllCategories,
  getRandomProducts,
  getLatestProducts,
  getColorsByProductId,
  getAllProducts,
} from '../database';
import { imageMap } from '../imageMap';
import { getSoldCountApi, getBestSellersApi } from '../cloudApi';

const ORANGE = '#C94B4C';
const BLUE = '#272C78';
const GREY = '#9E9E9E';
const DARK = '#1E1E1E';
const LIGHT_BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';

const HomeScreen = ({ navigation, signedInUser }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);

  useEffect(() => {
    loadCategories().catch(error => {
      console.log('Category load failed:', error);
    });

    loadProducts().catch(error => {
      console.log('Product load failed:', error);
    });

    loadLatestProducts().catch(error => {
      console.log('Latest product load failed:', error);
    });

    loadBestSellers().catch(error => {
      console.log('Best seller load failed:', error);
    });
  }, []);

  const loadProducts = async () => {
    try {
      const productList = await getRandomProducts();

      const productsWithSold = await Promise.all(
        productList.map(async (item: any) => {
          const colors = await getColorsByProductId(item.product_id);
          const colorIds = colors.map((color: any) => color.product_color_id);
          const soldCount = await getSoldCountApi(colorIds);

          return {
            ...item,
            sold_count: soldCount,
          };
        }),
      );

      setProducts(productsWithSold);
    } catch (error) {
      console.log('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await getAllCategories();
      console.log('categories = ', categoryList);
      setCategories(categoryList);
    } catch (error) {
      console.log('Error loading categories:', error);
    }
  };

  const loadLatestProducts = async () => {
    try {
      const latestList = await getLatestProducts();
      console.log('latest products = ', latestList);
      setLatestProducts(latestList);
    } catch (error) {
      console.log('Error loading latest products:', error);
    }
  };

  const loadBestSellers = async () => {
    try {
      const bestSellerRows = await getBestSellersApi();
      const productList = await getAllProducts();

      const bestSellerProducts = await Promise.all(
        bestSellerRows.map(async (row: any) => {
          for (const product of productList) {
            const colors = await getColorsByProductId(product.product_id);

            const matchedColor = colors.find(
              (color: any) => color.product_color_id === row.product_color_id,
            );

            if (matchedColor) {
              return {
                ...product,
                sold_count: row.sold_count,
                best_color_name: matchedColor.color_name,
                best_color_image: matchedColor.image_url || product.image_url,
              };
            }
          }

          return null;
        }),
      );

      setBestSellers(bestSellerProducts.filter(item => item !== null));
    } catch (error) {
      console.log('Error loading best sellers:', error);
    }
  };

  const goToShowAll = (title: string, type: string) => {
    navigation.navigate('ShopAll', { title, type });
  };

  const displayName =
    signedInUser?.username && signedInUser.username.trim().length > 0
      ? signedInUser.username.trim()
      : null;

  const avatarLetter = displayName
    ? displayName.charAt(0).toUpperCase()
    : null;

  const renderSectionHeader = (
    leftBlue: string,
    rightOrange?: string,
    onPress?: () => void,
  ) => (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionTitleWrap}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>
          <Text style={styles.blueText}>{leftBlue}</Text>
          {rightOrange ? <Text style={styles.orangeText}> {rightOrange}</Text> : null}
        </Text>
      </View>

      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderLatestItem = (item: any) => {
    const imageSource = imageMap[item.image_url];

    return (
      <TouchableOpacity
        key={item.product_id}
        style={styles.latestCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.latestImageWrap}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.latestImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholderText}>No Image</Text>
          )}
        </View>

        <Text style={styles.latestLabel} numberOfLines={2}>
          {item.name || item.product_name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = (item: any) => {
    const imageSource = imageMap[item.image_url];

    return (
      <TouchableOpacity
        key={item.category_id}
        style={styles.categoryCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Category', {
            category: item,
            fromMenu: false,
          })
        }
      >
        <View style={styles.categoryIconWrap}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.categoryScrollImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholderText}>No Icon</Text>
          )}
        </View>

        <Text style={styles.categoryScrollName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductItem = (item: any) => {
    const imageSource = imageMap[item.image_url];

    return (
      <TouchableOpacity
        key={item.product_id}
        style={styles.productCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.productImageWrap}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholderText}>No Image</Text>
          )}
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name || item.product_name}
        </Text>

        <Text style={styles.productPrice}>RM {Number(item.price).toFixed(2)}</Text>

        <View style={styles.productMetaRow}>
          <Text style={styles.ratingText}>
            ★ {Number(item.average_rating || 0).toFixed(1)}
          </Text>
          <Text style={styles.soldText}>{item.sold_count || 0} sold</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBestSellerItem = (item: any) => {
    const imageSource = imageMap[item.best_color_image] || imageMap[item.image_url];

    return (
      <TouchableOpacity
        key={item.product_id}
        style={styles.bestSellerCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.bestSellerImageWrap}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.bestSellerImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholderText}>No Image</Text>
          )}
        </View>

        <Text style={styles.bestSellerName} numberOfLines={2}>
          {item.name || item.product_name}
        </Text>

        <Text style={styles.bestSellerColor}>
          Top color: {item.best_color_name}
        </Text>

        <View style={styles.soldBadge}>
          <Text style={styles.soldBadgeText}>{item.sold_count || 0} sold</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.welcomeText}>
              {displayName ? 'Welcome back' : 'Welcome,'}
            </Text>
            <Text style={styles.hello}>
              {displayName ? `Hello, ${displayName}` : 'Guest'}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Icon name="search-outline" size={28} color={BLUE} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (signedInUser) {
                  navigation.navigate('MyAccount');
                } else {
                  navigation.navigate('SignIn');
                }
              }}
            >
              <View style={styles.headerAvatar}>
                {avatarLetter ? (
                  <Text style={styles.headerAvatarText}>{avatarLetter}</Text>
                ) : (
                  <Icon name="person-outline" size={20} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSectionHeader('NEW', 'ARRIVALS', () =>
          goToShowAll('New Arrivals', 'latest'),
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.latestScrollContent}
        >
          {latestProducts.map(renderLatestItem)}
        </ScrollView>

        <TouchableOpacity
          style={styles.bestSellerBanner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('BestSeller', { signedInUser })}
        >
          <View style={styles.bestSellerBannerLeft}>
            <View style={styles.trophyWrap}>
              <Icon name="trophy-outline" size={22} color="#FFFFFF" />
            </View>

            <View>
              <Text style={styles.bestSellerBannerTitle}>BEST SELLERS</Text>
              <Text style={styles.bestSellerBannerSub}>
                Browse the most popular gear
              </Text>
            </View>
          </View>

          <Icon name="chevron-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>


        {renderSectionHeader('CATEGORIES')}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map(renderCategoryItem)}
        </ScrollView>

        {renderSectionHeader('RECOMMENDED', undefined, () =>
          goToShowAll('Recommended', 'random'),
        )}

        <View style={styles.productContainer}>
          {products.map(renderProductItem)}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Shopping at Relm</Text>

          <View style={styles.infoCard}>
            <TouchableOpacity style={styles.infoItemRow} onPress={() => navigation.navigate('FAQ')}>
              <Icon name="chatbubble-ellipses-outline" size={20} color={BLUE} />
              <Text style={styles.infoItem}>FAQs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoItemRow}
              onPress={() => navigation.navigate('OrderDelivery')}
            >
              <Icon name="car-outline" size={20} color={BLUE} />
              <Text style={styles.infoItem}>Order & Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoItemRow}
              onPress={() => navigation.navigate('ReturnRefund')}
            >
              <Icon name="refresh-circle-outline" size={20} color={BLUE} />
              <Text style={styles.infoItem}>Returns & Refunds</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  stickyHeader: {
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 20,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },

  welcomeText: {
    fontSize: 14,
    color: GREY,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  hello: {
    fontSize: 25,
    fontWeight: '800',
    color: BLUE,
    fontFamily: 'Inter',
  },

  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchButton: {
    marginRight: 12,
  },

  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },

  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionAccent: {
    width: 4,
    height: 22,
    borderRadius: 4,
    backgroundColor: ORANGE,
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BLUE,
    fontFamily: 'Inter',
  },

  blueText: {
    color: BLUE,
  },

  orangeText: {
    color: ORANGE,
  },

  viewAllText: {
    fontSize: 14,
    color: BLUE,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  latestScrollContent: {
    paddingRight: 10,
    paddingBottom: 18,
  },

  latestCard: {
    width: 160,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 12,
    marginRight: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  latestImageWrap: {
    width: '100%',
    height: 118,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  latestImage: {
    width: '100%',
    height: '100%',
  },

  latestLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    fontFamily: 'Inter',
  },

  bestSellerBanner: {
    backgroundColor: BLUE,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  bestSellerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trophyWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  bestSellerBannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  bestSellerBannerSub: {
    color: '#E6EAF7',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Inter',
  },

  bestSellerScrollContent: {
    paddingRight: 10,
    paddingBottom: 16,
  },

  bestSellerCard: {
    width: 160,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  bestSellerImageWrap: {
    width: '100%',
    height: 95,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  bestSellerImage: {
    width: '100%',
    height: '100%',
  },

  bestSellerName: {
    fontSize: 13,
    fontWeight: '700',
    color: BLUE,
    fontFamily: 'Inter',
    minHeight: 36,
  },

  bestSellerColor: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
    fontFamily: 'Inter',
  },

  soldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },

  soldBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  categoryScrollContent: {
    paddingRight: 10,
    paddingBottom: 16,
  },

  categoryCard: {
    width: 116,
    marginRight: 14,
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  categoryIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#F7F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  categoryScrollImage: {
    width: 42,
    height: 42,
  },

  categoryScrollName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter',
  },

  productContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48%',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  productImageWrap: {
    width: '100%',
    height: 132,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: ORANGE,
    marginBottom: 6,
    fontFamily: 'Inter',
  },

  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    minHeight: 38,
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  productMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ratingText: {
    fontSize: 12,
    color: '#F3A000',
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  soldText: {
    fontSize: 11,
    color: '#999999',
    fontFamily: 'Inter',
  },

  placeholderText: {
    fontSize: 12,
    color: BLUE,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  infoSection: {
    marginTop: 4,
  },

  infoTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
  },

  infoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  infoItem: {
    fontSize: 14,
    color: BLUE,
    marginLeft: 10,
    fontWeight: '600',
  },
});