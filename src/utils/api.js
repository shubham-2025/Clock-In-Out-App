export const fetchHolidays = async (countryCode, year) => {
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching holidays:", error);
      return [];
    }
  };
  