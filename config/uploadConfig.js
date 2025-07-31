import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();
// Accept profileImage and multiple testimonial images
const uploadImg = multer({
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
});

// Export field-wise multer setup
export const uploadFreelancerMedia = uploadImg.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'image', maxCount: 5 }, // Adjust count as needed
]);

