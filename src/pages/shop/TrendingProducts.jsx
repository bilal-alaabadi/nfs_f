// ========================= src/components/shop/TrendingProducts.jsx =========================
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../../components/RatingStars';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import log from "../../assets/Screenshot_2025-08-23_183158-removebg-preview.png"; // شعار الأنثور

const TrendingProducts = ({ onProductsLoaded }) => {
  const [visibleProducts, setVisibleProducts] = useState(4);
  const { country } = useSelector((state) => state.cart);

  const {
    data: { products = [] } = {},
    error,
    isLoading,
  } = useFetchAllProductsQuery({
    category: '',
    page: 1,
    limit: 20,
  });

  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && !notifiedRef.current) {
      if (onProductsLoaded) onProductsLoaded();
      notifiedRef.current = true;
    }
  }, [isLoading, onProductsLoaded]);

  const isAEDCountry = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAEDCountry ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAEDCountry ? 9.5 : 1;

  const loadMoreProducts = () => setVisibleProducts((prev) => prev + 4);

  const getFirstPrice = (product) => {
    if (!product) return 0;
    if (product.category === 'حناء بودر' && product.price && typeof product.price === 'object') {
      return (product.price['500 جرام'] || product.price['1 كيلو'] || 0) * exchangeRate;
    }
    return (product.regularPrice || product.price || 0) * exchangeRate;
  };

  const getOldPrice = (product) => {
    if (!product?.oldPrice) return null;
    return product.oldPrice * exchangeRate;
  };

  if (isLoading) {
    return (
      <section className="section__container product__container">
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90">
          <img src={log} alt="شعار الأنثور" className="h-24 w-auto animate-pulse" draggable="false" />
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">حدث خطأ أثناء جلب البيانات.</div>;
  }

  return (
    <section className="section__container product__container">
      <div className="relative text-center" dir="rtl">
        <h2 className="text-[32px] font-normal text-[#CB908B] mb-1"> أحدث المنتجات</h2>

        <div className="flex items-center justify-center gap-3 relative z-10">
          <span className="flex-1 max-w-[100px] h-px bg-[#c8c5b9]"></span>
          <img src={log} alt="شعار الأنثور" className="h-20 w-auto object-contain" />
          <span className="flex-1 max-w-[100px] h-px bg-[#c8c5b9]"></span>
        </div>
      </div>

      <div className="mt-12" dir="rtl">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, visibleProducts).map((product) => {
            const price = getFirstPrice(product);
            const oldPrice = getOldPrice(product);
            const discountPercentage =
              oldPrice && oldPrice !== price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

            const qtyCandidate = [product?.stock, product?.quantity, product?.availableQty, product?.available]
              .find((v) => Number.isFinite(Number(v)));
            const availableQty = qtyCandidate !== undefined ? Number(qtyCandidate) : undefined;
            const isOutOfStock = product?.inStock === false ||
              (typeof availableQty === 'number' && availableQty <= 0);

            return (
              <div
                key={product._id}
                className="product__card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full"
              >
                {oldPrice && oldPrice !== price && (
                  <div className="absolute top-3 left-3 bg-[#CB908B] text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    خصم {discountPercentage}%
                  </div>
                )}

                <div className="relative flex-grow">
                  {!isOutOfStock ? (
                    <Link to={`/shop/${product._id}`} className="block h-full">
                      <div className="h-80 w-full overflow-hidden">
                        <img
                          src={product.image?.[0] || 'https://via.placeholder.com/300'}
                          alt={product.name || 'صورة المنتج'}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300';
                            e.currentTarget.alt = 'صورة المنتج غير متوفرة';
                          }}
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="block h-full cursor-not-allowed select-none relative" aria-disabled="true">
                      <div className="h-80 w-full overflow-hidden">
                        <img
                          src={product.image?.[0] || 'https://via.placeholder.com/300'}
                          alt={product.name || 'صورة المنتج'}
                          className="w-full h-full object-cover opacity-70"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300';
                            e.currentTarget.alt = 'صورة المنتج غير متوفرة';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded-md">انتهى المنتج</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 text-center">
                  <h4 className="text-lg font-semibold mb-1 line-clamp-2" title={product.name}>
                    {product.name || 'اسم المنتج'}
                  </h4>
                  <p className="text-gray-500 text-sm mb-3">{product.category || 'فئة غير محددة'}</p>

                  <div className="space-y-1 text-center">
                    <div className="font-medium text-lg">
                      {price.toFixed(2)} {currency}
                    </div>
                    {oldPrice && oldPrice !== price && (
                      <s className="text-red-500 text-sm">
                        {oldPrice.toFixed(2)} {currency}
                      </s>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {visibleProducts < products.length && (
        <div className="product__btn text-center mt-8" dir="rtl">
          <button
            className="hover:bg-[#c19e22] bg-[#CB908B] text-white px-6 py-2 rounded-md transition-colors"
            onClick={loadMoreProducts}
          >
            عرض المزيد
          </button>
        </div>
      )}
    </section>
  );
};

export default TrendingProducts;
