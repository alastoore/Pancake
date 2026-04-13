import React from "react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      {/* The Gray Rounded Card */}
      <div className="w-full max-w-md bg-gray-100 p-8 rounded-3xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create an Account
        </h1>

        <form className="flex flex-col gap-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="mt-2 w-full bg-gray-800 text-white font-semibold py-4 rounded-xl hover:bg-gray-700 transition active:scale-95"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}