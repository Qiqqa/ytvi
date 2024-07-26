// npm install ytdl-core axios xml2js he striptags

//import ytdl from 'ytdl-core';
//import axios from 'axios';
const ytdl = require('ytdl-core');
const axios = require('axios');
const {parseString} = require("xml2js");
const he = require("he");
const striptags = require("striptags");

const API_KEY = 'AIzaSyBBh2HlZM_cUmsYJYe9o2skqsqMWsjac9s';
const VIDEO_ID = 'I6PW8O7zHI4';

async function getVideoInfo(videoId) {
  try {

    const apiKey = API_KEY;
    let rtn = {}

    let jj=0;
    console.log( `/ytvi ${jj++}: ${videoId}:${apiKey}...` );

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log( `/ytvi ${jj++}: ${videoId}:${apiKey}...` );

    const videoInfo = await ytdl.getInfo(videoId);

    console.log( `/ytvi ${jj++}: ${videoId}:${apiKey}...` );

    const captionTracks = videoInfo.player_response.captions.playerCaptionsTracklistRenderer.captionTracks;
    const autoCaptionTrack = captionTracks.find(track => track.kind === 'asr');
    if (!autoCaptionTrack) {
      console.log('Auto-generated captions NOT FOUND!');
      return;
    }

    console.log( `/ytvi ${jj++}: ${videoId}:${apiKey}...` );

    const captionsUrl = autoCaptionTrack.baseUrl;
    const response2 = await axios.get(captionsUrl);
    if (response2.data) {
      console.log('Auto-generated captions found...');
      //fs.writeFileSync('auto-subs-en.xml', response.data);
      //console.log('Auto-generated captions saved to auto-subs-en.xml');
      //parseCaptions(response.data);
    } else {
      console.log('Auto-generated captions NOT FOUND!');
      return 'Auto-generated captions NOT FOUND!';
    }

    console.log( `/ytvi ${jj++}: ${videoId}:${apiKey}...` );

    rtn.videoId = `${videoId}`;
    rtn.url = `https://www.youtube.com/watch?v=${videoId}`;
    rtn.url2 = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=...`;
    rtn.autoCaptionTrack = autoCaptionTrack;
    rtn.thumbnails = data.items[0].snippet.thumbnails;
    rtn.storyboards = videoInfo.videoDetails.storyboards;
    rtn.chapters = videoInfo.videoDetails.chapters;
    rtn.title = data.items[0].snippet.title;
    rtn.tags = data.items[0].snippet.tags;
    rtn.category = videoInfo.videoDetails.category;
    rtn.lenthSeconds = videoInfo.videoDetails.lengthSeconds;
    rtn.viewCount = videoInfo.videoDetails.viewCount;
    rtn.likes = videoInfo.videoDetails.likes;
    rtn.dislikes = videoInfo.videoDetails.dislikes;
    rtn.uploadDate = videoInfo.videoDetails.uploadDate;
    rtn.publishDate = videoInfo.videoDetails.publishDate;
    rtn.publishedAt = data.items[0].snippet.publishedAt;
    rtn.channelTitle = data.items[0].snippet.channelTitle;
    rtn.author = videoInfo.videoDetails.author;
    rtn.description = data.items[0].snippet.description;
    rtn.xmlCC = response2.data;

    parseString(response2.data, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }

      const lines = result.transcript.text.map(line => {
        const start = line.$.start;
        const dur = line.$.dur;
        const htmlText = line._ || '';
        const decodedText = he.decode(htmlText);
        const text = striptags(decodedText);
        return { s:start, d:dur, t:text };
      });

      rtn.jsonCC = lines; // Store the parsed result into rtn.cc2
    });

    rtn.related_videos = videoInfo.related_videos;

    return rtn;

  } catch (error) {
    console.error('Error fetching video info:', error);
  }
}

// Main function
//async function main() {
//  const x = await getVideoInfo(VIDEO_ID, API_KEY);
//  console.log(x);
//}

// main();

module.exports = {
    getVideoInfo
};



