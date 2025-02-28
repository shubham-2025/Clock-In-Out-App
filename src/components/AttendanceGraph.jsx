import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const AttendanceGraph = ({ data }) => {
  // Extract only the latest clock-in entry for each day
  const latestEntries = Object.values(
    data.reduce((acc, entry) => {
      if (!entry.clockIn || !entry.clockIn.seconds) return acc; // Ensure clockIn exists
      
      const clockInDate = new Date(entry.clockIn.seconds * 1000); // Convert Firestore timestamp to Date
      const dateKey = clockInDate.toISOString().split("T")[0]; // Extract YYYY-MM-DD

      if (!acc[dateKey] || clockInDate > new Date(acc[dateKey].clockIn.seconds * 1000)) {
        acc[dateKey] = entry;
      }
      return acc;
    }, {})
  );

  // Format and validate data
  const formattedData = latestEntries.map((entry) => {
    const clockInTime = new Date(entry.clockIn.seconds * 1000);
    const clockOutTime = entry.clockOut ? new Date(entry.clockOut.seconds * 1000) : null;

    return {
      date: clockInTime.toLocaleDateString(),
      hours: clockOutTime ? (clockOutTime - clockInTime) / 3600000 : 0, // Convert ms to hours
    };
  });

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formattedData}>
        <XAxis dataKey="date" stroke="#8884d8" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(tick) => `${tick}h`} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="#4CAF50"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AttendanceGraph;
