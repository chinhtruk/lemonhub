import axios from '../config/axios';

export const getRevenueStatistics = async (period = 'month', year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
  const response = await axios.get(`/api/statistics/revenue?period=${period}&year=${year}&month=${month}`);
  return response.data;
};

export const getProductCategoryDistribution = async () => {
  const response = await axios.get('/api/statistics/product-categories');
  return response.data;
}; 