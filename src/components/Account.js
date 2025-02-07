import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import axiosInstance from './AxiosConfig';

const Account = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]); // Состояние для хранения сессий
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние ошибки

    // Загрузка данных с сервера
    useEffect(() => {
        axiosInstance
            .get('http://localhost:8080/account')
            .then((response) => {
                console.log('Данные с сервера:', response.data);
                setSessions(response.data); // Сохраняем данные в состояние
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

    const handleHomeButton = () => {
        navigate(`/`);
    };

    return (
        <div>
            <div className="button-container">
                <button onClick={() => handleHomeButton()}>На главную</button>
            </div>
            <h1>История попыток</h1>
            {sessions.length === 0 ? (
                <p>Нет сохраненных попыток.</p>
            ) : (
                <ul>
                    {sessions.map((session, index) => (
                        <li key={index} style={{ marginBottom: '20px' }}>
                            <h3>Попытка {index + 1}</h3>
                            <p>
                                <strong>Общий балл:</strong> {session.commonScore}
                            </p>
                            <h4>Баллы по задачам:</h4>
                            <ul>
                                {Object.entries(session.taskIdToScore)
                                    // Сортируем задачи по taskId
                                    .sort(([taskIdA], [taskIdB]) => taskIdA - taskIdB)
                                    // Перебираем отсортированные задачи
                                    .map(([taskId, score], taskIndex) => (
                                        <li key={taskId}>
                                            Задача {taskIndex + 1}: {score} баллов
                                        </li>
                                    ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Account;