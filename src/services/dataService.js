import axios from 'axios';

const fetchData = async (endpoint, cacheKey, fetchInterval) => {
  const cachedData = localStorage.getItem(cacheKey);
  const lastFetchTime = localStorage.getItem(`${cacheKey}_lastFetchTime`);
  const now = Date.now();

  if (cachedData && lastFetchTime && (now - lastFetchTime < fetchInterval)) {
    return JSON.parse(cachedData);
  } else {
    try {
      const response = await axios.get(endpoint);
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
      localStorage.setItem(`${cacheKey}_lastFetchTime`, now.toString());
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  }
};

export const fetchCustomers = async () => {
  return fetchData('/api/kunde/GetAllKunden', 'customers', 2 * 60 * 1000);
};

export const fetchDogs = async () => {
  return fetchData('/api/dog/GetAllDogs', 'dogs', 2 * 60 * 1000);
};

export const fetchAppointments = async () => {
  return fetchData('/api/appointment/getAllAppointments', 'appointments', 2 * 60 * 1000);
}