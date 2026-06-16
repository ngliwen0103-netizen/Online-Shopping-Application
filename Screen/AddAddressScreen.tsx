import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { addAddressApi } from '../cloudApi';
import AppBackHeader from '../Components/AppBackHeader';
import AppModal from '../Components/AppModal';
import FormInputRow from '../Components/FormInputRow';

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

const addressSuggestions = [
  {
    label:
      'UTAR Sungai Long Campus, Jalan Sungai Long, Bandar Sungai Long, Selangor',
    addressLine1: 'UTAR Sungai Long Campus',
    addressLine2: 'Jalan Sungai Long',
    city: 'Bandar Sungai Long',
    state: 'Selangor',
    postcode: '43000',
  },
  {
    label:
      'BMC Mall, Jalan Temenggung, Bandar Mahkota Cheras, Selangor',
    addressLine1: 'BMC Mall',
    addressLine2: 'Jalan Temenggung',
    city: 'Bandar Mahkota Cheras',
    state: 'Selangor',
    postcode: '43200',
  },
];

const cityOptions = [
  'Bandar Sungai Long',
  'Kajang',
  'Cheras',
  'Bandar Mahkota Cheras',
  'Balakong',
];

const stateOptions = ['Selangor', 'Kuala Lumpur'];

const AddAddressScreen = ({ navigation, route, signedInUser }: any) => {
  const [searchText, setSearchText] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSearchAddress = () => {
    if (!searchText.trim()) return;
    setAddressLine1(searchText);
  };

  const handleSubmit = async () => {
    if (
      !signedInUser ||
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !postcode.trim()
    ) {
      return;
    }

    try {
      await addAddressApi({
        user_id: signedInUser.user_id,
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
    } catch (error) {
      console.log('Add address error:', error);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    setAddressLine1(item.addressLine1);
    setAddressLine2(item.addressLine2);
    setCity(item.city);
    setStateName(item.state);
    setPostcode(item.postcode);
    setSearchText('');
    setShowSuggestions(false);
  };

  const filteredSuggestions =
    searchText.trim() === ''
      ? []
      : addressSuggestions.filter(item =>
          item.label.toLowerCase().includes(searchText.toLowerCase())
        );

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="New Address"
        onPressBack={() => setShowLeaveModal(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchRow}>
          <View style={styles.searchFieldWrap}>
            <FormInputRow
              iconName="search-outline"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setShowSuggestions(true);
              }}
              placeholder="Search your address here"
              containerStyle={styles.noLabelContainer}
              inputWrapStyle={styles.searchInputWrap}
            />
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchAddress}
            activeOpacity={0.85}
          >
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {filteredSuggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionItem,
                  index === filteredSuggestions.length - 1 &&
                    styles.lastSuggestionItem,
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Icon
                  name="location-outline"
                  size={18}
                  color={ORANGE}
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
                    index === cityOptions.length - 1 &&
                      styles.lastDropdownItem,
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
                    index === stateOptions.length - 1 &&
                      styles.lastDropdownItem,
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
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Icon
            name="save-outline"
            size={18}
            color="#FFFFFF"
            style={styles.submitIcon}
          />
          <Text style={styles.submitText}>Save Address</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppModal
        visible={showLeaveModal}
        title="Discard Address?"
        message="Are you sure you want to leave? Your new address will not be saved."
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
        visible={showSuccessModal}
        title="Address Saved"
        message="Your new address has been added successfully."
        iconName="checkmark-circle-outline"
        primaryButtonText="Continue"
        onPrimaryPress={() => {
          setShowSuccessModal(false);
          navigation.navigate('AddressSelection', {
            from: route?.params?.from || 'account',
            cartItems: route?.params?.cartItems || [],
          });
        }}
      />
    </SafeAreaView>
  );
};

export default AddAddressScreen;

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

  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  searchFieldWrap: {
    flex: 1,
    marginRight: 10,
  },

  noLabelContainer: {
    marginBottom: 0,
  },

  searchInputWrap: {
    minHeight: 52,
    marginBottom: 0,
    ...SHADOW,
  },

  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },

  suggestionBox: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  lastSuggestionItem: {
    borderBottomWidth: 0,
  },

  suggestionIcon: {
    marginRight: 10,
    marginTop: 2,
  },

  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: DARK,
    lineHeight: 18,
    fontFamily: 'Inter',
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