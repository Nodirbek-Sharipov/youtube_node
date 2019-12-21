'use strict'
const { promisify } = require('util')
const youtubedl = require('youtube-dl')
const ypi = require('youtube-playlist-info')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{console.log(`Go to 127.0.0.1:${PORT}/ in your browser`)}) 

const playlist = 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ij8CfkAY2RAGb-tmkNwQHG'
const playlistItem = 'https://www.youtube.com/watch?v=OxIDLw0M-m0&list=PL4cUxeGkcC9ij8CfkAY2RAGb-tmkNwQHG'



const GetPlaylist =  (url, res) => {
	// get playlist id from url
	const playlistId = url.split('list=')[1].split('&')[0];
	let listData = [];
	ypi(API_KEY, playlistId).then(items=>{
		listData = items.map(item=>({
			title		: item.title,
			thumbnail 	: item.thumbnails.medium.url,
			playlistId	: item.playlistId,
			resourceId	: item.resourceId,
			videoUrl	: `https://www.youtube.com/watch?v=${item.resourceId.videoId}&list=${item.playlistId}`,

		}));
		console.log(listData)
		res.setHeader('Content-Type', 'application/json')
    	res.end(JSON.stringify({error: false, data: listData, isPlaylist: true}))
	}).catch(error => {
		console.error(error)
		res.setHeader('Content-Type', 'application/json')
    	res.end(JSON.stringify({error: true, message: 'Error processing the playlist!'}))
	})	
}

const GetVideo = (url, res) => {
	youtubedl.getInfo(url, (err, info)=>{
		if(err){ 
			console.log(err)
			res.setHeader('Content-Type', 'application/json')
	    	res.end(JSON.stringify({error: true, message: 'Error processing the video!'}))
		}
		res.setHeader('Content-Type', 'application/json')
	    res.end(JSON.stringify({error: false, data: info, isPlaylist: false}))
	})
}


app.get('/', (req, res, next)=>{
	res.sendFile(__dirname + '/index.html');
})

app.post('/', (req, res, next)=>{
	const { url } = req.body;
	console.log(url)
	if(url.toLowerCase().includes('/playlist?list=')){
		// it is playlist
		GetPlaylist(url, res)

	}else if(url.toLowerCase().includes('/watch?v=')){
		// it is a single video
		GetVideo(url, res)

	}else{
		// error, invalid url
		res.end({error: true, message: 'Incorrect URL!'});
	}
})



