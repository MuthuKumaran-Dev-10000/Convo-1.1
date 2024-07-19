// src/NewHomePage.js
import React, { useState, useEffect } from 'react';
import './NewHomePage.css'; // Import the CSS file for styling
import axios from 'axios'; // Use axios for making HTTP requests

const NewHomePage = () => {
    const [preferences, setPreferences] = useState([]);
    const [selectedPreferences, setSelectedPreferences] = useState([]);

    useEffect(() => {
        // Define preferences or fetch them from an API
        const predefinedPreferences = [
            { name: 'Computer Science', icon: 'bx bx-laptop' },
            { name: 'Electronics', icon: 'bx bx-chip' },
            { name: 'Mechanical', icon: 'bx bx-cog' },
            { name: 'Civil', icon: 'bx bx-building' },
            { name: 'Entertainment', icon: 'bx bx-film' },
            { name: 'Job Opportunities', icon: 'bx bx-briefcase' },
        ];
        setPreferences(predefinedPreferences);
    }, []);

    const togglePreference = (prefName) => {
        setSelectedPreferences(prev =>
            prev.includes(prefName) ? prev.filter(item => item !== prefName) : [...prev, prefName]
        );
    };

    const submitPreferences = async () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            console.error('No user is logged in.');
            return;
        }

        const userId = `${user.username}_${user.phoneNumber}`; // Adjust if needed
        try {
            await axios.post('http://localhost:5000/api/preferences', {
                userId,
                preferences: selectedPreferences
            });
            window.location.href = "/home"; // Redirect to home page or any other page
        } catch (error) {
            console.error('Error submitting preferences: ', error);
        }
    };

    return (
        <div className="new-home-container">
            <h2>Choose Your Preferences</h2>
            <div className="grid-container">
                {preferences.map(pref => (
                    <div
                        key={pref.name}
                        className={`box ${selectedPreferences.includes(pref.name) ? 'selected' : ''}`}
                        onClick={() => togglePreference(pref.name)}
                    >
                        <i className={pref.icon}></i>
                        <span>{pref.name}</span>
                    </div>
                ))}
            </div>
            <button className="submit-button" onClick={submitPreferences}>Submit Preferences</button>
        </div>
    );
};

export default NewHomePage;
