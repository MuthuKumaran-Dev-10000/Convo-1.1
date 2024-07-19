import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Updated import
import './HomePage.css';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null); // Track the currently playing video
  const videoRefs = useRef({});
  const navigate = useNavigate(); // Updated useNavigate hook

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/videos');
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  // Play video and set it as the currently playing video
  const handleMouseOver = (videoURL) => {
    if (videoRefs.current[videoURL] && playingVideo !== videoURL) {
      if (videoRefs.current[playingVideo]) {
        videoRefs.current[playingVideo].pause(); // Pause the previously playing video
      }
      videoRefs.current[videoURL].play().catch(error => {
        console.error('Error playing video:', error);
      });
      setPlayingVideo(videoURL);
    }
  };

  // Pause video
  const handleMouseOut = (videoURL) => {
    if (videoRefs.current[videoURL]) {
      videoRefs.current[videoURL].pause();
      if (playingVideo === videoURL) {
        setPlayingVideo(null); // Clear the currently playing video
      }
    }
  };

  // Handle video click to navigate to video detail page
  const handleVideoClick = (videoId) => {
    if (videoId) {
      navigate(`/video/${videoId}`);
    } else {
      console.error('Video ID is undefined');
    }
  };

  // Create video tile
  const createVideoTile = (videoData) => {
    return (
      <div
        className="video-tile"
        key={videoData.videoId} // Use videoId as the key
        onMouseOver={() => handleMouseOver(videoData.videoURL)}
        onMouseOut={() => handleMouseOut(videoData.videoURL)}
        onClick={() => handleVideoClick(videoData.videoId)} // Pass videoId to handleVideoClick
      >
        <video
          src={videoData.videoURL}
          ref={(el) => (videoRefs.current[videoData.videoURL] = el)}
          controls={false}
          className="video-player"
        />
        <div className="video-title">{videoData.title}</div>
        <div className="video-user">
          <img src={videoData.userIcon || 'default-icon.png'} alt="User Icon" className="video-icon" />
          <span>{videoData.username}</span>
          <span className="video-views">Viewers: {videoData.viewersCount}</span>
        </div>
      </div>
    );
  };

  // Handle search functionality (dummy function)
  const handleSearch = () => {
    const searchBar = document.getElementById('searchBar').value.trim();
    // Implement search functionality based on your requirements
  };

  return (
    <div className="container">
      <div className="navbar">
        <a href="#" className="home-icon"><i className='bx bx-home icon'></i></a>
        <a href="/addwork"><i className='bx bx-upload icon'></i></a>
        <a href="#"><i className='bx bx-heart icon'></i></a>
        <a href="#"><i className='bx bx-history icon'></i></a>
      </div>

      <div className="content">
        <div className="search-container">
          <input type="text" placeholder="Search..." className="search-input" id="searchBar" />
          <button className="search-btn" onClick={handleSearch}><i className='bx bx-search icon'></i></button>
        </div>

        <div className="video-grid">
          {videos.map(createVideoTile)}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
