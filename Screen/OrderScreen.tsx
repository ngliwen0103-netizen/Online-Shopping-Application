import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const BG = '#F6F7FB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E8EBF3';
const TEXT_DARK = '#1E1E1E';
const TEXT_GREY = '#666666';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const steps = [
  {
    step: 'Step 1',
    title: 'Add product to cart',
    desc: 'Choose your product and preferred option, then add it to your shopping bag.',
  },
  {
    step: 'Step 2',
    title: 'Sign in before checkout',
    desc: 'Users must sign in before they can proceed with checkout.',
  },
  {
    step: 'Step 3',
    title: 'Select delivery address',
    desc: 'Choose an existing address or add a new address before placing the order.',
  },
  {
    step: 'Step 4',
    title: 'Choose payment method',
    desc: 'Select your payment method and review the payment details.',
  },
  {
    step: 'Step 5',
    title: 'Order confirmed',
    desc: 'After payment is successful, the system will show an order confirmation page.',
  },
  {
    step: 'Step 6',
    title: 'Confirm received',
    desc: 'Once the parcel is delivered, the user can confirm receipt from My Orders.',
  },
];

const OrderScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order & Delivery</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {steps.map((item, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.leftColumn}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{index + 1}</Text>
              </View>
              {index !== steps.length - 1 && <View style={styles.line} />}
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepLabel}>{item.step}</Text>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.contactSection}>
                  <Text style={styles.contactTitle}>
                    STILL CAN&apos;T FIND{'\n'}YOUR ANSWER? CONTACT US
                  </Text>
        
                  <TouchableOpacity style={styles.contactCard} activeOpacity={0.85}>
                    <View style={styles.contactIconWrap}>
                      <Icon name="call-outline" size={20} color={ORANGE} />
                    </View>
        
                    <View>
                      <Text style={styles.contactLabel}>Customer Support</Text>
                      <Text style={styles.contactText}>+60 12-345 6789</Text>
                    </View>
                  </TouchableOpacity>
                </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    fontFamily: 'Inter',
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  leftColumn: {
    width: 32,
    alignItems: 'center',
  },

  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  circleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#d9d9d9',
    marginTop: 4,
    marginBottom: 4,
  },

  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginLeft: 10,
    marginBottom: 14,
    elevation: 1,
  },

  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: ORANGE,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    marginBottom: 6,
    fontFamily: 'Inter',
  },

  stepDesc: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
    fontFamily: 'Inter',
  },

  contactSection: {
    marginTop: 24,
    marginBottom: 20,
  },

  contactTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BLUE,
    lineHeight: 24,
    marginBottom: 16,
  },

  contactCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW,
  },

  contactIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF3F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  contactLabel: {
    fontSize: 13,
    color: TEXT_GREY,
    marginBottom: 2,
  },

  contactText: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: '700',
  },
});