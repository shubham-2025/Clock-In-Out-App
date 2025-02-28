import React from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaRocket, FaCheckCircle, FaStar } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-8 overflow-hidden">
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mt-[-150px]">
        {/* ✅ Features Card */}
        <div className="p-8 w-80 bg-white rounded-lg shadow-lg flex flex-col items-center space-y-3 transition-all transform hover:scale-105">
          <h2 className="text-2xl font-bold text-blue-500 text-center">⭐ Features</h2>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Real-time Tracking</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Automated Attendance</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Detailed Reports</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Seamless UI/UX</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Customizable Alerts</span>
            </li>
          </ul>
        </div>

        {/* ✅ Welcome Card */}
        <div className="p-8 w-80 bg-white rounded-lg shadow-lg flex flex-col items-center space-y-5 transition-all transform hover:scale-105">
          <FaClock className="text-blue-500 text-5xl animate-pulse" />
          <h1 className="text-2xl font-bold text-center">Welcome to Clock Box ⏳</h1>
          <p className="text-base text-gray-600 text-center">
            Track time efficiently & stay productive!
          </p>

          <button
            onClick={() => navigate("/clock")}
            className="mt-4 px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md flex items-center space-x-2 hover:bg-blue-600 transition"
          >
            <FaRocket />
            <span>Get Started</span>
          </button>
        </div>

        {/* ✅ Why Choose Us Card */}
        <div className="p-8 w-80 bg-white rounded-lg shadow-lg flex flex-col items-center space-y-3 transition-all transform hover:scale-105">
          <h2 className="text-2xl font-bold text-blue-500 text-center">⭐ Why Choose Us?</h2>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center space-x-2">
              <FaStar className="text-yellow-500" />
              <span>Accurate Time Tracking</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaStar className="text-yellow-500" />
              <span>Secure & Reliable</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaStar className="text-yellow-500" />
              <span>Easy to Use</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaStar className="text-yellow-500" />
              <span>24/7 Support</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaStar className="text-yellow-500" />
              <span>Trusted by Businesses</span>
            </li>
          </ul>
        </div>
      </div>
      <style>{`body { overflow: hidden; }`}</style>
    </div>
  );
};

export default Dashboard;
