import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate(); // Хук для редиректа
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/task/generator`)
            .then((response) => response.json())
            .then((hashcode) => {
                const url = `${API_URL}/task/` + hashcode; // Формируем URL для получения задачи
                // Редиректим на страницу TaskDetail
                navigate(`/task/${hashcode}`);

                // Выполнение GET-запроса по полученному URL (если нужно)
                return fetch(url);
            })
            .then((response) => response.json())
            .then((data) => {
                setTasks(data); // Здесь мы просто получаем задачу, но редирект уже был выполнен
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, [navigate]); // Хук useEffect будет срабатывать при монтировании компонента

    return null; // Не нужно ничего отображать на этой странице, сразу редиректим
};

export default TaskList;
