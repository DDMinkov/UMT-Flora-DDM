const HttpError = require('../helpers/HttpError');

const isValidId = (req, res, next) => {
    const { id } = req.params;
    
    const parsedId = Number(id);
    
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return next(HttpError(400, `Invalid ID format: "${id}". ID must be a positive number.`));
    }
    
    next();
};

module.exports = isValidId;