import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/LoginForm.css'; // Добавьте стили, если нужно

const Auth = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Сброс ошибки

        try {
            axios.defaults.withCredentials = true
            const response = await axios.post('http://localhost:8080/login', { login, password });
            ;
            if (response.status === 200) {
                // Успешная аутентификация, можно перенаправить пользователя
                navigate('/'); // Перенаправление на главную страницу или другую
            }
        } catch (err) {
            // Обработка ошибок
            if (err.response && err.response.data) {
                setError(err.response.data); // Установка сообщения об ошибке
            } else {
                setError('Произошла ошибка при входе');
            }
        }
    };

    return (
        <div className="login-form-container">
            <h2>Авторизация</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Логин:</label>
                    <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default Auth;
