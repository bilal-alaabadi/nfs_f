// ========================= OrderSummary.jsx =========================
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const OrderSummary = ({ onClose }) => {
  const dispatch = useDispatch();
  const { products, totalPrice, shippingFee, country } = useSelector((store) => store.cart);
  
  const currency = country === 'الإمارات' ? 'د.إ' : 'ر.ع.';
  const exchangeRate = country === 'الإمارات' ? 9.5 : 1;

  const grandTotal = (totalPrice + shippingFee) * exchangeRate;
  const formattedTotalPrice = (totalPrice * exchangeRate).toFixed(2);
  const formattedShippingFee = (shippingFee * exchangeRate).toFixed(2);
  const formattedGrandTotal = grandTotal.toFixed(2);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const renderMeasurementsDetails = (item) => {
    const m = item.measurements;
    if (!m) return null;
    return (
      <div className="mt-2 text-sm text-gray-100 space-y-1 bg-[#CB908B] p-2 rounded">
        {m.length && <p>الطول: {m.length}</p>}
        {m.sleeveLength && <p>طول الكم: {m.sleeveLength}</p>}
        {m.width && <p>العرض: {m.width}</p>}
        {m.color && <p>اللون: {m.color}</p>}
        {m.design && <p>القصة: {m.design}</p>}
        {m.buttons && <p>الأزرار: {m.buttons}</p>}
        {m.quantity && <p>كمية الشيلات (اختيار): {m.quantity}</p>}
        {m.colorOption && <p>خيار اللون: {m.colorOption}</p>}
        {m.notes && <p>ملاحظات: {m.notes}</p>}
      </div>
    );
  };

  // إجمالي السطر بعد خصم الأزواج (بالعملة المعروضة)
  const getLineTotalDisplay = (item) => {
    const unit = (item.price || 0) * exchangeRate;
    const qty = item.quantity || 0;
    const isShayla = item.category === 'الشيلات فرنسية' || item.category === 'الشيلات سادة';
    const pairs = isShayla ? Math.floor(qty / 2) : 0;
    const pairDiscountDisplay = pairs * (1 * exchangeRate); // ريال لكل زوج
    const subtotal = unit * qty;
    return Math.max(0, subtotal - pairDiscountDisplay);
  };

  return (
    <div className='bg-[#CB908B] mt-5 rounded text-base'>
      <div className='px-6 py-4 space-y-5'>
        <h2 className='text-xl text-white font-bold border-b  pb-2'>ملخص الطلب</h2>
        
        {/* العناصر */}
        <div className="text-white space-y-4">
          {products.map((item, index) => (
            <div key={index} className="border-b  pb-3">
              <p className="font-semibold">{item.name} × {item.quantity}</p>
              {renderMeasurementsDetails(item)}
              <p className="text-sm mt-1 ">
                السعر: {getLineTotalDisplay(item).toFixed(2)} {currency}
              </p>
            </div>
          ))}
        </div>
        
        <div className='text-white space-y-1 pt-3 border-t '>
          <p>السعر الفرعي: {formattedTotalPrice} {currency}</p>
          <p>رسوم الشحن: {formattedShippingFee} {currency}</p>
          <p className='font-bold text-lg'>الإجمالي النهائي: {formattedGrandTotal} {currency}</p>
        </div>
        
        <div className='px-4 mb-6 space-y-3 pt-4 border-t '>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearCart();
            }}
            className='bg-red-500 px-3 py-1.5 text-white rounded-md flex justify-center items-center gap-2 hover:bg-red-600 transition-colors'
          >
            <i className="ri-delete-bin-7-line"></i>
            <span>تفريغ السلة</span>
          </button>
          <Link to="/checkout">
            <button
              onClick={onClose}
              className='bg-green-600 px-3 py-1.5 text-white rounded-md flex justify-center items-center gap-2 hover:bg-green-700 transition-colors'
            >
              <i className="ri-bank-card-line"></i>
              <span>إتمام الشراء</span>
            </button>
          </Link>
        </div>
      </div>
    </div> 
  );
};

export default OrderSummary;
