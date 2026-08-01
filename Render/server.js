const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static frontend and processed videos
app.use(express.static('public'));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Ensure downloads folder exists
if (!fs.existsSync('./downloads')) {
  fs.mkdirSync('./downloads');
}

app.post('/api/process-video', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    console.log("Fetching video info...");
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    const outputFilename = `merged_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, 'downloads', outputFilename);

    // Get highest quality video-only stream (super fast)
    const videoStream = ytdl(url, { quality: 'highestvideo' });
    
    // Get highest quality audio-only stream
    const audioStream = ytdl(url, { quality: 'highestaudio' });

    console.log("Merging video and audio using FFmpeg...");

    // Mix Video + Audio together using FFmpeg
    ffmpeg()
      .input(videoStream)
      .videoCodec('copy') // 'copy' prevents re-encoding so merging is SUPER FAST
      .input(audioStream)
      .audioCodec('aac')
      .outputOptions('-strict -2')
      .save(outputPath)
      .on('end', () => {
        console.log("Merge complete!");
        return res.json({
          status: "success",
          title: videoTitle,
          downloadUrl: `/downloads/${outputFilename}`
        });
      })
      .on('error', (err) => {
        console.error("FFmpeg error:", err);
        return res.status(500).json({ error: "Failed to merge video and audio: " + err.message });
      });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
