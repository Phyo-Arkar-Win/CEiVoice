import React from 'react';
import ceiLogo from '../assets/cei.png';
import { useNavigate } from 'react-router';

export default function Navbar({ title }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (title === 'Sign up') {
            navigate('/signup');
        } else if (title === 'Log in') {
            navigate('/login');
        }
    };
    return (
        <>
            <div className='navbar w-full flex justify-between items-center bg-surface px-4 py-3 border border-b-2 border-primary-500'>
                <div className='flex items-center gap-2'>
                    <img src={ceiLogo} alt='CEi Logo' className='w-15 h-15 object-contain' />
                    <h1 className='text-black text text-2xl font-semibold font-inter'>CEiVoice</h1>
                </div>
                <div className='flex text-white'>
                    <button
                        onClick={handleClick}
                        className='bg-primary-500 hover:bg-primary-600 px-3 py-2 text-white rounded-xl cursor-pointer'
                    >
                        {title}
                    </button>
                </div>
            </div>
        </>
    );
}
