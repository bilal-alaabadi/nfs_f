// ShopPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from './ProductCards';
import ShopFiltering from './ShopFiltering';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';
import imge from "../../assets/متجر-عبايات01.png";

const filters = {
  categories: ['الكل', 'تفصيل العبايات', 'الشيلات فرنسية', 'الشيلات سادة', 'العطور', 'دريسات']
};

const ShopPage = () => {
  const [searchParams] = useSearchParams();

  const [filtersState, setFiltersState] = useState({
    category: 'الكل'
  });

  // التهيئة حسب باراميتر الرابط ?category=
  useEffect(() => {
    const categoryFromURL = searchParams.get('category');
    if (categoryFromURL && filters.categories.includes(categoryFromURL)) {
      setFiltersState({ category: categoryFromURL });
    }
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [ProductsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  const { category } = filtersState;

  useEffect(() => {
    setCurrentPage(1);
  }, [filtersState]);

  const { data: { products = [], totalPages, totalProducts } = {}, error, isLoading } = useFetchAllProductsQuery({
    category: category !== 'الكل' ? category : undefined,
    page: currentPage,
    limit: ProductsPerPage,
  });

  const clearFilters = () => {
    setFiltersState({ category: 'الكل' });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading) return <div className="text-center py-8 text-[#CB908B]">جاري تحميل المنتجات...</div>;
  if (error) return <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المنتجات.</div>;

  const startProduct = (currentPage - 1) * ProductsPerPage + 1;
  const endProduct = Math.min(startProduct + ProductsPerPage - 1, totalProducts);

  return (
    <>
      {/* Hero Section with Image */}
      <section className='relative w-full overflow-hidden bg-[#e2e5e5]' style={{ aspectRatio: '16/9' }}>
        <img
          src={imge}
          alt="متجر حناء برغند"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4"></h1>
        </div>
      </section>

      {/* Products Section */}
      <section className='section__container py-8'>
        <div className='flex flex-col md:flex-row md:gap-8 gap-6'>
          {/* Filters Section */}
          <div className='md:w-1/4'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='md:hidden w-full bg-[#CB908B] text-white py-2 px-4 rounded-md mb-4 flex items-center justify-between  transition-colors'
            >
              <span>{showFilters ? 'إخفاء الفلاتر' : 'تصفية المنتجات'}</span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`${showFilters ? 'block' : 'hidden'} md:block bg-white p-4 rounded-lg shadow-sm`}>
              <ShopFiltering
                filters={filters}
                filtersState={filtersState}
                setFiltersState={setFiltersState}
                clearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Products List */}
          <div className='md:w-3/4'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-medium text-[#CB908B]'>
                عرض {startProduct}-{endProduct} من {totalProducts} منتج
              </h3>
            </div>

            {products.length > 0 ? (
              <>
                <ProductCards products={products} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='mt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className="text-sm text-[#CB908B]">
                      الصفحة {currentPage} من {totalPages}
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200'
                            : 'border-[#CB908B] text-[#CB908B] hover:bg-black hover:text-white'
                        }`}
                      >
                        السابق
                      </button>

                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const active = currentPage === index + 1;
                          return (
                            <button
                              key={index}
                              onClick={() => handlePageChange(index + 1)}
                              className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors ${
                                active
                                  ? 'bg-[#CB908B] text-white border-[#CB908B] '
                                  : 'border-[#CB908B] text-[#CB908B] bg-white  hover:text-white'
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200'
                            : 'border-[#CB908B] text-[#CB908B]  hover:text-white'
                        }`}
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-lg text-[#CB908B]">لا توجد منتجات متاحة حسب الفلتر المحدد</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-[#CB908B] text-white rounded-md  transition-colors"
                >
                  عرض جميع المنتجات
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopPage;
