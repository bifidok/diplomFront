import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

class AnswerRequest {
    constructor(answers) {
        this.taskToAnswer = answers; // Здесь будет ваш Map или объект с ответами
    }
}

const TaskDetail = () => {
    const [tasks, setTasks] = useState([]);
    const [answers, setAnswers] = useState({}); // Для хранения ответов на задачи
    const [images, setImages] = useState({}); // Для хранения изображений по задачам
    const { id } = useParams();
    const [selectedLanguage, setSelectedLanguage] = useState('JAVA');

    useEffect(() => {
        fetch(`http://localhost:8080/task/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setTasks(data);

                const imagesByTask = {};
                data.forEach(task => {
                    // Предполагается, что task.images - это массив изображений
                    imagesByTask[task.id] = task.images; // Сохраняем изображения по ID задачи
                });

                setImages(imagesByTask); //
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, []);

    const handleAnswerChange = (taskId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [taskId]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы
        // Отправка POST-запроса
        fetch('http://localhost:8080/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(new AnswerRequest(answers)),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Ответы отправлены:', data);

                // Предполагаем, что в data содержится URL для GET-запроса
                const url = data.resultUrl; // Измените это на правильный путь к URL в вашем ответе

                // Выполнение GET-запроса по полученному URL
                return fetch(url);
            })
            .then((response) => response.json())
            .then((result) => {
                console.log('Результат GET-запроса:', result);
                // Здесь вы можете обработать результат GET-запроса
                const resultContainer = document.getElementById('resultContainer');

                // Очистка предыдущих данных (если нужно)
                resultContainer.innerHTML = '';

                // Предполагаем, что result содержит данные, которые вы хотите отобразить
                const resultText = document.createElement('p');
                resultText.textContent = `Набрано баллов: ${result}`;
                resultContainer.appendChild(resultText);
            })
            .catch((error) => console.error('Error submitting answers:', error));
    };

    return (
        <div>
            <h1>Задачи для подготовки к ЕГЭ по информатике</h1>
            <form onSubmit={handleSubmit}>
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <h3>{task.description.text}</h3>
                            {images[task.id] && images[task.id].map(image => (
                                <img key={image.id} src={`http://localhost:8080/getfile?name=${encodeURIComponent(image.name)}`}/>
                            ))}
                            <br></br>
                            {task.level === 3 ? (
                                <div>
                                    <select
                                        value={selectedLanguage || 'JAVA'}
                                        onChange={(e) => setSelectedLanguage(e.target.value)} // Обработчик изменения языка
                                        style={{
                                            marginBottom: '8px',
                                            padding: '8px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '16px',
                                        }}
                                    >
                                        <option value="JAVA">JAVA</option>
                                        <option value="C_SHARP">C#</option>
                                        <option value="C">C</option>
                                        <option value="C_PLUS">C++</option>
                                        <option value="PASCAL">PASCAL</option>
                                        <option value="PYTHON">PYTHON</option>
                                    </select>
                                    <textarea
                                        placeholder="Введите ваш ответ"
                                        value={answers[task.id] || ''}
                                        onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '100px',
                                            resize: 'vertical',
                                            padding: '8px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '16px',
                                        }}
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Введите ваш ответ"
                                    value={answers[task.id] || ''}
                                    onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                                />
                            )}
                        </li>
                    ))}
                </ul>
                <div id="resultContainer"></div>
                <button type="submit">Отправить ответы</button>
            </form>
        </div>
    );

};

export default TaskDetail;
