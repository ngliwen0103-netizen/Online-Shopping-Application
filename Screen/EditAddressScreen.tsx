import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { updateAddressApi } from '../cloudApi';
import AppBackHeader from '../Components/AppBackHeader';
import AppModal from '../Components/AppModal';
import FormInputRow from '../Components/FormInputRow';

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

const cityOptions = [
  'Bandar Sungai Long',
  'Kajang',
  'Cheras',
  'Bandar Mahkota Cheras',
  'Balakong',
];

const stateOptions = ['Selangor', 'Kuala Lumpur'];

const EditAddressScreen = ({ navigation, route }: any) => {
  const address = route.params?.address;

  const originalData = {
    addressLine1: address?.address_line1 || '',
    addressLine2: address?.address_line2 || '',
    city: address?.city || '',
    stateName: address?.state || '',
    postcode: address?.postcode || '',
    fullName: address?.recipient_name || '',
    phone: address?.phone || '',
    isDefault: address?.is_default === 1,
  };

  const [addressLine1, setAddressLine1] = useState(originalData.addressLine1);
  const [addressLine2, setAddressLine2] = useState(originalData.addressLine2);
  const [city, setCity] = useState(originalData.city);
  const [stateName, setStateName] = useState(originalData.stateName);
  const [postcode, setPostcode] = useState(originalData.postcode);
  const [fullName, setFullName] = useState(originalData.fullName);
  const [phone, setPhone] = useState(originalData.phone);
  const [isDefault, setIsDefault] = useState(originalData.isDefault);

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');

  const isChanged = useMemo(() => {
    return (
      addressLine1.trim() !== originalData.addressLine1 ||
      addressLine2.trim() !== originalData.addressLine2 ||
      city !== originalData.city ||
      stateName !== originalData.stateName ||
      postcode.trim() !== originalData.postcode ||
      fullName.trim() !== originalData.fullName ||
      phone.trim() !== originalData.phone ||
      isDefault !== originalData.isDefault
    );
  }, [
    addressLine1,
    addressLine2,
    city,
    stateName,
    postcode,
    fullName,
    phone,
    isDefault,
  ]);

  const showAppMessage = (title: string, message: string) => {
    setMessageTitle(title);
    setMessageText(message);
    setShowMessageModal(true);
  };

  const handleBack = () => {
    if (isChanged) {
      setShowLeaveModal(true);
    } else {
      navigation.navigate('AddressSelection', {
        from: route?.params?.from || 'account',
        cartItems: route?.params?.cartItems || [],
      });
    }
  };

  const handleUpdate = async () => {
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !postcode.trim()
    ) {
      showAppMessage('Notice', 'Please fill in all required fields.');
      return;
    }

    try {
      await updateAddressApi(address.address_id, {
        recipient_name: fullName.trim(),
        phone: phone.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim(),
        city: city.trim(),
        state: stateName.trim(),
        postcode: postcode.trim(),
        is_default: isDefault ? 1 : 0,
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      console.log('Update address error:', error);
      showAppMessage('Error', error?.data?.message || 'Unable to update address.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="Edit Address"
        onPressBack={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Address Details</Text>

          <FormInputRow
            label="Address Line 1"
            iconName="home-outline"
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Enter address line 1"
          />

          <FormInputRow
            label="Address Line 2 (Optional)"
            iconName="business-outline"
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Enter address line 2"
          />

          <Text style={styles.label}>City</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => {
              setShowCityDropdown(!showCityDropdown);
              setShowStateDropdown(false);
            }}
            activeOpacity={0.85}
          >
            <Text style={city ? styles.dropdownText : styles.placeholderText}>
              {city || 'Select City'}
            </Text>
            <Icon name="chevron-down" size={16} color="#555555" />
          </TouchableOpacity>

          {showCityDropdown && (
            <View style={styles.dropdownBox}>
              {cityOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    index === cityOptions.length - 1 && styles.lastDropdownItem,
                  ]}
                  onPress={() => {
                    setCity(item);
                    setShowCityDropdown(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>State</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => {
              setShowStateDropdown(!showStateDropdown);
              setShowCityDropdown(false);
            }}
            activeOpacity={0.85}
          >
            <Text
              style={stateName ? styles.dropdownText : styles.placeholderText}
            >
              {stateName || 'Select State'}
            </Text>
            <Icon name="chevron-down" size={16} color="#555555" />
          </TouchableOpacity>

          {showStateDropdown && (
            <View style={styles.dropdownBox}>
              {stateOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    index === stateOptions.length - 1 && styles.lastDropdownItem,
                  ]}
                  onPress={() => {
                    setStateName(item);
                    setShowStateDropdown(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <FormInputRow
            label="Postal Code"
            iconName="mail-open-outline"
            value={postcode}
            onChangeText={setPostcode}
            keyboardType="number-pad"
            placeholder="Enter postal code"
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <FormInputRow
            label="Full Name"
            iconName="person-outline"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
          />

          <FormInputRow
            label="Phone Number"
            iconName="call-outline"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
          />

          <View style={styles.defaultRow}>
            <View style={styles.defaultTextWrap}>
              <Text style={styles.defaultTitle}>Set as Default Address</Text>
              <Text style={styles.defaultSubtitle}>
                Use this address as your primary address
              </Text>
            </View>

            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: '#DADADA', true: '#F2B7B0' }}
              thumbColor={isDefault ? ORANGE : '#FFFFFF'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleUpdate}
          activeOpacity={0.85}
        >
          <Icon
            name="save-outline"
            size={18}
            color="#FFFFFF"
            style={styles.submitIcon}
          />
          <Text style={styles.submitText}>Update Address</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppModal
        visible={showSuccessModal}
        title="Address Updated"
        message="Your address details have been updated successfully."
        iconName="checkmark-circle-outline"
        primaryButtonText="OK"
        onPrimaryPress={() => {
          setShowSuccessModal(false);
          navigation.navigate('AddressSelection', {
            from: route?.params?.from || 'account',
            cartItems: route?.params?.cartItems || [],
          });
        }}
      />

      <AppModal
        visible={showLeaveModal}
        title="Discard Changes?"
        message="Your changes will not be saved. Are you sure you want to leave?"
        iconName="alert-circle-outline"
        primaryButtonText="Leave"
        onPrimaryPress={() => {
          setShowLeaveModal(false);
          navigation.goBack();
        }}
        secondaryButtonText="Stay"
        onSecondaryPress={() => setShowLeaveModal(false)}
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

export default EditAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },

  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 16,
    ...SHADOW,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 14,
    fontFamily: 'Inter',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: BLUE,
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  dropdownInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  dropdownText: {
    fontSize: 14,
    color: DARK,
    fontFamily: 'Inter',
  },

  placeholderText: {
    fontSize: 14,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  dropdownBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
  },

  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  lastDropdownItem: {
    borderBottomWidth: 0,
  },

  dropdownItemText: {
    fontSize: 13,
    color: DARK,
    fontFamily: 'Inter',
  },

  defaultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  defaultTextWrap: {
    flex: 1,
    paddingRight: 14,
  },

  defaultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    fontFamily: 'Inter',
  },

  defaultSubtitle: {
    fontSize: 12,
    color: GREY_TEXT,
    marginTop: 4,
    lineHeight: 17,
    fontFamily: 'Inter',
  },

  submitButton: {
    backgroundColor: ORANGE,
    minHeight: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOW,
  },

  submitIcon: {
    marginRight: 8,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});