import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { getAddressesByUserApi, deleteAddressApi } from '../cloudApi';

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

const AddressSelectionScreen = ({ navigation, route, signedInUser }: any) => {
  const cartItems = route?.params?.cartItems || [];
  const from = route?.params?.from || 'checkout';
  const isFromAccount = from === 'account';

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const loadAddresses = async () => {
    try {
      if (!signedInUser) return;

      const result = await getAddressesByUserApi(signedInUser.user_id);
      setAddresses(result);
    } catch (error) {
      console.log('Load addresses error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [signedInUser])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Icon name="chevron-back" size={22} color={BLUE} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Address Selection</Text>

          <View style={styles.headerRightSpace} />
        </View>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="location-outline" size={36} color={GREY_TEXT} />
          </View>
          <Text style={styles.emptyTitle}>No address yet</Text>
          <Text style={styles.emptyText}>
            Please add a delivery address before placing your order.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.addressList}
        >
          {addresses.map((item, index) => (
            <View key={index} style={styles.addressCard}>
              <TouchableOpacity
                style={[
                  styles.radioCircle,
                  selectedAddressId === item.address_id && styles.radioCircleSelected,
                ]}
                onPress={() => {
                  setSelectedAddressId(item.address_id);

                  if (!isFromAccount) {
                    navigation.navigate('Checkout', {
                      selectedAddress: item,
                      cartItems,
                    });
                  }
                }}
                activeOpacity={0.85}
              >
                {selectedAddressId === item.address_id && <View style={styles.radioDot} />}
              </TouchableOpacity>

              <View style={styles.addressInfo}>
                <View style={styles.topInfoRow}>
                  <View style={styles.namePhoneWrap}>
                    <Text style={styles.nameText}>{item.recipient_name}</Text>
                    <Text style={styles.phoneText}>{item.phone}</Text>
                  </View>

                  {item.is_default === 1 && (
                    <View style={styles.defaultChip}>
                      <Text style={styles.defaultLabel}>Default</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.addressText}>
                  {item.address_line1}, {item.address_line2}, {item.postcode},{' '}
                  {item.city}, {item.state}
                </Text>
              </View>

              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setDeleteTarget(item);
                    setShowDeleteModal(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Icon name="trash-outline" size={18} color={ORANGE} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate('EditAddress', {
                      address: item,
                      from,
                      cartItems,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Icon name="chevron-forward" size={20} color={BLUE} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddAddress', {
              from,
              cartItems,
            })
          }
          activeOpacity={0.85}
        >
          <Icon name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopIconWrap}>
              <Icon name="trash-outline" size={24} color={ORANGE} />
            </View>

            <Text style={styles.modalTitle}>Delete Address?</Text>

            <Text style={styles.modalText}>
              Are you sure you want to delete this address? This action cannot be undone.
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={async () => {
                  if (!deleteTarget) return;

                  try {
                    await deleteAddressApi(deleteTarget.address_id);

                    setAddresses(prev =>
                      prev.filter(addr => addr.address_id !== deleteTarget.address_id)
                    );

                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  } catch (error) {
                    console.log('Delete error:', error);
                  }
                }}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddressSelectionScreen;

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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BLUE,
    marginTop: 16,
    fontFamily: 'Inter',
  },

  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  addressList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },

  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
    ...SHADOW,
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginTop: 6,
    marginRight: 12,
  },

  radioCircleSelected: {
    borderColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLUE,
  },

  addressInfo: {
    flex: 1,
    paddingRight: 10,
  },

  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  namePhoneWrap: {
    flex: 1,
    paddingRight: 8,
  },

  defaultChip: {
    backgroundColor: '#FFF3F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  defaultLabel: {
    fontSize: 11,
    color: ORANGE,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  nameText: {
    fontSize: 14,
    color: DARK,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 2,
  },

  phoneText: {
    fontSize: 13,
    color: BLUE,
    fontFamily: 'Inter',
  },

  addressText: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 18,
    fontFamily: 'Inter',
  },

  actionColumn: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 6,
    minHeight: 62,
  },

  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },

  addButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOW,
  },

  addButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
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
    fontWeight: '800',
    color: BLUE,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  modalText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    textAlign: 'center',
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

  deleteButton: {
    width: '48%',
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },

  cancelText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});