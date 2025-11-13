import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
  TextInput,
  Platform,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../utils/colors';
import { strings } from '../../utils/string/strings';
import { productImages } from '../../utils/images';
import CustomButton from '../../components/CustomButton';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR } from '../../utils/fonts';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: ImageSourcePropType;
  rating: number;
  shopName: string;
  isNew?: boolean;
  isSale?: boolean;
}

interface Tailor {
  id: string;
  name: string;
  rating: number;
  distance: string;
  specialization: string;
  experienceYears: number;
  priceRange: string;
}

interface Shop {
  id: string;
  name: string;
  rating: number;
  distance: string;
  productsCount: number;
  deliveryTime: string;
}

const CustomerHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const insets = useSafeAreaInsets();
  
  // Calculate tab bar height to add bottom padding
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  const categories: Category[] = [
    { id: 'all', name: 'All Fabrics', icon: '👔' },
    { id: 'shirts', name: 'Shirt Fabrics', icon: '👕' },
    { id: 'trousers', name: 'Trouser Fabrics', icon: '👖' },
    { id: 'blazers', name: 'Blazer Fabrics', icon: '🤵' },
    { id: 'suits', name: 'Suit Sets', icon: '👨‍💼' },
    { id: 'accessories', name: 'Formal Accessories', icon: '🎩' },
  ];

  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Cotton Shirt Fabric',
      price: '$24.99',
      originalPrice: '$34.99',
      image: productImages.shirt1,
      rating: 4.5,
      shopName: 'Elite Fabrics',
      isSale: true,
    },
    {
      id: '2',
      name: 'Wool Blend Blazer Fabric',
      price: '$89.99',
      image: productImages.shirt2,
      rating: 4.8,
      shopName: 'Royal Textiles',
      isNew: true,
    },
    {
      id: '3',
      name: 'Formal Trouser Fabric',
      price: '$34.99',
      originalPrice: '$44.99',
      image: productImages.shirt3,
      rating: 4.6,
      shopName: 'Premium Cloth House',
      isSale: true,
    },
    {
      id: '4',
      name: 'Complete Suit Set',
      price: '$149.99',
      image: productImages.shirt4,
      rating: 4.7,
      shopName: 'Elite Fabrics',
      isNew: true,
    },
    {
      id: '5',
      name: 'Luxury Formal Shirt Fabric',
      price: '$54.99',
      image: productImages.shirt5,
      rating: 4.9,
      shopName: 'Royal Textiles',
      isNew: true,
    },
    {
      id: '6',
      name: 'Classic Business Fabric',
      price: '$39.99',
      originalPrice: '$49.99',
      image: productImages.shirt6,
      rating: 4.7,
      shopName: 'Premium Cloth House',
      isSale: true,
    },
    {
      id: '7',
      name: 'Executive Formal Fabric',
      price: '$44.99',
      image: productImages.shirt7,
      rating: 4.6,
      shopName: 'Elite Fabrics',
      isNew: true,
    },
  ];

  const nearbyTailors: Tailor[] = [
    {
      id: '1',
      name: 'John Smith',
      rating: 4.8,
      distance: '1.2 km',
      specialization: 'Formal Suits',
      experienceYears: 15,
      priceRange: '$$',
    },
    {
      id: '2',
      name: 'Michael Johnson',
      rating: 4.9,
      distance: '2.5 km',
      specialization: 'Shirt & Blazers',
      experienceYears: 10,
      priceRange: '$$$',
    },
    {
      id: '3',
      name: 'David Williams',
      rating: 4.7,
      distance: '3.1 km',
      specialization: 'Complete Formal Wear',
      experienceYears: 20,
      priceRange: '$$',
    },
    {
      id: '4',
      name: 'Robert Brown',
      rating: 4.6,
      distance: '1.8 km',
      specialization: 'Trouser Specialist',
      experienceYears: 8,
      priceRange: '$',
    },
  ];

  const nearbyShops: Shop[] = [
    {
      id: '1',
      name: 'Elite Fabrics',
      rating: 4.7,
      distance: '0.8 km',
      productsCount: 250,
      deliveryTime: '1-2 days',
    },
    {
      id: '2',
      name: 'Royal Textiles',
      rating: 4.8,
      distance: '1.5 km',
      productsCount: 180,
      deliveryTime: '2-3 days',
    },
    {
      id: '3',
      name: 'Premium Cloth House',
      rating: 4.9,
      distance: '2.0 km',
      productsCount: 320,
      deliveryTime: '1-2 days',
    },
  ];

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleProductPress = (item: Product) => {
    (navigation.navigate as any)('ProductDetail', item);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} resizeMode="cover" />
        {item.isNew && <View style={styles.newBadge}><Text style={styles.badgeText}>NEW</Text></View>}
        {item.isSale && <View style={styles.saleBadge}><Text style={styles.badgeText}>SALE</Text></View>}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTailor = ({ item }: { item: Tailor }) => (
    <TouchableOpacity style={styles.tailorCard}>
      <View style={styles.tailorAvatar}>
        <Text style={styles.tailorAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.tailorInfo}>
        <Text style={styles.tailorName}>{item.name}</Text>
        <Text style={styles.tailorSpecialization}>{item.specialization}</Text>
        <View style={styles.tailorDetails}>
          <Text style={styles.tailorRating}>⭐ {item.rating}</Text>
          <Text style={styles.tailorDistance}>📍 {item.distance}</Text>
        </View>
        <View style={styles.tailorFooter}>
          <Text style={styles.tailorExperience}>{item.experienceYears} yrs exp</Text>
          <Text style={styles.tailorPrice}>{item.priceRange}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderShop = ({ item }: { item: Shop }) => (
    <TouchableOpacity style={styles.shopCard}>
      <View style={styles.shopIcon}>
        <Text style={styles.shopIconText}>🏪</Text>
      </View>
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{item.name}</Text>
        <View style={styles.shopDetails}>
          <Text style={styles.shopRating}>⭐ {item.rating}</Text>
          <Text style={styles.shopDistance}>📍 {item.distance}</Text>
        </View>
        <Text style={styles.shopProducts}>{item.productsCount} products</Text>
        <Text style={styles.shopDelivery}>🚚 {item.deliveryTime}</Text>
      </View>
      <TouchableOpacity style={styles.visitButton}>
        <Text style={styles.visitButtonText}>Visit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.userName}>Fit Formal</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search fabrics, tailors, shops..."
              placeholderTextColor={Colors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity 
              onPress={() => (navigation.navigate as any)('ProductsList', { title: 'Featured Products' })}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Find Tailors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Find Tailors Near You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={nearbyTailors}
            renderItem={renderTailor}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tailorsList}
          />
        </View>

        {/* Nearby Shops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Shops</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {nearbyShops.map((shop) => (
            <View key={shop.id}>{renderShop({ item: shop })}</View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('BookMeasurement' as never)}
            >
              <Text style={styles.quickActionIcon}>📏</Text>
              <Text style={styles.quickActionText}>Book Measurement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>✂️</Text>
              <Text style={styles.quickActionText}>Find Tailor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionText}>Track Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>❤️</Text>
              <Text style={styles.quickActionText}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: Colors.whiteColor,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: GILROY_REGULAR,
  },
  searchButton: {
    padding: 10,
  },
  searchIcon: {
    fontSize: 18,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontFamily: GILROY_BOLD,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  selectedCategoryText: {
    color: Colors.whiteColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  productsList: {
    paddingHorizontal: 15,
  },
  productCard: {
    width: width * 0.45,
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 180,
    backgroundColor: Colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saleBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.errorRed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.whiteColor,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: GILROY_SEMIBOLD,
  },
  shopName: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 8,
    fontFamily: GILROY_REGULAR,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginRight: 8,
    fontFamily: GILROY_BOLD,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.grey,
    textDecorationLine: 'line-through',
    fontFamily: GILROY_REGULAR,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  tailorsList: {
    paddingHorizontal: 15,
  },
  tailorCard: {
    width: width * 0.75,
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tailorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tailorAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
  },
  tailorInfo: {
    flex: 1,
  },
  tailorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: GILROY_BOLD,
  },
  tailorSpecialization: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 8,
    fontFamily: GILROY_REGULAR,
  },
  tailorDetails: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tailorRating: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 15,
    fontFamily: GILROY_REGULAR,
  },
  tailorDistance: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  tailorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tailorExperience: {
    fontSize: 11,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  tailorPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  bookButton: {
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    color: Colors.whiteColor,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  shopCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  shopIconText: {
    fontSize: 24,
  },
  shopInfo: {
    flex: 1,
  },
  shopDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  shopRating: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 15,
    fontFamily: GILROY_REGULAR,
  },
  shopDistance: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  shopProducts: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 2,
    fontFamily: GILROY_REGULAR,
  },
  shopDelivery: {
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  visitButton: {
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  visitButtonText: {
    color: Colors.whiteColor,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  quickActionItem: {
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: GILROY_SEMIBOLD,
  },
});

export default CustomerHomeScreen;

