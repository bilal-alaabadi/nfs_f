// src/pages/About.jsx
import React from 'react';
import perfumeImg from '../assets/Untitled-1-2.png';

const About = () => {
  return (
    <div dir="rtl" className="bg-white text-gray-800">
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          {/* الصورة */}
          {/* <div className="md:w-1/2">
            <img
              src={perfumeImg}
              alt="RF_COLLECTION عبايات راقية بطابع عماني"
              className="w-full max-w-md mx-auto rounded-xl shadow-lg"
            />
          </div> */}

          {/* النص */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-[#CB908B] mb-4">
              RF_COLLECTION 
              <br />
              <span> أناقة عُمانية بروح عصرية</span>
            </h2>

            <p className="text-lg leading-loose mb-4">
              في سلطنة عُمان، كانت هناك فتاة تحلم منذ صغرها بابتكار شيءٍ
              يعكس أناقة المرأة العُمانية بروحٍ عصرية. من هذا الحلم وُلدت
              <span className="font-semibold text-[#CB908B]"> RF_COLLECTION</span>:
              علامة عبايات راقية بقصّات نادرة وبسيطة، توازن بين الحشمة
              والتميّز.
            </p>

            <p className="leading-loose mb-4">
              بدأت التصاميم من غرفتها، بخامات فاخرة ولمسات مستوحاة من الطابع
              العُماني الساتر. وبالرغم من التحديات المالية، أطلقت أول مجموعة عبر
              إنستغرام، ولاقت إعجاب النساء الباحثات عن البساطة الراقية
              والهوية الأصيلة.
            </p>

            <p className="leading-loose mb-4">
              بفضل الإصرار وجودة التنفيذ، توسّعت الأعمال، وجاء قرار إطلاق موقع
              إلكتروني للوصول إلى جميع نساء العالم، حتى تمتلك كل فتاة قطعة
              نادرة صُمّمت لها خصيصًا.
            </p>

            <div className="mt-6 p-5 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-[#CB908B] mb-3">
                رؤيتنا
              </h3>
              <ul className="space-y-2 list-disc pr-5">
                <li>قصّات بسيطة ونادرة تُبرز الذوق الراقي دون تكلّف.</li>
                <li>خامات منتقاة بعناية لتجربة ارتداء مريحة ومتينة.</li>
                <li>هوية عُمانية حديثة تُجسّد الأناقة المحتشمة.</li>
              </ul>
            </div>

            <p className="mt-8 text-lg font-medium text-[#CB908B]">
              RF رمز الأناقة العُمانية الحديثة.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-xl font-semibold text-[#CB908B]">
            قطعة واحدة… تروي قصة هوية وأناقة خالدة.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
