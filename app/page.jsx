"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", username, password);
  };

  if (!isClient) return null; // Prevents SSR issues

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-200 p-2`}
    >
      <div
        className={`flex  rounded-xl shadow-lg backdrop-blur-xl aspect-8/5 w-1/2  bg-gray-100 grow shrink xl:grow-0 xl:shrink-0`}
      >
        {/* Background Image */}
        <div
          className={`w-2/5 aspect-16/25 relative rounded-l-xl p-5 overflow-hidden grow-2 shrink-2`}
        >
          <Image
            src="/st jude.jpg"
            alt="Saint Image"
            fill
            style={{ objectFit: "cover" }}
            sizes="100%"
            priority
            // quality={100}
          />
        </div>
        {/* Login Form */}
        <div
          className={`flex  aspect-48/50 items-center justify-center  rounded-r-xl p-5 w-3/5 bg-gray-100 grow-3 shrink-3`}
        >
          <div className="relative bg-white/70 p-6 flex flex-col rounded-xl shadow-lg w-96 backdrop-blur-xl 2xl:grow shrink">
            <h2 className="text-2xl font-semibold text-gray-800 text-center ">
              Log In
            </h2>
            <p className="text-gray-600 text-center mb-4 ">
              Please sign in to continue
            </p>
            <form onSubmit={handleLogin} className="space-y-4 ">
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
            <div className="text-center mt-4 text-blue-600 hover:underline cursor-pointer  ">
              Forgot Username or Password?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
