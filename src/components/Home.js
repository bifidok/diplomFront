import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleButtonClick = (id) => {
        navigate(`/task/${id}`);
    };
    const handleRandomButtonClick = () => {
        navigate(`/task`);
    };

    return (
        <div className="home-container">
            <h2>Выберите задачу:</h2>
            <div className="button-container">
                <button onClick={() => handleButtonClick('426')}>Задача 1</button>
                <button onClick={() => handleButtonClick('4235')}>Задача 2</button>
                <button onClick={() => handleButtonClick('126')}>Задача 3</button>
                <button onClick={() => handleButtonClick('42365')}>Задача 4</button>
                <button onClick={() => handleRandomButtonClick()}>Сгенерировать случайную</button>
            </div>
        </div>
    );
};

export default Home;
