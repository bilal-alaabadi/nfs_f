// src/pages/About.jsx
import React from 'react';
import perfumeImg from '../assets/DSC01623.jpg';

const About = () => {
  return (
    <div dir="rtl" className="bg-white text-gray-800">
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          {/* الصورة */}
          <div className="md:w-1/2">
            <img
              src={perfumeImg}
              alt="NAFAS | نفس - عطور وبخور فاخرة"
              className="w-full max-w-md mx-auto rounded-xl shadow-lg"
            />
          </div>

          {/* النص */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-[#d3ae27] mb-4">
              NAFAS | نفس
              <br />
              <span> عطور مستوحاة تجسد الفخامة </span>
            </h2>

            <p className="text-lg leading-loose mb-4">
              في سلطنة عُمان، انطلقت علامة <span className="font-semibold text-[#d3ae27]">NAFAS</span> 
              لتقدم مجموعة من العطور والبخور الفاخرة، المستوحاة من روح الأصالة 
              العُمانية الممزوجة بلمسات عصرية تعبّر عن الفخامة والرقي.
            </p>

            <p className="leading-loose mb-4">
              منتجات <span className="text-[#d3ae27] font-medium">NAFAS</span> 
              مصممة بعناية لتعكس شخصيتك وتترك أثراً لا يُنسى. كل رشة عطر 
              تحكي قصة من التقاليد العمانية الأصيلة مع روح حديثة تنبض بالحداثة.
            </p>

            <p className="leading-loose mb-4">
              رؤيتنا أن نكون الوجهة الأولى لعشاق العطور والبخور في عُمان 
              وخارجها، عبر تقديم منتجات ذات جودة عالية وعبوات تعكس 
              الفخامة والتفرد.
            </p>

            <div className="mt-6 p-5 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-[#d3ae27] mb-3">
                رؤيتنا
              </h3>
              <ul className="space-y-2 list-disc pr-5">
                <li>عطور وبخور فاخرة تعكس الذوق الرفيع.</li>
                <li>خامات أصيلة معتمدة من وزارة التجارة والصناعة 🇴🇲.</li>
                <li>تصاميم عصرية بروح عمانية أصيلة.</li>
              </ul>
            </div>

            <p className="mt-8 text-lg font-medium text-[#d3ae27]">
              NAFAS… حيث تلتقي الأصالة بالفخامة.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-xl font-semibold text-[#d3ae27]">
            كل عطر من NAFAS… قصة تلامس الروح وتبقى خالدة ✨
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
