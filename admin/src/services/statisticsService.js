import axios from 'axios';

const getRevenueStats = async (period = 'month', year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
  const { data } = await axios.get(`/api/statistics/revenue?period=${period}&year=${year}&month=${month}`);
  return data;
};

const getProductCategoryStats = async () => {
  const { data } = await axios.get('/api/statistics/products/categories');
  return data;
};

const getDashboardStats = async () => {
  const { data } = await axios.get('/api/statistics/dashboard');
  return data;
};

export { getRevenueStats, getProductCategoryStats, getDashboardStats }; 