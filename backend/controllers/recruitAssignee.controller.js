import User from '../models/user.js';
import Scope from "../models/scope.js"

export const getAssignee = async (req, res) => {
  try {
    const assignees = await User.find({ role: "assignee" }).populate("scopes")
    res.status(200).json({
      success: true,
      data: assignees
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignees",
      error: error.message
    });
  }
};

export const recruitAssignee = async (req, res) => {

  try {

    const { name, email, scopes } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // convert scope names -> ids
    const scopeDocs = await Scope.find({
      name: { $in: scopes }
    });

    const scopeIds = scopeDocs.map(s => s._id);

    user.name = name;
    user.scopes = scopeIds;
    user.role = "assignee";

    await user.save();

    res.status(200).json({
      message: "Assignee assigned successfully",
      data: user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};