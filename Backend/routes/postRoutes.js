const express = require("express");

const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =========================
// Create Post
// =========================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.create({
            content: content.trim(),
            author: req.userId
        });

        const populatedPost = await Post.findById(post._id)
            .populate(
                "author",
                "name username profileImage"
            );

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// Get All Posts
// =========================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate(
                "author",
                "name username profileImage"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            posts
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// Like / Unlike Post
// =========================

router.put("/:id/like", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.userId.toString();

        const alreadyLiked = post.likes.some(
            (id) => id.toString() === userId
        );

        if (alreadyLiked) {

            // Unlike
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );

        } else {

            // Like
            post.likes.push(req.userId);

        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked
                ? "Post unliked"
                : "Post liked",
            likesCount: post.likes.length,
            liked: !alreadyLiked
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }
});



module.exports = router;