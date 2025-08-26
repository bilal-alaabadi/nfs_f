// ========================= SingleProduct.jsx =========================
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import ReviewsCard from '../reviews/ReviewsCard';

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data, error, isLoading } = useFetchProductByIdQuery(id);
  const { country } = useSelector((state) => state.cart);
  const singleProduct = data;
  const productReviews = data?.reviews || [];

  // سلايدر الصور
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // عداد الكمية (مرتبط مع السلة)
  const [cartQty, setCartQty] = useState(1);

  // القياسات/الخيارات
  const [measurements, setMeasurements] = useState({
    length: '',
    sleeveLength: '',
    width: '',
    design: '',
    color: '',
    buttons: '',
    quantity: '',
    notes: '',
    colorOption: ''
  });

  // العملة وسعر الصرف للعرض فقط
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  useEffect(() => {
    setImageScale(1.05);
    const timer = setTimeout(() => setImageScale(1), 300);
    return () => clearTimeout(timer);
  }, []);

  // تزامن كمية الشيلات مع عداد السلة لعدم الازدواجية
  useEffect(() => {
    if (!singleProduct) return;
    if (singleProduct.category === 'الشيلات فرنسية' || singleProduct.category === 'الشيلات سادة') {
      setMeasurements((prev) => ({ ...prev, quantity: String(cartQty) }));
    }
  }, [cartQty, singleProduct]);

  const handleAddToCart = (product) => {
    // التحقق من الحقول المطلوبة حسب الفئة
    if (product.category === 'تفصيل العبايات') {
      if (!measurements.length || !measurements.sleeveLength ||
          !measurements.width || !measurements.color ||
          !measurements.design || !measurements.buttons) {
        alert('الرجاء إدخال جميع القياسات المطلوبة');
        return;
      }
    } else if (product.category === 'الشيلات فرنسية' || product.category === 'الشيلات سادة') {
      if (!measurements.quantity || !measurements.colorOption) {
        alert('الرجاء إدخال الكمية وتحديد اللون');
        return;
      }
      if (Number(measurements.quantity) !== cartQty) {
        alert('تمت مزامنة كمية الشراء مع عداد الكمية');
        setMeasurements((prev) => ({ ...prev, quantity: String(cartQty) }));
      }
    } else if (product.category === 'دريسات') {
      if (!measurements.color || !measurements.length) {
        alert('الرجاء إدخال رقم اللون والطول');
        return;
      }
    }

    // حساب خصم الشيلات: خصم "ريال لكل زوج"
    const isShayla =
      product.category === 'الشيلات فرنسية' || product.category === 'الشيلات سادة';
    const unitBasePrice = product.regularPrice || product.price || 0;
    const unitDisplayPrice = unitBasePrice * exchangeRate;
    const subtotal = unitDisplayPrice * cartQty;

    const pairsCount = isShayla ? Math.floor(cartQty / 2) : 0;
    const pairDiscount = pairsCount * (1 * exchangeRate);

    const lineTotal = Math.max(0, subtotal - pairDiscount);

    setIsAddingToCart(true);

    const productToAdd = {
      ...product,
      price: unitBasePrice,
      measurements: measurements,
      quantity: cartQty,
      appliedDiscount: pairDiscount,
      lineTotal,
      currency,
      exchangeRate,
      promoTag: isShayla && pairsCount > 0 ? `خصم ريال لكل زوج ( ${pairsCount} زوج )` : null,
    };

    dispatch(addToCart(productToAdd));

    setTimeout(() => {
      setIsAddingToCart(false);
    }, 700);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === singleProduct.image.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? singleProduct.image.length - 1 : prevIndex - 1
    );
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurements((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'quantity') {
        const q = parseInt(value || '1', 10);
        setCartQty(isNaN(q) || q < 1 ? 1 : q);
      }
      return updated;
    });
  };

  // عداد الكمية (أزرار)
  const increaseQty = () => setCartQty((q) => q + 1);
  const decreaseQty = () => setCartQty((q) => (q > 1 ? q - 1 : 1));

  if (isLoading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ أثناء تحميل تفاصيل المنتج.</p>;
  if (!singleProduct) return null;

  // الأسعار للعرض
  const currentBasePrice = singleProduct.regularPrice || singleProduct.price || 0;
  const unitPrice = currentBasePrice * exchangeRate;
  const isShayla =
    singleProduct.category === 'الشيلات فرنسية' || singleProduct.category === 'الشيلات سادة';

  const subtotal = unitPrice * cartQty;
  const pairsCount = isShayla ? Math.floor(cartQty / 2) : 0;
  const pairDiscount = pairsCount * (1 * exchangeRate);
  const totalAfterDiscount = Math.max(0, subtotal - pairDiscount);

  const oldPrice = singleProduct.oldPrice ? singleProduct.oldPrice * exchangeRate : null;
  const hasRealDiscount = oldPrice && singleProduct.oldPrice > currentBasePrice;
  const discountPercentage = hasRealDiscount
    ? Math.round(((oldPrice - unitPrice) / oldPrice) * 100)
    : 0;

  return (
    <>
      <section className=' bg-[#e2e5e5]'>
        <h2 className='section__header capitalize'>صفحة المنتج الفردي</h2>
        <div className='section__subheader space-x-2'>
          <span className='hover:text-[#CB908B]'><Link to="/">الرئيسية</Link></span>
          <i className="ri-arrow-right-s-line"></i>
          <span className='hover:text-[#CB908B]'><Link to="/shop">المتجر</Link></span>
          <i className="ri-arrow-right-s-line"></i>
          <span className='hover:text-[#CB908B]'>{singleProduct.name}</span>
        </div>
      </section>

      <section className='section__container mt-8' dir='rtl'>
        <div className='flex flex-col items-center md:flex-row gap-8'>
          {/* الصور */}
          <div className='md:w-1/2 w-full relative'>
            {hasRealDiscount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                خصم {discountPercentage}%
              </div>
            )}

            {singleProduct.image && singleProduct.image.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-md">
                  <img
                    src={singleProduct.image[currentImageIndex]}
                    alt={singleProduct.name}
                    className={`w-full h-auto transition-transform duration-300`}
                    style={{ transform: `scale(${imageScale})` }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/500";
                      e.target.alt = "Image not found";
                    }}
                  />
                </div>

                {singleProduct.image.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className='absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#CB908B] text-white p-2 rounded-full hover:opacity-90'
                      aria-label="الصورة السابقة"
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button
                      onClick={nextImage}
                      className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#CB908B] text-white p-2 rounded-full hover:opacity-90'
                      aria-label="الصورة التالية"
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </>
                )}

                {/* جميع الصور في الأسفل */}
                {singleProduct.image.length > 1 && (
                  <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2">
                    {singleProduct.image.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative rounded-md overflow-hidden border ${currentImageIndex === idx ? 'border-[#CB908B]' : 'border-gray-200'} hover:border-[#CB908B]`}
                        aria-label={`صورة رقم ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${singleProduct.name} - ${idx + 1}`}
                          className="w-full h-16 object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                            e.target.alt = "Image not found";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-red-600">لا توجد صور متاحة لهذا المنتج.</p>
            )}
          </div>

          {/* التفاصيل */}
          <div className='md:w-1/2 w-full'>
            <h3 className='text-2xl font-semibold mb-4'>{singleProduct.name}</h3>

            {/* ملاحظة جميلة خاصة بالدريسات */}
            {singleProduct.category === 'دريسات' && (
              <div className="mb-4">
                <div className="relative overflow-hidden rounded-lg border border-rose-200 bg-gradient-to-l from-pink-100 to-rose-50 p-3 text-center text-rose-700 font-semibold">
                  <span className="inline-flex items-center gap-2">
                    <i className="ri-heart-2-line text-xl"></i>
                    العرض يناسب جميع المقاسات
                  </span>
                  <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-rose-200 opacity-40"></span>
                  <span className="pointer-events-none absolute -left-6 -bottom-6 h-16 w-16 rounded-full bg-rose-200 opacity-40"></span>
                </div>
              </div>
            )}

            {/* عرض السعر والإجماليات */}
            <div className='mb-4'>
              <div className='text-xl text-[#CB908B] space-x-1 flex items-center gap-3'>
                <span>سعر الوحدة: {unitPrice.toFixed(2)} {currency}</span>
                {hasRealDiscount && oldPrice && (
                  <s className="text-[#9B2D1F] text-sm">{oldPrice.toFixed(2)} {currency}</s>
                )}
              </div>

              <div className="mt-3 rounded-md p-3 text-sm">
                {/* يظهر فقط إذا في خصم */}
                {pairDiscount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>الإجمالي الفرعي</span>
                      <span>{subtotal.toFixed(2)} {currency}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 mt-1">
                      <span>
                        عرض الشيلات: خصم ريال لكل زوج (مُفعّل - {pairsCount} زوج)
                      </span>
                      <span>- {pairDiscount.toFixed(2)} {currency}</span>
                    </div>

                    <div className="flex justify-between font-semibold mt-2 border-t pt-2">
                      <span>الإجمالي</span>
                      <span>{totalAfterDiscount.toFixed(2)} {currency}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* معلومات */}
            <div className='flex flex-col space-y-2'>
              <p className="text-gray-500 mb-4 text-lg font-medium leading-relaxed">
                <span className="text-gray-800 font-bold block">الفئة:</span>
                <span className="text-gray-600">{singleProduct.category}</span>
              </p>
            </div>
            <p className="text-gray-500 mb-4 text-lg font-medium leading-relaxed">
              <span className="text-gray-800 font-bold block">الوصف:</span>
              <span className="text-gray-600">{singleProduct.description}</span>
            </p>

            {/* عداد الكمية العام */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-semibold">الكمية</label>
              <div className="inline-flex items-center gap-3 bg-gray-100 rounded-md p-2">
                <button
                  type="button"
                  onClick={decreaseQty}
                  className="w-9 h-9 flex items-center justify-center rounded-md bg-[#CB908B] text-white hover:opacity-90"
                  aria-label="تقليل الكمية"
                >
                  -
                </button>
                <div className="min-w-[3rem] text-center font-semibold">{cartQty}</div>
                <button
                  type="button"
                  onClick={increaseQty}
                  className="w-9 h-9 flex items-center justify-center rounded-md bg-[#CB908B] text-white hover:opacity-90"
                  aria-label="زيادة الكمية"
                >
                  +
                </button>
              </div>
              {(singleProduct.category === 'الشيلات فرنسية' || singleProduct.category === 'الشيلات سادة') && (
                <p className="text-xs text-gray-500 mt-1">* سيتم مزامنة هذه الكمية مع حقل كمية الشيلات.</p>
              )}
            </div>

            {/* قياسات العبايات */}
            {singleProduct.category === 'تفصيل العبايات' && (
              <div className="mb-6">
                <div className=" p-4 rounded-md">
                  <h4 className="text-lg font-semibold mb-4 text-[#CB908B]">تفاصيل القياسات المطلوبة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">الطول (بالبوصة)</label>
                      <input
                        type="number"
                        name="length"
                        value={measurements.length}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="أدخل الطول"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">طول الكم من نصف الرقبة (بالبوصة)</label>
                      <input
                        type="number"
                        name="sleeveLength"
                        value={measurements.sleeveLength}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="أدخل طول الكم"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">العرض (بالبوصة)</label>
                      <input
                        type="number"
                        name="width"
                        value={measurements.width}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="أدخل العرض"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">اللون</label>
                      <input
                        type="text"
                        name="color"
                        value={measurements.color}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="أدخل اللون المطلوب"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">القطعة</label>
                      <select
                        name="design"
                        value={measurements.design}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">اختر القصة</option>
                        <option value="مثل المعروضة">مثل المعروضة</option>
                        <option value="عادية">عادية</option>
                        <option value="كلوش">كلوش</option>
                        <option value="بحريني">بحريني</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">الأزرار</label>
                      <select
                        name="buttons"
                        value={measurements.buttons}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">اختر نوع الأزرار</option>
                        <option value="بدون أزرار">بدون أزرار</option>
                        <option value="مع أزرار">مع أزرار</option>
                        <option value="خياطة بدون أزرار">خياطة بدون أزرار</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* خيارات الشيلات */}
            {(singleProduct.category === 'الشيلات فرنسية' || singleProduct.category === 'الشيلات سادة') && (
              <div className="mb-6">
                <div className=" p-4 rounded-md">
                  <h4 className="text-lg font-semibold mb-4 text-[#CB908B]">خيارات الشيلات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">الكمية</label>
                      <input
                        type="number"
                        name="quantity"
                        value={measurements.quantity}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="أدخل الكمية المطلوبة"
                        required
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">اختر اللون</label>
                      <select
                        name="colorOption"
                        value={measurements.colorOption}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">اختر اللون</option>
                        <option value="أسود">أسود</option>
                        <option value="أبيض">أبيض</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* يتم ربط هذه الكمية بعدّاد الكمية بالأعلى.</p>
                </div>
              </div>
            )}

            {/* خيارات الدريسات */}
            {singleProduct.category === 'دريسات' && (
              <div className="mb-6">
                <div className="bg-gray-100 p-4 rounded-md">
                  <h4 className="text-lg font-semibold mb-4 text-[#CB908B]">خيارات الدرسات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">رقم اللون</label>
                      <input
                        type="text"
                        name="color"
                        value={measurements.color}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="أدخل رقم اللون"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">الطول</label>
                      <input
                        type="text"
                        name="length"
                        value={measurements.length}
                        onChange={handleMeasurementChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="أدخل الطول المطلوب"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
                    <textarea
                      name="notes"
                      value={measurements.notes}
                      onChange={handleMeasurementChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="أدخل أي ملاحظات إضافية"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(singleProduct);
              }}
              className={`mt-6 px-6 py-3 bg-[#CB908B] text-white rounded-md hover:opacity-90 transition-all duration-200 relative overflow-hidden ${
                isAddingToCart ? 'bg-green-600' : ''
              }`}
              disabled={
                (singleProduct.category === 'تفصيل العبايات' &&
                  (!measurements.length || !measurements.sleeveLength ||
                    !measurements.width || !measurements.color ||
                    !measurements.design || !measurements.buttons)) ||
                ((singleProduct.category === 'الشيلات فرنسية' || singleProduct.category === 'الشيلات سادة') &&
                  (!measurements.quantity || !measurements.colorOption)) ||
                (singleProduct.category === 'دريسات' &&
                  (!measurements.color || !measurements.length))
              }
            >
              {isAddingToCart ? (
                <>
                  <span className="animate-bounce">تمت الإضافة!</span>
                  <span className="absolute inset-0 bg-green-600 opacity-0 animate-fade"></span>
                </>
              ) : (
                'إضافة إلى السلة'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* التقييمات */}
      <section className='section__container mt-8' dir='rtl'>
        <ReviewsCard productReviews={productReviews} />
      </section>
    </>
  );
};

export default SingleProduct;
