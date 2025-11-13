import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
  ImageSourcePropType,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import CustomButton from '../../components/CustomButton';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  userAvatar?: string;
}

interface ProductDetailScreenProps {
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

interface RecommendedProduct {
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

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const product = route.params as ProductDetailScreenProps;
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data for demonstration
  const productImages = [product.image, product.image, product.image];
  
  const sizes = ['1 Meter', '2 Meters', '3 Meters', '5 Meters'];
  
  const colors = [
    { id: '1', name: 'Navy Blue', hex: '#001F3F' },
    { id: '2', name: 'Charcoal', hex: '#36454F' },
    { id: '3', name: 'Black', hex: '#000000' },
    { id: '4', name: 'Light Grey', hex: '#D3D3D3' },
  ];
  
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'John Doe',
      rating: 5,
      date: '2 days ago',
      comment: 'Excellent quality fabric! Perfect for formal shirts. Highly recommend.',
    },
    {
      id: '2',
      userName: 'Jane Smith',
      rating: 4,
      date: '1 week ago',
      comment: 'Good quality but took a bit longer to deliver than expected.',
    },
    {
      id: '3',
      userName: 'Mike Johnson',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Amazing fabric! The tailor loved working with it.',
    },
  ];

  const productDescription = `Premium quality formal fabric perfect for shirts, blazers, and trousers. Made from 100% premium cotton with excellent breathability and comfort. Perfect for all-day wear in any formal setting.

Features:
• Premium cotton blend
• Breathable and comfortable
• Easy to maintain
• Color-fast and durable
• Perfect for formal occasions

Care Instructions:
• Dry clean recommended
• Iron at medium temperature
• Store in a cool, dry place`;

  const specifications = [
    { label: 'Material', value: 'Premium Cotton' },
    { label: 'Weight', value: '150 GSM' },
    { label: 'Width', value: '58 inches' },
    { label: 'Pattern', value: 'Solid' },
    { label: 'Care', value: 'Dry Clean' },
    { label: 'Origin', value: 'India' },
  ];

  // Recommended products - similar items
  const recommendedProducts: RecommendedProduct[] = [
    {
      id: 'rec1',
      name: 'Premium Linen Shirt Fabric',
      price: '$29.99',
      originalPrice: '$39.99',
      image: product.image,
      rating: 4.7,
      shopName: 'Elite Fabrics',
      isSale: true,
    },
    {
      id: 'rec2',
      name: 'Silk Blend Formal Fabric',
      price: '$64.99',
      image: product.image,
      rating: 4.9,
      shopName: 'Royal Textiles',
      isNew: true,
    },
    {
      id: 'rec3',
      name: 'Classic Cotton Fabric',
      price: '$22.99',
      image: product.image,
      rating: 4.6,
      shopName: 'Premium Cloth House',
    },
    {
      id: 'rec4',
      name: 'Executive Business Fabric',
      price: '$42.99',
      originalPrice: '$52.99',
      image: product.image,
      rating: 4.8,
      shopName: 'Elite Fabrics',
      isSale: true,
    },
  ];

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Size Required', 'Please select a size before adding to cart');
      return;
    }
    if (!selectedColor) {
      Alert.alert('Color Required', 'Please select a color before adding to cart');
      return;
    }
    // Add to cart logic here
    Alert.alert('Added to Cart', `Added ${quantity} ${selectedSize} of ${product.name} to cart`);
  };

  const renderImageThumbnail = ({ item, index }: { item: ImageSourcePropType; index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        selectedImage === index && styles.selectedThumbnail,
      ]}
      onPress={() => setSelectedImage(index)}
    >
      <Image source={item} style={styles.thumbnail} resizeMode="cover" />
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserAvatar}>
          <Text style={styles.reviewUserAvatarText}>{item.userName.charAt(0)}</Text>
        </View>
        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewUserName}>{item.userName}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <View style={styles.reviewRatingContainer}>
          <Text style={styles.reviewRating}>⭐ {item.rating}</Text>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const handleRecommendedProductPress = (item: RecommendedProduct) => {
    (navigation.navigate as any)('ProductDetail', item);
  };

  const renderRecommendedProduct = ({ item }: { item: RecommendedProduct }) => (
    <TouchableOpacity 
      style={styles.recommendedProductCard}
      onPress={() => handleRecommendedProductPress(item)}
    >
      <View style={styles.recommendedImageContainer}>
        <Image source={item.image} style={styles.recommendedImage} resizeMode="cover" />
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
      <View style={styles.recommendedProductInfo}>
        <Text style={styles.recommendedProductName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.recommendedShopName} numberOfLines={1}>{item.shopName}</Text>
        <View style={styles.recommendedPriceContainer}>
          <Text style={styles.recommendedProductPrice}>{item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.recommendedOriginalPrice}>{item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.recommendedRatingContainer}>
          <Text style={styles.recommendedRating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 10 : 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity 
          onPress={() => setIsFavorite(!isFavorite)} 
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Product Image */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            <Image 
              source={productImages[selectedImage]} 
              style={styles.mainImage} 
              resizeMode="cover" 
            />
            {product.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
            {product.isSale && (
              <View style={styles.saleBadge}>
                <Text style={styles.badgeText}>SALE</Text>
              </View>
            )}
          </View>

          {/* Image Thumbnails */}
          <FlatList
            data={productImages}
            renderItem={renderImageThumbnail}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsList}
          />
        </View>

        {/* Product Info */}
        <View style={styles.productInfoSection}>
          {/* Product Name & Price */}
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {product.rating}</Text>
                <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>{product.originalPrice}</Text>
              )}
            </View>
          </View>

          {/* Shop Info */}
          <TouchableOpacity style={styles.shopInfoCard}>
            <View style={styles.shopIcon}>
              <Text style={styles.shopIconText}>🏪</Text>
            </View>
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{product.shopName}</Text>
              <Text style={styles.shopDetails}>⭐ 4.8 • 0.8 km away</Text>
            </View>
            <TouchableOpacity style={styles.visitShopButton}>
              <Text style={styles.visitShopText}>Visit Shop</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{productDescription}</Text>
          </View>

          {/* Select Color */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Color</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorsList}
            >
              {colors.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    selectedColor === color.id && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color.id)}
                >
                  <View 
                    style={[
                      styles.colorCircle, 
                      { backgroundColor: color.hex }
                    ]} 
                  />
                  <Text style={styles.colorName}>{color.name}</Text>
                  {selectedColor === color.id && (
                    <View style={styles.selectedCheckmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Select Size */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.sizesContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.selectedSizeOption,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.selectedSizeText,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specificationsContainer}>
              {specifications.map((spec, index) => (
                <View key={index} style={styles.specificationRow}>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customer Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <View style={styles.averageRatingContainer}>
                <Text style={styles.averageRating}>⭐ {averageRating.toFixed(1)}</Text>
              </View>
            </View>
            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
            <TouchableOpacity style={styles.seeAllReviewsButton}>
              <Text style={styles.seeAllReviewsText}>See All Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Products */}
        <View style={styles.recommendedSection}>
          <View style={styles.recommendedHeader}>
            <Text style={styles.recommendedTitle}>You May Also Like</Text>
            <TouchableOpacity 
              onPress={() => (navigation.navigate as any)('ProductsList', { title: 'Recommended Products' })}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recommendedProducts}
            renderItem={renderRecommendedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedProductsList}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 15 }]}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            ${(parseFloat(product.price.replace('$', '')) * quantity).toFixed(2)}
          </Text>
        </View>
        <CustomButton
          title="Add to Cart"
          onPress={handleAddToCart}
          style={styles.addToCartButton}
        />
      </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  imageSection: {
    backgroundColor: Colors.whiteColor,
    paddingBottom: 15,
  },
  mainImageContainer: {
    height: width * 1.2,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  saleBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: Colors.errorRed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: Colors.whiteColor,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
  thumbnailsList: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.inputBorderColor,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: Colors.warmBrownColor,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  productInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  productHeader: {
    marginBottom: 20,
  },
  productTitleContainer: {
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    fontFamily: GILROY_BOLD,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 8,
    fontFamily: GILROY_REGULAR,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginRight: 12,
    fontFamily: GILROY_BOLD,
  },
  originalPrice: {
    fontSize: 20,
    color: Colors.grey,
    textDecorationLine: 'line-through',
    fontFamily: GILROY_REGULAR,
  },
  shopInfoCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shopIconText: {
    fontSize: 24,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: GILROY_BOLD,
  },
  shopDetails: {
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  visitShopButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
  },
  visitShopText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    fontFamily: GILROY_BOLD,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  colorsList: {
    gap: 10,
  },
  colorOption: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
    marginRight: 10,
    minWidth: 100,
    position: 'relative',
  },
  selectedColorOption: {
    borderColor: Colors.warmBrownColor,
    backgroundColor: Colors.lightBrownColor,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.whiteColor,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
  },
  selectedSizeOption: {
    borderColor: Colors.warmBrownColor,
    backgroundColor: Colors.warmBrownColor,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  selectedSizeText: {
    color: Colors.whiteColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  quantityDisplay: {
    marginHorizontal: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  specificationsContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
  },
  specLabel: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: '500',
    fontFamily: GILROY_MEDIUM,
  },
  specValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  averageRatingContainer: {
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  averageRating: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
  },
  reviewCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewUserAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
    fontFamily: GILROY_SEMIBOLD,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  reviewRatingContainer: {
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  seeAllReviewsButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
    borderRadius: 12,
    marginTop: 10,
  },
  seeAllReviewsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  recommendedSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  recommendedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  recommendedProductsList: {
    paddingHorizontal: 15,
  },
  recommendedProductCard: {
    width: width * 0.45,
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    marginHorizontal: 8,
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
  recommendedImageContainer: {
    height: 180,
    backgroundColor: Colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedProductInfo: {
    padding: 15,
  },
  recommendedProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: GILROY_SEMIBOLD,
  },
  recommendedShopName: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 8,
    fontFamily: GILROY_REGULAR,
  },
  recommendedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginRight: 8,
    fontFamily: GILROY_BOLD,
  },
  recommendedOriginalPrice: {
    fontSize: 14,
    color: Colors.grey,
    textDecorationLine: 'line-through',
    fontFamily: GILROY_REGULAR,
  },
  recommendedRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedRating: {
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorderColor,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  totalPriceContainer: {
    marginBottom: 12,
  },
  totalPriceLabel: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 4,
    fontFamily: GILROY_REGULAR,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  addToCartButton: {
    height: 50,
    borderRadius: 25,
  },
});

export default ProductDetailScreen;

