import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LeaveRequest = () => {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "leaveRequests"), {
        email,
        reason,
        days,
        status: "Pending",
        createdAt: new Date(),
      });

      // ✅ Show success toast
      toast.success("Leave request submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Clear form fields
      setEmail("");
      setReason("");
      setDays("");
    } catch (error) {
      // ❌ Show error toast
      toast.error("Error submitting leave request!", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error submitting leave request: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen overflow-hidden">
      <div className="bg-gray-200 dark:bg-gray-800 p-10 rounded-lg shadow-lg w-[500px] relative -translate-y-20">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">
          Request Leave
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="No. of days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
            className="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
            Request Leave
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequest;
