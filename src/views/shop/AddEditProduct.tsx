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
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';

const AddEditProduct: React.FC<any> = ({ navigation, route }) => {
  const { product, mode } = route?.params || { mode: 'add' };
  const insets = useSafeAreaInsets();

  // Form state
  const [productName, setProductName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || '');
  const [category, setCategory] = useState(product?.category || 'Shirt Fabric');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [selectedImage, setSelectedImage] = useState(product?.image || null);
  const [description, setDescription] = useState('');

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [stockError, setStockError] = useState('');

  const categories = [
    'Shirt Fabric',
    'Trouser Fabric',
    'Blazer Fabric',
    'Suit Set',
    'Accessories',
  ];

  const handleImageUpload = () => {
    // In a real app, this would open image picker
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            Alert.alert('Info', 'Camera functionality will be implemented with react-native-image-picker');
          },
        },
        {
          text: 'Choose from Library',
          onPress: () => {
            Alert.alert('Info', 'Gallery functionality will be implemented with react-native-image-picker');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const validateForm = () => {
    let isValid = true;

    if (productName.trim() === '') {
      setNameError('Product name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    if (price.trim() === '' || isNaN(Number(price)) || Number(price) <= 0) {
      setPriceError('Please enter a valid price');
      isValid = false;
    } else {
      setPriceError('');
    }

    if (stock.trim() === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      setStockError('Please enter a valid stock quantity');
      isValid = false;
    } else {
      setStockError('');
    }

    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const productData = {
      id: product?.id || Date.now().toString(),
      name: productName,
      price: price,
      category: category,
      stock: parseInt(stock),
      isAvailable: isAvailable,
      image: selectedImage,
    };

    // In a real app, this would make an API call
    Alert.alert(
      'Success',
      `Product ${mode === 'add' ? 'added' : 'updated'} successfully!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderCategorySelector = () => (
    <View style={styles.categorySelector}>
      <Text style={styles.label}>Category *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryOption,
              category === cat && styles.categoryOptionActive,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryOptionText,
                category === cat && styles.categoryOptionTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Photo</Text>
            <TouchableOpacity
              style={styles.imageUploadContainer}
              onPress={handleImageUpload}
            >
              {selectedImage ? (
                <Image
                  source={selectedImage}
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Tap to upload photo</Text>
                  <Text style={styles.uploadSubtext}>
                    JPG, PNG (Max 5MB)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {selectedImage && (
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={handleImageUpload}
              >
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Product Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <CustomInput
                placeholder="e.g., Premium Cotton Shirt Fabric"
                value={productName}
                onChangeText={(text) => {
                  setProductName(text);
                  setNameError('');
                }}
                error={nameError}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price ($) *</Text>
              <CustomInput
                placeholder="0.00"
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  setPriceError('');
                }}
                keyboardType="decimal-pad"
                error={priceError}
              />
            </View>

            {renderCategorySelector()}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <CustomInput
                placeholder="0"
                value={stock}
                onChangeText={(text) => {
                  setStock(text);
                  setStockError('');
                }}
                keyboardType="number-pad"
                error={stockError}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter product description..."
                  placeholderTextColor={Colors.grey}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Availability Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityContainer}>
              <View style={styles.availabilityInfo}>
                <Text style={styles.availabilityTitle}>
                  {isAvailable ? 'Available for Sale' : 'Out of Stock'}
                </Text>
                <Text style={styles.availabilitySubtext}>
                  {isAvailable
                    ? 'Product is visible to customers'
                    : 'Product is hidden from customers'}
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: Colors.grey, true: Colors.warmBrownColor }}
                thumbColor={Colors.whiteColor}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <CustomButton
              title={mode === 'add' ? 'Add Product' : 'Save Changes'}
              onPress={handleSave}
              style={styles.saveButton}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  imageUploadContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: Colors.grey,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warmBrownColor,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  categorySelector: {
    marginBottom: 20,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    marginRight: 10,
  },
  categoryOptionActive: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryOptionTextActive: {
    color: Colors.whiteColor,
  },
  textAreaContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    padding: 12,
  },
  textArea: {
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 100,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  availabilityInfo: {
    flex: 1,
    marginRight: 15,
  },
  availabilityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  availabilitySubtext: {
    fontSize: 13,
    color: Colors.grey,
  },
  actionButtons: {
    marginTop: 10,
  },
  saveButton: {
    marginBottom: 15,
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default AddEditProduct;

