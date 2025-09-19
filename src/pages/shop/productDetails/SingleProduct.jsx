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
  };

  const nextImage = () =>
    setCurrentImageIndex((prev) => (images.length ? (prev === images.length - 1 ? 0 : prev + 1) : 0));

  const prevImage = () =>
    setCurrentImageIndex((prev) => (images.length ? (prev === 0 ? images.length - 1 : prev - 1) : 0));

  return (
    <section className="section__container mt-8" dir="rtl">
      <div className="flex flex-col items-center md:flex-row gap-8">
        {/* الصور */}
        <div className="md:w-1/2 w-full relative">
          {images.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-md">
                <img
                  src={images[currentImageIndex]}
                  alt={data.name}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x800?text=Image+Not+Found';
                    e.currentTarget.alt = 'صورة غير متوفرة';
                  }}
                />
              </div>

              {/* أزرار تنقل فوق الصورة */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#a68b2c] text-white p-2 rounded-full"
                    aria-label="السابق"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#a68b2c] text-white p-2 rounded-full"
                    aria-label="التالي"
                  >
                    ›
                  </button>
                </>
              )}

              {/* معرض الصور المصغرة أسفل الصورة الرئيسية */}
              {images.length > 1 && (
                <div className="mt-4">
                  {/* على الشاشات الصغيرة: سطر أفقي قابل للتمرير، وعلى الشاشات الكبيرة: شبكة حلوة */}
                  <div className="block md:hidden">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                      {images.map((img, idx) => {
                        const active = idx === currentImageIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border transition
                              ${active ? 'border-[#a68b2c] ring-2 ring-[#a68b2c]/40' : 'border-gray-200 hover:border-[#a68b2c]'}`}
                            aria-label={`الصورة ${idx + 1}`}
                          >
                            <img
                              src={img}
                              alt={`${data.name} - ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/150';
                                e.currentTarget.alt = 'صورة غير متوفرة';
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="hidden md:grid grid-cols-6 lg:grid-cols-8 gap-3">
                    {images.map((img, idx) => {
                      const active = idx === currentImageIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative rounded-md overflow-hidden border transition 
                            ${active ? 'border-[#a68b2c] ring-2 ring-[#a68b2c]/40' : 'border-gray-200 hover:border-[#a68b2c]'}`}
                          aria-label={`الصورة ${idx + 1}`}
                        >
                          <img
                            src={img}
                            alt={`${data.name} - ${idx + 1}`}
                            className="w-full h-20 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/150';
                              e.currentTarget.alt = 'صورة غير متوفرة';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p>لا توجد صور متاحة.</p>
          )}
        </div>

        {/* التفاصيل */}
        <div className="md:w-1/2 w-full">
          <h3 className="text-2xl font-semibold mb-4 text-black">{data.name}</h3>
          <p className="text-gray-700 mb-2">الفئة: {data.category}</p>
          <p className="text-gray-700 mb-4">{data.description}</p>

          <div className="text-xl text-black mb-6">
            السعر: {unitPrice.toFixed(2)} {currency}
          </div>

          {/* عداد الكمية */}
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCartQty((q) => (q > 1 ? q - 1 : 1))}
              className="w-10 h-10 flex items-center justify-center bg-[#a68b2c] text-white rounded-md"
              aria-label="تقليل الكمية"
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
              aria-label="زيادة الكمية"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="px-6 py-3 bg-[#a68b2c] text-white rounded-md hover:opacity-90"
          >
            إضافة إلى السلة
          </button>
        </div>
      </div>
    </section>
  );
};

export default SingleProduct;
