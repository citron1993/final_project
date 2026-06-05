# Final Project

מערכת Web לניהול הדרכות, דיירים ומדריכים. הפרויקט בנוי כיישום Full Stack:

- Client: React + Vite
- Server: Node.js + Express
- Data: שמירה בזיכרון דרך קובץ `server/db.js`

## מבנה הפרויקט

```text
final_project/
  client/   # React frontend
  server/   # Express backend
```

## דרישות מקדימות

- Node.js
- npm

## התקנת צד שרת

```bash
cd server
npm install
npm start
```

שרת ה-API ירוץ בכתובת:

```text
http://localhost:5000
```

## התקנת צד לקוח

בטרמינל נוסף:

```bash
cd client
npm install
npm run dev
```

האפליקציה תרוץ בכתובת:

```text
http://localhost:5173
```

## משתמשי בדיקה

Admin:

```text
username: admin
password: 1234
```

Instructor:

```text
username: citron
password: 1993
```

## סקריפטים שימושיים

Server:

```bash
npm start
npm run dev
```

Client:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## הערות

- הפרויקט משתמש בנתונים בזיכרון, ולכן נתונים שנוספו בזמן ריצה נמחקים לאחר הפעלה מחדש של השרת.
- אין להעלות את תיקיות `node_modules` לגיט. הן נוצרות מחדש באמצעות `npm install`.
- כתובת ה-API בצד הלקוח מוגדרת בקובץ `client/src/services/api.js`.
