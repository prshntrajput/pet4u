import React, { useState } from 'react';
import { PawPrint, Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setSignupData } from '../../../store/reducers/User/Signup';
import { registerUser } from '../../../store/actions/User/signupAction';

export function SignupForm() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]=useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/api/users`,
        { name, email, password, role },
        { withCredentials: true } // Ensures cookies (like authToken) are handled
      );

      setSuccess('Account created successfully!');
      setError('');
      
      // Optionally redirect or perform another action
      console.log('User data:', response.data);
    } catch (err) {
      setSuccess('');
      setError(err.response?.data || 'Something went wrong. Please try again.');
    }
  };

{/** const dispatch= useDispatch();

 const { signupData, error , message , loading}= useSelector((state)=>state.SignupUserReducer);

 const handleChange = (e) => {
    dispatch(setSignupData({ name: e.target.name, value: e.target.value }));
  };

    const handleSubmit = (e) => {
    e.preventDefault();
      dispatch(registerUser(signupData));
    
  }; ***/}

  return (
    <div className="min-h-screen flex items-center justify-center py-10 pb-10 bg-gradient-to-b from-pink-600 via-red-200 to-white px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <PawPrint className="h-12 w-12 text-pink-500" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-2 text-gray-600">Join our community of pet lovers</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Create a password"
                />
              </div>
                     {/** role selection */}
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Select Role:</label>
           <select
             id="role"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
               >
              
          <option value="user"  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500">User</option>
         {/**  <option value="seller"  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500">Seller</option>**/}
                 
        </select>

              <p className="mt-2 text-sm text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-pink-500 hover:text-pink-600">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-pink-500 hover:text-pink-600">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 font-semibold shadow-lg shadow-pink-500/25"
          >
            Create account
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-pink-500 hover:text-pink-600">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
