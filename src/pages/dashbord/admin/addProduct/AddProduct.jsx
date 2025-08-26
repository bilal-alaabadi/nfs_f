import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';

const categories = [
  { label: 'أختر منتج', value: '' },
  { label: 'تفصيل العبايات', value: 'تفصيل العبايات' },
  { label: 'الشيلات فرنسية', value: 'الشيلات فرنسية' },
  { label: 'الشيلات سادة', value: 'الشيلات سادة' },
  { label: 'العطور', value: 'العطور' },
  { label: 'دريسات', value: 'دريسات' },
];

const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    oldPrice: '',
    inStock: true, // متوفر افتراضياً
  });

  const [image, setImage] = useState([]);

  const [addProduct, { isLoading }] = useAddProductMutation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ended' && type === 'checkbox') {
      // إذا تم التأشير على "هل انتهى المنتج؟" = نعم → inStock = false
      setProduct((prev) => ({ ...prev, inStock: !checked }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      'أسم المنتج': product.name,
      'صنف المنتج': product.category,
      'السعر': product.price,
      'الوصف': product.description,
      'الصور': image.length > 0,
    };

    const missing = Object.entries(required)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    if (missing.length) {
      alert(`الرجاء ملء الحقول التالية: ${missing.join('، ')}`);
      return;
    }

    try {
      await addProduct({
        ...product,
        image,
        author: user?._id,
      }).unwrap();

      alert('تمت أضافة المنتج بنجاح');
      setProduct({ name: '', category: '', oldPrice: '', price: '', description: '', inStock: true });
      setImage([]);
      navigate('/shop');
    } catch (err) {
      console.error('Failed to submit product', err);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">أضافة منتج جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="أسم المنتج"
          name="name"
          placeholder="أكتب أسم المنتج"
          value={product.name}
          onChange={handleChange}
        />

        <SelectInput
          label="صنف المنتج"
          name="category"
          value={product.category}
          onChange={handleChange}
          options={categories}
        />

        <TextInput
          label="السعر القديم (اختياري)"
          name="oldPrice"
          type="number"
          placeholder="100"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <TextInput
          label="السعر"
          name="price"
          type="number"
          placeholder="50"
          value={product.price}
          onChange={handleChange}
        />

        {/* هل انتهى المنتج؟ (إذا تم التأشير = لا يمكن إضافته للسلة) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ended"
            name="ended"
            checked={!product.inStock}
            onChange={handleChange}
          />
          <label htmlFor="ended">هل انتهى المنتج؟</label>
        </div>

        <UploadImage
          name="image"
          id="image"
          uploaded={image}
          setImage={setImage}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            وصف المنتج
          </label>
          <textarea
            name="description"
            id="description"
            className="add-product-InputCSS"
            value={product.description}
            placeholder="اكتب وصف المنتج"
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isLoading}>
            {isLoading ? 'جاري الإضافة...' : 'أضف منتج'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
