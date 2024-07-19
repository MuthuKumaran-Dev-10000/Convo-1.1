import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import 'firebase/compat/auth'; // Import auth if needed for user data

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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const AddWork = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genres, setGenres] = useState([]);
    const [hashtags, setHashtags] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [quizInputs, setQuizInputs] = useState([{ question: '', options: ['', '', '', ''], correctAnswerIndex: -1 }]);

    // Handle input changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        switch (id) {
            case 'title':
                setTitle(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'hashtags':
                setHashtags(value);
                break;
            case 'genres':
                setGenres(Array.from(e.target.selectedOptions, option => option.value));
                break;
            case 'videoFile':
                setVideoFile(e.target.files[0]);
                break;
            default:
                break;
        }
    };

    // Handle quiz input changes
    const handleQuizChange = (index, field, value) => {
        const updatedQuizzes = [...quizzes];
        if (field === 'question') {
            updatedQuizzes[index].question = value;
        } else if (field === 'options') {
            updatedQuizzes[index].options = value;
        } else if (field === 'correctAnswerIndex') {
            updatedQuizzes[index].correctAnswerIndex = value;
        }
        setQuizzes(updatedQuizzes);
    };

    // Add a new quiz section
    const addQuiz = () => {
        setQuizzes([...quizzes, { question: '', options: ['', '', '', ''], correctAnswerIndex: -1 }]);
    };

    // Submit work to Firebase
    const submitWork = async () => {
        if (!title || !description || genres.length === 0 || !hashtags || !videoFile) {
            alert('Please fill in all required fields.');
            return;
        }

        const userData = JSON.parse(sessionStorage.getItem('user'));
        if (!userData) {
            alert('Please make sure you are logged in.');
            return;
        }

        const { UniqueID: userId, username, phoneNumber } = userData;
        const storageRef = firebase.storage().ref();
        const videoRef = storageRef.child(`videos/${videoFile.name}`);

        try {
            const snapshot = await videoRef.put(videoFile);
            const videoURL = await snapshot.ref.getDownloadURL();

            const newVideoKey = firebase.database().ref().child('videos').push().key;
            const videoData = {
                title,
                description,
                genres,
                hashtags,
                videoURL,
                userId,
                username,
                phoneNumber,
                quizzes,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };

            await firebase.database().ref().update({ [`/videos/${newVideoKey}`]: videoData });
            alert('Video and quizzes submitted successfully!');

            // Clear form inputs
            setTitle('');
            setDescription('');
            setGenres([]);
            setHashtags('');
            setVideoFile(null);
            setQuizzes([]);
        } catch (error) {
            console.error('Error submitting work:', error);
            alert('Failed to submit video and quizzes.');
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <h1>Add Work</h1>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" value={title} onChange={handleChange} placeholder="Enter title..." required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="description">Video Description:</label>
                <textarea id="description" value={description} onChange={handleChange} rows="4" placeholder="Enter video description..." required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="genres">Genres:</label>
                <select id="genres" multiple value={genres} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Job Opportunities">Job Opportunities</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    {/* Add more options as needed */}
                </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="hashtags">Hashtags:</label>
                <input type="text" id="hashtags" value={hashtags} onChange={handleChange} placeholder="Enter hashtags..." required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="videoFile">Video File:</label>
                <input type="file" id="videoFile" onChange={handleChange} accept="video/*" required style={{ width: '100%' }} />
            </div>

            <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h2>Quizzes</h2>
                {quizzes.map((quiz, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Question:</label>
                            <input
                                type="text"
                                value={quiz.question}
                                onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                                placeholder="Enter quiz question"
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>
                        {quiz.options.map((option, optionIndex) => (
                            <div key={optionIndex} style={{ marginBottom: '5px' }}>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                        const updatedOptions = [...quiz.options];
                                        updatedOptions[optionIndex] = e.target.value;
                                        handleQuizChange(index, 'options', updatedOptions);
                                    }}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    style={{ width: 'calc(100% - 40px)', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
                                />
                                <input
                                    type="radio"
                                    checked={quiz.correctAnswerIndex === optionIndex}
                                    onChange={() => handleQuizChange(index, 'correctAnswerIndex', optionIndex)}
                                    style={{ marginLeft: '10px' }}
                                />
                            </div>
                        ))}
                    </div>
                ))}
                <button onClick={addQuiz} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add Quiz</button>
            </div>

            <button onClick={submitWork} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>Submit</button>
        </div>
    );
};

export default AddWork;
