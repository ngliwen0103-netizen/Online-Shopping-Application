import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

import { getReviewsByUserApi } from '../cloudApi';
import { imageMap } from '../imageMap';
import { getProductByColorId } from '../database';

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

const MyReviewsScreen = ({ navigation, signedInUser }: any) => {
  const [reviews, setReviews] = useState<any[]>([]);

  const loadReviews = async () => {
    try {
      const result = await getReviewsByUserApi(signedInUser.user_id);

      const fullReviews = await Promise.all(
        result.map(async (item: any) => {
          const productInfo = await getProductByColorId(item.product_color_id);

          return {
            ...item,
            ...productInfo,
          };
        })
      );

      setReviews(fullReviews);
    } catch (error) {
      console.log('Load reviews error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [])
  );

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(i => (
      <Icon
        key={i}
        name={i <= rating ? 'star' : 'star-outline'}
        size={16}
        color={ORANGE}
        style={styles.starIcon}
      />
    ));
  };

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

          <Text style={styles.headerTitle}>My Reviews</Text>

          <View style={styles.headerRightSpace} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {reviews.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Icon name="chatbubble-ellipses-outline" size={34} color={GREY_TEXT} />
            </View>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyText}>
              Reviews you submit for completed orders will appear here.
            </Text>
          </View>
        ) : (
          reviews.map(item => {
            const imageSource =
              imageMap[item.color_image_url] || imageMap[item.product_image_url];

            return (
              <View key={item.review_id} style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.productRow}>
                    <View style={styles.imageBox}>
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          style={styles.image}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.placeholderText}>IMG</Text>
                      )}
                    </View>

                    <View style={styles.info}>
                      <Text style={styles.name} numberOfLines={2}>
                        {item.name || item.product_name || 'Product Name'}
                      </Text>

                      <Text style={styles.colorText}>
                        {item.color_name || 'No color'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateChip}>
                    <Text style={styles.dateChipText}>
                      {new Date(item.created_at).toLocaleDateString('en-MY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.starRow}>
                  {renderStars(Number(item.rating || 0))}
                </View>

                {item.comment ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.comment}>{item.comment}</Text>
                  </View>
                ) : (
                  <View style={styles.commentBox}>
                    <Text style={styles.noCommentText}>No written comment</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyReviewsScreen;

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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: BLUE,
    fontFamily: 'Inter',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: GREY_TEXT,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter',
    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
    ...SHADOW,
  },

  topRow: {
    marginBottom: 12,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  imageBox: {
    width: 78,
    height: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  image: {
    width: '88%',
    height: '88%',
  },

  placeholderText: {
    fontSize: 10,
    color: BLUE,
    fontFamily: 'Inter',
  },

  info: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 78,
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  colorText: {
    fontSize: 12,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  dateChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF1F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  dateChipText: {
    fontSize: 11,
    color: BLUE,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  starIcon: {
    marginRight: 4,
  },

  commentBox: {
    backgroundColor: '#F9FAFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  comment: {
    fontSize: 13,
    color: DARK,
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  noCommentText: {
    fontSize: 13,
    color: GREY_TEXT,
    fontStyle: 'italic',
    fontFamily: 'Inter',
  },
});