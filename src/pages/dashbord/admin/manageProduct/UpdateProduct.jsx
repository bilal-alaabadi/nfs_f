// ========================= UpdateProduct.jsx =========================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchProductByIdQuery, useUpdateProductMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
// مهم: استورد كمبوننت "التعديل" وليس تبع الإضافة
import UploadImage from '../manageProduct/UploadImag';

const categories = [
  { label: 'أختر منتج', value: '' },
  { label: 'تفصيل العبايات', value: 'تفصيل العبايات' },
  { label: 'الشيلات فرنسية', value: 'الشيلات فرنسية' },
  { label: 'الشيلات سادة', value: 'الشيلات سادة' },
  { label: 'العطور', value: 'العطور' },
  { label: 'دريسات', value: 'دريسات' },
];

const sizes = [
  { label: 'اختر الحجم', value: '' },
  { label: '1 كيلو', value: '1 كيلو' },
  { label: '500 جرام', value: '500 جرام' },
];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: productData, isLoading: isFetching, error: fetchError } = useFetchProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [product, setProduct] = useState({
    name: '',
    category: '',
    size: '',
    price: '',
    oldPrice: '',
    description: '',
    image: [],
    inStock: true, // الخيار الأول والثابت: المنتج متوفر
  });

  const [showSizeField, setShowSizeField] = useState(false);

  // الصور الجديدة (Files)
  const [newImages, setNewImages] = useState([]);
  // الصور التي سنبقيها من الصور الحالية (روابط)
  const [keepImages, setKeepImages] = useState([]);

  useEffect(() => {
    if (!productData) return;

    // بعض الـ APIs ترجع { product, reviews } — نتعامل مع الحالتين
    const p = productData.product ? productData.product : productData;

    const currentImages = Array.isArray(p?.image)
      ? p.image
      : p?.image
      ? [p.image]
      : [];

    setProduct({
      name: p?.name || '',
      category: p?.category || '',
      size: p?.size || '',
      price: p?.price != null ? String(p.price) : '',
      oldPrice: p?.oldPrice != null ? String(p.oldPrice) : '',
      description: p?.description || '',
      image: currentImages,
      inStock: typeof p?.inStock === 'boolean' ? p.inStock : true, // افتراضي متوفر
    });

    setKeepImages(currentImages);
    setShowSizeField(p?.category === 'حناء بودر');
  }, [productData]);

  useEffect(() => {
    setShowSizeField(product.category === 'حناء بودر');
  }, [product.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      'أسم المنتج': product.name,
      'صنف المنتج': product.category,
      'السعر': product.price,
      'الوصف': product.description,
    };

    if (product.category === 'حناء بودر' && !product.size) {
      alert('الرجاء اختيار الحجم للحناء');
      return;
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      alert(`الرجاء ملء الحقول التالية: ${missingFields.join('، ')}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('category', product.category);
      formData.append('price', product.price);
      formData.append('oldPrice', product.oldPrice || '');
      formData.append('description', product.description);
      formData.append('size', product.size || '');
      formData.append('author', user?._id || '');
      formData.append('inStock', product.inStock); // true = متوفر، false = انتهى المنتج

      // الصور التي نُبقيها من القديمة
      formData.append('keepImages', JSON.stringify(keepImages || []));

      // الصور الجديدة
      if (Array.isArray(newImages) && newImages.length > 0) {
        newImages.forEach((file) => formData.append('image', file));
      }

      await updateProduct({ id, body: formData }).unwrap();
      alert('تم تحديث المنتج بنجاح');
      navigate('/dashboard/manage-products');
    } catch (error) {
      alert('حدث خطأ أثناء تحديث المنتج: ' + (error?.data?.message || error?.message || 'خطأ غير معروف'));
    }
  };

  if (isFetching) return <div className="text-center py-8">جاري تحميل بيانات المنتج...</div>;
  if (fetchError) return <div className="text-center py-8 text-red-500">خطأ في تحميل بيانات المنتج</div>;

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-right">تحديث المنتج</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="اسم المنتج"
          name="name"
          placeholder="أكتب اسم المنتج"
          value={product.name}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
          required
        />

        {showSizeField && (
          <SelectInput
            label="حجم الحناء"
            name="size"
            value={product.size}
            onChange={handleChange}
            options={sizes}
            required={product.category === 'حناء بودر'}
          />
        )}

        <TextInput
          label="السعر الحالي"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
          required
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
        />

        {/* كمبوننت التعديل: يعرض صور حالية + يحذف + يجمع ملفات جديدة */}
        <UploadImage
          name="image"
          id="image"
          initialImages={product.image}   // صور حالية
          setImages={setNewImages}        // ملفات جديدة
          setKeepImages={setKeepImages}   // الصور التي سيتم الإبقاء عليها
        />

        <div className="text-right">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            value={product.description}
            placeholder="أكتب وصف المنتج"
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        {/* خيارات حالة التوفر: الخيار الأول ثابت (متوفر) والثاني (انتهى المنتج) */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="available"
              checked={product.inStock === true}
              onChange={() => setProduct((prev) => ({ ...prev, inStock: true }))}
            />
            <span>المنتج متوفر</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value="ended"
              checked={product.inStock === false}
              onChange={() => setProduct((prev) => ({ ...prev, inStock: false }))}
            />
            <span>انتهى المنتج</span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
