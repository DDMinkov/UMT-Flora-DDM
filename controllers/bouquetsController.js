const bouquetsService = require('../services/bouquetsService');
const HttpError = require('../helpers/HttpError');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const getAllBouquets = async (req, res, next) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const result = await bouquetsService.getAll(filter);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getBouquetById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await bouquetsService.getById(id);
        if (!result) throw HttpError(404, "Not found");
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const createBouquet = async (req, res, next) => {
    try {
        // Fallback placeholder image via gravatar logic as required if file upload not triggered directly
        const hash = crypto.createHash('md5').update(req.body.title || 'bouquet').digest('hex');
        const defaultPhoto = `https://www.gravatar.com/avatar/${hash}?d=identicon`;

        const newBouquet = await bouquetsService.create({
            ...req.body,
            photoURL: defaultPhoto
        });
        res.status(201).json(newBouquet);
    } catch (error) {
        next(error);
    }
};

const updateBouquet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await bouquetsService.update(id, req.body);
        if (!result) throw HttpError(404, "Not found");
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateFavoriteStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await bouquetsService.update(id, req.body);
        if (!result) throw HttpError(404, "Not found");
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateBouquetPhoto = async (req, res, next) => {
    try {
        if (!req.file) throw HttpError(400, "Photo file is required");
        const { id } = req.params;
        
        const { path: tempUpload, originalname } = req.file;
        const uniqueFilename = `${id}_${Date.now()}_${originalname}`;
        const resultUpload = path.join(__dirname, '../public/photos', uniqueFilename);

        await fs.mkdir(path.dirname(resultUpload), { recursive: true });
        await fs.rename(tempUpload, resultUpload);

        const photoURL = `/photos/${uniqueFilename}`;
        const updatedBouquet = await bouquetsService.update(id, { photoURL });
        
        if (!updatedBouquet) throw HttpError(404, "Not found");
        
        res.json({ photoURL: updatedBouquet.photoURL });
    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        next(error);
    }
};

const deleteBouquet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await bouquetsService.remove(id);
        if (!result) throw HttpError(404, "Not found");
        res.json({ message: "bouquet deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBouquets,
    getBouquetById,
    createBouquet,
    updateBouquet,
    updateFavoriteStatus,
    updateBouquetPhoto,
    deleteBouquet
};