import axios from 'axios';

// Создаем экземпляр axios с глобальными настройками
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // Базовый URL вашего API
    withCredentials: true, // Включение передачи куки с каждым запросом
});

export default axiosInstance;