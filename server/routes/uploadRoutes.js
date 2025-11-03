import express from 'express';
import { upload } from '../controllers/bunnyController.js';
import { handleFileUpload } from '../utils/file-upload-util.js';

const uploadRouter = express.Router();

uploadRouter.post('/upload', upload.fields([{ name: 'attachment' }]), async (req, res) => {
  const attachment = req.files?.attachment[0];
  if (!attachment) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const uploadResponse = await handleFileUpload(attachment);
    return res.status(200).json({ message: 'File uploaded successfully', url: uploadResponse });
  } catch (error) {
    return res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

export default uploadRouter;
