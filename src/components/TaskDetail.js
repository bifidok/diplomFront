import React, { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import '../css/Files.css';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { csharp } from '@replit/codemirror-lang-csharp';
import { initialTimeLeft } from './Config';


class CompilableAnswer {
    constructor(answer, lang) {
        this.answer = answer;
        this.lang = lang;
    }
}

class AnswerRequest {
    constructor(hashcode, answers, compilableAnswers) {
        this.hashcode = hashcode;
        this.taskToAnswer = answers;
        this.taskToCompilableAnswer = compilableAnswers;
    }
}

const TaskDetail = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [answers, setAnswers] = useState({}); // Для обычных ответов
    const [compilableAnswers, setCompilableAnswers] = useState({}); // Для компилируемых задач
    const [selectedLanguages, setSelectedLanguages] = useState({}); // Храним язык для каждой задачи отдельно
    const [images, setImages] = useState({});
    const [files, setFiles] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false); // Новое состояние для отслеживания отправки
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const codeExamples = {
        JAVA: 'public class Main {\n    public static void main(String[] args) {\n        // Введите ваш код здесь\n    }\n}',
        C_SHARP: 'using System;\n\nclass Program {\n    static void Main(string[] args) {\n        // Введите ваш код здесь\n    }\n}',
        C: '#include <stdio.h>\n\nint main() {\n    // Введите ваш код здесь\n    return 0;\n}',
        C_PLUS: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Введите ваш код здесь\n    return 0;\n}',
        PASCAL: 'program HelloWorld;\nbegin\n    // Введите ваш код здесь\nend.',
        PYTHON: 'def main():\n    # Введите ваш код здесь\n\nif __name__ == "__main__":\n    main()',
    };
    const getLangs = (name) => {
        const functions = {
            JAVA: () => java(),
            C_PLUS: () => cpp(),
            PYTHON: () => python(),
            C_SHARP: () => csharp()
        };
        return (functions[name] || functions['JAVA']).call()
    }
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8080/task/${id}`)
            .then((response) => response.json())
            .then((data) => {
                const tasksWithScores = data.map((task) => ({
                    ...task,
                    score: null, // Инициализируем баллы как null
                }));
                setTasks(tasksWithScores);
                const initialAnswers = {};
                const initialCompilableAnswers = {};
                const imagesByTask = {};
                const filesByTask = {};
                data.forEach((task) => {
                    imagesByTask[task.id] = task.images;
                    filesByTask[task.id] = task.files;
                    if (task.level === 3) {
                        initialCompilableAnswers[task.id] = new CompilableAnswer('', 'JAVA'); // Начальный язык - JAVA
                    } else {
                        initialAnswers[task.id] = ''; // Пустая строка для обычных ответов
                    }
                });

                setImages(imagesByTask);
                setAnswers(initialAnswers);
                setCompilableAnswers(initialCompilableAnswers);
                setFiles(filesByTask);
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        setIsTimerRunning(true);

        const interval = setInterval(() => {
            if (isTimerRunning && !isSubmitted) {
                setTimeLeft(prevTime => prevTime - 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning, isSubmitted]); // Пустой массив зависимостей

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimerRunning(false)
            console.log("Таймер закончился!");
            handleSubmit()
            // Здесь можно добавить дополнительные действия по завершению таймера
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (seconds === 0) {
            return `Время вышло`;
        }
        if (isSubmitted) {
            return `Ответы отправлены`;
        }
        return `Осталось времени: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleHomeButton = () => {
        navigate(`/`);
    };
    // Обработка изменения обычных ответов
    const handleAnswerChange = (taskId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [taskId]: value,
        }));
    };

    // Обработка изменения компилируемого ответа
    const handleCompilableAnswerChange = (taskId, value, lang) => {
        value = value.replace(/\n/g, "\n")
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
    const handleSubmit = () => {
        setIsSubmitted(true);
        const answerRequest = new AnswerRequest(id, answers, compilableAnswers);

        // Отправка POST-запроса
        fetch('http://localhost:8080/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(answerRequest),
            credentials: 'include'
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
                setTasks((prevTasks) =>
                    prevTasks.map((task) => ({
                        ...task,
                        score: result.taskIdToDetail[task.id].score || 0, // Устанавливаем баллы из ответа сервера
                    }))
                );
            })
            .catch((error) => console.error('Error submitting answers:', error));
    };

    const handleConfirm = () => {
        setIsModalOpen(false);
        handleHomeButton();
    };

    const handleCancel = () => {
        setIsModalOpen(false); // Закрываем модальное окно
    };

    const handleExitButtonClick = () => {
        setIsModalOpen(true);
    };
    return (
        <div>
            <h1 className="text-heading-default">Задачи для подготовки к ЕГЭ по информатике</h1>
            <div className="text-heading-default">
                <div className="button-container">
                    <button onClick={handleExitButtonClick}>На главную</button>
                </div>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Подтверждение действия</h3>
                            <p>Вы точно хотите перейти на главную страницу?</p>
                            <div className="modal-buttons">
                                <button className="confirm-button" onClick={handleConfirm}>
                                    Да
                                </button>
                                <button className="cancel-button" onClick={handleCancel}>
                                    Нет
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                backgroundColor: 'rgb(16,32,71,0.5)',
                padding: '15px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
            }}>
                <h5 className="text-heading-default">{formatTime(timeLeft)}</h5>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit();}}>
                <ul>
                    {tasks.map((task, index) => (
                        <li key={task.id}>
                            <p>
                                Задача {index + 1}. {task.description.text}{' '}
                                {task.score !== null && (
                                    <span style={{ color: task.score > 0 ? 'green' : 'red' }}>
                                        ({task.score} баллов)
                                    </span>
                                )}
                            </p>
                            <div className="files-container">
                                {images[task.id] && images[task.id].map((image) => (
                                    <img key={image.id} src={`http://localhost:8080/getfile?name=${encodeURIComponent(image.name)}`} />
                                ))}
                            </div>
                            <br />
                            {files[task.id] && files[task.id].length > 0 && (
                                <>
                                    <h5 className="info-file-item">Вложенные файлы:</h5>
                                    <div className="files-container">
                                    {files[task.id].map((file, index) => (
                                        <div key={file.id} className="file-item">
                                            <a href={`http://localhost:8080/getfile?name=${encodeURIComponent(file.name)}&isDownload=true`} download>
                                            Файл {index + 1}
                                            </a>
                                        </div>
                                    ))}
                                    </div>
                                </>
                            )}
                            <br />
                            {task.level === 3 ? (
                                <div>
                                    <CodeMirror
                                        theme="dark"
                                        placeholder={codeExamples[selectedLanguages[task.id] || 'JAVA']}
                                        onChange={(value) => handleCompilableAnswerChange(task.id, value, selectedLanguages[task.id] || 'JAVA')}
                                        value={compilableAnswers[task.id]?.answer || ''}
                                        height="200px"
                                        extensions={getLangs(selectedLanguages[task.id] || 'JAVA') ? [getLangs(selectedLanguages[task.id] || 'JAVA')] : []}
                                    />
                                    <h5>Выберите язык</h5>
                                    <select
                                        value={selectedLanguages[task.id] || 'JAVA'} // Язык для каждой задачи
                                        onChange={(e) => handleLanguageChange(task.id, e)} // Передаем taskId в обработчик
                                        style={{
                                            marginBottom: '8px',
                                            padding: '8px',
                                            border: '1px solid #ccc',
                                            borderRadius: '100px',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <option value="JAVA">JAVA</option>
                                        <option value="C_SHARP">C#</option>
                                        <option value="C">C</option>
                                        <option value="C_PLUS">C++</option>
                                        <option value="PASCAL">PASCAL</option>
                                        <option value="PYTHON">PYTHON</option>
                                    </select>
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
                <div id="resultContainer">
                    <button
                        type="submit"
                        disabled={timeLeft <= 0 || isSubmitted} // Делаем кнопку неактивной, если время вышло или форма отправлена
                    >
                        {isSubmitted ? 'Ответы отправлены' : timeLeft <= 0 ? 'Время вышло' : 'Отправить ответы'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskDetail;
