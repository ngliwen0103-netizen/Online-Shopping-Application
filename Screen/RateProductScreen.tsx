import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { imageMap } from '../imageMap';
import { addReviewApi } from '../cloudApi';
import AppBackHeader from '../Components/AppBackHeader';
import AppModal from '../Components/AppModal';

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

const RateProductScreen = ({ navigation, route, signedInUser }: any) => {
  const item = route.params?.orderItem;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');

  const isChanged =
    rating > 0 || comment.trim() !== '' || selectedTags.length > 0;

  const imageSource =
    imageMap[item?.color_image_url] || imageMap[item?.product_image_url];

  const commentLength = comment.length;
  const charactersLeft = 50 - commentLength;
  const canSubmit = rating > 0 && commentLength > 0 && commentLength <= 50;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(item => item !== tag)
        : [...prev, tag]
    );
  };

  const showAppMessage = (title: string, message: string) => {
    setMessageTitle(title);
    setMessageText(message);
    setShowMessageModal(true);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showAppMessage('Notice', 'Please select a rating.');
      return;
    }

    if (commentLength === 0) {
      showAppMessage('Notice', 'Please write your review before submitting.');
      return;
    }

    try {
      await addReviewApi({
        user_id: signedInUser.user_id,
        product_id: item.product_id,
        product_color_id: item.product_color_id,
        order_id: item.order_id,
        rating,
        comment: comment.trim(),
        tags: selectedTags.join(','),
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.log('Submit review error:', error);
      showAppMessage('Error', 'Unable to submit review.');
    }
  };

  const ratingText = useMemo(() => {
    switch (rating) {
      case 1:
        return 'Very Poor';
      case 2:
        return 'Poor';
      case 3:
        return 'Average';
      case 4:
        return 'Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap a star to rate';
    }
  }, [rating]);

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="Rate Product"
        onPressBack={() => {
          if (isChanged) {
            setShowLeaveModal(true);
          } else {
            navigation.goBack();
          }
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.productCard}>
          <View style={styles.productRow}>
            <View style={styles.imageBox}>
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.noImageText}>IMG</Text>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {item?.name || item?.product_name || 'Product Name'}
              </Text>

              <Text style={styles.colorText}>
                {item?.color_name || 'No color'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Rating</Text>

          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.8}
                style={styles.starTouch}
              >
                <Icon
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={30}
                  color={ORANGE}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingText}>{ratingText}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.commentHeaderRow}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <Text style={styles.counterText}>{charactersLeft} left</Text>
          </View>

          <Text style={styles.helperText}>Maximum 50 characters.</Text>

          <TextInput
            style={styles.commentBox}
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
            placeholder="Share your review here..."
            placeholderTextColor={GREY_TEXT}
            maxLength={50}
          />

          <View style={styles.tagRow}>
            {['Good Quality', 'Item Not as Described', 'Damaged Item'].map(
              tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    selectedTags.includes(tag) && styles.tagButtonSelected,
                  ]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>Submit Review</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppModal
        visible={showSuccessModal}
        title="Review Submitted"
        message="Thank you for your feedback. Your review has been submitted successfully."
        iconName="checkmark-circle-outline"
        primaryButtonText="Continue"
        onPrimaryPress={() => {
          setShowSuccessModal(false);
          navigation.navigate('MyPurchase', {
            tab: 'completed',
          });
        }}
        secondaryButtonText="View My Reviews"
        onSecondaryPress={() => {
          setShowSuccessModal(false);
          navigation.replace('MyReviews');
        }}
      />

      <AppModal
        visible={showLeaveModal}
        title="Discard Changes?"
        message="Changes are not saved. Do you want to discard the changes?"
        iconName="alert-circle-outline"
        primaryButtonText="Discard"
        onPrimaryPress={() => {
          setShowLeaveModal(false);
          navigation.goBack();
        }}
        secondaryButtonText="Cancel"
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

export default RateProductScreen;

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

  productCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 16,
    ...SHADOW,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageBox: {
    width: 78,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  productImage: {
    width: '90%',
    height: '90%',
  },

  noImageText: {
    fontSize: 10,
    color: BLUE,
    fontFamily: 'Inter',
  },

  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    fontFamily: 'Inter',
    marginBottom: 4,
  },

  colorText: {
    fontSize: 12,
    color: DARK,
    fontFamily: 'Inter',
  },

  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 16,
    ...SHADOW,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BLUE,
    fontFamily: 'Inter',
  },

  starRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 10,
  },

  starTouch: {
    marginRight: 8,
  },

  ratingText: {
    fontSize: 13,
    color: ORANGE,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  counterText: {
    fontSize: 12,
    color: GREY_TEXT,
    fontFamily: 'Inter',
    fontWeight: '600',
  },

  helperText: {
    fontSize: 12,
    color: GREY_TEXT,
    marginTop: 6,
    marginBottom: 10,
    fontFamily: 'Inter',
  },

  commentBox: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: DARK,
    fontFamily: 'Inter',
    marginBottom: 12,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },

  tagButtonSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },

  tagText: {
    fontSize: 12,
    color: BLUE,
    fontFamily: 'Inter',
    fontWeight: '600',
  },

  tagTextSelected: {
    color: '#FFFFFF',
  },

  submitButton: {
    backgroundColor: ORANGE,
    minHeight: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },

  submitButtonDisabled: {
    backgroundColor: '#D9D9D9',
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});