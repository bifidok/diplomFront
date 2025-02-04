import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { csharp } from '@replit/codemirror-lang-csharp';


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
    const [files, setFiles] = useState({});
    const { id } = useParams();
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

                const filesByTask = {};
                data.forEach((task) => {
                    filesByTask[task.id] = task.files;
                });

                setFiles(filesByTask);
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
        value = value.replace(/\n/g, "\n")
        console.log(value)
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
                    {tasks.map((task, index) => (
                        <li key={task.id}>
                            <h3>Задача {index + 1}. {task.description.text}</h3>
                            {images[task.id] && images[task.id].map((image) => (
                                <img key={image.id} src={`http://localhost:8080/getfile?name=${encodeURIComponent(image.name)}`} />
                            ))}
                            <br />
                            {files[task.id] && files[task.id].length > 0 && (
                                <>
                                <h5>Вложенные файлы:</h5>
                                {files[task.id].map((file) => (
                                    <div key={file.id}>
                                        <a href={`http://localhost:8080/getfile?name=${encodeURIComponent(file.name)}&isDownload=true`} download>
                                        {file.name}
                                            </a>
                                            </div>
                                            ))}
                                        </>
                                        )
                                };
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
                                </div>
                            ) : (
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
