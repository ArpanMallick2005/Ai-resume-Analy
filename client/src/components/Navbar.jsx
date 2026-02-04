import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../app/features/authSlice.js';

const Navbar = () => {
    const {user}=useSelector(state=>state.auth);
    const dispatch=useDispatch()

    const navigate=useNavigate()
    const logoutUser=()=>{
        navigate('/');
        dispatch(logout());
    }
  return (
    <div className='shadow bg-white'>
        <div className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
            <Link to='/'>
            <h4 className='h-11 w-auto'>Resume</h4>
            </Link>
            <div className='flex items-center gap-4 text-sm'>
                <Link to="/app/analyzer" className="hover:text-blue-600 font-medium max-sm:hidden">Resume Analyzer</Link>
                <Link to="/app" className="hover:text-blue-600 font-medium max-sm:hidden">Dashboard</Link>
                <p className='max-sm:hidden text-gray-400'>|</p>
                <p className='max-sm:hidden'>Hi, {user?.name}</p>
                <button onClick={logoutUser} className='bg-white hover:bg-slate-50 border border-gray-300 px-7 py-1.5 rounded-full active:scale-95 transition-all'>Logout</button>
            </div>
        </div>
    </div>
  )
}

export default Navbar;
