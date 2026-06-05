const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');
const NodeGeocoder = require('node-geocoder');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });

// --- פונקציות עזר ---
const processAddress = async (clientData) => {
    const fields = db.formFields || [];
    const addressField = fields.find(f => f.type === 'address');
    
    if (addressField && clientData[addressField.id]) {
        try {
            const res = await geocoder.geocode(clientData[addressField.id]);
            if (res && res.length > 0) {
                clientData.lat = res[0].latitude;
                clientData.lng = res[0].longitude;
            }
        } catch (err) {
            console.error("Geocoding error:", err);
        }
    }
    return clientData;
};

// --- נתיבי דיירים (Clients) ---

app.get('/api/clients', (req, res) => {
    const { instructorId } = req.query;
    if (instructorId) {
        const filteredClients = db.clients.filter(c => String(c.instructorId) === String(instructorId));
        return res.json(filteredClients);
    }
    res.json(db.clients);
});

app.post('/api/clients', async (req, res) => {
    try {
        let clientData = req.body;
        clientData = await processAddress(clientData);
        
        const newClient = { 
            id: Date.now().toString(), 
            ...clientData, 
            status: clientData.status || 'חדש',
            createdAt: new Date().toLocaleDateString('he-IL'),
            isTrained: false 
        };
        
        db.clients.push(newClient);
        res.status(201).json({ success: true, client: newClient });
    } catch (err) {
        res.status(500).json({ message: "שגיאה בשרת" });
    }
});

app.post('/api/clients/quick-reg', (req, res) => {
    const { phone, address } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    
    const newClient = {
        id: Date.now().toString(),
        phone,
        address,
        token,
        isRegistered: false, 
        isTrained: false,
        status: "ממתין להשלמת פרטים על ידי הלקוח 🔗",
        createdAt: new Date().toLocaleDateString('he-IL')
    };
    
    db.clients.push(newClient);
    res.status(201).json({ client: newClient, link: `http://localhost:5173/complete-details/${token}` });
});

app.get('/api/clients/by-token/:token', (req, res) => {
    const { token } = req.params;
    const client = db.clients.find(c => c.token === token);
    if (client) res.json(client);
    else res.status(404).json({ message: "טוקן לא תקף" });
});

app.post('/api/clients/complete-by-token/:token', async (req, res) => {
    const { token } = req.params;
    let dynamicData = req.body;
    const client = db.clients.find(c => c.token === token);
    
    if (client) {
        dynamicData = await processAddress(dynamicData);
        Object.assign(client, dynamicData); 
        client.isRegistered = true;
        client.status = "פרטים הושלמו - ממתין לתיאום הדרכה 📅";
        delete client.token; 
        res.json({ success: true });
    } else {
        res.status(404).json({ message: "טוקן לא בתוקף" });
    }
});

// --- נתיב קביעת תור עם חסימת כפילויות מוחלטת ---
app.patch('/api/clients/:id/schedule', (req, res) => {
    const { id } = req.params;
    const { date, time, instructorId } = req.body;

    // בדיקה: האם המדריך הזה תפוס בשעה הזו אצל דייר אחר?
    const isDoubleBooked = db.clients.find(c => 
        String(c.instructorId) === String(instructorId) && 
        c.scheduledDate === date && 
        c.scheduledTime === time &&
        String(c.id) !== String(id)
    );

    if (isDoubleBooked) {
        return res.status(400).json({ 
            message: `שגיאה: אתה כבר משובץ להדרכה ב-${date} בשעה ${time}` 
        });
    }

    const client = db.clients.find(c => String(c.id) === String(id));
    if (client) {
        client.scheduledDate = date;
        client.scheduledTime = time;
        client.instructorId = instructorId;
        client.status = `תואם לתאריך ${date} בשעה ${time} 📅`;
        res.json({ success: true, client });
    } else {
        res.status(404).json({ message: "דייר לא נמצא" });
    }
});

app.delete('/api/clients/:id', (req, res) => {
    const index = db.clients.findIndex(c => String(c.id) === String(req.params.id));
    if (index !== -1) {
        db.clients.splice(index, 1);
        return res.json({ success: true });
    }
    res.status(404).json({ message: "דייר לא נמצא" });
});

// --- ניהול משתמשים והתחברות ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // קודם בודקים אדמין קשיח
    if (username === "admin" && password === "1234") {
        return res.json({ role: 'admin', user: { name: "מנהל", id: 'admin' } });
    }
    
    // אחר כך בודקים במערך המדריכים
    const inst = db.instructors.find(i => i.username === username && i.password === password);
    if (inst) {
        if (!inst.isActive) return res.status(403).json({ message: "חשבון מוקפא" });
        return res.json({ role: 'instructor', user: inst });
    }
    
    res.status(401).json({ message: "שם משתמש או סיסמה לא נכונים" });
});

app.get('/api/instructors', (req, res) => res.json(db.instructors));
app.post('/api/instructors', (req, res) => {
    const newInstructor = { id: 'inst_' + Date.now(), ...req.body, isActive: true };
    db.instructors.push(newInstructor);
    res.status(201).json(newInstructor);
});

// --- הגדרות שדות וסטטיסטיקה ---
app.get('/api/settings/fields', (req, res) => res.json(db.formFields || []));
app.post('/api/settings/fields', (req, res) => {
    db.formFields = req.body.fields;
    res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
    res.json({
        total: db.clients.length,
        completed: db.clients.filter(c => c.isTrained).length,
        pending: db.clients.filter(c => !c.isTrained).length
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
// 1. סימון הדרכה כבוצעה
app.patch('/api/clients/:id/complete', (req, res) => {
    const { id } = req.params;
    const client = db.clients.find(c => String(c.id) === String(id));
    
    if (client) {
        client.isTrained = true;
        client.status = "הדרכה בוצעה ✅";
        client.completionDate = new Date().toLocaleDateString('he-IL');
        res.json({ success: true, client });
    } else {
        res.status(404).json({ message: "דייr לא נמצא" });
    }
});

// 2. עדכון פרטי דייר כלליים (עריכה)
app.put('/api/clients/:id', async (req, res) => {
    const { id } = req.params;
    let updatedData = req.body;

    const index = db.clients.findIndex(c => String(c.id) === String(id));
    if (index !== -1) {
        // אם הכתובת השתנתה, נעדכן גם קואורדינטות
        if (updatedData.address && updatedData.address !== db.clients[index].address) {
            const fields = db.formFields || [];
            const addressField = fields.find(f => f.type === 'address');
            if (addressField) {
                try {
                    const geo = await geocoder.geocode(updatedData.address);
                    if (geo.length > 0) {
                        updatedData.lat = geo[0].latitude;
                        updatedData.lng = geo[0].longitude;
                    }
                } catch (e) { console.error("Geocode error on update"); }
            }
        }
        
        db.clients[index] = { ...db.clients[index], ...updatedData };
        res.json({ success: true, client: db.clients[index] });
    } else {
        res.status(404).json({ message: "דייר לא נמצא" });
    }
});
app.get('/api/stats', (req, res) => {
    const total = db.clients.length;
    const completed = db.clients.filter(c => c.isTrained).length;
    const pending = db.clients.filter(c => !c.isTrained && c.scheduledDate).length; // שובצו אך טרם בוצעו
    const waiting = db.clients.filter(c => !c.scheduledDate).length; // ממתינים לשיבוץ בכלל

    // בונוס: הדרכות לפי מדריך (לגרף עמודות)
    const instructorStats = db.instructors.map(inst => ({
        name: inst.name,
        count: db.clients.filter(c => String(c.instructorId) === String(inst.id) && c.isTrained).length
    }));

    res.json({
        total,
        completed,
        pending,
        waiting,
        instructorStats
    });
});