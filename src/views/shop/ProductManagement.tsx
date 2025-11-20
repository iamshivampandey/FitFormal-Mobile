import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../utils/colors';
import { productImages } from '../../utils/images';
import * as Images from '../../utils/images';
import { getProducts } from '../../utils/api/productApi';
import StorageService from '../../services/storage.service';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  image: any;
  raw?: any; // full backend product payload for editing
}

const ProductManagement: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const categories = [
    'all',
    'Shoes',
    'Clothing',
    'Accessories',
    'Sports Equipment',
    'Fitness Gear',
  ];

  const categoryNamesById: { [key: number]: string } = {
    1: 'Shoes',
    2: 'Clothing',
    3: 'Accessories',
    4: 'Sports Equipment',
    5: 'Fitness Gear',
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      // Get logged-in user id to filter products
      let userId: number | null = null;
      try {
        const storedUser = await StorageService.getUser();
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const rawUser = parsed.user || parsed;
          if (rawUser?.id) {
            userId = Number(rawUser.id);
          }
        }
      } catch (e) {
        console.warn('Unable to parse stored user for user_id in ProductManagement', e);
      }

      if (!userId) {
        setLoadError('Unable to determine logged-in user. Please sign in again.');
        setProducts([]);
        return;
      }

      const response = await getProducts({ user_id: userId });

      const raw = response?.data?.data.products || [];
      console.log('Loaded products:', JSON.stringify(raw));

      const mapped: Product[] = raw.map((item: any, index: number) => {
        const id = item.id ?? index;

        const categoryName =
          item.category?.name ||
          categoryNamesById[Number(item.category?.id)] ||
          'Uncategorized';

        const priceNode = item.price || {};
        const priceNumber =
          priceNode.price_sale ??
          priceNode.price_mrp ??
          0;

        // Backend response snippet does not include stock quantity yet,
        // so default to 0 to keep UI stable.
        const stockQty = item.stock_qty ?? 0;

        const primaryImage = item.primary_image;
        const imageSource =
          primaryImage?.url
            ? { uri: primaryImage.url }
            : productImages.shirt1;

        return {
          id: String(id),
          name: item.title || item.model_name || 'Untitled product',
          price: priceNumber.toString(),
          category: categoryName,
          stock: Number(stockQty),
          isAvailable: item.is_active ?? true,
          image: imageSource,
          raw: item,
        };
      });

      setProducts(mapped);
    } catch (error: any) {
      console.error('Failed to load products:', error?.response?.data || error?.message || error);
      setLoadError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load products. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, isAvailable: !product.isAvailable }
          : product
      )
    );
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts((prevProducts) =>
              prevProducts.filter((product) => product.id !== productId)
            );
            Alert.alert('Success', 'Product deleted successfully');
          },
        },
      ]
    );
  };

  const handleEditProduct = (product: Product) => {
    // Pass full backend product payload if available so AddEditProduct can prefill all fields
    navigation.navigate('AddEditProduct', { product: product.raw ?? product, mode: 'edit' });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct', { mode: 'add' });
  };

  const renderProduct = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('ProductDetail', {
          id: product.id,
          name: product.name,
          price: `₹${product.price}`,
          originalPrice: undefined,
          image: product.image,
          rating: 4.5,
          shopName: product.raw?.brand?.name || 'Your Shop',
          isNew: false,
          isSale: false,
        })
      }
    >
      <Image source={product.image} style={styles.productImage} resizeMode="cover" />

      <View style={styles.productDetails}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
          
          <View style={styles.stockAvailability}>
            <View style={styles.availabilityToggle}>
              <Text style={styles.availabilityLabel}>
                {product.isAvailable ? 'Available' : 'Out of Stock'}
              </Text>
              <Switch
                value={product.isAvailable}
                onValueChange={() => handleToggleAvailability(product.id)}
                trackColor={{ false: Colors.grey, true: Colors.warmBrownColor }}
                thumbColor={Colors.whiteColor}
              />
            </View>
          </View>
        </View>

        <View style={styles.productMeta}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>
          
          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Stock:</Text>
            <Text style={[
              styles.stockValue,
              product.stock === 0 && styles.stockValueZero,
              product.stock < 15 && product.stock > 0 && styles.stockValueLow,
            ]}>
              {product.stock} units
            </Text>
          </View>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProduct(product)}
          >
            <View style={styles.actionButtonContent}>
              <Image source={Images.edit_icon} style={styles.actionIconImage} />
              <Text style={styles.editButtonText}>Edit</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(product.id, product.name)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
       
          <Text style={styles.headerTitle}>Product Management</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Image source={Images.search_icon} style={styles.searchIconImage} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category === 'all' ? 'All Products' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 80 }}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {products.filter((p) => p.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {products.filter((p) => !p.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>

        {filteredProducts.length > 0 ? (
          filteredProducts.map(renderProduct)
        ) : (
          <View style={styles.emptyState}>
            <Image source={Images.shopping_bag} style={styles.emptyStateIconImage} />
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
        <Image source={Images.add_icon} style={styles.fabIconImage} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  searchIconImage: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: Colors.grey,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  categoryScroll: {
    maxHeight: 45,
  },
  categoryContainer: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryChipTextActive: {
    color: Colors.whiteColor,
  },
  content: {
    flex: 1,
    paddingTop: 15,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.grey,
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 120,
    borderRadius: 10,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.grey,
  },
  stockAvailability: {
    alignItems: 'flex-end',
  },
  availabilityToggle: {
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.grey,
    marginRight: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warmBrownColor,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 13,
    color: Colors.grey,
    marginRight: 6,
  },
  stockValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stockValueZero: {
    color: Colors.errorRed,
  },
  stockValueLow: {
    color: '#F57C00',
  },
  productActions: {
    flexDirection: 'row',
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIconImage: {
    width: 16,
    height: 16,
    tintColor: Colors.warmBrownColor,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.warmBrownColor,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.errorRed,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.errorRed,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIconImage: {
    width: 64,
    height: 64,
    marginBottom: 16,
    tintColor: Colors.warmBrownColor,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.grey,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 120 : 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIconImage: {
    width: 28,
    height: 28,
    tintColor: Colors.whiteColor,
  },
});

export default ProductManagement;

