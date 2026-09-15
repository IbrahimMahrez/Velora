const multer = require("multer");

const notFound = (req, res, next) => {
    const error = new Error(
        `Not Found - ${req.method} ${req.url}`
    );

    res.status(404);

    next(error);
};

const errorHandler = (err, req, res, next) => {
    // Friendly file-upload errors (shape matches what the
    // frontend reads: data.message)
    if (err instanceof multer.MulterError) {
        const message =
            err.code === "LIMIT_FILE_SIZE"
                ? "Image must be smaller than 8MB"
                : err.message || "File upload failed";

        return res.status(400).json({
            success: false,
            message,
            error: {
                message,
                status: 400,
            },
        });
    }

    // Rejected by fileFilter in uploads.js
    if (
        err &&
        err.message === "Only image files are allowed"
    ) {
        return res.status(400).json({
            success: false,
            message: err.message,
            error: {
                message: err.message,
                status: 400,
            },
        });
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: statusCode
        }
    });
};

module.exports = {
    notFound,
    errorHandler
};