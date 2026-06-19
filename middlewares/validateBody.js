const HttpError = require('../helpers/HttpError');

const validateBody = (schema) => {
    return (req, res, next) => {
        if (Object.keys(req.body).length === 0) {
            return next(HttpError(400, "missing fields"));
        }
        const { error } = schema.validate(req.body);
        if (error) {
            return next(HttpError(400, error.message));
        }
        next();
    };
};

module.exports = validateBody;