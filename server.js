const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://disha27:Pavbhaji270802&@ac-nrz8lop-shard-00-00.whin8ib.mongodb.net:27017,ac-nrz8lop-shard-00-01.whin8ib.mongodb.net:27017,ac-nrz8lop-shard-00-02.whin8ib.mongodb.net:27017/?replicaSet=atlas-an2b9q-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: String,
    excerpt: String,
    content: String,
    author: String,
    date: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', blogSchema);

// Case Study Schema
const caseStudySchema = new mongoose.Schema({
    title: String,
    excerpt: String,
    content: String,
    date: { type: Date, default: Date.now },
});

const CaseStudy = mongoose.model('CaseStudy', caseStudySchema);

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: 'Access denied: No token provided' });

    try {
        const verified = jwt.verify(token, 'your-secret-key');
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Register a new user
app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Public Routes
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching blogs' });
    }
});

app.get('/api/blogs/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid blog ID' });
        }
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching blog' });
    }
});

app.get('/api/case-studies', async (req, res) => {
    try {
        const caseStudies = await CaseStudy.find();
        res.json(caseStudies);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching case studies' });
    }
});

app.get('/api/case-studies/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid case study ID' });
        }
        const caseStudy = await CaseStudy.findById(req.params.id);
        if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
        res.json(caseStudy);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching case study' });
    }
});

// Protected Routes (Admin Only)
app.post('/api/blogs', authenticateToken, async (req, res) => {
    try {
        const blog = new Blog(req.body);
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Error creating blog' });
    }
});

app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid blog ID' });
        }
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Error updating blog' });
    }
});

app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid blog ID' });
        }
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting blog' });
    }
});

app.post('/api/case-studies', authenticateToken, async (req, res) => {
    try {
        const caseStudy = new CaseStudy(req.body);
        await caseStudy.save();
        res.status(201).json(caseStudy);
    } catch (err) {
        res.status(500).json({ error: 'Error creating case study' });
    }
});

app.put('/api/case-studies/:id', authenticateToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid case study ID' });
        }
        const caseStudy = await CaseStudy.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
        res.json(caseStudy);
    } catch (err) {
        res.status(500).json({ error: 'Error updating case study' });
    }
});

app.delete('/api/case-studies/:id', authenticateToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid case study ID' });
        }
        const caseStudy = await CaseStudy.findByIdAndDelete(req.params.id);
        if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
        res.json({ message: 'Case study deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting case study' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});