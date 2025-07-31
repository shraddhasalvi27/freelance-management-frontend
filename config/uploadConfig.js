import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();
const uploadProfileImg = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png).'));
    }
  }
}).single('profileImage'); 

export default uploadProfileImg;
