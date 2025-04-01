import React from "react";
import { Link } from "react-router-dom";

function HomePage({ token }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center p-8 bg-white rounded-xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Welcome to AI Document Assistant ✨
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Unlock the power of your documents with AI-driven insights. Ask
          questions, get answers, and streamline your workflow.
        </p>
        {token ? (
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out"
          >
            Continue to Dashboard
          </Link>
        ) : (
          <Link
            to="/register"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out"
          >
            Get Started (Register)
          </Link>
        )}
      </div>
    </div>
  );
}

export default HomePage;
