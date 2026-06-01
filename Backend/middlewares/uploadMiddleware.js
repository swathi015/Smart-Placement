import multer, { memoryStorage } from 'multer';
import { extname as _extname } from 'path';

// Memory storage to store files as buffer before uploading to Cloudinary
const storage = memoryStorage();

// File filter for resumes and documents
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = filetypes.test(_extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only resumes (.pdf, .doc, .docx) and images (.jpg, .jpeg, .png) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

export default upload;