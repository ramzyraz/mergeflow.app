import axios from 'axios';
// config
import { HOST_API_KEY } from '../config';
// ----------------------------------------------------------------------

console.log("Axios Base URL:", process.env.NEXT_PUBLIC_HOST_API);

const axiosInstance = axios.create({ baseURL: HOST_API_KEY });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

console.log("Axios instance -> ", axiosInstance);

export default axiosInstance;
