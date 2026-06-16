import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { updateUserApi } from '../cloudApi';
import AppBackHeader from '../Components/AppBackHeader';
import AppModal from '../Components/AppModal';
import FormInputRow from '../Components/FormInputRow';

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';
const GREY_TEXT = '#8A8FA3';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const ManageMyAccountScreen = ({
  navigation,
  signedInUser,
  setSignedInUser,
}: any) => {
  const [username, setUsername] = useState(signedInUser?.username || '');
  const [email, setEmail] = useState(signedInUser?.email || '');
  const [phone, setPhone] = useState(signedInUser?.phone || '');

  const [isSaving, setIsSaving] = useState(false);

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');

  const isChanged = useMemo(() => {
    return (
      username !== (signedInUser?.username || '') ||
      email !== (signedInUser?.email || '') ||
      phone !== (signedInUser?.phone || '')
    );
  }, [username, email, phone, signedInUser]);

  const displayAvatarLetter =
    username?.trim()?.length > 0
      ? username.trim().charAt(0).toUpperCase()
      : null;

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const validatePhone = (value: string) => {
    return /^[0-9+\-\s]{8,20}$/.test(value.trim());
  };

  const showAppMessage = (title: string, message: string) => {
    setMessageTitle(title);
    setMessageText(message);
    setShowMessageModal(true);
  };

  const handleBack = () => {
    if (isChanged) {
      setShowDiscardModal(true);
    } else {
      navigation.goBack();
    }
  };

  const handleUpdate = async () => {
    if (!signedInUser?.user_id) {
      showAppMessage('Error', 'User information is missing. Please sign in again.');
      return;
    }

    if (!username.trim() || !email.trim() || !phone.trim()) {
      showAppMessage('Validation', 'Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      showAppMessage('Validation', 'Please enter a valid email address.');
      return;
    }

    if (!validatePhone(phone)) {
      showAppMessage('Validation', 'Please enter a valid phone number.');
      return;
    }

    if (!isChanged) {
      showAppMessage('No Changes', 'There is nothing to update.');
      return;
    }

    try {
      setIsSaving(true);

      await updateUserApi(
        signedInUser.user_id,
        username.trim(),
        email.trim(),
        phone.trim(),
      );

      setSignedInUser({
        ...signedInUser,
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.log('Update profile error:', error);
      showAppMessage('Update Failed', 'Unable to update your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="Manage My Account"
        onPressBack={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {displayAvatarLetter ? (
              <Text style={styles.avatarText}>{displayAvatarLetter}</Text>
            ) : (
              <Icon name="person-outline" size={28} color="#FFFFFF" />
            )}
          </View>

          <Text style={styles.profileTitle}>Profile Details</Text>
          <Text style={styles.profileSubtitle}>
            Update your personal information below.
          </Text>
        </View>

        <View style={styles.formCard}>
          <FormInputRow
            label="Username"
            iconName="person-outline"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
          />

          <FormInputRow
            label="Email"
            iconName="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInputRow
            label="Phone Number"
            iconName="call-outline"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.passwordRow}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.passwordRowLeft}>
              <View style={styles.passwordIconWrap}>
                <Icon name="lock-closed-outline" size={18} color={BLUE} />
              </View>
              <View>
                <Text style={styles.passwordRowTitle}>Change Password</Text>
                <Text style={styles.passwordRowSubtitle}>
                  Update your account password securely
                </Text>
              </View>
            </View>

            <Icon name="chevron-forward" size={20} color={BLUE} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            (!isChanged || isSaving) && styles.updateButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleUpdate}
          disabled={!isChanged || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon
                name="save-outline"
                size={18}
                color="#FFFFFF"
                style={styles.updateIcon}
              />
              <Text style={styles.updateButtonText}>Update Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <AppModal
        visible={showDiscardModal}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to leave this page?"
        iconName="alert-circle-outline"
        primaryButtonText="Discard"
        onPrimaryPress={() => {
          setShowDiscardModal(false);
          navigation.goBack();
        }}
        secondaryButtonText="Stay"
        onSecondaryPress={() => setShowDiscardModal(false)}
      />

      <AppModal
        visible={showSuccessModal}
        title="Profile Updated"
        message="Your account details have been updated successfully."
        iconName="checkmark-circle-outline"
        primaryButtonText="OK"
        onPrimaryPress={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
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

export default ManageMyAccountScreen;

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

  profileCard: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    ...SHADOW,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    fontFamily: 'Inter',
  },

  profileTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  profileSubtitle: {
    fontSize: 13,
    color: GREY_TEXT,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  formCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 20,
    ...SHADOW,
  },

  passwordRow: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  passwordRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },

  passwordIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF1F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  passwordRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    fontFamily: 'Inter',
  },

  passwordRowSubtitle: {
    fontSize: 12,
    color: GREY_TEXT,
    marginTop: 2,
    fontFamily: 'Inter',
  },

  updateButton: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOW,
  },

  updateButtonDisabled: {
    backgroundColor: '#D9D9D9',
  },

  updateIcon: {
    marginRight: 8,
  },

  updateButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});