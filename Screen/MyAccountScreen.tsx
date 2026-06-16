import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getOrdersByUserApi } from '../cloudApi';
import { useFocusEffect } from '@react-navigation/native';

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

const MyAccountScreen = ({ navigation, signedInUser, setSignedInUser }: any) => {
  const user = signedInUser;
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [toReceiveCount, setToReceiveCount] = useState(0);

  const displayName =
    user?.username?.trim() ||
    user?.name?.trim() ||
    user?.email?.trim() ||
    null;

  const avatarLetter = displayName
    ? displayName.charAt(0).toUpperCase()
    : null;

  const loadOrderCount = async () => {
    if (!signedInUser) return;

    try {
      const result = await getOrdersByUserApi(signedInUser.user_id);

      const count = result.filter(
        (item: any) => item.status !== 'Completed'
      ).length;

      setToReceiveCount(count);
    } catch (error) {
      console.log('Load order count error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrderCount();
    }, [signedInUser])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stickyHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Icon name="chevron-back" size={22} color={BLUE} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Account</Text>

          <View style={styles.headerRightSpace} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ManageMyAccount')}
        >
          <View style={styles.profileTopRow}>
            <View style={styles.avatar}>
              {avatarLetter ? (
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              ) : (
                <Icon name="person-outline" size={28} color="#FFFFFF" />
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{displayName || 'Guest User'}</Text>
              <Text style={styles.email}>{user?.email || '-'}</Text>
            </View>

            <Icon name="chevron-forward" size={20} color={BLUE} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>My Purchases</Text>

        <View style={styles.orderCard}>
          <TouchableOpacity
            style={styles.orderItem}
            onPress={() => navigation.navigate('MyPurchase', { tab: 'toReceive' })}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrapper}>
              <Icon name="cube-outline" size={26} color={BLUE} />

              {toReceiveCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {toReceiveCount > 99 ? '99+' : toReceiveCount}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.orderText}>To Receive</Text>
          </TouchableOpacity>

          <View style={styles.orderDividerVertical} />

          <TouchableOpacity
            style={styles.orderItem}
            onPress={() =>
              navigation.navigate('MyPurchase', {
                tab: 'completed',
              })
            }
            activeOpacity={0.85}
          >
            <View style={styles.iconWrapper}>
              <Icon name="checkmark-done-outline" size={26} color={BLUE} />
            </View>

            <Text style={styles.orderText}>Completed</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>My Account</Text>

        <View style={styles.menuCard}>
          <MenuRow
            title="Address Book"
            icon="location-outline"
            onPress={() =>
              navigation.navigate('AddressSelection', {
                from: 'account',
              })
            }
          />
          <MenuRow
            title="Manage My Account"
            icon="person-circle-outline"
            onPress={() => navigation.navigate('ManageMyAccount')}
          />
          <MenuRow
            title="My Reviews"
            icon="chatbubble-ellipses-outline"
            onPress={() => navigation.navigate('MyReviews')}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Terms</Text>

        <View style={styles.menuCard}>
          <MenuRow
            title="Privacy & Cookie Policy"
            icon="shield-checkmark-outline"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <MenuRow
            title="Terms & Conditions"
            icon="document-text-outline"
            onPress={() => navigation.navigate('TermsOfUse')}
            isLast
          />
        </View>

        <TouchableOpacity
          style={styles.signOut}
          activeOpacity={0.85}
          onPress={() => setShowSignOutModal(true)}
        >
          <Icon name="log-out-outline" size={18} color="#FFFFFF" style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showSignOutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopIconWrap}>
              <Icon name="log-out-outline" size={24} color={ORANGE} />
            </View>

            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setShowSignOutModal(false);
                  setSignedInUser(null);

                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'RootDrawer' }],
                  });
                }}
              >
                <Text style={styles.confirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const MenuRow = ({ title, icon, onPress, isLast = false }: any) => (
  <TouchableOpacity
    style={[styles.rowItem, isLast && styles.lastRowItem]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.rowLeft}>
      <Icon name={icon} size={20} color="#272c78" style={styles.rowIcon} />
      <Text style={styles.rowText}>{title}</Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#272c78" />
  </TouchableOpacity>
);

export default MyAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  stickyHeader: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 10,
  },

  header: {
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
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    ...SHADOW,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BLUE,
    fontFamily: 'Inter',
    letterSpacing: 0.3,
  },

  headerRightSpace: {
    width: 38,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },

  profileCard: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 20,
    ...SHADOW,
  },

  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BLUE,
    marginRight: 14,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  email: {
    fontSize: 14,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  orderCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    ...SHADOW,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  orderItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },

  orderDividerVertical: {
    width: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },

  iconWrapper: {
    position: 'relative',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: -8,
    right: -18,
    backgroundColor: ORANGE,
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 5,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  orderText: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    fontFamily: 'Inter',
  },

  menuCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    overflow: 'hidden',
    ...SHADOW,
  },

  rowItem: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastRowItem: {
    borderBottomWidth: 0,
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  rowIcon: {
    marginRight: 10,
  },

  rowText: {
    fontSize: 15,
    color: DARK,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  signOut: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOW,
  },

  signOutIcon: {
    marginRight: 8,
  },

  signOutText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
  },

  modalTopIconWrap: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF3F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 20,
    color: BLUE,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  modalMessage: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    fontFamily: 'Inter',
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelButton: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 13,
    alignItems: 'center',
  },

  confirmButton: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: ORANGE,
    paddingVertical: 13,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 14,
    color: BLUE,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  confirmText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});