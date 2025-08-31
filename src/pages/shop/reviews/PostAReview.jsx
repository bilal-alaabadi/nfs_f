import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { usePostReviewMutation } from '../../../redux/features/reviews/reviewsApi';

const PostAReview = ({ isModalOpen, handleClose }) => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth)
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { refetch } = useFetchProductByIdQuery(id, { skip: !id });
  const [postReview] = usePostReviewMutation();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // في حال فُتح المودال بطريقة ما بدون وجود مستخدم، نعيد التوجيه للتسجيل
    if (isModalOpen && !user) {
      handleClose?.();
      navigate('/register', { state: { from: location.pathname } });
    }
  }, [isModalOpen, user, navigate, location.pathname, handleClose]);

  const handleRating = (value) => {
    setRating(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      // حماية إضافية
      handleClose?.();
      navigate('/register', { state: { from: location.pathname } });
      return;
    }

    const newComment = {
      comment,
      rating,
      userId: user?._id,
      productId: id
    }

    try {
      await postReview(newComment).unwrap();
      alert("تم نشر التعليق بنجاح!");
      setComment('');
      setRating(0);
      refetch();
    } catch (error) {
      alert(error?.data?.message || error.message || "حدث خطأ غير متوقع");
    }
    handleClose?.();
  }

  return (
    <div className={`fixed inset-0 bg-black/90 flex items-center bg-gradient-to-r from-[#f8edf1] to-[#ffffff] justify-center z-40 px-2 ${isModalOpen ? 'block' : 'hidden'}`}>
      <div className='bg-white p-6 rounded-md shadow-lg w-96 z-50'>
        <h2 className='text-lg font-medium mb-4'>انشر التعليق</h2>

        <div className='flex items-center mb-4'>
          {
            [1, 2, 3, 4, 5].map((star, index) => (
              <span
                key={index}
                onClick={() => handleRating(star)}
                className='cursor-pointer text-yellow-500 text-xl'
              >
                {rating >= star ? (<i className="ri-star-fill"></i>) : (<i className="ri-star-line"></i>)}
              </span>
            ))
          }
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          className='w-full border border-gray-300 p-2 rounded-md mb-4 focus:outline-none'
        ></textarea>

        <div className='flex justify-end gap-2'>
          <button
            onClick={handleClose}
            className='px-4 py-2 bg-gray-300 rounded-md'>إلغاء</button>
          <button
            onClick={handleSubmit}
            className='px-4 py-2 bg-primary text-white rounded-md'>إرسال</button>
        </div>
      </div>
    </div>
  )
}

export default PostAReview
