import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './AxiosConfig';
import '../css/LoginForm.css'; // Добавьте стили, если нужно

const Auth = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors('');
        const newErrors = [];

        if (!login) {
            newErrors.push('Логин не может быть пустым');
        }
        if (!password) {
            newErrors.push('Пароль не может быть пустым');
        }
        if (newErrors.length > 0) {
            setErrors(newErrors); // Устанавливаем ошибки
            return;
        }
        try {
            const response = await axiosInstance.post('http://localhost:8080/login', { login, password });
            ;
            if (response.status === 200) {
                // Успешная аутентификация, можно перенаправить пользователя
                navigate('/'); // Перенаправление на главную страницу или другую
            }
        } catch (err) {
            // Обработка ошибок
            if (err.response && err.response.data) {
                setErrors(err.response.data); // Установка сообщения об ошибке
            } else {
                setErrors('Произошла ошибка при входе');
            }
        }
    };

    const handleHomeButton = () => {
        navigate(`/`);
    };

    return (
        <div className="text-heading-default">
            <div className="button-container">
                <button onClick={() => handleHomeButton()}>На главную</button>
            </div>
            <div className="login-form-container">
                <h2>Авторизация</h2>
                <form onSubmit={handleSubmit}>
                    <label>Логин:</label>
                    <div className="input-group">
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </div>
                    <label>Пароль:</label>
                    <div className="input-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {errors.length > 0 && (
                        <ul className="error-list">
                            {errors.map((error, index) => (
                                <li key={index} className="error-message">{error}</li>
                            ))}
                        </ul>
                    )}
                    <button type="submit">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
