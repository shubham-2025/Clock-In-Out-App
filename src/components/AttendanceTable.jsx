import { useEffect, useState } from "react";
import { db, collection, getDocs } from "./firebase";
import React from "react";

const AttendanceTable = () => {
  const [attendance, setAttendance] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Default: Current month
  

  useEffect(() => {
    const fetchAttendance = async () => {
      const data = await getDocs(collection(db, "attendance"));
      const formattedData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendance(formattedData);
    };

    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=EgYTi5BQ5pwuCt9C5TlBgyKek2HM2mVN&country=IN&year=${new Date().getFullYear()}`
        );
        const data = await response.json();

        if (data?.response?.holidays) {
          setHolidays(
            data.response.holidays.map((holiday) => ({
              name: holiday.name,
              date: holiday.date.iso,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchAttendance();
    fetchHolidays();
  }, []);

  const getStatus = (clockIn) => {
    if (!clockIn || !clockIn.seconds) return "Absent";
    const clockInTime = new Date(clockIn.seconds * 1000);
    const hours = clockInTime.getHours();
    const minutes = clockInTime.getMinutes();
    return hours > 9 || (hours === 9 && minutes > 30) ? "LATE" : "ON TIME";
  };

  const calculateWorkingHours = (clockIn, clockOut) => {
    if (!clockIn || !clockIn.seconds || !clockOut || !clockOut.seconds) {
      return "--";
    }
    const clockInTime = new Date(clockIn.seconds * 1000);
    const clockOutTime = new Date(clockOut.seconds * 1000);
    const workingHours = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Convert ms to hours
    return `${workingHours.toFixed(2)} hrs`;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isHoliday = (date) => {
    return holidays.some((holiday) => holiday.date === date.toISOString().split("T")[0]);
  };

    // ✅ Fix: Ensure today's date is included
const today = new Date();
today.setHours(0, 0, 0, 0); // Set to midnight to avoid timezone issues

const year = today.getFullYear();
const monthStart = new Date(year, selectedMonth, 1);
const monthEnd = new Date(year, selectedMonth + 1, 0);

// ✅ Generate list of all past dates including today
const dates = [];
for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
  if (d > today) break; // Exclude future dates
  dates.push(new Date(d));
}

// ✅ If today's date is missing, manually add it
if (!dates.some((d) => d.getTime() === today.getTime())) {
  console.log("Today's date was missing! Adding manually...");
  dates.push(new Date(today));
}

// ✅ Sort dates in descending order (latest first)
dates.sort((a, b) => b - a);

// 🔍 Debugging: Log the generated dates
console.log("Generated Dates:", dates.map(d => d.toDateString()));

  return (
    <div className="mt-6">
      {/* Month Selection Dropdown - Aligned to Right */}
      <div className="flex justify-end mb-4">
        <select
          className="select select-bordered w-full max-w-xs"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(year, i).toLocaleString("en-US", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-300 rounded-lg">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th>Date</th>
              <th>Name</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Working Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
  {dates.map((date, index) => {
    const formattedDate = date.toISOString().split("T")[0];
    console.log(`Rendering row for: ${formattedDate}`); // 🔍 Debugging log

    const entriesForDate = attendance.filter((att) => {
      if (!att.clockIn || !att.clockIn.seconds) return false;
      return (
        new Date(att.clockIn.seconds * 1000).toISOString().split("T")[0] === formattedDate
      );
    });

    // Get the latest entry if multiple exist
    const latestEntry =
      entriesForDate.length > 0
        ? entriesForDate.reduce((latest, current) => {
            return latest.clockIn.seconds > current.clockIn.seconds ? latest : current;
          })
        : null;

    return (
      <tr
        key={index} // 🔍 Use index to ensure uniqueness
        className={`text-gray-900 ${
          isWeekend(date)
            ? "bg-yellow-200 font-bold"
            : isHoliday(date)
            ? "bg-red-200 font-bold"
            : "bg-white"
        }`}
      >
        <td>{formattedDate}</td>
        {isWeekend(date) ? (
          <td colSpan="5" className="text-center">
            Weekend - {date.toLocaleDateString("en-US", { weekday: "long" })}
          </td>
        ) : isHoliday(date) ? (
          <td colSpan="5" className="text-center">{`Public Holiday - ${
            holidays.find((h) => h.date === formattedDate)?.name
          }`}</td>
        ) : latestEntry ? (
          <>
            <td>{latestEntry.name || "N/A"}</td>
            <td>
              {latestEntry.clockIn && latestEntry.clockIn.seconds
                ? new Date(latestEntry.clockIn.seconds * 1000).toLocaleTimeString()
                : "--"}
            </td>
            <td>
              {latestEntry.clockOut && latestEntry.clockOut.seconds
                ? new Date(latestEntry.clockOut.seconds * 1000).toLocaleTimeString()
                : "Not Clocked Out"}
            </td>
            <td>{calculateWorkingHours(latestEntry.clockIn, latestEntry.clockOut)}</td>
            <td
              className={
                getStatus(latestEntry.clockIn) === "LATE"
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {getStatus(latestEntry.clockIn)}
            </td>
          </>
        ) : (
          <td colSpan="5" className="text-center text-red-500 font-bold">Absent</td>
        )}
      </tr>
    );
  })}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
