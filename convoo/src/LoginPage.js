import React, { useState } from 'react';
import './LoginPage.css';
import './SignupPage';


const LoginPage = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!usernameOrEmail || !password) {
            setError('Please fill in both fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernameOrEmail, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store user data in sessionStorage
                sessionStorage.setItem('username', usernameOrEmail);
                sessionStorage.setItem('password', password);
                sessionStorage.setItem('user', JSON.stringify(data.preferences));
                const userData = JSON.parse(sessionStorage.getItem('user'));
                // Redirect based on preferences
                if (userData.preferences && userData.preferences.length > 0) {
                    window.location.href = "/home"; // Redirect to home if there are preferences
                } else {
                    window.location.href = "/newhome"; // Redirect to newhome if no preferences
                }
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <form id="loginForm" onSubmit={handleLogin}>
                <h2>Login</h2>
                <label htmlFor="usernameOrEmail">Username or Email:</label>
                <input
                    type="text"
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    required
                />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                <p>Don't have an account? <a href="/signup">Sign up here</a></p>
            </form>
            {error && <p id="error">{error}</p>}
        </div>
    );
};

export default LoginPage;
