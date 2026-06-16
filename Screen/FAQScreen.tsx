import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

const faqData = [
  {
    question: 'Do I need to sign in before checkout?',
    answer:
      'Yes, you must sign in before proceeding to checkout. This allows us to save your order details and delivery address securely.',
  },
  {
    question: 'How do I add a product to my cart?',
    answer:
      'Go to the product page, select your preferred options such as color, and tap "Add to Cart". The item will be added to your shopping bag.',
  },
  {
    question: 'How can I edit or delete my address?',
    answer:
      'Go to your Profile page, then select Address Book. From there, you can add, edit, or delete your saved addresses.',
  },
  {
    question: 'What happens after I press checkout?',
    answer:
      'After checkout, you will select your delivery address and payment method. Once payment is successful, your order will be confirmed.',
  },
  {
    question: 'Can I track or confirm my order?',
    answer:
      'Yes, you can go to your Profile > My Orders to view your order status. Once your item is delivered, you can confirm receipt.',
  },
  {
    question: 'How do I leave a review?',
    answer:
      'After your order is marked as completed, you can go to your completed orders and submit a rating and review for the product.',
  },
  {
    question: 'What if I want to cancel changes while editing?',
    answer:
      'If you make changes such as editing your address or profile, you can discard the changes before saving.',
  },
];

const FAQScreen = ({ navigation }: any) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Icon name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>FAQs</Text>

        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {faqData.map((item, index) => {
          const isOpen = activeIndex === index;

          return (
            <View key={index} style={styles.card}>
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => toggleItem(index)}
                activeOpacity={0.85}
              >
                <Text style={styles.question}>{item.question}</Text>

                <View style={[styles.iconCircle, isOpen && styles.iconCircleActive]}>
                  <Icon
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={isOpen ? '#FFFFFF' : ORANGE}
                  />
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              )}
            </View>
          );
        })}

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

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  headerRightSpace: {
    width: 36,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...SHADOW,
  },

  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: BLUE,
    lineHeight: 22,
    paddingRight: 12,
  },

  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F2C5C3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  iconCircleActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },

  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  answer: {
    fontSize: 14,
    color: TEXT_GREY,
    lineHeight: 22,
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
    borderRadius: 10,
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