const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const Admin = require('./models/Admin');
const Settings = require('./models/Settings');
const Slider = require('./models/Slider');
const University = require('./models/University');
const Course = require('./models/Course');
const Destination = require('./models/Destination');
const Class = require('./models/Class');
const Blog = require('./models/Blog');
const Review = require('./models/Review');
const Appointment = require('./models/Appointment');

// ---------- Auth middleware ----------
const requireAuth = (req, res, next) => {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// ===================== AUTH =====================
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.adminId = admin._id.toString();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ success: true });
  });
});

router.get('/auth/check', (req, res) => {
  res.json({ authenticated: !!req.session?.adminId });
});

// ===================== SETTINGS =====================
router.get('/settings', async (_req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = { companyName: 'Everest Worldwide Consultancy Pvt. Ltd.', tagline: 'Your Gateway to Global Education' };
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

router.put('/settings', requireAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update settings' });
  }
});

// ===================== SLIDERS =====================
router.get('/sliders', async (_req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch {
    res.status(500).json({ message: 'Failed to fetch sliders' });
  }
});

router.post('/sliders', requireAuth, async (req, res) => {
  try {
    const slider = new Slider(req.body);
    await slider.save();
    res.json(slider);
  } catch {
    res.status(400).json({ message: 'Failed to create slider' });
  }
});

router.put('/sliders/:id', requireAuth, async (req, res) => {
  try {
    const slider = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(slider);
  } catch {
    res.status(400).json({ message: 'Failed to update slider' });
  }
});

router.delete('/sliders/:id', requireAuth, async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: 'Failed to delete slider' });
  }
});

// ===================== UNIVERSITIES =====================
router.get('/universities', async (_req, res) => {
  try {
    const universities = await University.find({ isActive: true });
    res.json(universities);
  } catch {
    res.status(500).json({ message: 'Failed to fetch universities' });
  }
});

router.post('/universities', requireAuth, async (req, res) => {
  try {
    const university = new University(req.body);
    await university.save();
    res.json(university);
  } catch {
    res.status(400).json({ message: 'Failed to create university' });
  }
});

router.put('/universities/:id', requireAuth, async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(university);
  } catch {
    res.status(400).json({ message: 'Failed to update university' });
  }
});

router.delete('/universities/:id', requireAuth, async (req, res) => {
  try {
    await University.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: 'Failed to delete university' });
  }
});

// ===================== COURSES =====================
router.get('/courses', async (_req, res) => {
  try {
    const courses = await Course.find({ isActive: true });
    res.json(courses);
  } catch {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

router.post('/courses', requireAuth, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.json(course);
  } catch {
    res.status(400).json({ message: 'Failed to create course' });
  }
});

router.put('/courses/:id', requireAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch {
    res.status(400).json({ message: 'Failed to update course' });
  }
});

router.delete('/courses/:id', requireAuth, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: 'Failed to delete course' });
  }
});

// ===================== DESTINATIONS =====================
router.get('/destinations', async (_req, res) => {
  try {
    const destinations = await Destination.find({ isActive: true });
    res.json(destinations);
  } catch {
    res.status(500).json({ message: 'Failed to fetch destinations' });
  }
});

router.post('/destinations', requireAuth, async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    res.json(destination);
  } catch {
    res.status(400).json({ message: 'Failed to create destination' });
  }
});

router.put('/destinations/:id', requireAuth, async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(destination);
  } catch {
    res.status(400).json({ message: 'Failed to update destination' });
  }
});

router.delete('/destinations/:id', requireAuth, async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: 'Failed to delete destination' });
  }
});

// ===================== CLASSES =====================
router.get('/classes', async (_req, res) => {
  try {
    const classes = await Class.find({ isActive: true });
    res.json(classes);
  } catch {
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
});

router.post('/classes', requireAuth, async (req, res) => {
  try {
    const classItem = new Class(req.body);
    await classItem.save();
    res.json(classItem);
  } catch {
    res.status(400).json({ message: 'Failed to create class' });
  }
});

router.put('/classes/:id', requireAuth, async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(classItem);
  } catch {
    res.status(400).json({ message: 'Failed to update class' });
  }
});

router.delete('/classes/:id', requireAuth, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: 'Failed to delete class' });
  }
});

// ===================== BLOGS =====================
router.get('/blogs', async (_req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch {
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

router.post('/blogs', requireAuth, async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.json(blog);
  } catch {
    res.status(400).json({ message: 'Failed to create blog' });
  }
});

router.put('/blogs/:id', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(blog);
  } catch {
    res.status(400).json({ message: 'Failed to update blog' });
  }
});

router.delete('/blogs/:id', requireAuth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: 'Failed to delete blog' });
  }
});

// ===================== REVIEWS =====================
router.get('/reviews', async (_req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

router.post('/reviews', requireAuth, async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json(review);
  } catch {
    res.status(400).json({ message: 'Failed to create review' });
  }
});

router.put('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(review);
  } catch {
    res.status(400).json({ message: 'Failed to update review' });
  }
});

router.delete('/reviews/:id', requireAuth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: 'Failed to delete review' });
  }
});

// ===================== APPOINTMENTS =====================
// List (admin only)
router.get('/appointments', requireAuth, async (_req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Create (public)
router.post('/appointments', async (req, res) => {
  try {
    // Accept both "name" and "fullName" from client and map to schema's "name"
    const {
      name,
      fullName,
      email,
      phone,
      preferredDate,
      preferredTime = '',
      message = '',
      status, // ignored on create; schema default is pending
    } = req.body || {};

    const finalName = (name || fullName || '').toString().trim();
    if (!finalName || !email || !phone) {
      return res.status(400).json({ message: 'Missing required fields (name/fullName, email, phone)' });
    }

    const doc = await Appointment.create({
      name: finalName,
      email: email.toString().trim(),
      phone: phone.toString().trim(),
      preferredDate: preferredDate ? String(preferredDate) : '',
      preferredTime: String(preferredTime || ''),
      message: String(message || ''),
      // status left to default
    });

    // Use 201 for creation
    return res.status(201).json(doc);
  } catch (error) {
    console.error('Failed to create appointment:', error);
    res.status(400).json({ message: 'Failed to create appointment' });
  }
});

// Update (admin)
router.put('/appointments/:id', requireAuth, async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      preferredDate,
      preferredTime,
      message,
      status,
    } = req.body || {};

    const update = {};
    if (name !== undefined || fullName !== undefined) update.name = (name || fullName || '').toString().trim();
    if (email !== undefined) update.email = String(email);
    if (phone !== undefined) update.phone = String(phone);
    if (preferredDate !== undefined) update.preferredDate = String(preferredDate || '');
    if (preferredTime !== undefined) update.preferredTime = String(preferredTime || '');
    if (message !== undefined) update.message = String(message || '');
    if (status !== undefined) update.status = String(status);

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update appointment' });
  }
});

// Delete (admin)
router.delete('/appointments/:id', requireAuth, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete appointment' });
  }
});


module.exports = router;
