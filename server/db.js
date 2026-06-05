// server/db.js
const db = {
  clients: [], // רשימת הדיירים
  instructors: [
    { id: "1", name: "איתי ציטרון", username: "citron", password: "1993", isActive: true }
  ],
  // הגדרת השדות של הטופס
  formFields: [
    { id: "firstName", label: "שם פרטי", type: "text", required: true },
    { id: "lastName", label: "שם משפחה", type: "text", required: true },
    { id: "phone", label: "טלפון", type: "tel", required: true },
    { id: "email", label: "אימייל", type: "email", required: true },
    { id: "carModel", label: "דגם רכב", type: "text", required: true },
    { id: "licenseplate", label: "מספר רכב", type: "text", required: true },
    // שינוי ה-type ל-address כדי להפעיל את ה-Geocoding בשרת
    { id: "address", label: "כתובת מלאה", type: "address", required: true }
  ]
};

module.exports = db;