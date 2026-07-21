const notFound = (req, res, next) => {
    const error = new Error(
        `Not Found - ${req.method} ${req.url}`
    );

    res.status(404);

    next(error);
};

const errorHandler = (err, req, res, next) => {
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