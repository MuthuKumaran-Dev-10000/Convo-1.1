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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // Track profile image URL

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
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchUser();
    fetchVideo();
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
          <div style={{ fontWeight: 'bold', marginRight: '10px' }}>{video.username}</div>
          <div style={{ color: '#666' }}>Subscribers: {video.subscribers?.length || 0}</div>
          <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s', marginLeft: '10px' }} onClick={handleSubscribe}>
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        </div>
      </div>

      <div style={{ width: '70%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '5px', marginTop: '20px' }}>
        <button onClick={handleLike} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>Like</button>
        <div>Likes: {likeCount}</div>
      </div>

      {quizzes.length > 0 && (
        <div style={{ width: '70%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '5px', marginTop: '20px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>{quizzes[currentQuizIndex].question}</div>
          <form>
            {quizzes[currentQuizIndex].options.map((option, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <label>
                  <input type="radio" name="quiz" value={option} checked={selectedOption === option} onChange={() => handleAnswer(option)} />
                  {option}
                </label>
              </div>
            ))}
          </form>
          {currentQuizIndex < quizzes.length - 1 ? (
            <button onClick={handleNextQuiz} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>Next</button>
          ) : (
            <button onClick={handleSubmitQuiz} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>Submit</button>
          )}
        </div>
      )}

      <div style={{ width: '70%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '5px', marginTop: '20px' }}>
        <form onSubmit={handleCommentSubmit}>
          <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." style={{ width: '80%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s', marginLeft: '10px' }}>Submit</button>
        </form>
        <div style={{ marginTop: '20px' }}>
          {comments.map((comment, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', marginRight: '10px' }}>{comment.userId}</div>
              <div>{comment.comment}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VidScreen;
