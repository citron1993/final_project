const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const NodeGeocoder = require('node-geocoder');
const db = require('./db');

const app = express();
const geocoder = NodeGeocoder({ provider: 'openstreetmap' });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const processAddress = async (clientData) => {
  const fields = db.getFormFields();
  const addressField = fields.find((field) => field.type === 'address');

  if (addressField && clientData[addressField.id]) {
    try {
      const result = await geocoder.geocode(clientData[addressField.id]);
      if (result && result.length > 0) {
        return {
          ...clientData,
          lat: result[0].latitude,
          lng: result[0].longitude
        };
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  }

  return clientData;
};

app.get('/api/clients', (req, res) => {
  const { instructorId } = req.query;

  if (instructorId) {
    return res.json(db.getClientsByInstructor(instructorId));
  }

  return res.json(db.getClients());
});

app.post('/api/clients', async (req, res) => {
  try {
    const clientData = await processAddress(req.body);
    const newClient = {
      id: Date.now().toString(),
      ...clientData,
      status: clientData.status || 'New',
      createdAt: new Date().toLocaleDateString('he-IL'),
      isRegistered: clientData.isRegistered ?? true,
      isTrained: false
    };

    db.createClient(newClient);
    return res.status(201).json({ success: true, client: newClient });
  } catch (err) {
    console.error('Create client error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/clients/quick-reg', async (req, res) => {
  const { phone, address } = req.body;
  const token = crypto.randomBytes(16).toString('hex');
  const clientData = await processAddress({ phone, address });
  const newClient = {
    id: Date.now().toString(),
    ...clientData,
    token,
    isRegistered: false,
    isTrained: false,
    status: 'Waiting for client details',
    createdAt: new Date().toLocaleDateString('he-IL')
  };

  db.createClient(newClient);
  return res.status(201).json({
    client: newClient,
    link: `http://localhost:5173/complete-details/${token}`
  });
});

app.get('/api/clients/by-token/:token', (req, res) => {
  const client = db.getClientByToken(req.params.token);

  if (!client) {
    return res.status(404).json({ message: 'Invalid token' });
  }

  return res.json(client);
});

app.post('/api/clients/complete-by-token/:token', async (req, res) => {
  const client = db.getClientByToken(req.params.token);

  if (!client) {
    return res.status(404).json({ message: 'Token expired or invalid' });
  }

  const dynamicData = await processAddress(req.body);
  db.updateClient(client.id, {
    ...dynamicData,
    isRegistered: true,
    status: 'Details completed - waiting for scheduling',
    token: undefined
  });

  return res.json({ success: true });
});

app.patch('/api/clients/:id/schedule', (req, res) => {
  const { id } = req.params;
  const { date, time, instructorId } = req.body;

  const isDoubleBooked = db.hasDoubleBooking({
    instructorId,
    date,
    time,
    excludeClientId: id
  });

  if (isDoubleBooked) {
    return res.status(400).json({
      message: `Instructor is already scheduled on ${date} at ${time}`
    });
  }

  const updatedClient = db.updateClient(id, {
    scheduledDate: date,
    scheduledTime: time,
    instructorId,
    status: `Scheduled for ${date} at ${time}`
  });

  if (!updatedClient) {
    return res.status(404).json({ message: 'Client not found' });
  }

  return res.json({ success: true, client: updatedClient });
});

app.patch('/api/clients/:id/complete', (req, res) => {
  const updatedClient = db.updateClient(req.params.id, {
    isTrained: true,
    status: 'Training completed',
    completionDate: new Date().toLocaleDateString('he-IL')
  });

  if (!updatedClient) {
    return res.status(404).json({ message: 'Client not found' });
  }

  return res.json({ success: true, client: updatedClient });
});

app.put('/api/clients/:id', async (req, res) => {
  const currentClient = db.getClientById(req.params.id);

  if (!currentClient) {
    return res.status(404).json({ message: 'Client not found' });
  }

  let updatedData = req.body;
  if (updatedData.address && updatedData.address !== currentClient.address) {
    updatedData = await processAddress(updatedData);
  }

  const updatedClient = db.updateClient(req.params.id, updatedData);
  return res.json({ success: true, client: updatedClient });
});

app.delete('/api/clients/:id', (req, res) => {
  if (!db.deleteClient(req.params.id)) {
    return res.status(404).json({ message: 'Client not found' });
  }

  return res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();

  if (username === 'admin' && password === '1234') {
    return res.json({ role: 'admin', user: { name: 'Admin', id: 'admin' } });
  }

  const instructor = db
    .getInstructors()
    .find((item) => item.username === username && item.password === password);

  if (!instructor) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  if (!instructor.isActive) {
    return res.status(403).json({ message: 'Account is inactive' });
  }

  return res.json({ role: 'instructor', user: instructor });
});

app.get('/api/instructors', (req, res) => {
  return res.json(db.getInstructors());
});

app.post('/api/instructors', (req, res) => {
  const name = String(req.body.name || '').trim();
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, username and password are required' });
  }

  const usernameExists = db
    .getInstructors()
    .some((item) => String(item.username || '').toLowerCase() === username.toLowerCase());

  if (usernameExists || username.toLowerCase() === 'admin') {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const newInstructor = {
    id: `inst_${Date.now()}`,
    name,
    username,
    password,
    isActive: true
  };

  db.createInstructor(newInstructor);
  return res.status(201).json(newInstructor);
});

app.patch('/api/instructors/:id', (req, res) => {
  const updatedInstructor = db.updateInstructor(req.params.id, req.body);

  if (!updatedInstructor) {
    return res.status(404).json({ message: 'Instructor not found' });
  }

  return res.json({ success: true, instructor: updatedInstructor });
});

app.get('/api/settings/fields', (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  return res.json(db.getFormFields({ includeInactive }));
});

app.post('/api/settings/fields', (req, res) => {
  const fields = Array.isArray(req.body.fields) ? req.body.fields : [];
  db.setFormFields(fields);
  return res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  return res.json(db.getStats());
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
