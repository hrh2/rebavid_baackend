const mongoose = require('mongoose');
const multer = require('multer');
const initializeGridFS = require('../../DB/connector');
const router = require('express').Router();
const { verifyToken, extractUserIdFromToken } = require('../../Middlewares/Token-verification');


let gfs;

// Initialize GridFS
initializeGridFS({ chunkSizeBytes: 100240 }) // 10KB chunk size
  .then(gridFS => {
    gfs = gridFS;
    // console.log('GridFS initialized successfully');
    // Do whatever you need with gfs
  })
  .catch(err => {
    // console.error('Error initializing GridFS:', err);
  });

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload endpoint
router.post('/uploads', verifyToken, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), async (req, res) => {
  try {
    // Check if both files are uploaded
    if (!req.files['video'] || !req.files['poster']) {
      return res.status(400).json({ message: 'Both video and poster files are required' });
    }

    const videoFile = req.files['video'][0];
    const videoData = videoFile.buffer;
    const videoFilename = videoFile.originalname;


    // Process poster image file
    const posterFile = req.files['poster'][0];
    const posterData = posterFile.buffer;
    const posterFilename = posterFile.originalname;

    // Extract other properties from form fields
    const { name, description, type, constraint } = req.body;

    // Create video metadata
    const videoMetadata = {
      name,
      description,
      vidtype: type,
      constraint,
      type: "content"
    };

    const posterMetadata = {
      belongs: name,
      type: "poster"
    };

    // Write both video file and poster file to GridFS along with metadata
    const videoUploadStream = gfs.openUploadStream(videoFilename, { metadata: videoMetadata });
    videoUploadStream.write(videoData);
    videoUploadStream.end();

    const posterUploadStream = gfs.openUploadStream(posterFilename, { metadata: posterMetadata });
    posterUploadStream.write(posterData);
    posterUploadStream.end();

    // Wait for both upload streams to finish
    const promises = [];
    promises.push(new Promise((resolve) => {
      videoUploadStream.on('finish', () => {
        resolve();
      });
    }));
    promises.push(new Promise((resolve) => {
      posterUploadStream.on('finish', () => {
        resolve();
      });
    }));

    await Promise.all(promises);

    return res.status(200).json({ message: 'Files uploaded successfully', videoMetadata });
  } catch (error) {
    console.error('Error uploading files:', error);
    return res.status(500).json({ message: error.message });
  }
});

router.get('/stream/:fileId', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const file = await gfs.find({ _id: fileId }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    const videoSize = file[0].length;
    const start = 0;
    const end = videoSize - 1;
    const contentLength = end - start + 1;
    const contentType = file[0].contentType || 'application/octet-stream';
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${file[0].filename}"`,
    });

    const downloadStream = gfs.openDownloadStream(fileId, {
      start,
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error streaming file:', error);
    return res.status(500).json({ message: error.message });
  }
});

router.get('/poster/:videoName', async (req, res) => {
  try {
    const videoName = req.params.videoName;

    // Find file by filename
    const file = await gfs.find({ "metadata.belongs": videoName }).toArray();

    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'Poster not found' });
    }

    const imageSize = file[0].length;
    const start = 0;
    const end = imageSize - 1;
    const contentLength = end - start + 1;
    const contentType = file[0].contentType || 'application/octet-stream';

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${imageSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${videoName}"`,
    });

    const fileId = file[0]._id;
    const downloadStream = gfs.openDownloadStream(fileId, {
      start,
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error streaming file:', error);
    return res.status(500).json({ message: error.message });
  }
});


router.get('/files', verifyToken, async (req, res) => {
  try {
    // Access the database from the existing connection
    const db = mongoose.connection.db;
    const collection = db.collection('fs.files');

    // Filter files based on metadata.type: "content"
    const documents = await collection.find({ "metadata.type": "content" }).toArray();
    const documentIds = documents.map(doc => ({ id: doc._id, name: doc.metadata.name, vidtype: doc.metadata.vidtype }));
    res.json(documentIds);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: error.message });
  }
});

router.get('/latest-files', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('fs.files');
    const documents = await collection.find({ "metadata.type": "content" })
      .sort({ uploadDate: -1 })
      .limit(4)
      .toArray();

    const documentIds = documents.map(doc => ({ id: doc._id, name: doc.metadata.name, vidtype: doc.metadata.vidtype }));
    res.json(documentIds);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: error.message });
  }
});

router.get('/type/:videoType', verifyToken, async (req, res) => {
  try {
    const { videoType } = req.params
    // Access the database from the existing connection
    const db = mongoose.connection.db;
    const collection = db.collection('fs.files');

    // Filter files based on metadata.type: "content"
    const documents = await collection.find({ "metadata.type": "content", "metadata.vidtype": videoType }).toArray();
    const documentIds = documents.map(doc => ({ id: doc._id, name: doc.metadata.name, vidtype: doc.metadata.vidtype }));
    res.json(documentIds);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: error.message });
  }
});

router.get('/admin/:videoType', verifyToken, async (req, res) => {
  try {
    const { videoType } = req.params
    // Access the database from the existing connection
    const db = mongoose.connection.db;
    const collection = db.collection('fs.files');

    // Filter files based on metadata.type: "content"
    const documents = await collection.find({ "metadata.type": "content", "metadata.vidtype": videoType }).toArray();
    const documentIds = documents.map(doc => ({ id: doc._id, name: doc.metadata.name, vidtype: doc.metadata.vidtype }));
    res.json(documentIds);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: error.message });
  }
});


module.exports = router;
