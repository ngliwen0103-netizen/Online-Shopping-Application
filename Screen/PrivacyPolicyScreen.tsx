import React from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BLUE = '#272c78';
const ORANGE = '#c94b4c';
const BG = '#F7F7F7';

const PrivacyPolicyScreen = ({ navigation }: any) => {
  const items = [
    {
      icon: 'person-outline',
      title: 'Personal Information',
      text: 'We collect basic user information such as username, email and phone number for account purposes.',
    },
    {
      icon: 'bag-check-outline',
      title: 'Order Information',
      text: 'Your order and delivery details are used only to process purchases and improve your shopping experience.',
    },
    {
      icon: 'lock-closed-outline',
      title: 'Data Protection',
      text: 'Your information will not be shared with others without your permission.',
    },
    {
      icon: 'create-outline',
      title: 'Control Your Data',
      text: 'You can update your account details anytime through Manage My Account.',
    },
  ];

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

          <Text style={styles.title}>Privacy Policy</Text>

          <View style={styles.headerRightSpace} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Icon name="shield-checkmark" size={42} color="#FFFFFF" />
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroText}>
            RELM protects your information and uses it only to support your
            shopping experience.
          </Text>
        </View>

        {items.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconCircle}>
              <Icon name={item.icon} size={22} color={ORANGE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

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
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EBF3',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  headerRightSpace: {
    width: 38,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: BLUE,
    fontFamily: 'Inter',
    letterSpacing: 0.3,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  heroBox: {
    backgroundColor: BLUE,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: 'Inter',
  },

  heroText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    fontFamily: 'Inter',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  cardText: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 17,
    fontFamily: 'Inter',
  },
});