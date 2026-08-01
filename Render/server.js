const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so your Extension and Frontend can talk to this server
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check Endpoint (keeps Render awake and tests connectivity)
app.get('/', (req, res) => {
  res.send({ status: "online", message: "Fastest Neon Downloader Backend Ready!" });
});

// Fast Direct Link Extraction Endpoint
app.post('/api/get-download-link', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Extract video details directly from YouTube CDN
    const info = await ytdl.getInfo(url);
    
    // Pick the highest quality format that includes BOTH video and audio
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highest', 
      filter: 'audioandvideo' 
    });

    if (!format || !format.url) {
      return res.status(500).json({ error: "Could not retrieve direct media link." });
    }

    // Send direct CDN link back immediately (takes less than 1 second!)
    return res.json({
      status: "success",
      title: info.videoDetails.title.replace(/[^\w\s]/gi, ''),
      directUrl: format.url
    });

  } catch (error) {
    console.error("Extraction error:", error.message);
    return res.status(500).json({ error: "Failed to extract video: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
