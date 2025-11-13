import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ImageSourcePropType,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { productImages } from '../../utils/images';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR } from '../../utils/fonts';

const { width } = Dimensions.get('window');

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
  category?: string;
}

interface RouteParams {
  title?: string;
  category?: string;
}

const ProductsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = (route.params as RouteParams) || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const screenTitle = params.title || 'All Products';

  // Mock products data
  const allProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Cotton Shirt Fabric',
      price: '$24.99',
      originalPrice: '$34.99',
      image: productImages.shirt1,
      rating: 4.5,
      shopName: 'Elite Fabrics',
      isSale: true,
      category: 'shirts',
    },
    {
      id: '2',
      name: 'Wool Blend Blazer Fabric',
      price: '$89.99',
      image: productImages.shirt2,
      rating: 4.8,
      shopName: 'Royal Textiles',
      isNew: true,
      category: 'blazers',
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
      category: 'trousers',
    },
    {
      id: '4',
      name: 'Complete Suit Set',
      price: '$149.99',
      image: productImages.shirt4,
      rating: 4.7,
      shopName: 'Elite Fabrics',
      isNew: true,
      category: 'suits',
    },
    {
      id: '5',
      name: 'Luxury Formal Shirt Fabric',
      price: '$54.99',
      image: productImages.shirt5,
      rating: 4.9,
      shopName: 'Royal Textiles',
      isNew: true,
      category: 'shirts',
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
      category: 'shirts',
    },
    {
      id: '7',
      name: 'Executive Formal Fabric',
      price: '$44.99',
      image: productImages.shirt7,
      rating: 4.6,
      shopName: 'Elite Fabrics',
      isNew: true,
      category: 'blazers',
    },
    {
      id: '8',
      name: 'Premium Linen Shirt Fabric',
      price: '$29.99',
      originalPrice: '$39.99',
      image: productImages.shirt1,
      rating: 4.7,
      shopName: 'Elite Fabrics',
      isSale: true,
      category: 'shirts',
    },
    {
      id: '9',
      name: 'Silk Blend Formal Fabric',
      price: '$64.99',
      image: productImages.shirt2,
      rating: 4.9,
      shopName: 'Royal Textiles',
      isNew: true,
      category: 'shirts',
    },
    {
      id: '10',
      name: 'Classic Wool Trouser Fabric',
      price: '$42.99',
      image: productImages.shirt3,
      rating: 4.8,
      shopName: 'Premium Cloth House',
      category: 'trousers',
    },
    {
      id: '11',
      name: 'Designer Blazer Material',
      price: '$95.99',
      originalPrice: '$120.99',
      image: productImages.shirt4,
      rating: 4.9,
      shopName: 'Elite Fabrics',
      isSale: true,
      category: 'blazers',
    },
    {
      id: '12',
      name: 'Business Casual Fabric',
      price: '$32.99',
      image: productImages.shirt5,
      rating: 4.5,
      shopName: 'Royal Textiles',
      category: 'shirts',
    },
  ];

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'sale', label: 'On Sale' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'trousers', label: 'Trousers' },
    { id: 'blazers', label: 'Blazers' },
    { id: 'suits', label: 'Suits' },
  ];

  const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'newest', label: 'Newest First' },
  ];

  // Filter products based on selected filter and search query
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'new') return product.isNew;
    if (selectedFilter === 'sale') return product.isSale;
    return product.category === selectedFilter;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
      case 'price-high':
        return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  const handleProductPress = (item: Product) => {
    (navigation.navigate as any)('ProductDetail', item);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} resizeMode="cover" />
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
        {item.isSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.badgeText}>SALE</Text>
          </View>
        )}
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

  const renderFilterOption = (option: { id: string; label: string }) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.filterChip,
        selectedFilter === option.id && styles.filterChipActive,
      ]}
      onPress={() => setSelectedFilter(option.id)}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedFilter === option.id && styles.filterChipTextActive,
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 10 : 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Options */}
      <View style={styles.filtersSection}>
        <FlatList
          data={filterOptions}
          renderItem={({ item }) => renderFilterOption(item)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Sort & Results Count */}
      <View style={styles.controlsBar}>
        <Text style={styles.resultsCount}>
          {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
        </Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            // Cycle through sort options
            const currentIndex = sortOptions.findIndex(opt => opt.id === sortBy);
            const nextIndex = (currentIndex + 1) % sortOptions.length;
            setSortBy(sortOptions[nextIndex].id);
          }}
        >
          <Text style={styles.sortIcon}>⇅</Text>
          <Text style={styles.sortText}>
            {sortOptions.find(opt => opt.id === sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <FlatList
          data={sortedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          columnWrapperStyle={styles.productRow}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateText}>No products found</Text>
          <Text style={styles.emptyStateSubText}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
    backgroundColor: Colors.whiteColor,
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  placeholder: {
    width: 34,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
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
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: GILROY_REGULAR,
  },
  clearIcon: {
    fontSize: 18,
    color: Colors.grey,
    paddingHorizontal: 5,
  },
  filtersSection: {
    backgroundColor: Colors.whiteColor,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
  },
  filtersList: {
    paddingHorizontal: 15,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  filterChipTextActive: {
    color: Colors.whiteColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  sortIcon: {
    fontSize: 16,
    marginRight: 6,
    color: Colors.textPrimary,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  productsList: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productImageContainer: {
    height: 180,
    backgroundColor: Colors.background,
    position: 'relative',
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
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    minHeight: 36,
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
    fontSize: 12,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: GILROY_BOLD,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: GILROY_REGULAR,
  },
});

export default ProductsListScreen;


