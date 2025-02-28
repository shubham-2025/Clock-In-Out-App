import React, { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      navigate("/dashboard"); // Redirect to dashboard after signup
    } catch (err) {
      setError("Signup failed. Try again!");
      console.error("Signup error:", err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#1a2a3a] to-[#0f2027]">
      {/* Background Effects */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500 opacity-30 blur-[180px] rounded-full top-1/4 left-1/4"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-30 blur-[160px] rounded-full bottom-1/4 right-1/4"></div>

      {/* Signup Card */}
      <motion.div
        className="relative z-10 bg-white/15 backdrop-blur-lg border border-white/30 shadow-2xl p-8 rounded-3xl w-[400px] flex flex-col items-center text-white"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
          Create Your Account
        </h2>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form className="w-full" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Enter Your Full Name"
            className="p-4 mb-4 w-full text-center rounded-lg border border-gray-400 bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Enter Your Email"
            className="p-4 mb-4 w-full text-center rounded-lg border border-gray-400 bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Your Password"
            className="p-4 mb-6 w-full text-center rounded-lg border border-gray-400 bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <motion.button
            type="submit"
            className="flex justify-center items-center gap-3 p-4 w-full bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-green-400 text-lg"
            whileHover={{ scale: 1.07 }}
          >
            <FaUserPlus />
            <span>Sign Up</span>
          </motion.button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
