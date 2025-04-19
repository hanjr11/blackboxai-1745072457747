const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store for tracking links
const trackingLinks = {};

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// POST /api/create - create a new tracking link
app.post('/api/create', (req, res) => {
  const { campaignName } = req.body || {};
  const id = generateId();
  trackingLinks[id] = {
    id,
    campaignName: campaignName || null,
    createdAt: new Date().toISOString(),
    visits: []
  };
  const trackingUrl = `${req.protocol}://${req.get('host')}/track/${id}`;
  res.json({ trackingUrl, id });
});

// GET /track/:id - track a visit with natural redirect
app.get('/track/:id', async (req, res) => {
  const { id } = req.params;
  const link = trackingLinks[id];
  if (!link) {
    return res.status(404).send('Tracking link not found');
  }

  // Get visitor IP address
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

  try {
    // Call IP geolocation API
    const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
    const geoData = geoResponse.data;

    // Extract relevant location data
    const visit = {
      timestamp: new Date().toISOString(),
      ip,
      city: geoData.city || 'Unknown',
      region: geoData.region || 'Unknown',
      country: geoData.country_name || 'Unknown',
      latitude: geoData.latitude || null,
      longitude: geoData.longitude || null
    };

    // Save visit data
    link.visits.push(visit);

    // Redirect to the original campaign URL or a natural-looking page
    // For demonstration, redirect to a generic page or campaign URL if stored
    // Here, redirect to a neutral page with minimal tracking
    res.redirect('https://example.com'); // Replace with actual campaign URL if available
  } catch (error) {
    console.error('Error fetching geolocation:', error.message);
    res.status(500).send('Error tracking visit');
  }
});

// GET /api/data/:id - get tracking data
app.get('/api/data/:id', (req, res) => {
  const { id } = req.params;
  const link = trackingLinks[id];
  if (!link) {
    return res.status(404).json({ error: 'Tracking link not found' });
  }
  res.json({ id: link.id, campaignName: link.campaignName, createdAt: link.createdAt, visits: link.visits });
});

// New endpoint to list all tracking links with summary info
app.get('/api/links', (req, res) => {
  const links = Object.values(trackingLinks).map(link => ({
    id: link.id,
    campaignName: link.campaignName,
    createdAt: link.createdAt,
    visitCount: link.visits.length,
    trackingUrl: `${req.protocol}://${req.get('host')}/track/${link.id}`
  }));
  res.json(links);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
