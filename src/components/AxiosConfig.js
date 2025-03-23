import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
// Создаем экземпляр axios с глобальными настройками
const axiosInstance = axios.create({
    baseURL: `${API_URL}`, // Базовый URL вашего API
    withCredentials: true, // Включение передачи куки с каждым запросом
});

export default axiosInstance;