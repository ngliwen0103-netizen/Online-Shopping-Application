import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { getAllCategories, getAllBrands } from '../database';
import { imageMap } from '../imageMap';
import AppModal from '../Components/AppModal';

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';
const GREY_TEXT = '#8A8FA3';
const DARK = '#1E1E1E';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const MenuScreen = ({ navigation, signedInUser, setSignedInUser }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showBrands, setShowBrands] = useState(false);

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      const categoryList = await getAllCategories();
      const brandList = await getAllBrands();

      setCategories(categoryList);
      setBrands(brandList);
    } catch (error) {
      console.log('Error loading menu data:', error);
    }
  };

  const displayName =
    signedInUser?.username?.trim() ||
    signedInUser?.name?.trim() ||
    signedInUser?.email?.trim() ||
    null;

  const avatarLetter = displayName
    ? displayName.charAt(0).toUpperCase()
    : null;

  const navigateToHomeStack = (screenName: string, params?: any) => {
    navigation.dispatch(DrawerActions.closeDrawer());

    setTimeout(() => {
      navigation.navigate('MainTabs', {
        screen: 'Home',
        params: {
          screen: screenName,
          params: params || {},
        },
      });
    }, 180);
  };

  const renderCategoryItem = (item: any) => {
    const imageSource = imageMap[item.image_url];

    return (
      <TouchableOpacity
        key={item.category_id}
        style={styles.subMenuRow}
        activeOpacity={0.85}
        onPress={() =>
          navigateToHomeStack('Category', {
            category: item,
            fromMenu: true,
          })
        }
      >
        <View style={styles.leftRow}>
          <View style={styles.iconBox}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.menuImage}
                resizeMode="contain"
              />
            ) : (
              <Icon name="cube-outline" size={18} color={BLUE} />
            )}
          </View>

          <Text style={styles.rowText}>{item.name}</Text>
        </View>

        <Icon name="chevron-forward" size={18} color={ORANGE} />
      </TouchableOpacity>
    );
  };

  const renderBrandItem = (item: any) => {
    const imageSource = imageMap[item.logo_url];

    return (
      <TouchableOpacity
        key={item.brand_id}
        style={styles.subMenuRow}
        activeOpacity={0.85}
        onPress={() =>
          navigateToHomeStack('Brand', {
            brand: item,
            fromMenu: true,
          })
        }
      >
        <View style={styles.leftRow}>
          <View style={styles.iconBox}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.brandImage}
                resizeMode="contain"
              />
            ) : (
              <Icon name="pricetag-outline" size={18} color={BLUE} />
            )}
          </View>

          <Text style={styles.rowText}>{item.brand_name}</Text>
        </View>

        <Icon name="chevron-forward" size={18} color={ORANGE} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
              activeOpacity={0.85}
            >
              <Icon name="chevron-back" size={22} color={BLUE} />
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
              <View style={styles.avatarCircle}>
                {avatarLetter ? (
                  <Text style={styles.avatarText}>{avatarLetter}</Text>
                ) : (
                  <Icon name="person-outline" size={20} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.greetingBlock}>
            <Text style={styles.welcomeText}>
              {displayName ? 'Welcome back,' : 'Welcome,'}
            </Text>
            <Text style={styles.helloText}>
              {displayName ? displayName : 'Guest'}
            </Text>

          </View>

          <TouchableOpacity
            style={styles.shopAllCard}
            activeOpacity={0.85}
            onPress={() =>
              navigateToHomeStack('ShopAll', {
                fromMenu: true,
              })
            }
          >
            <View style={styles.shopAllLeft}>
              <View style={styles.shopIconWrap}>
                <Icon name="grid-outline" size={20} color="#FFFFFF" />
              </View>

              <View>
                <Text style={styles.shopAllTitle}>Shop All</Text>
                <Text style={styles.shopAllSubtitle}>
                  Browse the full catalog
                </Text>
              </View>
            </View>

            <Icon name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              activeOpacity={0.85}
              onPress={() => setShowCategories(!showCategories)}
            >
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>

              <Icon
                name={showCategories ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={BLUE}
              />
            </TouchableOpacity>

            {showCategories ? (
              <View style={styles.subList}>
                {categories.map(renderCategoryItem)}
              </View>
            ) : null}
          </View>

          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              activeOpacity={0.85}
              onPress={() => setShowBrands(!showBrands)}
            >
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Brands</Text>
              </View>

              <Icon
                name={showBrands ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={BLUE}
              />
            </TouchableOpacity>

            {showBrands ? (
              <View style={styles.subList}>
                {brands.map(renderBrandItem)}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              !signedInUser && styles.logoutButtonDisabled,
            ]}
            activeOpacity={signedInUser ? 0.85 : 1}
            disabled={!signedInUser}
            onPress={() => setShowLogoutModal(true)}
          >
            <Icon
              name="log-out-outline"
              size={18}
              color={!signedInUser ? '#8A8A8A' : '#FFFFFF'}
              style={styles.logoutIcon}
            />
            <Text
              style={[
                styles.logoutText,
                !signedInUser && styles.logoutTextDisabled,
              ]}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AppModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        iconName="log-out-outline"
        primaryButtonText="Sign Out"
        onPrimaryPress={() => {
          setShowLogoutModal(false);
          setSignedInUser(null);
          navigation.dispatch(DrawerActions.closeDrawer());

          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'RootDrawer' }],
            });
          }, 150);
        }}
        secondaryButtonText="Cancel"
        onSecondaryPress={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
};

export default MenuScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW,
  },

  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  greetingBlock: {
    marginTop: 18,
    marginBottom: 18,
  },

  welcomeText: {
    fontSize: 14,
    color: GREY_TEXT,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  helloText: {
    fontSize: 25,
    color: BLUE,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  helperText: {
    fontSize: 13,
    color: GREY_TEXT,
    marginTop: 6,
    fontFamily: 'Inter',
    lineHeight: 19,
  },

  shopAllCard: {
    backgroundColor: BLUE,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOW,
  },

  shopAllLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  shopIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  shopAllTitle: {
    fontSize: 19,
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  shopAllSubtitle: {
    fontSize: 12,
    color: '#E6EAF7',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...SHADOW,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitleRow: {
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
    fontSize: 20,
    color: BLUE,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  subList: {
    marginTop: 12,
  },

  subMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F8F9FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuImage: {
    width: 28,
    height: 28,
  },

  brandImage: {
    width: 34,
    height: 20,
  },

  rowText: {
    fontSize: 14,
    color: DARK,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  bottomArea: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 8,
    backgroundColor: BG,
  },

  logoutButton: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...SHADOW,
  },

  logoutIcon: {
    marginRight: 8,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  logoutButtonDisabled: {
    backgroundColor: '#D9D9D9',
  },

  logoutTextDisabled: {
    color: '#8A8A8A',
  },
});