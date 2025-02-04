import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import Home from './components/Home';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/task" element={<TaskList />} />
                <Route path="/task/:id" element={<TaskDetail />} /> {}
            </Routes>
        </Router>
    );
}

export default App;
