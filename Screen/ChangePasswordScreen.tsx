import React, { useState } from 'react';
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
import { changePasswordApi } from '../cloudApi';
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

const ChangePasswordScreen = ({ navigation, signedInUser }: any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');

  const isChanged =
    currentPassword.trim() !== '' ||
    newPassword.trim() !== '' ||
    confirmPassword.trim() !== '';

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

  const handleChangePassword = async () => {
    if (!signedInUser?.user_id) {
      showAppMessage('Error', 'User information is missing. Please sign in again.');
      return;
    }

    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      showAppMessage('Validation', 'Please fill in all password fields.');
      return;
    }

    if (newPassword.trim().length < 6) {
      showAppMessage('Validation', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAppMessage('Validation', 'New password and confirm password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      showAppMessage('Validation', 'New password must be different from current password.');
      return;
    }

    try {
      setIsSaving(true);

      await changePasswordApi(
        signedInUser.user_id,
        currentPassword.trim(),
        newPassword.trim()
      );

      setShowSuccessModal(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.log('Change password error:', error);

      const msg =
        error?.data?.message ||
        error?.response?.data?.message ||
        'Unable to change password.';

      showAppMessage('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="Change Password"
        onPressBack={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Icon name="lock-closed-outline" size={28} color="#FFFFFF" />
          </View>

          <Text style={styles.heroTitle}>Secure Your Account</Text>
          <Text style={styles.heroSubtitle}>
            Update your password to keep your account protected.
          </Text>
        </View>

        <View style={styles.formCard}>
          <FormInputRow
            label="Current Password"
            iconName="shield-checkmark-outline"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry={!showCurrentPassword}
            rightIconName={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
          />

          <FormInputRow
            label="New Password"
            iconName="lock-closed-outline"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry={!showNewPassword}
            rightIconName={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
          />

          <FormInputRow
            label="Confirm New Password"
            iconName="checkmark-done-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            rightIconName={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSaving && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleChangePassword}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon
                name="save-outline"
                size={18}
                color="#FFFFFF"
                style={styles.submitIcon}
              />
              <Text style={styles.submitText}>Update Password</Text>
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
        title="Password Updated"
        message="Your password has been changed successfully."
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

export default ChangePasswordScreen;

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

  heroCard: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    ...SHADOW,
  },

  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  heroSubtitle: {
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

  submitButton: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOW,
  },

  submitButtonDisabled: {
    backgroundColor: '#D9D9D9',
  },

  submitIcon: {
    marginRight: 8,
  },

  submitText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});