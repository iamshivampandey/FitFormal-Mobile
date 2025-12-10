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
  TextInput,
  Platform,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { strings } from '../../utils/string/strings';
import { productImages } from '../../utils/images';
import * as Images from '../../utils/images';
import CustomButton from '../../components/CustomButton';

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
  isNew?: boolean;
  isSale?: boolean;
}

const HomeScreen: React.FC = () => {
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
      isSale: true,
    },
    {
      id: '2',
      name: 'Wool Blend Blazer Fabric',
      price: '$89.99',
      image: productImages.shirt2,
      rating: 4.8,
      isNew: true,
    },
    {
      id: '3',
      name: 'Formal Trouser Fabric',
      price: '$34.99',
      originalPrice: '$44.99',
      image: productImages.shirt3,
      rating: 4.6,
      isSale: true,
    },
    {
      id: '4',
      name: 'Complete Suit Set',
      price: '$149.99',
      image: productImages.shirt4,
      rating: 4.7,
      isNew: true,
    },
    {
      id: '5',
      name: 'Luxury Formal Shirt Fabric',
      price: '$54.99',
      image: productImages.shirt5,
      rating: 4.9,
      isNew: true,
    },
    {
      id: '6',
      name: 'Classic Business Fabric',
      price: '$39.99',
      originalPrice: '$49.99',
      image: productImages.shirt6,
      rating: 4.7,
      isSale: true,
    },
    {
      id: '7',
      name: 'Executive Formal Fabric',
      price: '$44.99',
      image: productImages.shirt7,
      rating: 4.6,
      isNew: true,
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

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} resizeMode="cover" />
        {item.isNew && <View style={styles.newBadge}><Text style={styles.badgeText}>NEW</Text></View>}
        {item.isSale && <View style={styles.saleBadge}><Text style={styles.badgeText}>SALE</Text></View>}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
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

  const renderBanner = () => (
    <View style={styles.banner}>
      <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Formal Wear Sale!</Text>
            <Text style={styles.bannerSubtitle}>Up to 40% OFF</Text>
            <Text style={styles.bannerDescription}>
              Premium formal fabrics with custom tailoring services
            </Text>
        <CustomButton
          title="Shop Now"
          onPress={() => {}}
          style={styles.bannerButton}
          variant="outline"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
              <Image source={Images.person_icon} style={styles.profileIconImage} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search formal fabrics..."
              placeholderTextColor={Colors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Image source={Images.search_icon} style={styles.searchIconImage} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner
        {renderBanner()} */}

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
            <TouchableOpacity>
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>📏</Text>
              <Text style={styles.quickActionText}>Book Measurement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Image source={Images.scissor_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>Find Tailor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Image source={Images.shopping_cart_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>Track Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>🎁</Text>
              <Text style={styles.quickActionText}>Tailor + Shop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  greeting: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
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
  profileIconImage: {
    width: 22,
    height: 22,
    tintColor: Colors.whiteColor,
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
  },
  searchButton: {
    padding: 10,
  },
  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: Colors.grey,
  },
  banner: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: Colors.warmBrownColor,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  bannerContent: {
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.whiteColor,
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.whiteColor,
    marginBottom: 10,
  },
  bannerDescription: {
    fontSize: 14,
    color: Colors.whiteColor,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  bannerButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.whiteColor,
    borderWidth: 2,
    width: 120,
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
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontWeight: '600',
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
  },
  selectedCategoryText: {
    color: Colors.whiteColor,
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
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
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
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.grey,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: Colors.grey,
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
  quickActionIconImage: {
    width: 24,
    height: 24,
    marginBottom: 8,
    tintColor: Colors.warmBrownColor,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default HomeScreen;
