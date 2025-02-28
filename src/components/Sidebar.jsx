import { Link } from "react-router-dom";
import React from "react";

const Sidebar = () => {
  return (
    <div className="flex">
      <div className="bg-gray-800 text-white w-64 min-h-screen p-5 shadow-md">
        <h2 className="text-3xl font-extrabold text-yellow-400 italic tracking-wide mb-6">
          ⏰ Clock Box
        </h2>
        <ul className="space-y-4">
          <li>
            <Link to="/Clock" className="block p-2 hover:bg-gray-700 rounded">
              Clock In
            </Link>
          </li>
          <li>
            <Link to="/attendance" className="block p-2 hover:bg-gray-700 rounded">
              Attendance
            </Link>
          </li>
          <li>
            <Link to="/timesheet" className="block p-2 hover:bg-gray-700 rounded">
              Timesheet
            </Link>
          </li>
          <li>
            <Link to="/Leave" className="block p-2 hover:bg-gray-700 rounded">
              Request a Leave
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
