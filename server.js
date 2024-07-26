// npm install express http path url

const express = require('express');
const http = require('http');
const path = require('path');
const url = require('url');

const ytvi = require('./yt-videoInfo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// GET route for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route for '/ytvi'
app.post('/ytvi', async (req, res) => {

    console.log( '/ytvi' );
    // Construct the full URL
    const protocol = req.socket.encrypted ? 'https' : 'http';
    const fullUrl = new URL(req.url, `${protocol}://${req.headers.host}`);
    // Create the response
    let response = ``;
    // response += `\n<h1>URL Components - ${requestCounter}</h1>`;
    response += `\n<p>Full URL: ${fullUrl.href}</p>`;
    response += `\n<p>Protocol: ${fullUrl.protocol}</p>`;
    response += `\n<p>Host: ${fullUrl.host}</p>`;
    response += `\n<p>Hostname: ${fullUrl.hostname}</p>`;
    response += `\n<p>Port: ${fullUrl.port || (protocol === 'https' ? '443' : '80')}</p>`;
    response += `\n<p>Pathname: ${fullUrl.pathname}</p>`;
    response += `\n<p>Search: ${fullUrl.search || 'None'}</p>`;
    response += `\n<p>Query: ${fullUrl.searchParams.toString()}</p>`;
    response += `\n<p>All search parameters:</p>`;
    fullUrl.searchParams.forEach((value, name) => {
      response += `\n<p>${name}: ${value}</p>`;
    });

    console.log('+--- [BEGIN] ')
    console.log( response )
    console.log('+--- [  END] ')

    const { videoUrl } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Video URL is required' });
    }

    try {
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
            console.log( `/ytvi ${videoId}...` );

            const rtn = await ytvi.getVideoInfo( videoId );
            console.log( `/ytvi ---------- ---------- ---------- ---------- ----------...` );
            console.log( `/ytvi ${rtn}...` );
            console.log( `/ytvi ---------- ---------- ---------- ---------- ----------...` );

            res.json( rtn );
        } else {
            res.status(400).json({ error: 'Invalid YouTube URL' });
        }
    } catch (error) {
        console.error( error );
        res.status(500).json({ error: 'An error occurred while processing the URL' });
    }
});

// Function to extract video ID from YouTube URL
function extractVideoId(videoUrl) {
    const parsedUrl = url.parse(videoUrl, true);
    let videoId = null;

    if (parsedUrl.hostname === 'youtu.be') {
        videoId = parsedUrl.pathname.slice(1);
    } else if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
        if (parsedUrl.pathname === '/watch') {
            videoId = parsedUrl.query.v;
        } else if (parsedUrl.pathname.startsWith('/embed/')) {
            videoId = parsedUrl.pathname.split('/')[2];
        } else if (parsedUrl.pathname.startsWith('/v/')) {
            videoId = parsedUrl.pathname.split('/')[2];
        }
    }

    return videoId;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});