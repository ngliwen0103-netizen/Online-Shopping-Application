import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  getProductsByCategoryId,
  getColorsByProductId,
} from '../database';
import { imageMap } from '../imageMap';
import { DrawerActions } from '@react-navigation/native';
import { getSoldCountApi } from '../cloudApi';

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';
const TEXT_GREY = '#8A8FA3';
const DARK = '#1E1E1E';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const CategoryScreen = ({ route, navigation }: any) => {
  const { category, fromMenu } = route.params;

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState('latest');
  const sortSlideAnim = useRef(new Animated.Value(300)).current;

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const filterSlideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    loadCategoryProducts();
    setSearchText('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColorFilter('');
    setSelectedBrandFilter('');
    setSelectedSort('latest');
  }, [category?.category_id]);

  const loadCategoryProducts = async () => {
    try {
      const productList = await getProductsByCategoryId(category.category_id);

      const productsWithSold = await Promise.all(
        productList.map(async (item: any) => {
          const colors = await getColorsByProductId(item.product_id);
          const colorIds = colors.map((color: any) => color.product_color_id);
          const soldCount = await getSoldCountApi(colorIds);

          return {
            ...item,
            sold_count: soldCount,
          };
        })
      );

      setProducts(productsWithSold);
      setFilteredProducts(productsWithSold);
    } catch (error) {
      console.log('Error loading category products:', error);
    }
  };

  useEffect(() => {
    if (category?.category_id) {
      loadCategoryProducts();
      setSearchText('');
      setMinPrice('');
      setMaxPrice('');
      setSelectedColorFilter('');
      setSelectedBrandFilter('');
      setSelectedSort('latest');
    }
  }, [category?.category_id]);
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((item: any) =>
      (item.product_name || '')
        .toLowerCase()
        .includes(text.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  const handleOpenSort = () => {
    setShowSortModal(true);
    sortSlideAnim.setValue(300);

    Animated.timing(sortSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseSort = () => {
    Animated.timing(sortSlideAnim, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowSortModal(false);
    });
  };

  const handleOpenFilter = () => {
    setShowFilterModal(true);
    filterSlideAnim.setValue(300);

    Animated.timing(filterSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseFilter = () => {
    Animated.timing(filterSlideAnim, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowFilterModal(false);
    });
  };

  const handleApplySort = () => {
    const sortedList = [...filteredProducts];

    switch (selectedSort) {
      case 'latest':
        sortedList.sort((a, b) => a.product_id.localeCompare(b.product_id));
        break;
      case 'name_asc':
        sortedList.sort((a, b) =>
          (a.product_name || '').localeCompare(b.product_name || ''),
        );
        break;
      case 'name_desc':
        sortedList.sort((a, b) =>
          (b.product_name || '').localeCompare(a.product_name || ''),
        );
        break;
      case 'price_low_high':
        sortedList.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_high_low':
        sortedList.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'best_sellers':
        sortedList.sort((a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(sortedList);
    handleCloseSort();
  };

  const handleApplyFilter = () => {
    let filtered = [...products];

    if (minPrice.trim() !== '') {
      filtered = filtered.filter(
        (item: any) => Number(item.price) >= Number(minPrice),
      );
    }

    if (maxPrice.trim() !== '') {
      filtered = filtered.filter(
        (item: any) => Number(item.price) <= Number(maxPrice),
      );
    }

    if (selectedColorFilter.trim() !== '') {
      filtered = filtered.filter((item: any) =>
        (item.product_name || '')
          .toLowerCase()
          .includes(selectedColorFilter.toLowerCase()),
      );
    }

    if (selectedBrandFilter.trim() !== '') {
      filtered = filtered.filter((item: any) =>
        (item.brand_name || '')
          .toLowerCase()
          .includes(selectedBrandFilter.toLowerCase()),
      );
    }

    if (searchText.trim() !== '') {
      filtered = filtered.filter((item: any) =>
        (item.product_name || '')
          .toLowerCase()
          .includes(searchText.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
    handleCloseFilter();
  };

  const handleBack = () => {
    if (fromMenu) {
      navigation.navigate('RootDrawer');

      setTimeout(() => {
        navigation.dispatch(DrawerActions.openDrawer());
      }, 100);
    } else {
      navigation.goBack();
    }
  };

  const renderProductItem = (item: any) => {
    const imageSource = imageMap[item.image_url];

    return (
      <TouchableOpacity
        key={item.product_id}
        style={styles.productCard}
        activeOpacity={0.88}
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
            <Text style={styles.noImageText}>No Image</Text>
          )}
        </View>

        <Text style={styles.productPrice}>
          RM {Number(item.price).toFixed(2)}
        </Text>

        <Text style={styles.productName} numberOfLines={2}>
          {item.product_name}
        </Text>

        <Text style={styles.soldText}>
          {item.sold_count || 0} sold
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleBack}
            activeOpacity={0.85}
          >
            <Icon name="chevron-back" size={22} color={BLUE} />
          </TouchableOpacity>

          <Text style={styles.title}>{category.name?.toUpperCase() || 'CATEGORY'}</Text>

          <View style={styles.headerRightSpace} />
        </View>

        <View style={styles.searchCard}>
          <Icon
            name="search-outline"
            size={20}
            color={TEXT_GREY}
            style={styles.searchLeftIcon}
          />

          <TextInput
            placeholder="Search products"
            placeholderTextColor={TEXT_GREY}
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />

          <Icon name="search-outline" size={20} color={ORANGE} />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={handleOpenSort}
          >
            <Icon name="swap-vertical-outline" size={16} color="#FFFFFF" />
            <Text style={styles.filterText}>Sort</Text>
            <Icon name="chevron-down" size={14} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={handleOpenFilter}
          >
            <Icon name="options-outline" size={16} color="#FFFFFF" />
            <Text style={styles.filterText}>Filter</Text>
            <Icon name="chevron-down" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.productContainer}>
          {filteredProducts.map(renderProductItem)}
        </View>
      </ScrollView>

      <Modal
        visible={showSortModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseSort}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseSort}>
          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: sortSlideAnim }] },
            ]}
          >
            <Pressable>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>SORT</Text>

                <TouchableOpacity onPress={handleCloseSort}>
                  <Icon name="close" size={18} color={ORANGE} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.sortOptionRow}
                onPress={() => setSelectedSort('best_sellers')}
              >
                <Icon
                  name={
                    selectedSort === 'best_sellers'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={16}
                  color={selectedSort === 'best_sellers' ? ORANGE : '#BDBDBD'}
                />
                <Text style={styles.sortOptionText}>Best Sellers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOptionRow}
                onPress={() => setSelectedSort('latest')}
              >
                <Icon
                  name={selectedSort === 'latest' ? 'radio-button-on' : 'radio-button-off'}
                  size={16}
                  color={selectedSort === 'latest' ? ORANGE : '#BDBDBD'}
                />
                <Text style={styles.sortOptionText}>Latest</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOptionRow}
                onPress={() => setSelectedSort('name_asc')}
              >
                <Icon
                  name={selectedSort === 'name_asc' ? 'radio-button-on' : 'radio-button-off'}
                  size={16}
                  color={selectedSort === 'name_asc' ? ORANGE : '#BDBDBD'}
                />
                <Text style={styles.sortOptionText}>Name (A → Z)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOptionRow}
                onPress={() => setSelectedSort('name_desc')}
              >
                <Icon
                  name={selectedSort === 'name_desc' ? 'radio-button-on' : 'radio-button-off'}
                  size={16}
                  color={selectedSort === 'name_desc' ? ORANGE : '#BDBDBD'}
                />
                <Text style={styles.sortOptionText}>Name (Z → A)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOptionRow}
                onPress={() => setSelectedSort('price_low_high')}
              >
                <Icon
                  name={
                    selectedSort === 'price_low_high'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={16}
                  color={selectedSort === 'price_low_high' ? ORANGE : '#BDBDBD'}
                />
                <Text style={styles.sortOptionText}>Price (Lowest → Highest)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOptionRow}
                onPress={() => setSelectedSort('price_high_low')}
              >
                <Icon
                  name={
                    selectedSort === 'price_high_low'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={16}
                  color={selectedSort === 'price_high_low' ? ORANGE : '#BDBDBD'}
                />
                <Text style={styles.sortOptionText}>Price (Highest → Lowest)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.85}
                onPress={handleApplySort}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseFilter}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseFilter}>
          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: filterSlideAnim }] },
            ]}
          >
            <Pressable>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>FILTER</Text>

                <TouchableOpacity onPress={handleCloseFilter}>
                  <Icon name="close" size={18} color={ORANGE} />
                </TouchableOpacity>
              </View>

              <Text style={styles.filterLabel}>Min Price</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Not input"
                placeholderTextColor="#999"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />

              <Text style={styles.filterLabel}>Max Price</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Not input"
                placeholderTextColor="#999"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />

              <Text style={styles.filterLabel}>Color</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="eg. black"
                placeholderTextColor="#999"
                value={selectedColorFilter}
                onChangeText={setSelectedColorFilter}
              />

              <Text style={styles.filterLabel}>Brand</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="eg. razer"
                placeholderTextColor="#999"
                value={selectedBrandFilter}
                onChangeText={setSelectedBrandFilter}
              />

              <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.85}
                onPress={handleApplyFilter}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  stickyHeader: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 10,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW,
  },

  headerRightSpace: {
    width: 38,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: BLUE,
    fontFamily: 'Inter',
    letterSpacing: 0.3,
  },

  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 12,
    ...SHADOW,
  },

  searchLeftIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BLUE,
    fontFamily: 'Inter',
  },

  filterRow: {
    flexDirection: 'row',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    ...SHADOW,
  },

  filterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: 6,
    fontFamily: 'Inter',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },

  resultRow: {
    marginBottom: 12,
  },

  resultText: {
    fontSize: 13,
    color: TEXT_GREY,
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
    ...SHADOW,
  },

  productImageWrap: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 6,
    fontFamily: 'Inter',
  },

  productName: {
    fontSize: 13,
    color: DARK,
    fontWeight: '600',
    minHeight: 36,
    fontFamily: 'Inter',
    marginBottom: 6,
  },

  soldText: {
    fontSize: 11,
    color: '#999999',
    fontFamily: 'Inter',
  },

  noImageText: {
    fontSize: 12,
    color: BLUE,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sheetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ORANGE,
    fontFamily: 'Inter',
    letterSpacing: 0.4,
  },

  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sortOptionText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#555555',
    fontFamily: 'Inter',
  },

  applyButton: {
    backgroundColor: ORANGE,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  filterLabel: {
    fontSize: 12,
    color: BLUE,
    marginBottom: 6,
    marginTop: 8,
    fontFamily: 'Inter',
    fontWeight: '600',
  },

  filterInput: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
});