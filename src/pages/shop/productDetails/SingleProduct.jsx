// ========================= src/pages/shop/SingleProduct.jsx =========================
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data, error, isLoading } = useFetchProductByIdQuery(id);
  const { country } = useSelector((state) => state.cart);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartQty, setCartQty] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  const isAEDCountry = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAEDCountry ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAEDCountry ? 9.5 : 1;

  if (isLoading) return <p className="text-center py-10">جاري التحميل...</p>;
  if (error) return <p className="text-center py-10 text-red-600">حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;
  if (!data) return null;

  const images = Array.isArray(data.image) ? data.image : (data.image ? [data.image] : []);
  const unitPrice = (data.regularPrice || data.price || 0) * exchangeRate;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...data,
        price: data.price,
        quantity: cartQty,
        currency,
        exchangeRate,
      })
    );

    setAddedMessage(true);
    setCartQty(1);

    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  return (
    <section className="section__container mt-8" dir="rtl">
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between gap-10 md:gap-12">

        {/* الصور */}
        <div className="md:w-1/2 w-full flex flex-col items-center">
          {images.length > 0 ? (
            <div className="overflow-hidden rounded-md max-w-[520px] w-full">
              <img
                src={images[currentImageIndex]}
                alt={data.name}
                className="w-full h-auto mx-auto"
              />
            </div>
          ) : (
            <p className="text-center">لا توجد صور متاحة.</p>
          )}
        </div>

        {/* التفاصيل */}
        <div className="md:w-1/2 w-full flex flex-col items-center text-center md:items-start md:text-right pt-10">
          <h3 className="text-2xl font-semibold mb-2 text-black">{data.name}</h3>

          <p className="text-gray-700 mb-2">الفئة: {data.category}</p>

          <p className="text-gray-700 mb-4 max-w-prose">
            {data.description}
          </p>

          {/* ✅ عدد المبيعات */}
{data.salesCount > 0 && (
  <p className="text-green-600 mb-3 font-semibold">
    عدد المبيعات: {data.salesCount}
  </p>
)}


          <div className="text-2xl text-black mb-6">
            السعر: {unitPrice.toFixed(2)} {currency}
          </div>

          {/* عداد الكمية */}
          <div className="mb-6 flex items-center justify-center md:justify-start gap-4 w-full">
            <button
              type="button"
              onClick={() => setCartQty((q) => (q > 1 ? q - 1 : 1))}
              className="w-10 h-10 flex items-center justify-center bg-[#a68b2c] text-white rounded-md"
            >
              -
            </button>

            <div className="min-w-[3rem] text-center font-bold text-lg text-black">
              {cartQty}
            </div>

            <button
              type="button"
              onClick={() => setCartQty((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center bg-[#a68b2c] text-white rounded-md"
            >
              +
            </button>
          </div>

          {/* زر الإضافة */}
          <button
            onClick={handleAddToCart}
            className="px-8 py-3 bg-[#a68b2c] text-white rounded-md hover:opacity-90"
          >
            إضافة إلى السلة
          </button>

          {addedMessage && (
            <p className="mt-4 text-green-600 font-semibold">
              ✅ تم إضافة المنتج إلى السلة
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SingleProduct;
