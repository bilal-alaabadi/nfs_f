// HeroSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import card1 from "../../assets/IMG_0064.jpg";
import card2 from "../../assets/IMG_3440.png";
import card3 from "../../assets/IMG_3441.png";
import card4 from "../../assets/IMG_0067.jpg";

const cards = [
  { id: 1, image: card1, trend: '  ', title: 'تفصيل العبايات' },
  { id: 4, image: card4, trend: ' ',  title: 'دريسات' },
  { id: 2, image: card2, trend: '  ', title: 'الشيلات' },
  { id: 3, image: card3, trend: '  ', title: 'العطور' },
];

// خريطة ربط عناوين الكروت مع فلاتر المتجر الموجودة
const categoryMap = {
  'تفصيل العبايات': 'تفصيل العبايات',
  'دريسات': 'دريسات',
  'العطور': 'العطور',
  'الشيلات': 'الشيلات سادة', // ينقله مباشرة لفلتر الشيلات
};

const HeroSection = () => {
  const navigate = useNavigate();

  const handleClick = (title) => {
    const category = categoryMap[title] || title;
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className=' px-4 py-8'>
      <div className='text-center mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-800 relative inline-block'>
          الاقسام
          <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-1 bg-amber-500 rounded-full'></span>
        </h1>
      </div>

      <div className='grid grid-cols-2 gap-4 md:gap-6'>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleClick(card.title)}
            className='relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 aspect-[3/4] focus:outline-none focus:ring-2 focus:ring-amber-500'
            type="button"
          >
            <img
              src={card.image}
              alt={card.title}
              className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-300'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col items-center justify-end p-4'>
              <p className='text-xs md:text-sm font-medium text-gray-200'>{card.trend}</p>
              <h4 className='text-lg md:text-xl font-bold text-white mt-1 text-center'>{card.title}</h4>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
