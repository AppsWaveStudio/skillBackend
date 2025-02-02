const multer = require('multer');
const path = require('path');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        cb(null, uploadPath); // Path where files are saved
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}${Math.round(Math.random() * 1e9)}`;
        let ext = path.extname(file.originalname);

        // Fallback to extension based on mimetype if missing
        if (!ext && file.mimetype) {
            switch (file.mimetype) {
                case 'image/jpeg':
                    ext = '.jpg';
                    break;
                case 'image/png':
                    ext = '.png';
                    break;
                case 'image/gif':
                    ext = '.gif';
                    break;
            }
        }

        cb(null, uniqueName + ext);
    },
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/octet-stream']; // Add application/octet-stream
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    if (allowedMimes.includes(file.mimetype)) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Invalid file extension. Only JPG, PNG, and GIF are allowed.'), false);
        }
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'), false);
    }
};


// Configure multer with storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

module.exports = upload;
