import { useEffect, useState } from "react";
import React from "react";

const API_KEY = "hUFbWedtFoe97VDbY8Y4Q2UYHxaFXNnt"; 
const COUNTRY = "IN"; // India
const YEAR = new Date().getFullYear();

const PublicHolidays = () => {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${COUNTRY}&year=${YEAR}`
        );
        const data = await response.json();
        
        if (data?.response?.holidays) {
          const allHolidays = data.response.holidays.map((holiday) => ({
            name: holiday.name,
            date: holiday.date.iso,
          }));

          const currentWeekHolidays = filterHolidaysForCurrentWeek(allHolidays);
          setHolidays(currentWeekHolidays);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
  }, []);

  const filterHolidaysForCurrentWeek = (holidays) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)

    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= startOfWeek && holidayDate <= endOfWeek;
    });
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
  <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
    Public Holidays (This Week)
  </h3>
  {holidays.length > 0 ? (
    <ul className="space-y-2">
      {holidays.map((holiday, index) => (
        <li
          key={index}
          className="text-md font-medium text-gray-900 dark:text-gray-100"
        >
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {holiday.date}
          </span>{" "}
          - {holiday.name}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-700 dark:text-gray-300">No public holidays this week.</p>
  )}
</div>
  );
};

export default PublicHolidays;
