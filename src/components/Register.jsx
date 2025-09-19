import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../redux/features/auth/authApi';

const Register = () => {
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [registerUser, { isLoading }] = useRegisterUserMutation();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const data = {
            username,
            email,
            password,
        };
        try {
            await registerUser(data).unwrap();
            alert('تم التسجيل بنجاح!');
            navigate('/login');
        } catch (error) {
            setMessage('فشل التسجيل');
        }
    };

    return (
        <section className='h-screen flex items-center justify-center'>
            <div className='max-w-sm border shadow bg-white mx-auto p-8'>
                <h2 className='text-2xl font-semibold pt-5'>يرجى التسجيل</h2>
                <form onSubmit={handleRegister} className='space-y-5 max-w-sm mx-auto pt-8'>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='اسم المستخدم'
                        required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3'
                    />
                    <input
                        type="email"
                        name="email"
                        id="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='البريد الإلكتروني'
                        required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3'
                    />
                    <input
                        type="password"
                        name="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='كلمة المرور'
                        required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3'
                    />
                    {message && <p className='text-red-500'>{message}</p>}

                    <button
                        type='submit'
                        className='w-full mt-5 bg-[#d3ae27] text-white hover:bg-indigo-500 font-medium py-3 rounded-md'
                    >
                        تسجيل
                    </button>
                </form>

                <p className='my-5 italic text-sm text-center'>
                    لديك حساب؟ يرجى{' '}
                    <Link to="/login" className='text-red-700 px-1 underline'>تسجيل الدخول</Link>.
                </p>
            </div>
        </section>
    );
};

export default Register;