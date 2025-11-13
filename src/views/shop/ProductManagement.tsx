import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { productImages } from '../../utils/images';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  image: any;
}

const ProductManagement: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock products data
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Premium Cotton Shirt Fabric',
      price: '24.99',
      category: 'Shirt Fabric',
      stock: 45,
      isAvailable: true,
      image: productImages.shirt1,
    },
    {
      id: '2',
      name: 'Wool Blend Blazer Fabric',
      price: '89.99',
      category: 'Blazer Fabric',
      stock: 12,
      isAvailable: true,
      image: productImages.shirt2,
    },
    {
      id: '3',
      name: 'Formal Trouser Fabric',
      price: '34.99',
      category: 'Trouser Fabric',
      stock: 0,
      isAvailable: false,
      image: productImages.shirt3,
    },
    {
      id: '4',
      name: 'Complete Suit Set',
      price: '149.99',
      category: 'Suit Set',
      stock: 28,
      isAvailable: true,
      image: productImages.shirt4,
    },
    {
      id: '5',
      name: 'Luxury Formal Shirt Fabric',
      price: '54.99',
      category: 'Shirt Fabric',
      stock: 35,
      isAvailable: true,
      image: productImages.shirt5,
    },
    {
      id: '6',
      name: 'Classic Business Fabric',
      price: '39.99',
      category: 'Shirt Fabric',
      stock: 22,
      isAvailable: true,
      image: productImages.shirt6,
    },
    {
      id: '7',
      name: 'Executive Formal Fabric',
      price: '44.99',
      category: 'Blazer Fabric',
      stock: 18,
      isAvailable: true,
      image: productImages.shirt7,
    },
  ]);

  const categories = [
    'all',
    'Shirt Fabric',
    'Trouser Fabric',
    'Blazer Fabric',
    'Suit Set',
    'Accessories',
  ];

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
    navigation.navigate('AddEditProduct', { product, mode: 'edit' });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct', { mode: 'add' });
  };

  const renderProduct = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
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
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(product.id, product.name)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
          <Text style={styles.searchIcon}>🔍</Text>
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
            <Text style={styles.emptyStateIcon}>📦</Text>
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
        <Text style={styles.fabIcon}>+</Text>
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
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
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
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
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
  fabIcon: {
    fontSize: 32,
    color: Colors.whiteColor,
    fontWeight: '300',
  },
});

export default ProductManagement;

