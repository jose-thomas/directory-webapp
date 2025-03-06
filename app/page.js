'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', username, password);
  };

  if (!isClient) return null; // Prevents SSR issues

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/st jude.jpg" // Replace with your image path
          alt="Saint Image"
          layout="fill"
          objectFit="contain"
          quality={100}
        />
      </div>
      
      {/* Login Form */}
      <div className="relative z-10 bg-white/70 p-6 rounded-xl shadow-lg w-96 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Log In</h2>
        <p className="text-gray-600 text-center mb-4">Please sign in to continue</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-400 text-gray-900"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-400 text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 hover:cursor-pointer transition "
          >
            LOGIN
          </button>
        </form>
        <div className="text-center mt-4 text-blue-600 hover:underline cursor-pointer">
          Forgot Username or Password?
        </div>
      </div>
    </div>
  );
}
