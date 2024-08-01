import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate(); // For navigation
  const [video, setVideo] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizPoints, setQuizPoints] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [feedback, setFeedback] = useState(""); // Feedback for quiz answers
  const [showSubmit, setShowSubmit] = useState(false); // For showing submit button

  useEffect(() => {
    const fetchUser = async () => {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      setUser(userData);
    };

    const fetchProfileImage = async (videoData) => {
      const uploaderId = `${videoData.username}_${videoData.phoneNumber}`;
      const userRef = firebase.database().ref(`users/${uploaderId}`);
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();
      setProfileImage(userData?.profileImage);
    };

    const fetchVideo = async () => {
      try {
        const videoRef = firebase.database().ref(`videos/${videoId}`);
        const snapshot = await videoRef.once('value');
        const videoData = snapshot.val();
        setVideo(videoData);
        setLikeCount(videoData.likes || 0);
        setComments(videoData.comments || []);

        fetchProfileImage(videoData);

        const userId = JSON.parse(sessionStorage.getItem('user')).UniqueID;
        if (userId && !(videoData.views || []).includes(userId)) {
          await videoRef.update({ views: [...(videoData.views || []), userId] });
        }

        const uploaderId = videoData.userId;
        const userRef = firebase.database().ref(`users/${uploaderId}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();
        if (userData?.subscribers?.includes(userId)) {
          setIsSubscribed(true);
        }

        if (videoData.quizzes) {
          // Filter out quizzes with no content or options
          const validQuizzes = videoData.quizzes.filter(q => q.question && q.options && q.options.length > 0);
          setQuizzes(validQuizzes);
          setShowSubmit(validQuizzes.length > 0); // Show submit button if there are valid quizzes
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchUser();
    fetchVideo();
  }, [videoId]);

  const handleAnswer = (index) => {
    const correctAnswerIndex = quizzes[currentQuizIndex].correctAnswerIndex;
    const options = document.querySelectorAll('.quiz-option');

    setSelectedOption(index);

    options.forEach((option, i) => {
      if (i === index) {
        option.style.color = 'white';
        option.style.backgroundColor = i === correctAnswerIndex ? 'green' : 'red';
      } else if (i === correctAnswerIndex) {
        option.style.color = 'white';
        option.style.backgroundColor = 'green';
      } else {
        option.style.color = 'black';
        option.style.backgroundColor = '#f9f9f9'; // Reset background
      }
    });

    if (index === correctAnswerIndex) {
      setQuizPoints(quizPoints + 1);
      setFeedback('Correct! +1 point');
    } else {
      setFeedback('Wrong answer! The correct answer is highlighted in green.');
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setCurrentQuizIndex(currentQuizIndex + 1);
    setFeedback("");
    document.querySelectorAll('.quiz-option').forEach(option => {
      option.style.color = 'black';
      option.style.backgroundColor = '#f9f9f9'; // Reset background
    });

    // Check if the last quiz has been reached
    if (currentQuizIndex + 1 >= quizzes.length) {
      setShowSubmit(true);
    } else {
      setShowSubmit(false);
    }
  };

  const handleSubmitQuiz = () => {
    setFeedback(`Quiz submitted! You scored ${quizPoints} out of ${quizzes.length}`);
    // Redirect to home page after submitting
    navigate('/home');
  };

  const handleSubscribe = async () => {
    try {
      const uploaderId = `${video.username}_${video.phoneNumber}`;
      const userId = user.UniqueID;
      const userRef = firebase.database().ref(`users/${uploaderId}`);
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();

      if (!userData) {
        console.error('User data not found');
        return;
      }

      const updatedSubscribers = isSubscribed
        ? (userData.subscribers || []).filter(id => id !== userId)
        : [...(userData.subscribers || []), userId];

      await userRef.update({ subscribers: updatedSubscribers });
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleLike = async () => {
    try {
      const videoRef = firebase.database().ref(`videos/${videoId}`);
      await videoRef.update({ likes: likeCount + 1 });
      setLikeCount(likeCount + 1);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const videoRef = firebase.database().ref(`videos/${videoId}`);
      const newComments = [...comments, { userId: `${user.username}(${user.UniqueID})`, comment }];
      await videoRef.update({ comments: newComments });
      setComments(newComments);
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <br />
      <br />
      <br />
      <div style={{ width: '100%', padding: '40px', boxSizing: 'border-box', backgroundColor: 'black', position: 'relative' }}>
        <video src={video.videoURL} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
          Your browser does not support the video tag.
        </video>
      </div>

      <div style={{ width: '70%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '5px', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{video.title}</div>
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>{video.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <img src={profileImage} id="image" alt="User Icon" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
          <div>{video.username}</div>
        </div>

        <button style={{ padding: '10px 20px', backgroundColor: isSubscribed ? '#dc3545' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px' }} onClick={handleSubscribe}>
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>

        <button style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px' }} onClick={handleLike}>
          Like {likeCount}
        </button>

        <div style={{ width: '100%', marginBottom: '20px' }}>
          {quizzes.length > 0 && quizzes[currentQuizIndex]?.question && quizzes[currentQuizIndex]?.options?.length > 0 && (
            <div style={{ width: '100%' }}>
              <h3>Quiz: {currentQuizIndex + 1}/{quizzes.length}</h3>
              <div style={{ marginBottom: '10px' }}>{quizzes[currentQuizIndex].question}</div>
              {quizzes[currentQuizIndex].options.map((option, index) => (
                <div key={index} className="quiz-option" style={{ cursor: 'pointer', padding: '10px', marginBottom: '5px', borderRadius: '5px', backgroundColor: '#f9f9f9', transition: 'background-color 0.3s' }} onClick={() => handleAnswer(index)}>
                  {option}
                </div>
              ))}
              {feedback && (
                <div style={{ fontSize: '1rem', color: feedback.startsWith('Correct') ? 'green' : 'red', marginTop: '10px' }}>
                  {feedback}
                </div>
              )}
              <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }} onClick={handleNextQuiz}>
                Next
              </button>
              {showSubmit && (
                <button style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }} onClick={handleSubmitQuiz}>
                  Submit Quiz
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleCommentSubmit} style={{ width: '100%', marginTop: '20px' }}>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Post Comment</button>
        </form>

        <div style={{ width: '100%', marginTop: '20px' }}>
          <h3>Comments</h3>
          {comments.length > 0 ? (
            comments.map((c, index) => (
              <div key={index} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <strong>{c.userId}</strong>: {c.comment}
              </div>
            ))
          ) : (
            <div>No comments yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VidScreen;
