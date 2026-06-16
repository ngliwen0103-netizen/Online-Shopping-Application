import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { getReviewsByProductApi } from '../cloudApi';
import { getColorsByProductId } from '../database';
import AppBackHeader from '../Components/AppBackHeader';

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

const ProductReviewsScreen = ({ navigation, route }: any) => {
  const { productId, productName } = route.params;
  const [reviews, setReviews] = useState<any[]>([]);

  const loadReviews = async () => {
    try {
      const result = await getReviewsByProductApi(productId);

      const colors = await getColorsByProductId(productId);

      const reviewsWithColor = result.map((review: any) => {
        const matchedColor = colors.find(
          (color: any) => color.product_color_id === review.product_color_id
        );

        return {
          ...review,
          color_name: matchedColor?.color_name || 'Unknown',
        };
      });

      setReviews(reviewsWithColor);
    } catch (error) {
      console.log('Load product reviews error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [productId])
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0
    );

    return total / reviews.length;
  }, [reviews]);

  const renderStars = (rating: number, size = 16) => {
    return [1, 2, 3, 4, 5].map(i => (
      <Icon
        key={i}
        name={i <= rating ? 'star' : 'star-outline'}
        size={size}
        color={ORANGE}
        style={styles.starIcon}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackHeader
        title="Reviews"
        onPressBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.productHeroCard}>
          <Text style={styles.productTitle}>{productName}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRating}>
              {reviews.length > 0 ? averageRating.toFixed(1) : '0.0'}
            </Text>

            <View style={styles.summaryInfo}>
              <View style={styles.summaryStars}>
                {renderStars(Math.round(averageRating), 17)}
              </View>
              <Text style={styles.summaryCount}>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </Text>
            </View>
          </View>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Icon
                name="chatbubble-ellipses-outline"
                size={32}
                color={GREY_TEXT}
              />
            </View>

            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyText}>
              This product has not received any reviews yet.
            </Text>
          </View>
        ) : (
          reviews.map(item => (
            <View key={item.review_id} style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(item.username || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.userTopRow}>
                    <Text style={styles.username}>{item.username || 'User'}</Text>

                    <View style={styles.colorChip}>
                      <Text style={styles.colorChipText}>
                        {item.color_name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.starRow}>
                    {renderStars(Number(item.rating), 16)}
                  </View>

                  <Text style={styles.dateText}>
                    Rated on{' '}
                    {new Date(item.created_at).toLocaleDateString('en-MY', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {item.tags ? (
                <View style={styles.tagWrap}>
                  <Text style={styles.tagText}>{item.tags}</Text>
                </View>
              ) : null}

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
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductReviewsScreen;

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

  productHeroCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 16,
    ...SHADOW,
  },

  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryRating: {
    fontSize: 34,
    fontWeight: '800',
    color: BLUE,
    marginRight: 14,
    fontFamily: 'Inter',
  },

  summaryInfo: {
    flex: 1,
  },

  summaryStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  summaryCount: {
    fontSize: 13,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
    ...SHADOW,
  },

  topRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Inter',
  },

  userInfo: {
    flex: 1,
  },

  userTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  username: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    fontFamily: 'Inter',
    flex: 1,
    marginRight: 8,
  },

  colorChip: {
    backgroundColor: '#EEF1F7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  colorChipText: {
    fontSize: 11,
    color: BLUE,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  starRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 4,
  },

  starIcon: {
    marginRight: 3,
  },

  dateText: {
    fontSize: 11,
    color: GREY_TEXT,
    fontFamily: 'Inter',
  },

  tagWrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3F1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },

  tagText: {
    fontSize: 11,
    color: ORANGE,
    fontWeight: '700',
    fontFamily: 'Inter',
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
    color: '#333333',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  noCommentText: {
    fontSize: 13,
    color: GREY_TEXT,
    fontStyle: 'italic',
    fontFamily: 'Inter',
  },

  emptyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...SHADOW,
  },

  emptyIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#F8F9FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 6,
    fontFamily: 'Inter',
  },

  emptyText: {
    fontSize: 13,
    color: GREY_TEXT,
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: 'Inter',
  },
});