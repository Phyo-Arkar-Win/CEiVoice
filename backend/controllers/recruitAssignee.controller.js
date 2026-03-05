import User from '../models/user.js';

const recruitAssignee = async (req, res) => {
    try {
        const { name, email, scopes } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        user.name = name;
        user.scope = scopes;
        user.role = 'assignee';

        await user.save();

        res.status(200).json({ message: 'Assignee assigned successfully', data: user });
    } catch (error) {
        res.status(500).json({ message: `Cannot assign assignee. ${error.message}` });
    }
}

export default recruitAssignee;