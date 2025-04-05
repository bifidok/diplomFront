import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../AxiosConfig';

const Account = () => {
    const navigate = useNavigate();
    const [accountDetails, setAccountDetails] = useState(null); // Состояние для хранения данных AccountDetails
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние ошибки
    const API_URL = process.env.REACT_APP_API_URL;

    // Загрузка данных с сервера
    useEffect(() => {
        axiosInstance
            .get(`${API_URL}/account`)
            .then((response) => {
                console.log('Данные с сервера:', response.data);
                setAccountDetails(response.data); // Сохраняем данные в состояние
                setLoading(false); // Завершаем загрузку
            })
            .catch((err) => {
                console.error('Ошибка при получении данных:', err);
                setError('Не удалось загрузить данные');
                setLoading(false); // Завершаем загрузку в случае ошибки
            });
    }, []);

    // Если данные еще загружаются
    if (loading) {
        return <div>Загрузка...</div>;
    }

    // Если произошла ошибка
    if (error) {
        return <div>{error}</div>;
    }

    // Если данные не загружены
    if (!accountDetails) {
        return <div>Нет данных.</div>;
    }

    const handleHomeButton = () => {
        navigate(`/`);
    };

    const handleRetryAttempt = (hashcode) => {
        const url = `/task/${hashcode}`; // Формируем URL для получения задачи
        navigate(url); // Редиректим на страницу TaskDetail
    };

    const { login, sessions } = accountDetails;

    return (
        <div className="text-heading-default-black">
            <div className="button-container">
                <button onClick={() => handleHomeButton()}>На главную</button>
            </div>
            <h1 className="text-heading-default">История попыток</h1>
            <p className="text-heading-default">Логин: {login}</p>

            {sessions.length === 0 ? (
                <p>Нет сохраненных попыток.</p>
            ) : (
                <ul>
                    {sessions.map((session, sessionIndex) => (
                        <li key={sessionIndex} style={{ marginBottom: '20px' }}>
                            <h3>Попытка {sessionIndex + 1}</h3>
                            <p>
                                <strong>Общий балл:</strong> {session.commonScore}
                            </p>
                            <h4>Баллы по задачам:</h4>
                            <ul>
                                {Object.entries(session.taskIdToDetail)
                                    // Сортируем задачи по полю index
                                    .sort(([_, taskDetailA], [__, taskDetailB]) => taskDetailA.index - taskDetailB.index)
                                    // Перебираем отсортированные задачи
                                    .map(([taskId, taskDetail]) => (
                                        <li key={taskId}>
                                            Задача {taskDetail.index + 1}: {taskDetail.score} баллов
                                        </li>
                                    ))}
                            </ul>
                            <div className="button-container">
                                <button
                                    onClick={() => handleRetryAttempt(session.hashcode)} // Передаем hashcode сессии
                                >
                                    Повторить попытку
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Account;