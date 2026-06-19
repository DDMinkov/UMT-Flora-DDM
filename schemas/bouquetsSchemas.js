const Joi = require('joi');

const createBouquetSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid('bestseller', 'regular').optional(),
    favorite: Joi.boolean().optional()
});

const updateBouquetSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    category: Joi.string().valid('bestseller', 'regular').optional(),
    favorite: Joi.boolean().optional()
}).min(1); // At least one field must be provided to update

const updateFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required()
});

module.exports = {
    createBouquetSchema,
    updateBouquetSchema,
    updateFavoriteSchema
};