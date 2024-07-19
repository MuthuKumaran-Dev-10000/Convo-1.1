import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';

// Your Firebase configuration
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

const VidScreen = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizPoints, setQuizPoints] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // Track selected option

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videoRef = firebase.database().ref(`videos/${videoId}`);
        const snapshot = await videoRef.once('value');
        setVideo(snapshot.val());
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    const fetchQuizzes = async () => {
      try {
        const videoRef = firebase.database().ref(`videos/${videoId}`);
        const snapshot = await videoRef.once('value');
        const videoData = snapshot.val();
        if (videoData && videoData.quizzes) {
          setQuizzes(videoData.quizzes);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchVideo();
    fetchQuizzes();
  }, [videoId]);

  const handleAnswer = (option) => {
    setSelectedOption(option); // Set the selected option
    const correctAnswer = quizzes[currentQuizIndex].answer;
    if (option === correctAnswer) {
      setQuizPoints(quizPoints + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null); // Reset selected option for the next quiz
    setCurrentQuizIndex(currentQuizIndex + 1);
  };

  const handleSubmitQuiz = () => {
    alert(`Quiz submitted! You scored ${quizPoints} out of ${quizzes.length}`);
    // Update quiz points in user's past data (not implemented here)
  };

  if (!video) return <div>Loading...</div>;

  return (
    
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', margin: 225, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh' }}>
      <div style={{ width: '100%', padding: '40px', boxSizing: 'border-box', backgroundColor: 'black', position: 'relative' }}>
        <video src={video.videoURL} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
          Your browser does not support the video tag.
        </video>
      </div>

      <div style={{ width: '70%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '5px', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{video.title}</div>
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>{video.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <img src={video.userIcon} alt="User Icon" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
          <div style={{ fontWeight: 'bold', marginRight: '10px' }}>{video.username}</div>
          <div style={{ color: '#666' }}>Subscribers: {video.subscribers || 0}</div>
          <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s', marginLeft: '10px' }} onClick={() => { /* Handle subscribe */ }}>Subscribe</button>
        </div>
      </div>

      {quizzes.length > 0 && (
        <div style={{ width: '70%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '5px', marginTop: '20px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>{quizzes[currentQuizIndex].question}</div>
          <div style={{ marginTop: '10px' }}>
            {quizzes[currentQuizIndex].options.map(option => (
              <button
                key={option}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  backgroundColor: option === selectedOption ? '#45a049' : '#4CAF50', // Highlight selected option
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onClick={() => handleAnswer(option)}
                disabled={selectedOption !== null} // Disable options after one is selected
              >
                {option}
              </button>
            ))}
          </div>
          <button style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }} onClick={handleNextQuiz}>Next</button>
          {currentQuizIndex === quizzes.length - 1 && (
            <button style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }} onClick={handleSubmitQuiz}>Submit</button>
          )}
        </div>
      )}
    </div>
  );
};

export default VidScreen;
