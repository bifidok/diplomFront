import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

class CompilableAnswer {
    constructor(answer, lang) {
        this.answer = answer;
        this.lang = lang;
    }
}

class AnswerRequest {
    constructor(answers, compilableAnswers) {
        this.taskToAnswer = answers;
        this.taskToCompilableAnswer = compilableAnswers;
    }
}

const TaskDetail = () => {
    const [tasks, setTasks] = useState([]);
    const [answers, setAnswers] = useState({}); // Для обычных ответов
    const [compilableAnswers, setCompilableAnswers] = useState({}); // Для компилируемых задач
    const [selectedLanguages, setSelectedLanguages] = useState({}); // Храним язык для каждой задачи отдельно
    const [images, setImages] = useState({});
    const { id } = useParams();

    useEffect(() => {
        fetch(`http://localhost:8080/task/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setTasks(data);

                const imagesByTask = {};
                data.forEach((task) => {
                    imagesByTask[task.id] = task.images;
                });

                setImages(imagesByTask);
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, [id]);

    // Обработка изменения обычных ответов
    const handleAnswerChange = (taskId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [taskId]: value,
        }));
    };

    // Обработка изменения компилируемого ответа
    const handleCompilableAnswerChange = (taskId, value, lang) => {
        setCompilableAnswers((prevAnswers) => ({
            ...prevAnswers,
            [taskId]: new CompilableAnswer(value, lang),
        }));
    };

    // Обработка выбора языка для каждой задачи
    const handleLanguageChange = (taskId, event) => {
        const newLanguage = event.target.value;
        setSelectedLanguages((prevLanguages) => ({
            ...prevLanguages,
            [taskId]: newLanguage,
        }));

        // Также обновляем компилируемый ответ с новым языком
        if (compilableAnswers[taskId]) {
            setCompilableAnswers((prevAnswers) => ({
                ...prevAnswers,
                [taskId]: new CompilableAnswer(compilableAnswers[taskId].answer, newLanguage),
            }));
        }
    };

    // Отправка формы
    const handleSubmit = (event) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы

        const answerRequest = new AnswerRequest(answers, compilableAnswers);

        // Отправка POST-запроса
        fetch('http://localhost:8080/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(answerRequest),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Ответы отправлены:', data);

                const url = data.resultUrl; // Предполагаем, что в data содержится URL для GET-запроса

                // Выполнение GET-запроса по полученному URL
                return fetch(url);
            })
            .then((response) => response.json())
            .then((result) => {
                console.log('Результат GET-запроса:', result);
                const resultContainer = document.getElementById('resultContainer');

                // Очистка предыдущих данных (если нужно)
                resultContainer.innerHTML = '';

                // Отображение результата
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
                            {images[task.id] && images[task.id].map((image) => (
                                <img key={image.id} src={`http://localhost:8080/getfile?name=${encodeURIComponent(image.name)}`} />
                            ))}
                            <br />
                            {task.level === 3 ? (
                                <div>
                                    {/* Выбор языка для каждой задачи */}
                                    <select
                                        value={selectedLanguages[task.id] || 'JAVA'} // Язык для каждой задачи
                                        onChange={(e) => handleLanguageChange(task.id, e)} // Передаем taskId в обработчик
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

                                    {/* Textarea для ввода кода */}
                                    <textarea
                                        placeholder="Введите ваш ответ"
                                        value={compilableAnswers[task.id]?.answer || ''} // Для каждого taskId свой ответ
                                        onChange={(e) => handleCompilableAnswerChange(task.id, e.target.value, selectedLanguages[task.id] || 'JAVA')}
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
                                // Для обычных задач - текстовый input
                                <input
                                    type="text"
                                    placeholder="Введите ваш ответ"
                                    value={answers[task.id] || ''} // Для обычных задач
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
