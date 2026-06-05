const path = require('path');
const Database = require('better-sqlite3');

const databasePath = path.join(__dirname, 'database.sqlite');
const database = new Database(databasePath);

database.pragma('journal_mode = WAL');

database.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const defaultInstructor = {
  id: '1',
  name: 'Itay Citron',
  username: 'citron',
  password: '1993',
  isActive: true
};

const defaultFormFields = [
  { id: 'firstName', label: 'First name', type: 'text', required: true },
  { id: 'lastName', label: 'Last name', type: 'text', required: true },
  { id: 'phone', label: 'Phone', type: 'tel', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'carModel', label: 'Car model', type: 'text', required: true },
  { id: 'licenseplate', label: 'License plate', type: 'text', required: true },
  { id: 'address', label: 'Full address', type: 'address', required: true }
];

const normalizeField = (field) => ({
  ...field,
  isActive: field.isActive !== false
});

const parseRow = (row) => {
  if (!row) {
    return null;
  }

  return JSON.parse(row.data || row.value);
};

const stringify = (value) => JSON.stringify(value);

const seedDefaults = () => {
  const instructorCount = database.prepare('SELECT COUNT(*) AS count FROM instructors').get().count;
  if (instructorCount === 0) {
    database
      .prepare('INSERT INTO instructors (id, data) VALUES (?, ?)')
      .run(defaultInstructor.id, stringify(defaultInstructor));
  }

  const fields = database.prepare('SELECT key FROM settings WHERE key = ?').get('formFields');
  if (!fields) {
    database
      .prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .run('formFields', stringify(defaultFormFields));
  }
};

seedDefaults();

const getClients = () =>
  database.prepare('SELECT data FROM clients ORDER BY rowid DESC').all().map(parseRow);

const getClientsByInstructor = (instructorId) =>
  getClients().filter((client) => String(client.instructorId) === String(instructorId));

const getClientById = (id) => {
  const row = database.prepare('SELECT data FROM clients WHERE id = ?').get(String(id));
  return parseRow(row);
};

const getClientByToken = (token) => {
  return getClients().find((client) => client.token === token) || null;
};

const createClient = (client) => {
  database.prepare('INSERT INTO clients (id, data) VALUES (?, ?)').run(client.id, stringify(client));
  return client;
};

const updateClient = (id, updates) => {
  const current = getClientById(id);
  if (!current) {
    return null;
  }

  const updated = { ...current, ...updates };
  database.prepare('UPDATE clients SET data = ? WHERE id = ?').run(stringify(updated), String(id));
  return updated;
};

const deleteClient = (id) => {
  const result = database.prepare('DELETE FROM clients WHERE id = ?').run(String(id));
  return result.changes > 0;
};

const hasDoubleBooking = ({ instructorId, date, time, excludeClientId }) => {
  return getClients().some(
    (client) =>
      String(client.instructorId) === String(instructorId) &&
      client.scheduledDate === date &&
      client.scheduledTime === time &&
      String(client.id) !== String(excludeClientId)
  );
};

const getInstructors = () =>
  database.prepare('SELECT data FROM instructors ORDER BY rowid ASC').all().map(parseRow);

const createInstructor = (instructor) => {
  database
    .prepare('INSERT INTO instructors (id, data) VALUES (?, ?)')
    .run(instructor.id, stringify(instructor));
  return instructor;
};

const updateInstructor = (id, updates) => {
  const row = database.prepare('SELECT data FROM instructors WHERE id = ?').get(String(id));
  const current = parseRow(row);
  if (!current) {
    return null;
  }

  const updated = { ...current, ...updates };
  database.prepare('UPDATE instructors SET data = ? WHERE id = ?').run(stringify(updated), String(id));
  return updated;
};

const getFormFields = ({ includeInactive = false } = {}) => {
  const row = database.prepare('SELECT value FROM settings WHERE key = ?').get('formFields');
  const fields = (parseRow(row) || []).map(normalizeField);
  return includeInactive ? fields : fields.filter((field) => field.isActive);
};

const setFormFields = (fields) => {
  const normalizedFields = fields.map(normalizeField);
  database
    .prepare(
      `INSERT INTO settings (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    .run('formFields', stringify(normalizedFields));
  return normalizedFields;
};

const getStats = () => {
  const clients = getClients();
  const instructors = getInstructors();
  const total = clients.length;
  const completed = clients.filter((client) => client.isTrained).length;
  const pending = clients.filter((client) => !client.isTrained && client.scheduledDate).length;
  const waiting = clients.filter((client) => !client.scheduledDate).length;
  const instructorStats = instructors.map((instructor) => ({
    id: instructor.id,
    name: instructor.name,
    username: instructor.username,
    isActive: instructor.isActive !== false,
    assigned: clients.filter((client) => String(client.instructorId) === String(instructor.id)).length,
    completed: clients.filter(
      (client) => String(client.instructorId) === String(instructor.id) && client.isTrained
    ).length,
    pending: clients.filter(
      (client) =>
        String(client.instructorId) === String(instructor.id) &&
        client.scheduledDate &&
        !client.isTrained
    ).length,
    unscheduled: clients.filter(
      (client) =>
        String(client.instructorId) === String(instructor.id) &&
        !client.scheduledDate &&
        !client.isTrained
    ).length
  }));

  return {
    total,
    completed,
    pending,
    waiting,
    activeInstructors: instructors.filter((instructor) => instructor.isActive !== false).length,
    instructorStats
  };
};

module.exports = {
  createClient,
  createInstructor,
  deleteClient,
  getClientById,
  getClientByToken,
  getClients,
  getClientsByInstructor,
  getFormFields,
  getInstructors,
  getStats,
  hasDoubleBooking,
  setFormFields,
  updateClient,
  updateInstructor
};
