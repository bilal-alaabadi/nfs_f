// src/pages/About.jsx
import React from 'react';
import perfumeImg from '../assets/DSC01623.jpg';
import log from '../assets/ChatGPT Image Sep 19, 2025, 01_36_18 PM.png';

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
    <img src={log} alt="" />
              <br />
            </h2>

            <p className="text-lg leading-loose mb-4">
              <span> عطور مستوحاة تجسد الفخامة </span>
                 <br />

  في سلطنة عُمان، انطلقت علامة <span className="font-semibold text-[#d3ae27]" > نَفَــس </span> 
  لتقدم مجموعة من العطور والبخور الفاخرة، المستوحاة من روح الأصالة 
  العُمانية الممزوجة بلمسات عصرية تعبّر عن الفخامة والرقي.
</p>

<p className="leading-loose mb-4">
  في <span className="text-[#d3ae27] font-medium">نَفَــس</span> نؤمن أن العطر أكثر من مجرد رائحة. 
  هو تجربة وذاكرة تُحكى من أول رشة. كل رشة عطر تحكي قصة من التقاليد 
  العمانية الأصيلة مع روح حديثة تنبض بالحداثة.
</p>

<div className="mt-6 p-5 rounded-xl border border-gray-200">
  <h3 className="text-2xl font-semibold text-[#d3ae27] mb-3">
    رؤيتنا
  </h3>
  <p className="leading-loose">
    أن نكون الوجهة الأولى لعشاق العطور والبخور في عُمان وخارجها، عبر تقديم منتجات ذات جودة عالية وعبوات تعكس الفخامة والتفرد.
  </p>
</div>


           <p className="mt-8 text-lg font-medium text-[#d3ae27]">
  نَفَــس… حيث تلتقي الأصالة بالفخامة.
</p>
</div>
</div>

<div className="text-center mt-16">
  <p className="text-xl font-semibold text-[#d3ae27]">
    كل عطر من نَفَــس… قصة تلامس الروح وتبقى خالدة ✨
  </p>
</div>

      </section>
    </div>
  );
};

export default About;
