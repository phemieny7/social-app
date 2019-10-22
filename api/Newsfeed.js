const router = require("express").Router();
const USer = require("../model/User")
const Newsfeed = require("../model/Newsfeed");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
const validateCommentInput = require("../validation/comment");



// @route   GET api/Newsfeed
// @desc    Get posts
// @access  Public
router.get("/", async (req, res) => {
    const newsfeed = await Newsfeed.find().sort({ date: -1 });
    try {
        if (newsfeed == null || newsfeed.length == 0) {
            res.status(400).send("No post found in this category")
        } else {
            res.json(newsfeed);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route   GET api/newsfeed/comedy
// @desc    Get newfeed by category comedy
// @access  Public
router.get('/comedy', async (req, res) => {
    const newsfeed = await Newsfeed.find({ category: "comedy" }).sort({ date: -1 });
    try {
        if (newsfeed == null || newsfeed.length == 0) {
            res.status(400).send("No post found in this category")
        } else {
            res.json(newsfeed);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route   GET api/newsfeed/lifestyle
// @desc    Get newfeed by category lifestyle
// @access  Public
router.get('/lifestyle', async (req, res) => {
    const newsfeed = await Newsfeed.find({ category: "lifestyle" }).sort({ date: -1 });
    try {
        if (newsfeed == null || newsfeed.length == 0) {
            res.status(400).send("No post found in this category")
        } else {
            res.json(newsfeed);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route   GET api/newsfeed/sport
// @desc    Get newfeed by category sport
// @access  Public
router.get('/sport', async (req, res) => {
    const newsfeed = await Newsfeed.find({ category: "sport" }).sort({ date: -1 });
    try {
        if (newsfeed == null || newsfeed.length == 0) {
            res.status(400).send("No post found in this category")
        } else {
            res.json(newsfeed);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route   GET api/newsfeed/business
// @desc    Get newfeed by category business
// @access  Public
router.get('/business', async (req, res) => {
    const newsfeed = await Newsfeed.find({ category: "business" }).sort({ date: -1 });
    try {
        if (newsfeed == null || newsfeed.length == 0) {
            res.status(400).send("No post found in this category")
        } else {
            res.json(newsfeed);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route   GET api/newsfeed/news
// @desc    Get newfeed by category news
// @access  Public
router.get('/news', async (req, res) => {
    const newsfeed = await Newsfeed.find({ category: "news" }).sort({ date: -1 });
    try {
        if (newsfeed == null || newsfeed.length == 0) {
            res.status(400).send("No post found in this category")
        } else {
            res.json(newsfeed);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route   GET api/newsfeed/:id
// @desc    Get newfeed by id
// @access  Public
router.get('/:id', async (req, res) => {
    const post = req.params.id;
    const newsfeed = await Newsfeed.findById(post);
    try {
        if (newsfeed == null || newsfeed.length == 0) {
            res.status(400).send("No post found by this id")
        } else {
            res.json(newsfeed);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});



// @route   POST api/newfeed/like/:id
// @desc    Like newfeed
// @access  Private
router.post(
    '/like/:id',
    authenticate,
    async (req, res) => {
        const profile = await Profile.findOne({ user: req.user.id });

        const newsfeed = await Newsfeed.findById(req.params.id);
        try {
            if (
                newsfeed.likes.filter(like => like.user.toString() === req.user.id)
                    .length > 0
            ) {
                return res
                    .status(400)
                    .json({ alreadyliked: 'User already liked this post' });
            }

            // Add user id to likes array
            newsfeed.likes.unshift({ user: req.user.id });

            const save = newsfeed.save();
            res.json(newsfeed);
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

// @route   POST api/newfeed/unlike/:id
// @desc    Unlike newsfeed post
// @access  Private
router.post(
    '/unlike/:id',
    authenticate,
    async (req, res) => {
        const profile = await Profile.findOne({ user: req.user.id });
        const newsfeed = await Newsfeed.findById(req.params.id);
        try {
            if (
                newsfeed.likes.filter(like => like.user.toString() === req.user.id)
                    .length === 0
            ) {
                return res
                    .status(400)
                    .json({ notliked: 'You have not yet liked this newsfeed' });
            }

            // Get remove index
            const removeIndex = newsfeed.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);

            // Splice out of array
            newsfeed.likes.splice(removeIndex, 1);

            // Save
            const save = newsfeed.save();
            res.json(newsfeed)
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

// @route  Newsfeed api/newfeed/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
    '/comment/:id',
    authenticate,
    async (req, res) => {
        const { errors, isValid } = validateCommentInput(req.body);
        // Check Validation
        if (!isValid) {
            // If any errors, send 400 with errors object
            return res.status(400).json(errors);
        }
        try {
            const newsfeed = await Newsfeed.findById(req.params.id);
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            };
            // Add to comments array
            newsfeed.comments.unshift(newComment);
            const save = newsfeed.save()
            res.json(newsfeed)

        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

module.exports = router;