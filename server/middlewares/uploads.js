const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },

    filename(req, file, cb) {
        // Strip any directory components
        const base = path.basename(file.originalname);
        // Keep only the extension (lowercased)
        const ext = path.extname(base).toLowerCase();
        // Sanitize name without extension: replace unsafe chars
        const nameWithoutExt = path.basename(base, path.extname(base)).replace(/[^a-zA-Z0-9-_]/g, "_") || "file";
        // Prefix with timestamp + random suffix for uniqueness
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + nameWithoutExt + ext);
    }
});

const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
];
const allowedExts = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".heic",
    ".heif",
];

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"));
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 8 * 1024 * 1024 }
});

module.exports = upload;
