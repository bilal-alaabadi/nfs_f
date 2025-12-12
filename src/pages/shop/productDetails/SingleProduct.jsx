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
      {/* مركز العناصر عموديًا وأفقيًا على الشاشات الصغيرة، ومحاذاة يمين على الكبيرة */}
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between gap-10 md:gap-12">
        {/* الصور */}
        <div className="md:w-1/2 w-full relative flex flex-col items-center">
          {images.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-md max-w-[520px] w-full">
                <img
                  src={images[currentImageIndex]}
                  alt={data.name}
                  className="w-full h-auto mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x800?text=Image+Not+Found';
                    e.currentTarget.alt = 'صورة غير متوفرة';
                  }}
                />
              </div>

              {/* أزرار تنقل */}
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

              {/* معرض الصور المصغرة */}
              {images.length > 1 && (
                <div className="mt-4 w-full">
                  {/* موبايل: سطر قابل للتمرير ومتمركز */}
                  <div className="block md:hidden">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar justify-center">
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

                  {/* دِسك توب: شبكة ومتمركزة */}
                  <div className="hidden md:grid grid-cols-6 lg:grid-cols-8 gap-3 place-items-center">
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
                            className="w-24 h-20 object-cover"
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
            <p className="text-center">لا توجد صور متاحة.</p>
          )}
        </div>

        {/* التفاصيل */}
<div className="md:w-1/2 w-full flex flex-col items-center text-center md:items-start md:text-right pt-10">
  <h3 className="text-2xl font-semibold mb-2 text-black">{data.name}</h3>

  <p className="text-gray-700 mb-2">الفئة: {data.category}</p>

  {typeof data.salesCount === 'number' && data.salesCount > 0 && (
    <p className="text-green-600 text-xl font-bold mb-2">
      عدد المبيعات: {data.salesCount}
    </p>
  )}

  <p className="text-gray-700 mb-4 max-w-prose">
    {data.description}
  </p>

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

  <button
    onClick={handleAddToCart}
    className="px-8 py-3 bg-[#a68b2c] text-white rounded-md hover:opacity-90"
  >
    إضافة إلى السلة
  </button>
</div>


      </div>
    </section>
  );
};

export default SingleProduct;
