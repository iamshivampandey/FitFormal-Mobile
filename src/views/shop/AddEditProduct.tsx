import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import CustomButton from '../../components/CustomButton';
import {
  createProduct,
  updateProduct,
  getAllBrands,
  getAllCategories,
  getAllProductTypes,
} from '../../utils/api/productApi';
import { showSuccessMessage, showErrorMessage } from '../../utils/flashMessage';
import StorageService from '../../services/storage.service';

interface ProductImage {
  id: string;
  uri: string;
  fileName: string;
  isPrimary: boolean;
}

interface AddEditProductProps {
  navigation: any;
  route?: any;
}

const AddEditProduct: React.FC<AddEditProductProps> = ({ navigation, route }) => {
  console.log(JSON.stringify(route.params));
  const { product, mode } = route?.params || { mode: 'add' };
  const insets = useSafeAreaInsets();
  
  // Data options loaded from backend
  const [brandOptions, setBrandOptions] = useState<{ id: number | string; name: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number | string; name: string }[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<{ id: number | string; name: string }[]>([]);
  
  // Form State - ALL FIELDS from web / backend
  const [title, setTitle] = useState(product?.title || '');
  const [brandId, setBrandId] = useState(
    product?.brand_id ||
    product?.brand?.id ||
    ''
  );
  const [categoryId, setCategoryId] = useState(
    product?.category_id ||
    product?.category?.id ||
    ''
  );
  const [sku, setSku] = useState(product?.sku || '');
  const [styleCode, setStyleCode] = useState(product?.style_code || '');
  const [modelName, setModelName] = useState(product?.model_name || '');
  const [shortDescription, setShortDescription] = useState(product?.short_description || '');
  const [longDescription, setLongDescription] = useState(product?.long_description || '');
  const [salesPackage, setSalesPackage] = useState(product?.sales_package || '');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  
  // Product Details
  const [productType, setProductType] = useState(product?.product_type || '');
  const [color, setColor] = useState(product?.color || '');
  const [brandColor, setBrandColor] = useState(product?.brand_color || '');
  const [fabric, setFabric] = useState(product?.fabric || '');
  const [fabricPurity, setFabricPurity] = useState(product?.fabric_purity || '');
  const [composition, setComposition] = useState(product?.composition || '');
  const [pattern, setPattern] = useState(product?.pattern || '');
  const [stitchingType, setStitchingType] = useState(product?.stitching_type || '');
  const [idealFor, setIdealFor] = useState(product?.ideal_for || '');
  const [topLengthValue, setTopLengthValue] = useState(product?.top_length_value || '');
  const [topLengthUnit, setTopLengthUnit] = useState(product?.top_length_unit || 'm');
  const [unit, setUnit] = useState(product?.unit || 'meter');
  
  // Pricing
  const [currencyCode, setCurrencyCode] = useState(
    product?.currency_code ||
    product?.price?.currency_code ||
    'INR'
  );
  const [priceMRP, setPriceMRP] = useState(
    product?.price_mrp ||
    (product?.price?.price_mrp != null ? String(product.price.price_mrp) : '')
  );
  const [priceSale, setPriceSale] = useState(
    product?.price_sale ||
    (product?.price?.price_sale != null ? String(product.price.price_sale) : '')
  );
  
  // Inventory
  const [stockQty, setStockQty] = useState(product?.stock_qty || '');
  
  // Compliance
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    product?.country_of_origin ||
    product?.compliance?.country_of_origin ||
    ''
  );
  const [manufacturerDetails, setManufacturerDetails] = useState(
    product?.manufacturer_details ||
    product?.compliance?.manufacturer_details ||
    ''
  );
  const [packerDetails, setPackerDetails] = useState(
    product?.packer_details ||
    product?.compliance?.packer_details ||
    ''
  );
  const [importerDetails, setImporterDetails] = useState(
    product?.importer_details ||
    product?.compliance?.importer_details ||
    ''
  );
  const [mfgMonthYear, setMfgMonthYear] = useState(
    product?.mfg_month_year ||
    product?.compliance?.mfg_month_year ||
    ''
  );
  const [customerCare, setCustomerCare] = useState(
    product?.customer_care ||
    product?.compliance?.customer_care ||
    ''
  );
  
  const [images, setImages] = useState<ProductImage[]>(
    product?.images ||
    (product?.primary_image?.url
      ? [{
          id: String(product.primary_image.id || 'primary'),
          uri: product.primary_image.url,
          fileName: product.primary_image.file_name || 'primary.jpg',
          isPrimary: true,
        }]
      : [])
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load dropdown data from API
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [brandsRes, categoriesRes, productTypesRes] = await Promise.all([
          getAllBrands(),
          getAllCategories(),
          getAllProductTypes(),
        ]);

        const brandsRaw = brandsRes?.data?.data.brands || [];
        const categoriesRaw = categoriesRes?.data?.data.categories || [];
        const productTypesRaw = productTypesRes?.data?.data?.product_types || [];

        setBrandOptions(brandsRaw);
        setCategoryOptions(categoriesRaw);
        setProductTypeOptions(productTypesRaw);
      } catch (e) {
        console.error('Failed to load dropdown data:', e);
      }
    };

    loadDropdownData();
  }, []);

  // Pick Images
  const handlePickImages = () => {
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: remaining,
        quality: 0.8,
      },
      (response) => {
        console.log('response', response);
        if (response.didCancel) return;
        
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to pick images');
          return;
        }
        
        if (response.assets) {
          const newImages: ProductImage[] = response.assets.map((asset, index) => ({
            id: Date.now() + index + '',
            uri: asset.uri || '',
            fileName: asset.fileName || 'image.jpg',
            isPrimary: images.length === 0 && index === 0,
          }));
          
          setImages([...images, ...newImages]);
          if (errors.images) {
            setErrors({...errors, images: ''});
          }
        }
      }
    );
  };

  const handleRemoveImage = (id: string) => {
    const newImages = images.filter(img => img.id !== id);
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const handleSetPrimaryImage = (id: string) => {
    setImages(images.map(img => ({
      ...img,
      isPrimary: img.id === id,
    })));
  };

  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!categoryId) newErrors.categoryId = 'Category is required';
    if (!unit) newErrors.unit = 'Unit is required';
    if (!priceMRP || parseFloat(priceMRP) <= 0) newErrors.priceMRP = 'Valid MRP is required';
    if (!stockQty || parseFloat(stockQty) < 0) newErrors.stockQty = 'Valid stock quantity is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill all required fields marked with *');
      return;
    }

    setLoading(true);
    
    try {
      // Get logged-in user id for user_id field
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
        console.warn('Unable to parse stored user for user_id', e);
      }

      const productData = {
        user_id: userId ?? undefined,
        title,
        price_mrp: parseFloat(priceMRP),
        brand: brandId ? parseInt(brandId, 10) : null,
        category: categoryId ? parseInt(categoryId, 10) : null,
        sku,
        style_code: styleCode,
        model_name: modelName,
        product_type: productType,
        color,
        brand_color: brandColor,
        fabric,
        fabric_purity: fabricPurity,
        composition,
        pattern,
        stitching_type: stitchingType,
        ideal_for: idealFor,
        unit,
        top_length_value: topLengthValue ? parseFloat(topLengthValue) : null,
        top_length_unit: topLengthUnit,
        sales_package: salesPackage,
        short_description: shortDescription,
        long_description: longDescription,
        is_active: isActive,
        price_sale: priceSale ? parseFloat(priceSale) : null,
        currency_code: currencyCode,
        country_of_origin: countryOfOrigin,
        manufacturer_details: manufacturerDetails,
        packer_details: packerDetails,
        importer_details: importerDetails,
        mfg_month_year: mfgMonthYear,
        customer_care: customerCare,
        // You can add stock_qty or images when backend supports them
      };
      
      console.log('Product Data:', productData);

      let response;
      if (mode === 'edit' && product?.id) {
        response = await updateProduct(product.id, productData);
      } else {
        response = await createProduct(productData);
      }

      console.log('Product save response:', response?.data);
      showSuccessMessage(
        'Product saved',
        `Product ${mode === 'add' ? 'added' : 'updated'} successfully.`
      );
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to save product:', error?.response?.data || error?.message || error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to save product. Please try again.';

      showErrorMessage('Error saving product', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={20} color={Colors.warmBrownColor} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    errorKey: string,
    options?: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric' | 'email-address' | 'decimal-pad' | 'number-pad';
      required?: boolean;
      maxLength?: number;
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {options?.required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          options?.multiline ? styles.textArea : styles.input,
          errors[errorKey] && styles.inputError,
        ]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          if (errors[errorKey]) {
            setErrors({...errors, [errorKey]: ''});
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 4 : 1}
        keyboardType={options?.keyboardType || 'default'}
        maxLength={options?.maxLength}
      />
      {options?.maxLength && options?.multiline && (
        <Text style={styles.charCount}>{value.length}/{options.maxLength}</Text>
      )}
      {errors[errorKey] && (
        <Text style={styles.errorText}>{errors[errorKey]}</Text>
      )}
    </View>
  );

  const renderPicker = (
    label: string,
    selectedValue: string,
    onValueChange: (value: string) => void,
    items: Array<{label: string; value: string}>,
    errorKey?: string,
    required?: boolean,
    allowOther?: boolean
  ) => {
    const [showOtherInput, setShowOtherInput] = React.useState(false);
    const [otherValue, setOtherValue] = React.useState('');
    const [isFocus, setIsFocus] = React.useState(false);

    // Add "Other" option if allowOther is true
    const dropdownItems = allowOther 
      ? [...items, { label: '✏️ Other (Custom)', value: '__OTHER__' }]
      : items;

    React.useEffect(() => {
      // Check if current value is not in predefined list
      if (selectedValue && selectedValue !== '' && selectedValue !== '__OTHER__') {
        const foundItem = items.find(item => item.value === selectedValue);
        if (!foundItem) {
          setShowOtherInput(true);
          setOtherValue(selectedValue);
        }
      }
    }, []);

    const handleValueChange = (value: string) => {
      if (value === '__OTHER__') {
        setShowOtherInput(true);
        setOtherValue('');
        onValueChange('');
      } else {
        setShowOtherInput(false);
        onValueChange(value);
        if (errorKey && errors[errorKey]) {
          setErrors({...errors, [errorKey]: ''});
        }
      }
    };

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        
        {!showOtherInput && (
          <Dropdown
            style={[
              styles.dropdown,
              isFocus && styles.dropdownFocused,
              errorKey && errors[errorKey] && styles.inputError,
            ]}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            inputSearchStyle={styles.dropdownSearchInput}
            iconStyle={styles.dropdownIcon}
            containerStyle={styles.dropdownContainer}
            itemTextStyle={styles.dropdownItemText}
            activeColor={Colors.warmBrownColor + '20'}
            data={dropdownItems}
            search={items.length > 5}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? `Select ${label}` : '...'}
            searchPlaceholder="Search..."
            value={selectedValue}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              handleValueChange(item.value);
              setIsFocus(false);
            }}
            renderLeftIcon={() => (
              isFocus ? (
                <Icon
                  name="chevron-up"
                  size={20}
                  color={Colors.warmBrownColor}
                  style={styles.dropdownLeftIcon}
                />
              ) : null
            )}
            renderRightIcon={() => (
              <Icon
                name={isFocus ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isFocus ? Colors.warmBrownColor : Colors.textSecondary}
                style={styles.dropdownRightIcon}
              />
            )}
          />
        )}
        
        {showOtherInput && (
          <View>
            <TextInput
              style={[styles.input, styles.otherInput]}
              value={otherValue}
              onChangeText={(text) => {
                setOtherValue(text);
                onValueChange(text);
                if (errorKey && errors[errorKey]) {
                  setErrors({...errors, [errorKey]: ''});
                }
              }}
              placeholder={`Enter custom ${label.toLowerCase()}`}
              placeholderTextColor={Colors.textSecondary}
              autoFocus
            />
            <TouchableOpacity
              style={styles.backToDropdownButton}
              onPress={() => {
                setShowOtherInput(false);
                setOtherValue('');
                onValueChange('');
              }}
            >
              <Icon name="arrow-back" size={16} color={Colors.warmBrownColor} />
              <Text style={styles.backToDropdownText}>Back to options</Text>
          </TouchableOpacity>
          </View>
        )}
        
        {errorKey && errors[errorKey] && (
          <Text style={styles.errorText}>{errors[errorKey]}</Text>
        )}
    </View>
  );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* BASIC INFORMATION */}
          {renderSectionHeader('Basic Information', 'information-circle-outline')}
          <View style={styles.section}>
            {renderInput('Product Title', title, setTitle, 'e.g., Premium Cotton Shirt Fabric', 'title', { required: true })}
            
            {renderPicker(
              'Brand',
              brandId,
              setBrandId,
              [
                { label: 'Select Brand', value: '' },
                ...brandOptions.map(b => ({ label: b.name, value: String(b.id) }))
              ]
            )}
            
            {renderPicker(
              'Category',
              categoryId,
              setCategoryId,
              [
                { label: 'Select Category', value: '' },
                ...categoryOptions.map(c => ({ label: c.name, value: String(c.id) }))
              ],
              'categoryId',
              true
            )}
            
            {renderInput('SKU', sku, setSku, 'Stock Keeping Unit', 'sku')}
            {renderInput('Style Code', styleCode, setStyleCode, 'Style Code', 'styleCode')}
            {renderInput('Model Name', modelName, setModelName, 'Model Name', 'modelName')}
            {renderInput('Short Description', shortDescription, setShortDescription, 'Brief description (max 500 characters)', 'shortDescription', { multiline: true, maxLength: 500 })}
            {renderInput('Long Description', longDescription, setLongDescription, 'Detailed product description', 'longDescription', { multiline: true })}
            {renderInput('Sales Package', salesPackage, setSalesPackage, 'e.g., 1 Piece', 'salesPackage')}
            
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Product is Active</Text>
                <Text style={styles.switchSubtext}>
                  {isActive ? 'Visible to customers' : 'Hidden from customers'}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: Colors.grey, true: Colors.warmBrownColor }}
                thumbColor={Colors.whiteColor}
              />
            </View>
          </View>

          {/* PRODUCT DETAILS */}
          {renderSectionHeader('Product Details', 'list-outline')}
          <View style={styles.section}>
            {renderPicker(
              'Product Type',
              productType,
              setProductType,
              [
                { label: 'Select Type', value: '' },
                ...productTypeOptions.map(p => ({ label: p.name, value: String(p.name) }))
              ]
            )}
            
            {renderInput('Color', color, setColor, 'e.g., Navy Blue, Sky Blue, Any color', 'color')}
            {renderInput('Brand Color', brandColor, setBrandColor, 'Brand specific color name', 'brandColor')}
            {renderInput('Fabric', fabric, setFabric, 'e.g., Cotton, Linen, Giza Cotton, Any fabric', 'fabric')}
            
            {renderPicker(
              'Fabric Purity',
              fabricPurity,
              setFabricPurity,
              [
                { label: 'Select', value: '' },
                { label: 'Pure', value: 'Pure' },
                { label: 'Blend', value: 'Blend' },
              ],
              undefined,
              false,
              true
            )}
            
            {renderInput('Composition', composition, setComposition, 'e.g., 90% Cotton / 10% Polyester', 'composition')}
            
            {renderPicker(
              'Pattern',
              pattern,
              setPattern,
              [
                { label: 'Select', value: '' },
                { label: 'Solid', value: 'Solid' },
                { label: 'Checkered', value: 'Checkered' },
                { label: 'Striped', value: 'Striped' },
                { label: 'Printed', value: 'Printed' },
                { label: 'Plain', value: 'Plain' },
              ],
              undefined,
              false,
              true
            )}
            
            {renderPicker(
              'Stitching Type',
              stitchingType,
              setStitchingType,
              [
                { label: 'Select', value: '' },
                { label: 'Unstitched', value: 'Unstitched' },
                { label: 'Stitched', value: 'Stitched' },
              ],
              undefined,
              false,
              true
            )}
            
            {renderPicker(
              'Ideal For',
              idealFor,
              setIdealFor,
              [
                { label: 'Select', value: '' },
                { label: 'Men', value: 'Men' },
                { label: 'Women', value: 'Women' },
                { label: 'Unisex', value: 'Unisex' },
              ],
              undefined,
              false,
              true
            )}
            
            {renderInput('Top Length Value', topLengthValue, setTopLengthValue, '1.6', 'topLengthValue', { keyboardType: 'decimal-pad' })}
            
            {renderPicker(
              'Top Length Unit',
              topLengthUnit,
              setTopLengthUnit,
              [
                { label: 'Meter (m)', value: 'm' },
                { label: 'Centimeter (cm)', value: 'cm' },
                { label: 'Feet (ft)', value: 'ft' },
                { label: 'Yard (yd)', value: 'yd' },
              ]
            )}
            
            {renderPicker(
              'Product Unit',
              unit,
              setUnit,
              [
                { label: 'Meter', value: 'meter' },
                { label: 'Piece', value: 'piece' },
                { label: 'Yard', value: 'yard' },
              ],
              'unit',
              true
            )}
          </View>

          {/* PRICING */}
          {renderSectionHeader('Pricing', 'pricetag-outline')}
          <View style={styles.section}>
            {renderPicker(
              'Currency',
              currencyCode,
              setCurrencyCode,
              [
                { label: 'INR (₹)', value: 'INR' },
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
              ]
            )}
            
            {renderInput('MRP Price', priceMRP, setPriceMRP, '0.00', 'priceMRP', { required: true, keyboardType: 'decimal-pad' })}
            {renderInput('Sale Price (Optional)', priceSale, setPriceSale, '0.00', 'priceSale', { keyboardType: 'decimal-pad' })}
            
            {priceSale && parseFloat(priceSale) > 0 && parseFloat(priceMRP) > 0 && (
              <View style={styles.discountInfo}>
                <Icon name="pricetag" size={16} color="#16A34A" />
                <Text style={styles.discountText}>
                  {Math.round(((parseFloat(priceMRP) - parseFloat(priceSale)) / parseFloat(priceMRP)) * 100)}% OFF
                </Text>
                <Text style={styles.savingsText}>
                  Save {currencyCode === 'INR' ? '₹' : currencyCode === 'USD' ? '$' : '€'}{(parseFloat(priceMRP) - parseFloat(priceSale)).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* PRODUCT IMAGES */}
          {renderSectionHeader('Product Images', 'images-outline')}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>
              Upload Images <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helperText}>Add up to 5 images. First image will be primary.</Text>
            
            <View style={styles.imagesGrid}>
              {images.map((img) => (
                <View key={img.id} style={styles.imageCard}>
                  <Image source={{ uri: img.uri }} style={styles.productImage} />
                  {img.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>Primary</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(img.id)}
                  >
                    <Icon name="close-circle" size={24} color={Colors.whiteColor} />
                  </TouchableOpacity>
                  {!img.isPrimary && (
                    <TouchableOpacity
                      style={styles.setPrimaryButton}
                      onPress={() => handleSetPrimaryImage(img.id)}
                    >
                      <Text style={styles.setPrimaryText}>Set Primary</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
                  <Icon name="add-circle-outline" size={40} color={Colors.warmBrownColor} />
                  <Text style={styles.addImageText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {errors.images && (
              <Text style={styles.errorText}>{errors.images}</Text>
            )}
          </View>

          {/* INVENTORY */}
          {renderSectionHeader('Inventory', 'cube-outline')}
          <View style={styles.section}>
            {renderInput('Stock Quantity', stockQty, setStockQty, '0.00', 'stockQty', { required: true, keyboardType: 'decimal-pad' })}
            <Text style={styles.helperText}>Unit: {unit || 'meter'}</Text>
          </View>

          {/* COMPLIANCE */}
          {renderSectionHeader('Compliance Information', 'globe-outline')}
          <View style={styles.section}>
            {renderInput('Country of Origin', countryOfOrigin, setCountryOfOrigin, 'e.g., India', 'countryOfOrigin')}
            {renderInput('Manufacturer Details', manufacturerDetails, setManufacturerDetails, 'Manufacturer name and address', 'manufacturerDetails', { multiline: true })}
            {renderInput('Packer Details', packerDetails, setPackerDetails, 'Packer name and address', 'packerDetails', { multiline: true })}
            {renderInput('Importer Details', importerDetails, setImporterDetails, 'Importer name and address (if applicable)', 'importerDetails', { multiline: true })}
            {renderInput('Manufacturing Month & Year', mfgMonthYear, setMfgMonthYear, 'e.g., Aug 2025', 'mfgMonthYear')}
            {renderInput('Customer Care', customerCare, setCustomerCare, 'Customer care contact details', 'customerCare', { multiline: true })}
          </View>

          {/* Save Button */}
            <CustomButton
              title={mode === 'add' ? 'Add Product' : 'Save Changes'}
              onPress={handleSave}
            loading={loading}
              style={styles.saveButton}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
    fontFamily: GILROY_SEMIBOLD,
  },
  section: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
    fontFamily: GILROY_MEDIUM,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
    fontFamily: GILROY_REGULAR,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: GILROY_REGULAR,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.inputBackground,
  },
  dropdownFocused: {
    borderColor: Colors.warmBrownColor,
    borderWidth: 1.5,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_MEDIUM,
  },
  dropdownSearchInput: {
    height: 40,
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: GILROY_REGULAR,
  },
  dropdownIcon: {
    marginRight: 5,
  },
  dropdownContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_REGULAR,
    paddingVertical: 4,
  },
  dropdownLeftIcon: {
    marginRight: 8,
  },
  dropdownRightIcon: {
    marginLeft: 8,
  },
  otherInput: {
    marginTop: 0,
  },
  backToDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
  },
  backToDropdownText: {
    fontSize: 13,
    color: Colors.warmBrownColor,
    marginLeft: 4,
    fontFamily: GILROY_MEDIUM,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontFamily: GILROY_REGULAR,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
    fontFamily: GILROY_REGULAR,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontFamily: GILROY_REGULAR,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageCard: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    fontSize: 10,
    color: Colors.whiteColor,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  setPrimaryButton: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    borderRadius: 4,
  },
  setPrimaryText: {
    fontSize: 10,
    color: Colors.whiteColor,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputBackground,
  },
  addImageText: {
    fontSize: 12,
    color: Colors.warmBrownColor,
    marginTop: 4,
    fontFamily: GILROY_MEDIUM,
  },
  discountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  discountText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: GILROY_SEMIBOLD,
  },
  savingsText: {
    fontSize: 12,
    color: '#16A34A',
    marginLeft: 8,
    fontFamily: GILROY_REGULAR,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
    fontFamily: GILROY_SEMIBOLD,
  },
  switchSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: Colors.warmBrownColor,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  bottomPadding: {
    height: 40,
  },
});

export default AddEditProduct;
