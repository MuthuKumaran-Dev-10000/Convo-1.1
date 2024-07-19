import React, { useState } from 'react';
import './SignupPage.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-LvuCHGNNUYWyQte_kvYHcZZM8Sbxxkg",
    authDomain: "convo-be05d.firebaseapp.com",
    databaseURL: "https://convo-be05d-default-rtdb.firebaseio.com",
    projectId: "convo-be05d",
    storageBucket: "convo-be05d.appspot.com",
    messagingSenderId: "230404052463",
    appId: "1:230404052463:web:5676d99c4f64e4232ed21a",
    measurementId: "G-3YESMGCVBP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        dob: '',
        city: '',
        country: '',
        phoneNumber: '',
        email: '',
        role: '',
        password: '',
        confirm: '',
        profileImage: null
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'file' ? files[0] : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm) {
            setError('Passwords do not match.');
            return;
        }

        try {
            // Upload profile image to Firebase Storage
            const storageRef = ref(storage, `profile_images/${formData.username}_${formData.profileImage.name}`);
            await uploadBytes(storageRef, formData.profileImage);
            const downloadURL = await getDownloadURL(storageRef);

            // Save user data to Firebase Realtime Database
            const userData = {
                ...formData,
                profileImage: downloadURL,
                createdAt: new Date().toISOString(),
                UniqueID: `user_${Date.now()}`
            };

            await set(dbRef(database, `users/${formData.username}_${formData.phoneNumber}`), userData);

            alert('Signup successful');
            window.location.href = "/"; // Redirect to homepage or another page after successful signup

        } catch (err) {
            setError('Error during signup: ' + err.message);
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit}>
                <h2>Signup</h2>
                {error && <p id="error">{error}</p>}
                <fieldset>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                    <label htmlFor="username">Username:</label>
                </fieldset>
                <fieldset>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    <label htmlFor="name">Name:</label>
                </fieldset>
                <fieldset>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                    <label htmlFor="dob">Date of Birth:</label>
                </fieldset>
                <fieldset>
                    <input type="file" name="profileImage" accept="image/*" onChange={handleChange} required />
                    <label htmlFor="profileImage">Profile Image:</label>
                </fieldset>
                <fieldset>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                    <label htmlFor="city">City:</label>
                </fieldset>
                <fieldset>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} required />
                    <label htmlFor="country">Country:</label>
                </fieldset>
                <fieldset>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                    <label htmlFor="phoneNumber">Phone Number:</label>
                </fieldset>
                <fieldset>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    <label htmlFor="email">Email:</label>
                </fieldset>
                <fieldset>
                    <select name="role" value={formData.role} onChange={handleChange} required>
                        <option value="" disabled>Select Role</option>
                        <option value="student">Student</option>
                        <option value="it_professional">IT Professional</option>
                        <option value="hr">HR</option>
                        <option value="engineer">Engineer</option>
                        <option value="teacher">Teacher</option>
                        <option value="doctor">Doctor</option>
                        <option value="lawyer">Lawyer</option>
                        <option value="manager">Manager</option>
                        <option value="sales">Sales</option>
                        <option value="other">Other</option>
                    </select>
                    <label htmlFor="role">Role:</label>
                </fieldset>
                <fieldset>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    <label htmlFor="password">Password:</label>
                </fieldset>
                <fieldset>
                    <input type="password" name="confirm" value={formData.confirm} onChange={handleChange} required />
                    <label htmlFor="confirm">Confirm Password:</label>
                </fieldset>
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default SignupPage;
