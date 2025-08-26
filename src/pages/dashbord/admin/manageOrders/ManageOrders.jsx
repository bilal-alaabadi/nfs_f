// ========================= ManageOrders.jsx (نهائي) =========================
import React, { useState } from 'react';
import { useDeleteOrderMutation, useGetAllOrdersQuery } from '../../../../redux/features/orders/orderApi';
import { formatDate } from '../../../../utils/formateDate';
import html2pdf from 'html2pdf.js';

const DEPOSIT_DEFAULT = 10; // قيمة المقدم الافتراضية

const ManageOrders = () => {
  const { data: orders, error, isLoading, refetch } = useGetAllOrdersQuery();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteOrder] = useDeleteOrderMutation();

  const handleDeleteOder = async (orderId) => {
    try {
      await deleteOrder(orderId).unwrap();
      alert("تم حذف الطلب بنجاح");
      refetch();
    } catch (error) {
      console.error("فشل حذف الطلب:", error);
    }
  };

  const handleViewOrder = (order) => setViewOrder(order);

  const handlePrintOrder = () => window.print();

  const handleDownloadPDF = () => {
    const element = document.getElementById('order-details');
    const options = {
      margin: [10, 10],
      filename: `طلب_${viewOrder._id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().from(element).set(options).save();
  };

  const formatPrice = (price) => {
    const n = Number(price);
    return (isNaN(n) ? 0 : n).toFixed(2);
  };

  // ===== إظهار قياسات/خيارات المنتج داخل تفاصيل الطلب =====
  const renderMeasurements = (m) => {
    if (!m || typeof m !== 'object') return null;
    const entries = Object.entries(m).filter(([_, v]) => v !== '' && v !== null && v !== undefined);
    if (entries.length === 0) return null;
    return (
      <div className="mt-2 bg-gray-50 rounded p-2 text-xs text-gray-700">
        <p className="font-semibold mb-1">القياسات / الخيارات:</p>
        <ul className="list-disc pr-5 space-y-0.5">
          {entries.map(([k, v]) => (
            <li key={k}><span className="font-medium">{k}</span>: {String(v)}</li>
          ))}
        </ul>
      </div>
    );
  };
  // ===============================================================

  // منطق العربون (المقدم)
  const isDepositOrder = (order) =>
    !!(order?.depositMode || order?.isDeposit || order?.deposit === true);

  const paidAmount = (order) => Number(order?.amount || 0);

  const remainingAmount = (order) =>
    Number(order?.remainingAmount ?? order?.remaining ?? 0);

  const shippingFeeSaved = (order) =>
    Number(order?.shippingFee ?? order?.deliveryFee ?? 0);

  // السعر الأصلي للطلب = (المدفوع + المتبقي) عندما يوجد مقدم، وإلا = المدفوع
  const originalTotal = (order) => {
    const paid = paidAmount(order);
    const rem = remainingAmount(order);
    return isDepositOrder(order) ? paid + rem : paid;
  };

  // تفصيـل توزيع المقدم (10 من ضمنه الشحن 2)
  const getDepositBreakdown = (order) => {
    if (!isDepositOrder(order)) {
      return {
        depositAmount: 0,
        deliveryCovered: 0,
        productCovered: 0,
        unused: 0,
      };
    }

    const depositAmount =
      Number(order?.depositAmount) > 0 ? Number(order?.depositAmount) : DEPOSIT_DEFAULT;

    const shippingFee = shippingFeeSaved(order); // المحفوظ في الطلب
    // نفترض أن السعر الأصلي = منتجات + شحن محفوظ
    const orig = originalTotal(order);
    const productSubtotal = Math.max(orig - shippingFee, 0);

    const deliveryCovered = Math.min(shippingFee, depositAmount); // عادةً 2
    const depositLeft = depositAmount - deliveryCovered;          // عادةً 8
    const productCovered = Math.min(productSubtotal, depositLeft);
    const unused = Math.max(depositAmount - deliveryCovered - productCovered, 0);

    return { depositAmount, deliveryCovered, productCovered, unused, productSubtotal, orig, shippingFee };
  };

  const handleContactWhatsApp = (phone) => {
    if (!phone) {
      alert('رقم الهاتف غير متوفر');
      return;
    }
    const o = viewOrder || {};
    const cleanedPhone = phone.replace(/\D/g, '');

    const isDep = isDepositOrder(o);
    const paid = paidAmount(o);
    const rem = remainingAmount(o);
    const orig = originalTotal(o);

    const linesProducts = (o.products || [])
      .map(p => `- ${p.name} (${p.quantity}x ${formatPrice(p.price)} ر.ع)`)
      .join('\n');

    const depositBlock = isDep
      ? `\n\nطريقة الدفع: دفعة مقدم\nالمبلغ المدفوع: ${formatPrice(paid)} ر.ع\nالمتبقي: ${formatPrice(rem)} ر.ع\nالسعر الأصلي: ${formatPrice(orig)} ر.ع`
      : '';

    const message = `مرحباً ${o.customerName || 'عميلنا العزيز'},
        
تفاصيل طلبك رقم: ${o.orderId}
تاريخ الطلب: ${formatDate(o.createdAt)}
${isDep ? '' : `الإجمالي النهائي: ${formatPrice(o.amount || 0)} ر.ع`}

المنتجات:
${linesProducts}${depositBlock}

الرجاء تأكيد استلامك للطلب. شكراً لثقتكم بنا!`;

    window.open(`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) return <div className="p-4 text-center">جار التحميل...</div>;
  if (error) return <div className="p-4 text-center text-red-500">لا توجد طلبات</div>;

  return (
    <div className="w-full p-2 md:p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-md p-4 w-full">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center md:text-right">إدارة الطلبات</h2>
        
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3">
          {orders?.length > 0 ? (
            orders.map((order, index) => (
              <div key={index} className="border rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      العميل: {order?.customerName || order?.email || 'غير موجود'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">{formatDate(order?.updatedAt)}</p>
                  </div>
                </div>

                {isDepositOrder(order) && (
                  <div className="mt-2">
                    <span className="inline-block text-[10px] px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">
                      دفعة مقدم
                    </span>
                  </div>
                )}
                
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="text-blue-500 hover:underline text-xs px-2 py-1 border border-blue-200 rounded"
                    onClick={() => setViewOrder(order)}
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    className="text-red-500 hover:underline text-xs px-2 py-1 border border-red-200 rounded"
                    onClick={() => handleDeleteOder(order?._id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              لا توجد طلبات متاحة
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-right w-1/6">رقم الطلب</th>
                <th className="py-3 px-4 border-b text-right w-2/6">العميل</th>
                <th className="py-3 px-4 border-b text-right w-1/6">التاريخ</th>
                <th className="py-3 px-4 border-b text-right w-2/6">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders?.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center gap-2">
                        <span>{order?.orderId || '--'}</span>
                        {isDepositOrder(order) && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                            دفعة مقدم
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">{order?.customerName || order?.email || 'غير موجود'}</td>
                    <td className="py-3 px-4 border-b">{formatDate(order?.updatedAt)}</td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex gap-3 justify-end">
                        <button
                          className="text-blue-500 hover:underline text-sm px-3 py-1 border border-blue-200 rounded"
                          onClick={() => setViewOrder(order)}
                        >
                          عرض التفاصيل
                        </button>
                        <button
                          className="text-red-500 hover:underline text-sm px-3 py-1 border border-red-200 rounded"
                          onClick={() => handleDeleteOder(order?._id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    لا توجد طلبات متاحة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        {viewOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto print-modal" id="order-details" dir="rtl">
              <style>
                {`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    .print-modal, .print-modal * {
                      visibility: visible;
                    }
                    .print-modal {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      max-width: 100%;
                      box-shadow: none;
                      border: none;
                      padding: 20px;
                    }
                    .print-modal button {
                      display: none;
                    }
                    .print-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 20px;
                      border-bottom: 1px solid #eee;
                      padding-bottom: 10px;
                    }
                    .invoice-title {
                      font-size: 24px;
                      font-weight: bold;
                      color: #333;
                    }
                    .invoice-meta {
                      text-align: left;
                    }
                  }
                `}
              </style>
              
              <div className="print-header">
                <div className="flex items-center gap-2">
                  <h1 className="invoice-title">فاتورة الطلب</h1>
                  {isDepositOrder(viewOrder) && (
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">
                      دفعة مقدم
                    </span>
                  )}
                  <p className="text-gray-600 hidden md:block">شكراً لاختياركم متجرنا</p>
                </div>
                <div className="invoice-meta">
                  <p><strong>رقم الفاتورة:</strong> #{viewOrder.orderId}</p>
                  <p><strong>تاريخ الفاتورة:</strong> {formatDate(viewOrder.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">معلومات العميل</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>الاسم:</strong> {viewOrder.customerName || 'غير محدد'}</p>
                    <p><strong>رقم الهاتف:</strong> {viewOrder.customerPhone || 'غير محدد'}</p>
                    {viewOrder.email && <p><strong>البريد الإلكتروني:</strong> {viewOrder.email}</p>}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">معلومات التوصيل</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>البلد:</strong> {viewOrder.country || 'غير محدد'}</p>
                    <p><strong>الولاية:</strong> {viewOrder.wilayat || 'غير محدد'}</p>
                    <p><strong>ملاحظات:</strong> {viewOrder.description || 'لا توجد ملاحظات'}</p>
                  </div>
                </div>
              </div>

              {/* ====== بيانات بطاقة الهدية (إن وجدت) ====== */}
              {viewOrder?.giftCard && (viewOrder.giftCard.from || viewOrder.giftCard.to || viewOrder.giftCard.phone || viewOrder.giftCard.note) && (
                <div className="bg-pink-50 p-3 rounded-lg mb-6 border border-pink-200">
                  <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">بيانات بطاقة الهدية</h3>
                  <div className="space-y-1 text-sm">
                    {viewOrder.giftCard.from && <p><strong>من:</strong> {viewOrder.giftCard.from}</p>}
                    {viewOrder.giftCard.to && <p><strong>إلى:</strong> {viewOrder.giftCard.to}</p>}
                    {viewOrder.giftCard.phone && <p><strong>رقم المستلم:</strong> {viewOrder.giftCard.phone}</p>}
                    {viewOrder.giftCard.note && <p><strong>ملاحظات الهدية:</strong> {viewOrder.giftCard.note}</p>}
                  </div>
                </div>
              )}
              {/* ========================================= */}

              <div className="mb-6">
                <h3 className="font-bold text-base md:text-lg mb-2 border-b pb-2">المنتجات المطلوبة</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="hidden md:block">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-3 text-right w-12">#</th>
                          <th className="py-2 px-3 text-right">الصورة</th>
                          <th className="py-2 px-3 text-right">المنتج</th>
                          <th className="py-2 px-3 text-right">الكمية</th>
                          <th className="py-2 px-3 text-right">السعر</th>
                          <th className="py-2 px-3 text-right">المجموع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewOrder.products?.map((product, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2 px-3 text-center">{index + 1}</td>
                            <td className="py-2 px-3">
                              <img 
                                src={product.image || '/images/placeholder.jpg'} 
                                alt={product.name || 'منتج'} 
                                className="w-12 h-12 object-cover rounded mx-auto"
                                onError={(e) => {
                                  e.target.src = '/images/placeholder.jpg';
                                  e.target.alt = 'صورة غير متوفرة';
                                }}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <div>
                                <p className="font-medium text-sm">{product.name || 'منتج غير محدد'}</p>
                                {product.selectedSize && (
                                  <p className="text-xs text-gray-500">الحجم: {product.selectedSize}</p>
                                )}
                                {product.selectedColor && (
                                  <p className="text-xs text-gray-500">اللون: {product.selectedColor}</p>
                                )}
                                {renderMeasurements(product.measurements)}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">{product.quantity || 0}</td>
                            <td className="py-2 px-3 text-left">{formatPrice(product.price)} ر.ع</td>
                            <td className="py-2 px-3 text-left font-medium">
                              {formatPrice((product.price || 0) * (product.quantity || 0))} ر.ع
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Products View */}
                  <div className="md:hidden">
                    {viewOrder.products?.map((product, index) => (
                      <div key={index} className="border-b p-3 last:border-b-0">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <img 
                              src={product.image || '/images/placeholder.jpg'} 
                              alt={product.name || 'منتج'} 
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.src = '/images/placeholder.jpg';
                                e.target.alt = 'صورة غير متوفرة';
                              }}
                            />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-sm">{product.name || 'منتج غير محدد'}</p>
                            {product.selectedSize && (
                              <p className="text-xs text-gray-500">الحجم: {product.selectedSize}</p>
                            )}
                            {product.selectedColor && (
                              <p className="text-xs text-gray-500">اللون: {product.selectedColor}</p>
                            )}
                            {renderMeasurements(product.measurements)}
                            <div className="flex justify-between mt-1">
                              <span className="text-xs">الكمية: {product.quantity || 0}</span>
                              <span className="text-xs font-medium">
                                {formatPrice((product.price || 0) * (product.quantity || 0))} ر.ع
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
 <div className="bg-gray-50 p-4 rounded-lg mb-6">
  <h3 className="font-bold text-base md:text-lg mb-3 border-b pb-2">ملخص الفاتورة</h3>

  {(() => {
    const prods = Array.isArray(viewOrder?.products) ? viewOrder.products : [];
    const productsSubtotal = prods.reduce(
      (sum, p) => sum + Number(p?.price || 0) * Number(p?.quantity || 0),
      0
    );
    const discount = Number(viewOrder?.pairDiscount ?? viewOrder?.discount ?? 0);
    const productTotal = Math.max(0, productsSubtotal - discount); // السعر

    // الشحن مع fallback إن كان غير محفوظ/0
    const country = (viewOrder?.country || '').trim();
    const defaultShipping = country === 'الإمارات' ? 4 : 2; // بالقيمة الأساسية ر.ع
    const storedShipping = Number(viewOrder?.shippingFee);
    const shipping = Number.isFinite(storedShipping) && storedShipping > 0
      ? storedShipping
      : defaultShipping;

    const total = productTotal + shipping; // الإجمالي = السعر + الشحن

    // المقدم = amount من الطلب (سواء كان عربون 10 أو كامل المبلغ)
    const amount = Number(viewOrder?.amount || 0); // المقدم
    const remaining = Math.max(0, total - amount); // المتبقي = الإجمالي - المقدم

    const isDeposit = !!(viewOrder?.depositMode || viewOrder?.isDeposit);
    const productTitle = prods.length === 1 ? (prods[0]?.name || 'منتج') : 'متعدد';

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-white">
            <tr>
              <th className="border px-3 py-2 text-right">المنتج</th>
              <th className="border px-3 py-2 text-right"> السعر المنتج</th>
              <th className="border px-3 py-2 text-right">التوصيل</th>
              <th className="border px-3 py-2 text-right">الإجمالي</th>
              <th className="border px-3 py-2 text-right">المقدم</th>
              <th className="border px-3 py-2 text-right">المتبقي</th>
            </tr>
          </thead>
          <tbody>
            <tr className={isDeposit ? 'bg-amber-50' : ''}>
              <td className="border px-3 py-2">{productTitle}</td>
              <td className="border px-3 py-2">{formatPrice(productTotal)} ر.ع</td>
              <td className="border px-3 py-2">{formatPrice(shipping)} ر.ع</td>
              <td className="border px-3 py-2">{formatPrice(total)} ر.ع</td>
              <td className="border px-3 py-2">{formatPrice(amount)} ر.ع</td>
              <td className="border px-3 py-2">{formatPrice(remaining)} ر.ع</td>
            </tr>
          </tbody>
        </table>

        {isDeposit && (
          <p className="mt-2 text-xs text-gray-600">
            * دفعة المقدم (10 ر.ع) تُحتسب ضمن الإجمالي (يشمل التوصيل).
          </p>
        )}

        <div className="flex justify-between items-center mt-3">
          <span>حالة الطلب:</span>
          <span>{viewOrder?.status || '—'}</span>
        </div>
      </div>
    );
  })()}
</div>



              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  className="bg-gray-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-gray-600 text-xs md:text-sm flex items-center gap-1"
                  onClick={() => setViewOrder(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/>
                  </svg>
                  إغلاق
                </button>
                <button
                  className="bg-blue-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-blue-600 text-xs md:text-sm flex items-center gap-1"
                  onClick={handlePrintOrder}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 17v4h-12v-4h-4v-9c0-2.761 2.239-5 5-5h10c2.761 0 5 2.239 5 5v9h-4zm-10-1h8v1h-8v-1zm0-2h8v1h-8v-1zm-5-6v5h18v-5c0-1.656-1.344-3-3-3h-12c-1.656 0-3 1.344-3 3zm18 2h-2v-1h2v1z"/>
                  </svg>
                  طباعة
                </button>
                <button
                  className="bg-green-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-green-600 text-xs md:text-sm flex items-center gap-1"
                  onClick={() => handleContactWhatsApp(viewOrder?.customerPhone)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.52 3.48A11.86 11.86 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.54 4.08 1.49 5.8L0 24l6.34-1.64A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.29-6.1-3.48-8.52zM12 22c-1.96 0-3.79-.57-5.32-1.54l-.38-.24-3.76.97.99-3.66-.25-.38A9.92 9.92 0 012 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.26-7.13c-.29-.15-1.71-.84-1.98-.93-.27-.1-.47-.15-.66.15-.19.29-.76.93-.93 1.12-.17.2-.34.22-.63.08-.29-.15-1.23-.45-2.35-1.45-.87-.77-1.46-1.72-1.63-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.91-2.18-.24-.58-.49-.5-.66-.51h-.56c-.2 0-.52.07-.79.37-.27.29-1.05 1.03-1.05 2.51 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.53.72.31 1.28.49 1.72.63.72.23 1.37.2 1.88.12.57-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.35z"/>
                  </svg>
                  تواصل واتساب
                </button>
                <button
                  className="bg-emerald-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-md hover:bg-emerald-700 text-xs md:text-sm flex items-center gap-1"
                  onClick={handleDownloadPDF}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2v17h2v-7h3v7h2v-17h-7zm-9 0v17h2v-7h3v7h2v-17h-9z"/>
                  </svg>
                  تحميل PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
