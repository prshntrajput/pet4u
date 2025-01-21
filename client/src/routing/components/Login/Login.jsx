import React, { useState } from 'react';
import { PawPrint, Mail, Lock, ArrowRight } from 'lucide-react';
import { setLoginUser } from '../../../store/reducers/User/Login';
import {loginUser} from "../../../store/actions/User/loginAction";
import {useDispatch , useSelector} from "react-redux";
import axios from 'axios';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  

  {/**const { error, loading, message}=useSelector((state)=>state.loginUserReducer);

   const dispatch = useDispatch();**/}

  {/**const handleChange =(e)=>{
    dispatch(setLoginUser({ name: e.target.name, value: e.target.value }))
    console.log({name: e.target.name, value: e.target.value})
  }***/}


  {/***const handleSubmit=(e)=>{
    e.preventDefault();
    dispatch(loginUser(email,password))
    console.log(loginData)
  }**/}

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login logic here
   try {
          const response = await axios.post("http://localhost:3001/api/login",{ email, password});

          const {data} = response;
          console.log(data)
          localStorage.setItem("authToken",data.token)

           if (data.role === "admin") {
            window.location.href = "/admin-dashboard"; // Example route
           } else {
            window.location.href = "/home"; // Example route
              }

   } catch (error) {
      const errorMessage =
      error.response?.data || "Something went wrong. Please try again.";
      alert(errorMessage); 
  }
  }; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-600 via-red-200 to-white px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <PawPrint className="h-12 w-12 text-pink-500" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to continue your journey</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-pink-500 hover:text-pink-600">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 font-semibold shadow-lg shadow-pink-500/25"
          >
            Sign in
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-pink-500 hover:text-pink-600">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}