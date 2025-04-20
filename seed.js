const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/marketing27', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const blogSchema = new mongoose.Schema({
    title: String,
    excerpt: String,
    content: String,
    author: String,
    date: { type: Date, default: Date.now },
});

const caseStudySchema = new mongoose.Schema({
    title: String,
    excerpt: String,
    content: String,
    date: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', blogSchema);
const CaseStudy = mongoose.model('CaseStudy', caseStudySchema);

const seedData = async () => {
    await Blog.deleteMany({});
    await CaseStudy.deleteMany({});

    await Blog.insertMany([
        {
            title: "Top 10 SEO Strategies for 2025",
            excerpt: "Discover the latest SEO trends to boost your website’s ranking and drive organic traffic.",
            content: "<p>Search Engine Optimization (SEO) is constantly evolving...</p>",
            author: "Jane Doe",
        },
        {
            title: "How to Create a Winning Social Media Campaign",
            excerpt: "Learn the step-by-step process to craft a social media strategy that engages and converts.",
            content: "<p>Social media campaigns are a powerful way to connect with your audience...</p>",
            author: "John Smith",
        },
    ]);

    await CaseStudy.insertMany([
        {
            title: "Increased Organic Traffic by 200% for a Startup",
            excerpt: "We implemented a tailored SEO strategy that skyrocketed our client’s visibility in just 6 months.",
            content: "<p>We partnered with a tech startup to overhaul their SEO strategy...</p>",
        },
    ]);

    console.log('Data seeded successfully');
    mongoose.connection.close();
};

seedData();