import React from 'react';

const ReturnPolicy = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        
        {/* العنوان الرئيسي */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-[#9B2D1F] mb-6">
          سياسة الاسترجاع والاستبدال
        </h1>

        {/* مقدمة الصفحة */}
        <div className="mb-8 text-right space-y-4">
          <p className="text-gray-700 text-lg leading-relaxed">
            في سلطنة عُمان، وُلِدت فكرة <span className="font-semibold text-[#9B2D1F]">RF_COLLECTION</span> 
            من طموح فتاة تسعى لتعكس أناقة المرأة العمانية بروحٍ عصرية. 
            بدأت التصاميم من غرفتها باستخدام خامات فاخرة بلمسات مستوحاة من الطابع العماني الساتر، 
            ومع الإصرار والجودة وصلت منتجاتها إلى النساء الباحثات عن التميز والبساطة حول العالم.
          </p>
          <p className="text-gray-600">
            نؤمن بأن كل قطعة لديكِ فريدة صُممت خصيصًا لكِ، ومع ذلك نحرص أن تكون سياسة الاسترجاع والاستبدال 
            واضحة وسهلة لضمان راحتكِ ورضاكِ التام.
          </p>
        </div>

        {/* البنود الأساسية */}
        <div className="space-y-6 text-right">
          
          {/* البند الأول */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">الاسترجاع</h3>
            <p className="text-gray-600 leading-relaxed">
              نقبل طلبات الاسترجاع فقط في حال وجود خطأ في المقاس مقارنةً بالذي قام العميل بإرفاقه 
              أو في حال وجود عيب أو تلف في المنتج. 
              يجب تقديم الطلب خلال <span className="font-semibold text-[#9B2D1F]">24 ساعة من استلام الطلبية</span>.
            </p>
          </div>

          {/* البند الثاني */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">شروط الاستبدال</h3>
            <p className="text-gray-600 leading-relaxed">
              لا نقبل استبدال المنتجات التي تم فتح عبواتها الأصلية أو استخدامها، 
              وذلك لأسباب صحية وضمان الجودة.
            </p>
          </div>

          {/* البند الثالث */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">المنتجات التالفة</h3>
            <p className="text-gray-600 leading-relaxed">
              في حال استلام منتج تالف، يرجى التواصل معنا خلال 24 ساعة مع إرفاق صور توضح المشكلة بوضوح.
            </p>
          </div>

          {/* البند الرابع */}
          <div className="pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">تكاليف الشحن</h3>
            <p className="text-gray-600 leading-relaxed">
              نتحمل تكاليف الشحن فقط في حال كان الخطأ من جانبنا (منتج تالف أو غير مطابق للوصف). 
              في الحالات الأخرى تكون تكاليف الشحن على العميل.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReturnPolicy;
