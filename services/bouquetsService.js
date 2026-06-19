const Bouquet = require('../models/Bouquet');

const getAll = async (filter = {}) => {
    return await Bouquet.findAll({ where: filter });
};

const getById = async (id) => {
    return await Bouquet.findByPk(id);
};

const create = async (data) => {
    return await Bouquet.create(data);
};

const update = async (id, data) => {
    const bouquet = await Bouquet.findByPk(id);
    if (!bouquet) return null;
    return await bouquet.update(data);
};

const remove = async (id) => {
    const bouquet = await Bouquet.findByPk(id);
    if (!bouquet) return null;
    await bouquet.destroy();
    return bouquet;
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};