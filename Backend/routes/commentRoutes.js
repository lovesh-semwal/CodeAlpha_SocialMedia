const express = require("express");

const Comment = require("../models/Comment");
const Post = require("../models/Post");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =========================
// Add Comment
// =========================

router.post(
    "/posts/:postId/comments",
    authMiddleware,
    async (req, res) => {

        try {

            const { content } = req.body;

            const { postId } = req.params;


            // Check comment content
            if (!content || !content.trim()) {

                return res.status(400).json({
                    message: "Comment content is required"
                });

            }


            // Check post
            const post = await Post.findById(postId);

            if (!post) {

                return res.status(404).json({
                    message: "Post not found"
                });

            }


            // Create comment
            const comment = await Comment.create({

                content: content.trim(),

                author: req.userId,

                post: postId

            });


            // Get author information
            const populatedComment =
                await Comment.findById(comment._id)
                    .populate(
                        "author",
                        "name username profileImage"
                    );


            res.status(201).json({

                message: "Comment added successfully",

                comment: populatedComment

            });


        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// =========================
// Get Comments
// =========================

router.get(
    "/posts/:postId/comments",
    authMiddleware,
    async (req, res) => {

        try {

            const { postId } = req.params;


            // Check post
            const post = await Post.findById(postId);

            if (!post) {

                return res.status(404).json({
                    message: "Post not found"
                });

            }


            const comments =
                await Comment.find({
                    post: postId
                })
                .populate(
                    "author",
                    "name username profileImage"
                )
                .sort({
                    createdAt: 1
                });


            res.status(200).json({
                comments
            });


        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// =========================
// Delete Own Comment
// =========================

router.delete(
    "/comments/:commentId",
    authMiddleware,
    async (req, res) => {

        try {

            const comment =
                await Comment.findById(
                    req.params.commentId
                );


            if (!comment) {

                return res.status(404).json({
                    message: "Comment not found"
                });

            }


            // Only comment owner can delete it
            if (
                comment.author.toString() !==
                req.userId.toString()
            ) {

                return res.status(403).json({
                    message: "You can only delete your own comment"
                });

            }


            await Comment.findByIdAndDelete(
                req.params.commentId
            );


            res.status(200).json({

                message: "Comment deleted successfully"

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