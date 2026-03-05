import mongoose from 'mongoose';

const scopeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

export default mongoose.model('Scope', scopeSchema);