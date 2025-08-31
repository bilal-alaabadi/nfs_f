// ========================= src/components/cart/OrderSummary.jsx =========================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const OrderSummary = ({ onClose }) => {
  const dispatch = useDispatch();
  const { products = [], totalPrice = 0, shippingFee = 0, country } = useSelector((s) => s.cart);

  // ✅ إذا زادت المنتجات عن 2: نجعل "تفاصيل العناصر" قابلة للطيّ ومغلقة افتراضيًا
  const [showItems, setShowItems] = useState(products.length <= 2);
  useEffect(() => {
    setShowItems(products.length <= 2);
  }, [products.length]);

  const collapsible = products.length > 2;

  const isAED = country === 'الإمارات' || country === 'دول الخليج';
  const currency = isAED ? 'د.إ' : 'ر.ع.';
  const exchangeRate = isAED ? 9.5 : 1;

  // الشحن محفوظ بالريال العُماني. لدول الخليج نفرض 5 ر.ع.
  const baseShippingFee = country === 'دول الخليج' ? 5 : Number(shippingFee || 0);

  const grandTotal = (Number(totalPrice) + Number(baseShippingFee)) * exchangeRate;
  const formattedTotalPrice = (Number(totalPrice) * exchangeRate).toFixed(2);
  const formattedShippingFee = (Number(baseShippingFee) * exchangeRate).toFixed(2);
  const formattedGrandTotal = grandTotal.toFixed(2);

  // تفاصيل المقاسات/الملاحظات — تُعرض دائمًا داخل بطاقة العنصر عندما تكون القائمة مفتوحة
  const renderMeasurementsDetails = (item) => {
    const m = item?.measurements;
    if (!m) return null;
    return (
      <div className="mt-2 text-sm md:text-base text-gray-700 space-y-1">
        {m.length && <p>الطول: {m.length}</p>}
        {m.sleeveLength && <p>طول الكم: {m.sleeveLength}</p>}
        {m.width && <p>العرض: {m.width}</p>}
        {m.color && <p>اللون: {m.color}</p>}
        {m.design && <p>القصة: {m.design}</p>}
        {m.buttons && <p>الأزرار: {m.buttons}</p>}
        {m.quantity && <p>كمية الشيلات (اختياري): {m.quantity}</p>}
        {m.colorOption && <p>خيار اللون: {m.colorOption}</p>}
        {m.notes && <p>ملاحظات: {m.notes}</p>}
      </div>
    );
  };

  // معلومات خصم الأزواج للشيلات (عرض فقط)
  const getPairDiscountInfo = (item) => {
    const qty = Number(item?.quantity || 0);
    const isShayla =
      item?.category === 'الشيلات فرنسية' || item?.category === 'الشيلات سادة';
    if (!isShayla || qty < 2) return null;
    const pairs = Math.floor(qty / 2);
    const discountAmount = (pairs * (1 * exchangeRate)).toFixed(2); // 1 ر.ع لكل زوج (تعرض بالعملة الحالية)
    return { pairs, discountAmount };
  };

  return (
    <div className="text-sm text-gray-800" dir="rtl">
      {/* قائمة المنتجات */}
      {products.length > 0 && (
        <div className="mb-4">
          {/* العنوان يصبح زرًا عند وجود أكثر من عنصرين */}
          <button
            type="button"
            onClick={collapsible ? () => setShowItems((v) => !v) : undefined}
            className={`w-full flex items-center justify-between font-semibold text-gray-700 ${
              collapsible ? 'cursor-pointer select-none' : 'cursor-default'
            }`}
            aria-expanded={showItems}
          >
            <span>تفاصيل العناصر</span>
            {collapsible && (
              <span className="text-xs text-gray-500">
                ({products.length}) {showItems ? 'إخفاء' : 'عرض'}
              </span>
            )}
          </button>

          {/* القائمة تظهر فقط إذا showItems = true */}
          {showItems && (
            <div className="mt-2 space-y-2">
              {products.map((item, i) => {
                const qty = Number(item?.quantity || 0);
                const pairInfo = getPairDiscountInfo(item);

                return (
                  <div
                    key={`${item?._id || item?.id || i}`}
                    className="rounded-md border border-gray-200 p-3"
                  >
                    {/* السطر الأساسي */}
                    <div className="flex items-center justify-between">
                      <div className="text-gray-700">
                        <span className="inline-block min-w-10">عنصر #{i + 1}</span>
                        <span className="mx-2">× {qty}</span>
                      </div>
                    </div>

                    {/* خصم الأزواج إن وُجد */}
                    {pairInfo && (
                      <p className="text-[11px] text-emerald-700 mt-1">
                        خصم الأزواج: −{pairInfo.discountAmount} {currency} ({pairInfo.pairs} زوج)
                      </p>
                    )}

                    {/* تفاصيل المقاسات/الملاحظات */}
                    {renderMeasurementsDetails(item)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* المجاميع */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الإجمالي الفرعي</span>
          <span className="font-medium">
            {formattedTotalPrice} {currency}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الشحن</span>
          <span className="font-medium">
            {formattedShippingFee} {currency}
          </span>
        </div>

        <p className="text-[12px] text-gray-500 leading-5 mt-2">
          سيتم احتساب الشحن والضرائب (إن وُجدت) عند إتمام الطلب. قد تُضاف رسوم إضافية حسب الوجهة.
        </p>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="font-bold text-base">المجموع</span>
          <span className="font-extrabold text-base">
            {formattedGrandTotal} {currency}
          </span>
        </div>
      </div>

      {/* الأزرار */}
      <div className="mt-3 space-y-2">
        <Link to="/checkout" className="block">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-[#CB908B] text-white py-2.5 text-sm font-medium hover:bg-[#6a1a26] transition-colors"
          >
            المتابعة للدفع
          </button>
        </Link>

        <button
          onClick={() => dispatch(clearCart())}
          className="w-full rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          مسح السلة
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
