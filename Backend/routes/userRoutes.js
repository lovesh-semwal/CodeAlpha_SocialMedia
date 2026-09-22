const express = require("express");

const User = require("../models/User");
const Post = require("../models/Post");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// Get My Profile
// ===============================

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const posts = await Post.find({
            author: req.userId
        })
            .populate(
                "author",
                "name username profileImage"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            user,
            posts
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ===============================
// Search Users
// ===============================

router.get("/search", authMiddleware, async (req, res) => {
    try {
        const query = req.query.q?.trim();

        if (!query) {
            return res.status(400).json({
                message: "Search query is required"
            });
        }

        const users = await User.find({
            $or: [
                {
                    name: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    username: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        })
            .select("_id name username profileImage")
            .limit(20);

        res.status(200).json({
            users
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ===============================
// Get Other User's Profile
// ===============================

router.get(
    "/profile/:userId",
    authMiddleware,
    async (req, res) => {
        try {

            const user =
                await User.findById(req.params.userId)
                    .select("-password");

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const posts =
                await Post.find({
                    author: user._id
                })
                    .populate(
                        "author",
                        "name username profileImage"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.status(200).json({
                user,
                posts
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// ===============================
// Update My Profile
// ===============================

router.put(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                name,
                username,
                bio,
                profileImage
            } = req.body;


            const user =
                await User.findById(req.userId);


            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }


            if (name !== undefined) {
                user.name = name.trim();
            }


            if (username !== undefined) {
                user.username =
                    username.trim().toLowerCase();
            }


            if (bio !== undefined) {
                user.bio = bio.trim();
            }


            if (profileImage !== undefined) {
                user.profileImage =
                    profileImage.trim();
            }


            await user.save();


            res.status(200).json({

                message:
                    "Profile updated successfully",

                user: {
                    _id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    profileImage: user.profileImage
                }

            });

        } catch (error) {

            console.log(error);


            if (error.code === 11000) {

                return res.status(400).json({
                    message:
                        "Username already exists"
                });
            }


            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// ===============================
// Follow User
// ===============================

router.put(
    "/:userId/follow",
    authMiddleware,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(req.userId);

            const targetUser =
                await User.findById(req.params.userId);


            if (!currentUser) {
                return res.status(404).json({
                    message: "Current user not found"
                });
            }


            if (!targetUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }


            // Prevent following yourself

            if (
                currentUser._id.toString() ===
                targetUser._id.toString()
            ) {
                return res.status(400).json({
                    message: "You cannot follow yourself"
                });
            }


            // Check if already following

            const alreadyFollowing =
                currentUser.following.some(
                    id =>
                        id.toString() ===
                        targetUser._id.toString()
                );


            if (alreadyFollowing) {
                return res.status(400).json({
                    message: "Already following this user"
                });
            }


            // Add target user to following

            currentUser.following.push(
                targetUser._id
            );


            // Add current user to target's followers

            targetUser.followers.push(
                currentUser._id
            );


            await currentUser.save();
            await targetUser.save();


            res.status(200).json({

                message:
                    "User followed successfully",

                following: true,

                followersCount:
                    targetUser.followers.length,

                followingCount:
                    currentUser.following.length

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

// ===============================
// Unfollow User
// ===============================

router.put(
    "/:userId/unfollow",
    authMiddleware,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(req.userId);

            const targetUser =
                await User.findById(req.params.userId);


            if (!currentUser) {
                return res.status(404).json({
                    message: "Current user not found"
                });
            }


            if (!targetUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }


            const isFollowing =
                currentUser.following.some(
                    id =>
                        id.toString() ===
                        targetUser._id.toString()
                );


            if (!isFollowing) {
                return res.status(400).json({
                    message:
                        "You are not following this user"
                });
            }


            // Remove target from following

            currentUser.following =
                currentUser.following.filter(
                    id =>
                        id.toString() !==
                        targetUser._id.toString()
                );


            // Remove current user from followers

            targetUser.followers =
                targetUser.followers.filter(
                    id =>
                        id.toString() !==
                        currentUser._id.toString()
                );


            await currentUser.save();
            await targetUser.save();


            res.status(200).json({

                message:
                    "User unfollowed successfully",

                following: false,

                followersCount:
                    targetUser.followers.length,

                followingCount:
                    currentUser.following.length

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

// ===============================
// Check Follow Status
// ===============================

router.get(
    "/:userId/follow-status",
    authMiddleware,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(req.userId);

            const targetUser =
                await User.findById(req.params.userId);


            if (!currentUser || !targetUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }


            const isFollowing =
                currentUser.following.some(
                    id =>
                        id.toString() ===
                        targetUser._id.toString()
                );


            res.status(200).json({

                following: isFollowing,

                followersCount:
                    targetUser.followers.length,

                followingCount:
                    targetUser.following.length

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


module.exports = router;