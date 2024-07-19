import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import NewHomePage from './NewHomePage';
import SignupPage from './SignupPage';
import './boxicons/css/boxicons.min.css';
import VidScreen from './VidScreen';
import AddWork from './AddWork';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/video/:videoId" element={<VidScreen />} />
                    <Route path="/addwork" element={<AddWork />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/newhome" element={<NewHomePage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
