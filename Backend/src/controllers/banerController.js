const e = require('express');
const banersRepository = require('../repositories/banerRepository');

exports.getBaners = async (req, res) => {
    try {
        const baners = await banersRepository.getBaners();
        return res.status(200).json(baners);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los baners' });
    }
}

exports.getBanerById = async (req, res) => {
    const banerId = req.params.banerId;
    try {
        const baner = await banersRepository.getBanerById(banerId);
        if (!baner) {
            return res.status(404).json({ message: 'Baner no encontrado' });
        }
        return res.status(200).json(baner);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el baner' });
    }
}