// ========================= src/components/Checkout/Checkout.jsx (نهائي) =========================
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RiBankCardLine } from "react-icons/ri";
import { getBaseUrl } from "../../utils/baseURL";

const Checkout = () => {
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wilayat, setWilayat] = useState("");
  const [description, setDescription] = useState("");

  // وضع دفع المقدم (10 ر.ع) إذا كان ضمن الطلب تفصيل عباية
  const [payDeposit, setPayDeposit] = useState(false);

  // بطاقة هدية
  const [showGift, setShowGift] = useState(false);
  const [giftFrom, setGiftFrom] = useState("");
  const [giftTo, setGiftTo] = useState("");
  const [giftPhone, setGiftPhone] = useState("");
  const [giftNote, setGiftNote] = useState("");

  const { products, totalPrice, country } = useSelector((state) => state.cart);

  const baseShippingFee = country === "الإمارات" ? 4 : 2; // بالعملة الأساسية (ر.ع.)
  const currency = country === "الإمارات" ? "د.إ" : "ر.ع.";
  const exchangeRate = country === "الإمارات" ? 9.5 : 1; // للعرض فقط
  const shippingFee = baseShippingFee * exchangeRate;

  // هل يوجد ضمن الطلب "تفصيل عباية"؟
  const hasTailoredAbaya = useMemo(() => {
    const tailoredCategories = new Set(["تفصيل العبايات", "تفصيل عباية", "عباية", "عبايات"]);
    return products.some((p) => {
      const cat = (p.category || "").trim();
      const isAbayaCategory = tailoredCategories.has(cat);
      const hasMeasures = p.measurements && Object.keys(p.measurements).length > 0;
      return isAbayaCategory && hasMeasures;
    });
  }, [products]);

  useEffect(() => {
    if (products.length === 0) {
      setError("لا توجد منتجات في السلة. الرجاء إضافة منتجات قبل المتابعة إلى الدفع.");
    } else {
      setError("");
    }
  }, [products]);

  const makePayment = async (e) => {
    e.preventDefault();

    if (products.length === 0) {
      setError("لا توجد منتجات في السلة. الرجاء إضافة منتجات قبل المتابعة إلى الدفع.");
      return;
    }

    if (!customerName || !customerPhone || !country || !wilayat || !email) {
      setError("الرجاء إدخال جميع المعلومات المطلوبة (الاسم، رقم الهاتف، البريد الإلكتروني، البلد، العنوان)");
      return;
    }

    const body = {
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        price: product.price, // ر.ع.
        quantity: product.quantity,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        measurements: product.measurements || {},
        category: product.category || "",
      })),
      customerName,
      customerPhone,
      country,
      wilayat,
      description,
      email,
      depositMode: !!payDeposit,

      // بيانات بطاقة الهدية (اختيارية)
      giftCard: showGift
        ? {
            from: giftFrom,
            to: giftTo,
            phone: giftPhone,
            note: giftNote,
          }
        : null,
    };

    try {
      const response = await fetch(`${getBaseUrl()}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.details?.description || errorData.error || "Failed to create checkout session");
      }

      const session = await response.json();
      if (session.paymentLink) {
        window.location.href = session.paymentLink;
      } else {
        setError("حدث خطأ أثناء إنشاء رابط الدفع. الرجاء المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setError(error.message || "حدث خطأ أثناء عملية الدفع. الرجاء المحاولة مرة أخرى.");
    }
  };

  const displayTotal = useMemo(() => {
    if (payDeposit) return (10 * exchangeRate).toFixed(2);
    return ((totalPrice + baseShippingFee) * exchangeRate).toFixed(2);
  }, [payDeposit, exchangeRate, totalPrice, baseShippingFee]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* تفاصيل الفاتورة */}
      <div className="flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">تفاصيل الفاتورة</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={makePayment} className="space-y-4 md:space-y-6" dir="rtl">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                className="w-full p-2 border rounded-md"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">البلد</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-gray-100"
                value={country}
                readOnly
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">العنوان</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={wilayat}
                onChange={(e) => setWilayat(e.target.value)}
                required
                placeholder="الرجاء إدخال العنوان كاملاً"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">وصف إضافي (اختياري)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أي ملاحظات أو تفاصيل إضافية عن الطلب"
                rows="3"
              />
            </div>

            {/* زر دفع مقدم يظهر فقط إذا كان ضمن الطلب تفصيل عباية وليس في الإمارات */}
            {hasTailoredAbaya && country !== "الإمارات" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setPayDeposit((v) => !v)}
                  className={`px-3 py-1 text-sm rounded-md border transition ${
                    payDeposit ? "bg-[#799b52] text-white border-[#799b52]" : "bg-white text-[#799b52] border-[#799b52]"
                  }`}
                >
                  {payDeposit ? "إلغاء دفع المقدم" : "دفع مقدم 10 ر.ع"}
                </button>
                <p className="text-xs text-gray-600 mt-2">
                  عند تفعيل "دفع مقدم"، سيتم دفع 10 ر.ع الآن فقط، ويتم احتساب المبلغ المتبقي لاحقاً.
                </p>
              </div>
            )}

            {/* زر "بطاقة هدية ؟" + حقول الهدية */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setShowGift((v) => !v)}
                className="px-3 py-1 text-sm rounded-md border border-[#CB908B] text-[#CB908B] hover:bg-[#CB908B] hover:text-white transition"
              >
                بطاقة هدية ؟
              </button>

              {showGift && (
                <div className="mt-3 p-3 border rounded-md bg-pink-50/40 border-pink-200 space-y-3">
                  <div>
                    <label className="block text-gray-700 mb-1">من</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={giftFrom}
                      onChange={(e) => setGiftFrom(e.target.value)}
                      placeholder="اسم المُرسِل"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">إلى</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={giftTo}
                      onChange={(e) => setGiftTo(e.target.value)}
                      placeholder="اسم المُستلم"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">الرقم (رقم المستلم)</label>
                    <input
                      type="tel"
                      className="w-full p-2 border rounded-md"
                      value={giftPhone}
                      onChange={(e) => setGiftPhone(e.target.value)}
                      placeholder="مثال: 9XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">ملاحظات الهدية</label>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="رسالة قصيرة تُرفق مع الهدية (اختياري)"
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#CB908B] text-white px-6 py-3 rounded-md w-full"
            disabled={products.length === 0}
          >
            إتمام الطلب
          </button>
        </form>
      </div>

      {/* تفاصيل الطلب */}
      <div className="w-full md:w-1/3 p-4 md:p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">طلبك</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={`${product._id}-${JSON.stringify(product.measurements || {})}`}
              className="py-2 border-b border-gray-100"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {product.name} × {product.quantity}
                </span>
                <span className="text-gray-900 font-medium">
                  {Math.max(
                    0,
                    (product.price || 0) * exchangeRate * product.quantity -
                      (["الشيلات فرنسية", "الشيلات سادة"].includes(product.category)
                        ? Math.floor(product.quantity / 2) * (1 * exchangeRate)
                        : 0)
                  ).toFixed(2)}{" "}
                  {currency}
                </span>
              </div>

              {product.measurements && (
                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                  {product.measurements.length && <p>الطول: {product.measurements.length}</p>}
                  {product.measurements.sleeveLength && <p>طول الكم: {product.measurements.sleeveLength}</p>}
                  {product.measurements.width && <p>العرض: {product.measurements.width}</p>}
                  {product.measurements.color && <p>اللون: {product.measurements.color}</p>}
                  {product.measurements.design && <p>القصة: {product.measurements.design}</p>}
                  {product.measurements.buttons && <p>الأزرار: {product.measurements.buttons}</p>}
                  {product.measurements.quantity && <p>كمية الشيلات (اختيار): {product.measurements.quantity}</p>}
                  {product.measurements.colorOption && <p>خيار اللون: {product.measurements.colorOption}</p>}
                  {product.measurements.notes && <p>ملاحظات: {product.measurements.notes}</p>}
                </div>
              )}
            </div>
          ))}

          {/* رسوم الشحن تُخفى عند دفع المقدم */}
          {!payDeposit && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-800">رسوم الشحن</span>
              <p className="text-gray-900">
                {currency}
                {shippingFee.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-gray-800 font-semibold">
              {payDeposit ? "الإجمالي (دفعة مقدم)" : "الإجمالي"}
            </span>
            <p className="text-gray-900 font-bold">
              {currency}
              {displayTotal}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">دفع ثواني</h3>
          <button
            onClick={makePayment}
            className="w-full bg-[#799b52] text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center justify-center gap-2 hover:bg-[#678f43]"
            disabled={products.length === 0}
          >
            <RiBankCardLine className="text-xl" />
            <span>{payDeposit ? "دفع الدفعة (10 ر.ع)" : "الدفع باستخدام ثواني"}</span>
          </button>
          <p className="mt-4 text-sm text-gray-600">
            سيتم استخدام بياناتك الشخصية لمعالجة طلبك، ودعم تجربتك عبر هذا
            الموقع، ولأغراض أخرى موضحة في{" "}
            <a className="text-blue-600 hover:underline">سياسة الخصوصية</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
