import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import '../css/Home.css';
import '../css/Auth.css';

const Home = () => {
    const navigate = useNavigate();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const checkUserStatus = async () => {
        try {
            axios.defaults.withCredentials = true
            const response = await axios.get('http://localhost:8080/user');
            if (response.status === 204) {
                setIsUserLoggedIn(false); // Пользователь не авторизован
            } else {
                setIsUserLoggedIn(true); // Пользователь авторизован
            }
        } catch (error) {
            console.error('Ошибка при проверке статуса пользователя:', error);
            setIsUserLoggedIn(false); // В случае ошибки считаем, что пользователь не авторизован
        }
    };

    useEffect(() => {
        checkUserStatus();
    }, []);

    const handleButtonClick = (id) => {
        navigate(`/task/${id}`);
    };

    const handleRandomButtonClick = () => {
        navigate(`/task`);
    };

    const handleLoginClick = () => {
        navigate(`/login`);
    };

    const handleRegisterClick = () => {
        navigate(`/register`);
    };

    const handleProfileClick = () => {
        navigate(`/profile`);
    };

    return (
        <div className="home-container">
            <div className="auth-buttons">
                {isUserLoggedIn ? (
                    <button onClick={handleProfileClick}>Личный кабинет</button>
                ) : (
                    <>
                        <button onClick={handleLoginClick}>Войти</button>
                        <button onClick={handleRegisterClick}>Регистрация</button>
                    </>
                )}
            </div>
            <h2>Выберите задачу:</h2>
            <div className="button-container">
                <button onClick={() => handleButtonClick('426')}>Вариант 1</button>
                <button onClick={() => handleButtonClick('4235')}>Вариант 2</button>
                <button onClick={() => handleButtonClick('126')}>Вариант 3</button>
                <button onClick={() => handleButtonClick('42365')}>Вариант 4</button>
                <button onClick={() => handleRandomButtonClick()}>Сгенерировать случайный</button>
            </div>
        </div>
    );
};

export default Home;
