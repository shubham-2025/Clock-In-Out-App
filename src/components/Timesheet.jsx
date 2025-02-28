import { useEffect, useState } from "react";
import React from "react";
import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEdit,
  FaSave,
  FaCoffee,
  FaCheck,
} from "react-icons/fa";

const Timesheet = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [editedTime, setEditedTime] = useState({ clockIn: "", clockOut: "" });
  const [onBreak, setOnBreak] = useState(false);
  const [breakId, setBreakId] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    if (auth.currentUser) {
      const q = query(
        collection(db, "attendance"),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        clockIn: docSnap.data().clockIn?.toDate(),
        clockOut: docSnap.data().clockOut?.toDate(),
        breakStart: docSnap.data().breakStart?.toDate(),
        breakEnd: docSnap.data().breakEnd?.toDate(),
      }));

      setAttendance(data);
      setLoading(false);

      const latestEntries = Object.values(
        data.reduce((acc, entry) => {
          const dateKey = entry.clockIn?.toISOString().split("T")[0];
          if (!acc[dateKey] || entry.clockIn > acc[dateKey].clockIn) {
            acc[dateKey] = entry;
          }
          return acc;
        }, {})
      );

      setAttendance(latestEntries);
      setLoading(false);

      const activeBreak = data.find((entry) => entry.breakStart && !entry.breakEnd);
      setOnBreak(!!activeBreak);
      setBreakId(activeBreak ? activeBreak.id : null);
    }
  };

  const handleEdit = (id, clockIn, clockOut) => {
    setIsEditing(id);
    setEditedTime({
      clockIn: clockIn ? clockIn.toISOString().slice(11, 16) : "",
      clockOut: clockOut ? clockOut.toISOString().slice(11, 16) : "",
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editedTime.clockIn || !editedTime.clockOut) {
      toast.error("❌ Please enter both Clock In and Clock Out times.");
      return;
    }

    const entry = attendance.find((att) => att.id === id);
    if (!entry || !entry.clockIn) return;

    // Preserve original date while updating time
    const date = entry.clockIn.toISOString().split("T")[0];
    const clockInTime = new Date(`${date}T${editedTime.clockIn}:00`);
    const clockOutTime = new Date(`${date}T${editedTime.clockOut}:00`);
    const minClockIn = new Date(`${date}T09:30:00`);
    const maxClockOut = new Date(`${date}T19:00:00`);

    if (clockInTime < minClockIn) {
      toast.error("❌ Clock-In cannot be before 9:30 AM.");
      return;
    }
    if (clockOutTime > maxClockOut) {
      toast.error("❌ Clock-Out cannot be after 7:00 PM.");
      return;
    }

    const docRef = doc(db, "attendance", id);
    await updateDoc(docRef, {
      clockIn: clockInTime,
      clockOut: clockOutTime,
    });

    setIsEditing(null);
    fetchAttendance();
    toast.success("✅ Timesheet updated successfully!");
  };

  const handleBreak = async () => {
    if (onBreak) return;
  
    const timestamp = new Date();
  
    // Find the latest clock-in entry that hasn't been clocked out
    const latestEntry = attendance.find((entry) => entry.clockIn && !entry.clockOut);
  
    if (!latestEntry) {
      toast.error("❌ No active clock-in entry found.");
      return;
    }
  
    await updateDoc(doc(db, "attendance", latestEntry.id), {
      breakStart: timestamp,
      breakEnd: null, // Ensure it starts fresh
    });
  
    setOnBreak(true);
    setBreakId(latestEntry.id);
    fetchAttendance();
    toast.info("☕ Break started!");
  };

  const handleResumeBreak = async () => {
    if (!breakId) return;
  
    const timestamp = new Date();
    const latestEntry = attendance.find((entry) => entry.id === breakId);
  
    if (!latestEntry) return;
  
    const breakStartTime = latestEntry.breakStart;
    const breakDuration = (timestamp - breakStartTime) / (1000 * 60); // Convert to minutes
  
    if (breakDuration > 45) {
      toast.error("⏳ Break cannot exceed 45 minutes!");
      return;
    }
  
    await updateDoc(doc(db, "attendance", breakId), { breakEnd: timestamp });
  
    setOnBreak(false);
    setBreakId(null);
    fetchAttendance();
    toast.success("✅ Break ended!");
  };
  

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Timesheet</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <button
              onClick={handleBreak}
              disabled={onBreak}
              className={`btn ${onBreak ? "btn-disabled" : "btn-warning"}`}
            >
              <FaCoffee /> Start Break
            </button>

            <button
              onClick={handleResumeBreak}
              disabled={!onBreak}
              className={`btn ${!onBreak ? "btn-disabled" : "btn-success"}`}
            >
              <FaCheck /> Resume Work
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
         <table className="w-full border-collapse border border-gray-300">
           <thead>
             <tr className="bg-purple-500 text-white">
             <th className="p-2 text-left pl-2">Date</th>
            <th className="p-2 text-left pl-2">Clock In</th>
            <th className="p-2 text-left pl-2">Clock Out</th>
            <th className="p-2 text-left pl-2">Break Start</th>
            <th className="p-2 text-left pl-2">Break End</th>
           <th className="p-2 text-left pl-2">Actions</th>
           </tr>
           </thead>
            <tbody>

                {attendance.map((entry) => (
                  <tr key={entry.id} className="border-b">
                    <td className="p-2">{entry.clockIn ? entry.clockIn.toLocaleDateString() : "—"}</td>
                    <td className="p-2">
                      {isEditing === entry.id ? (
                        <input
                          type="time"
                          value={editedTime.clockIn}
                          onChange={(e) => setEditedTime({ ...editedTime, clockIn: e.target.value })}
                          className="border p-1 rounded"
                        />
                      ) : entry.clockIn ? (
                        entry.clockIn.toLocaleTimeString()
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing === entry.id ? (
                        <input
                          type="time"
                          value={editedTime.clockOut}
                          onChange={(e) => setEditedTime({ ...editedTime, clockOut: e.target.value })}
                          className="border p-1 rounded"
                        />
                      ) : entry.clockOut ? (
                        entry.clockOut.toLocaleTimeString()
                      ) : (
                        "Not Clocked Out"
                      )}
                    </td>
                    <td className="p-2">{entry.breakStart ? entry.breakStart.toLocaleTimeString() : "—"}</td>
                    <td className="p-2">{entry.breakEnd ? entry.breakEnd.toLocaleTimeString() : "—"}</td>
                    <td className="p-2">
                      {isEditing === entry.id ? (
                        <button onClick={() => handleSaveEdit(entry.id)} className="btn btn-success">
                          <FaSave /> Save
                        </button>
                      ) : (
                        <button onClick={() => handleEdit(entry.id, entry.clockIn, entry.clockOut)} className="btn btn-primary">
                          <FaEdit /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Timesheet;
