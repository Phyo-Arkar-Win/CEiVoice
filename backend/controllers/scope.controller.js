import Scope from '../models/scope.js';

const getScopes = async (req, res) => {
    try {
        const scopes = await Scope.find();
        res.status(200).json(scopes);
    } catch (error) {
        res.status(500).json({ message: `Cannot get scopes: ${error.message}` });
    }
}

const createScope = async (req, res) => {
    try {
        const { name } = req.body;
        const existingScope = await Scope.findOne({ name });

        if (existingScope) {
            return res.status(400).json({ message: 'Scope already exists' });
        }
        const newScope = await Scope.create({ name });
        res.status(201).json({ message: `Scope ${name} created successfully`, data: newScope });
    } catch (error) {
        res.status(500).json({ message: `Cannot create scope. ${error.message}` });
    }
}

export { getScopes, createScope };