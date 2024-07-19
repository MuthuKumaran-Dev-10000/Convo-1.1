const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use(cors()); 


// Login Route
app.post('/api/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    console.log('Login attempt:', { usernameOrEmail, password });

    try {
        const usersRef = db.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val();

        let matchedUser = null;
        let key1 = null;

        for (const key in users) {
            if (users[key].email === usernameOrEmail || users[key].username === usernameOrEmail) {
                if (users[key].password === password) {
                    matchedUser = users[key];
                    key1 = key;
                    break;
                }
            }
        }

        if (matchedUser) {
            res.status(200).json({
                success: true,
                preferences: matchedUser
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid username/email or password.',
            });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
    const userData = req.body;

    try {
        const userRef = db.ref(`users/${userData.username}_${userData.phoneNumber}`);
        await userRef.set(userData);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Update Preferences Route
app.post('/api/preferences', async (req, res) => {
    const { userId, preferences } = req.body;

    if (!userId || !preferences) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        const userPrefRef = db.ref(`users/${userId}/preferences`);
        await userPrefRef.set(preferences);
        res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating preferences', error });
    }
});

// Get Videos for User Based on Preferences
const getUserPreferences = async (userId) => {
    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();
    return userData.preferences || [];
};

const getVideosForUser = async (userId) => {
    try {
        const userRef = db.ref(`users/${userId}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();

        if (!userData) {
            throw new Error('User not found');
        }

        const preferences = userData.preferences || [];
        const videosRef = db.ref('videos');
        const videosSnapshot = await videosRef.once('value');
        const videosData = videosSnapshot.val();

        if (!videosData) {
            return [];
        }

        // Filter videos based on user preferences
        const filteredVideos = Object.values(videosData).filter(video => {
            return preferences.some(pref => video.title.toLowerCase().includes(pref.toLowerCase()));
        });

        return filteredVideos;
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
};

// Get All Videos
app.get('/videos', async (req, res) => {
    try {
        const videosRef = db.ref('videos');
        const snapshot = await videosRef.once('value');
        const videos = snapshot.val() || {};
        const videoArray = Object.keys(videos).map(key => ({ videoId: key, ...videos[key] }));
        res.json(videoArray);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
});

// Get Videos for Home (same as /videos)
app.get('/home', async (req, res) => {
    try {
        const videosRef = db.ref('videos');
        const snapshot = await videosRef.once('value');
        const videos = snapshot.val() || {};
        const videoArray = Object.keys(videos).map(key => ({ videoId: key, ...videos[key] }));
        res.json(videoArray);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
});

// Get Video by ID
app.get('/videos/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    try {
        const videoRef = db.ref('videos').child(videoId);
        const snapshot = await videoRef.once('value');
        const video = snapshot.val();
        if (video) {
            res.json(video);
        } else {
            res.status(404).send('Video not found');
        }
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).send('Error fetching video');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
