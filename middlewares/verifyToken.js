
const jwt = require('jsonwebtoken'); 



function verifytoken(req, res, next) {
const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}
function verifyAuthorization(req, res, next) {
    verifytoken(req, res, () => {
        if (req.user._id === req.params.id || req.user.isAdmin) {
            next();
        }
        else {
            res.status(403).json({ error: 'Access denied. You can only update your own account.' });
        }
    });
}

function verifyAuthorizationadmin(req, res, next) {
    verifytoken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        }
        else {
            res.status(403).json({ error: 'Access denied. You must be an administrator to perform this action.' });
        }
    });
}

module.exports={
    verifytoken,
    verifyAuthorization,
    verifyAuthorizationadmin
}