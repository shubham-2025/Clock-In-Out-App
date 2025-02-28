import { auth, db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import React from "react";
import AttendanceGraph from "./AttendanceGraph"; 
import PublicHolidays from "./PublicHolidays";

const API_KEY = "EgYTi5BQ5pwuCt9C5TlBgyKek2HM2mVN";
const COUNTRY = "IN"; // India
const YEAR = new Date().getFullYear();

const ClockInOut = () => {
  const [clockedIn, setClockedIn] = useState(localStorage.getItem("clockedIn") === "true");
  const [clockInTime, setClockInTime] = useState(
    localStorage.getItem("clockInTime") ? new Date(parseInt(localStorage.getItem("clockInTime"))) : null
  );
  const [clockOutTime, setClockOutTime] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState("00:00:00");
  const [averageWorkHours, setAverageWorkHours] = useState(0);
  const [onTimeArrivalPercentage, setOnTimeArrivalPercentage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [allHolidays, setAllHolidays] = useState([]);

  useEffect(() => {
    fetchAttendanceData();
    fetchHolidays();
    if (clockedIn && clockInTime) {
      const interval = setInterval(() => {
        updateTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [clockedIn, clockInTime]);

  const fetchAttendanceData = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, "attendance"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceData(data);
      calculateStats(data);
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch(
        `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${COUNTRY}&year=${YEAR}`
      );
      const data = await response.json();
      if (data?.response?.holidays) {
        const holidays = data.response.holidays.map((holiday) => ({
          name: holiday.name,
          date: holiday.date.iso,
        }));
        setAllHolidays(holidays);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const calculateStats = (data) => {
    let totalHours = 0;
    let onTimeCount = 0;
    let totalDays = data.length;

    data.forEach((entry) => {
      if (entry.clockIn && entry.clockOut) {
        const workDuration = (entry.clockOut.seconds - entry.clockIn.seconds) / 3600;
        totalHours += workDuration;
      }
      if (entry.status === "ON TIME") {
        onTimeCount++;
      }
    });

    setAverageWorkHours(totalDays ? (totalHours / totalDays).toFixed(2) : "0");
    setOnTimeArrivalPercentage(totalDays ? ((onTimeCount / totalDays) * 100).toFixed(1) : "0");
  };

  const updateTimer = () => {
    if (clockedIn && clockInTime) {
      const elapsed = new Date() - clockInTime;
      const hours = String(Math.floor(elapsed / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
      setTimer(`${hours}:${minutes}:${seconds}`);
    }
  };

  const handleClockIn = async () => {
    const timestamp = new Date();
    await addDoc(collection(db, "attendance"), {
      userId: auth.currentUser.uid,
      name: auth.currentUser.displayName,
      clockIn: timestamp,
      clockOut: null,
      status: timestamp.getHours() >= 9 ? "LATE" : "ON TIME",
    });

    setClockInTime(timestamp);
    setClockedIn(true);
    localStorage.setItem("clockedIn", "true");
    localStorage.setItem("clockInTime", timestamp.getTime().toString());
  };

  const handleClockOut = async () => {
    const timestamp = new Date();
    const q = query(collection(db, "attendance"), where("userId", "==", auth.currentUser.uid), where("clockOut", "==", null));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = doc(db, "attendance", querySnapshot.docs[0].id);
      await updateDoc(docRef, { clockOut: timestamp });

      setClockOutTime(timestamp);
      setClockedIn(false);
      setTimer("00:00:00");
      localStorage.removeItem("clockedIn");
      localStorage.removeItem("clockInTime");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
     {/* Clock Timer Section */}
<div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-center w-full">
  {/* Left Side - Label & Clock */}
  <div className="flex flex-col items-center justify-center">
    {/* Title in Green */}
    <h2 className="text-lg font-semibold text-green-600 mb-2">Current Time</h2>

    {/* Clock Circle */}
    <div className="relative w-40 h-40 flex items-center justify-center border-4 border-green-500 rounded-full text-xl font-bold text-gray-900 dark:text-white">
      {clockedIn ? timer : new Date().toLocaleTimeString()}
    </div>

    {/* Clock-in Info */}
    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
      {clockedIn ? `Checked in at ${clockInTime.toLocaleTimeString()}` : "Not Checked In"}
    </p>
  </div>

  {/* Right Side - Clock In/Out Button */}
  <div className="ml-10"> {/* Adds spacing between clock and button */}
    {!clockedIn ? (
      <button
        onClick={handleClockIn}
        className="px-5 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition"
      >
        Clock In
      </button>
    ) : (
      <button
        onClick={handleClockOut}
        className="px-5 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
      >
        Clock Out
      </button>
    )}
  </div>
</div>
      {/* Attendance Summary & Public Holidays */}
      <div className="flex flex-col gap-2 w-full">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
          <h3 className="text-md font-semibold text-green-600 mb-1">Attendance Summary</h3>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Avg. Work Hrs</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{averageWorkHours} hrs</p>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">Arrival On Time</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{onTimeArrivalPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
  <h3 className="text-md font-semibold text-green-600 mb-1">Public Holidays</h3>
  <PublicHolidays />

  {/* See All Button */}
  <button
    onClick={() => setShowPopup(true)}
    className="mt-2 text-blue-500 hover:underline text-sm"
  >
    See All
  </button>
</div>

{/* Popup Window for Holidays */}
  {showPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto">
      {/* Title */}
      <h2 className="text-lg font-bold text-green-600 mb-4 text-center">
        Public Holidays - {YEAR}
      </h2>

      {/* Holidays Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="p-2 border">Month</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Holiday Name</th>
            </tr>
          </thead>
          <tbody>
            {allHolidays.length > 0 ? (
              allHolidays
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((holiday, index) => (
                  <tr key={index} className="border text-center bg-gray-100 dark:bg-gray-700">
                    <td className="p-2 border text-gray-900 dark:text-gray-100">
                      {new Date(holiday.date).toLocaleString("default", {
                        month: "long",
                      })}
                    </td>
                    <td className="p-2 border text-gray-900 dark:text-gray-100">{holiday.date}</td>
                    <td className="p-2 border text-gray-900 dark:text-gray-100">{holiday.name}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500 dark:text-gray-300">
                  No holidays available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowPopup(false)}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
        >
          Back
        </button>
      </div>
    </div>
  </div>
)}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 col-span-2">
        <h3 className="text-md font-semibold text-green-600 mb-1">Attendance Graph</h3>
        <AttendanceGraph data={attendanceData} /> 
        
      </div>
    </div>
  );
};

export default ClockInOut;
