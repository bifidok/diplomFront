import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TaskList from './components/task/TaskList';
import TaskDetail from './components/task/TaskDetail';
import Home from './components/Home';
import Auth from './components/user/Auth';
import Register from './components/user/Register';
import Account from './components/user/Account';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/register" element={<Register />} />
                <Route path="/task" element={<TaskList />} />
                <Route path="/task/:id" element={<TaskDetail />} /> {}
            </Routes>
        </Router>
    );
}

export default App;
