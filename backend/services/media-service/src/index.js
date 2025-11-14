const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const sharp = require('sharp');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and videos are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter
});

// Upload single file
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(uploadsDir, req.file.filename);

    // Strip metadata from images
    if (req.file.mimetype.startsWith('image/')) {
      await stripImageMetadata(filePath);
    }

    // Use API Gateway URL instead of direct service URL
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:4000';
    const fileUrl = `${apiGatewayUrl}/media/uploads/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        type: getFileType(req.file.mimetype)
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
app.post('/upload/multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Strip metadata from each image
    for (const file of req.files) {
      if (file.mimetype.startsWith('image/')) {
        const filePath = path.join(uploadsDir, file.filename);
        await stripImageMetadata(filePath);
      }
    }

    // Use API Gateway URL instead of direct service URL
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:4000';
    const files = req.files.map(file => ({
      url: `${apiGatewayUrl}/media/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      type: getFileType(file.mimetype)
    }));

    res.json({
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Delete file
app.delete('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Helper function to determine file type
function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) {
    return 'document';
  }
  return 'other';
}

// Helper function to strip metadata from images
async function stripImageMetadata(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    // Only process image files
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      const tempPath = filePath + '.tmp';

      // Process with sharp to strip all metadata
      await sharp(filePath)
        .rotate() // Auto-rotate based on EXIF orientation, then remove EXIF
        .withMetadata({
          exif: {},  // Remove all EXIF data
          icc: undefined,  // Remove color profile
          iptc: undefined  // Remove IPTC data
        })
        .toFile(tempPath);

      // Replace original with processed file
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);

      console.log(`Stripped metadata from ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error('Error stripping metadata:', error);
    // If processing fails, keep original file
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Media Service is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Maximum size is 50MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Media Service running on port ${PORT}`);
});
