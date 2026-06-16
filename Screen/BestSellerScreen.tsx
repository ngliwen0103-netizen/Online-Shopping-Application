import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAllProducts, getColorsByProductId } from '../database';
import { getBestSellersApi, getProductReviewSummaryApi } from '../cloudApi';
import { imageMap } from '../imageMap';

const BLUE = '#272C78';
const ORANGE = '#C94B4C';
const DARK = '#1E1E1E';
const GREY = '#7C7C7C';
const LIGHT_BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const categoryFilters = [
  { key: 'all', label: 'All' },
  { key: 'mouse', label: 'Mouse' },
  { key: 'keyboard', label: 'Keyboard' },
  { key: 'audio', label: 'Audio' },
  { key: 'monitor', label: 'Monitor' },
];

const sortOptions = [
  { key: 'topRated', label: 'Top Rated', icon: 'star-outline' },
  { key: 'mostSold', label: 'Most Sold', icon: 'trending-up-outline' },
  { key: 'price', label: 'Price', icon: 'pricetag-outline' },
];

const BestSellerScreen = ({ navigation, route }: any) => {
  const { signedInUser } = route.params || {};
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('mostSold');

   const displayName =
    signedInUser?.username && signedInUser.username.trim().length > 0
      ? signedInUser.username.trim()
      : null;

  const avatarLetter = displayName
    ? displayName.charAt(0).toUpperCase()
    : null;

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
  try {
    const bestSellerRows = await getBestSellersApi();
    const productList = await getAllProducts();

    const bestSellerProducts = await Promise.all(
      bestSellerRows.map(async (row: any, index: number) => {
        for (const product of productList) {
          const colors = await getColorsByProductId(product.product_id);

          const matchedColor = colors.find(
            (color: any) => color.product_color_id === row.product_color_id,
          );

          if (matchedColor) {
            const reviewSummary = await getProductReviewSummaryApi(product.product_id);

            return {
              ...product,
              rank: index + 1,
              sold_count: row.sold_count,
              best_color_name: matchedColor.color_name,
              best_color_image: matchedColor.image_url || product.image_url,
              average_rating: Number(reviewSummary?.average_rating || 0),
              review_count: Number(reviewSummary?.review_count || 0),
            };
          }
        }
        return null;
      }),
    );

    setBestSellers(bestSellerProducts.filter(Boolean));
  } catch (error) {
    console.log('Error loading best sellers:', error);
  }
};

  const normalizeCategory = (value: string) => {
    const text = value.toLowerCase();

    if (text.includes('mouse')) return 'mouse';
    if (text.includes('keyboard')) return 'keyboard';
    if (text.includes('audio') || text.includes('headset') || text.includes('ear')) return 'audio';
    if (text.includes('monitor')) return 'monitor';

    return 'all';
  };

  const filteredAndSortedProducts = useMemo(() => {
    let items = [...bestSellers];

    if (selectedCategory !== 'all') {
      items = items.filter((item: any) => {
        const rawCategory =
          item.category_name || item.category || item.categoryLabel || '';
        return normalizeCategory(rawCategory) === selectedCategory;
      });
    }

    if (selectedSort === 'topRated') {
      items.sort(
        (a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0),
      );
    } else if (selectedSort === 'mostSold') {
      items.sort(
        (a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0),
      );
    } else if (selectedSort === 'price') {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    return items.map((item, index) => ({
      ...item,
      displayRank: index + 1,
    }));
  }, [bestSellers, selectedCategory, selectedSort]);

  const renderFilterChip = (item: { key: string; label: string }) => {
    const active = selectedCategory === item.key;

    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.filterChip, active && styles.filterChipActive]}
        activeOpacity={0.85}
        onPress={() => setSelectedCategory(item.key)}
      >
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSortChip = (item: { key: string; label: string; icon: string }) => {
    const active = selectedSort === item.key;

    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.sortChip, active && styles.sortChipActive]}
        activeOpacity={0.85}
        onPress={() => setSelectedSort(item.key)}
      >
        <Icon
          name={item.icon}
          size={18}
          color={active ? '#FFFFFF' : BLUE}
          style={styles.sortIcon}
        />
        <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
          {item.label}
        </Text>
        <Icon
          name="chevron-down-outline"
          size={16}
          color={active ? '#FFFFFF' : BLUE}
        />
      </TouchableOpacity>
    );
  };

  const renderProductCard = ({ item }: any) => {
    const imageSource = imageMap[item.best_color_image] || imageMap[item.image_url];
    const rawCategory = item.category_name || item.category || '';
    const categoryLabel =
      rawCategory && typeof rawCategory === 'string'
        ? rawCategory.replace(/^Gaming\s+/i, '')
        : '';

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{item.displayRank}</Text>
        </View>

        {categoryLabel ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
          </View>
        ) : null}

        <View style={styles.productImageWrap}>
          {imageSource ? (
            <Image source={imageSource} style={styles.productImage} resizeMode="contain" />
          ) : (
            <Text style={styles.placeholderText}>No Image</Text>
          )}
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name || item.product_name}
        </Text>

        <Text style={styles.productPrice}>RM {Number(item.price || 0).toFixed(2)}</Text>

        <View style={styles.productMetaRow}>
          <Text style={styles.ratingText}>
            ★ {Number(item.average_rating).toFixed(1)}
          </Text>
          <Text style={styles.soldText}>{item.sold_count || 0} sold</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={BLUE} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Best Sellers</Text>

          <View style={styles.headerRight}>
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

      <FlatList
        data={filteredAndSortedProducts}
        keyExtractor={(item) => `${item.product_id}-${item.displayRank}`}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {categoryFilters.map(renderFilterChip)}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortRow}
            >
              {sortOptions.map(renderSortChip)}
            </ScrollView>
          </View>
        }
        renderItem={renderProductCard}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No best sellers found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default BestSellerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  stickyHeader: {
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 16,
    paddingTop: 12,
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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginLeft: 8,
    fontSize: 22,
    fontWeight: '800',
    color: BLUE,
    fontFamily: 'Inter',
  },

  headerRight: {
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

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },

  filterRow: {
    paddingBottom: 14,
    paddingRight: 8,
  },

  filterChip: {
    minWidth: 102,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginRight: 12,
  },

  filterChipActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  filterChipText: {
    color: GREY,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  filterChipTextActive: {
    color: '#FFFFFF',
  },

  sortRow: {
    paddingBottom: 18,
    paddingRight: 8,
  },

  sortChip: {
    minWidth: 150,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    ...SHADOW,
  },

  sortChipActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  sortIcon: {
    marginRight: 8,
  },

  sortChipText: {
    flex: 1,
    color: BLUE,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  sortChipTextActive: {
    color: '#FFFFFF',
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48%',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW,
  },

  rankBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 5,
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  rankText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  categoryBadge: {
    position: 'absolute',
    top: 14,
    right: 12,
    zIndex: 5,
    backgroundColor: '#F1F2FB',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  categoryBadgeText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  productImageWrap: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    minHeight: 40,
    marginBottom: 10,
    fontFamily: 'Inter',
  },

  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: ORANGE,
    marginBottom: 10,
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
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
  },

  placeholderText: {
    fontSize: 12,
    color: BLUE,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  emptyWrap: {
    paddingVertical: 50,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: GREY,
    fontFamily: 'Inter',
  },
});