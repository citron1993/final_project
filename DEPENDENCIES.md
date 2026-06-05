# Dependencies And Installation

מסמך זה מפרט את הספריות והכלים שבהם הפרויקט משתמש.

## Server

מיקום:

```text
server/package.json
```

### Production Dependencies

| Package | Purpose |
| --- | --- |
| `express` | בניית שרת HTTP ו-REST API |
| `cors` | פתיחת גישה מה-React client לשרת המקומי |
| `node-geocoder` | המרת כתובות לקואורדינטות עבור מפה |
| `better-sqlite3` | חיבור למסד נתונים SQLite מקומי |

### Development Dependencies

| Package | Purpose |
| --- | --- |
| `nodemon` | הרצת שרת בפיתוח עם restart אוטומטי בשינוי קבצים |

### Install And Run

```bash
cd server
npm install
npm start
```

מצב פיתוח:

```bash
npm run dev
```

קובץ מסד הנתונים נוצר אוטומטית בזמן הרצת השרת:

```text
server/database.sqlite
```

הקובץ מוחרג מ-Git כדי לא להעלות נתוני runtime למאגר.

## Client

מיקום:

```text
client/package.json
```

### Production Dependencies

| Package | Purpose |
| --- | --- |
| `react` | בניית ממשק המשתמש |
| `react-dom` | חיבור React ל-DOM |
| `react-router-dom` | ניתוב בין עמודים באפליקציה |
| `axios` | קריאות HTTP מהלקוח אל השרת |
| `leaflet` | הצגת מפה |
| `react-leaflet` | שימוש ב-Leaflet מתוך React |
| `@fullcalendar/react` | רכיב לוח שנה ב-React |
| `@fullcalendar/daygrid` | תצוגת חודש/ימים בלוח השנה |
| `@fullcalendar/timegrid` | תצוגת שעות בלוח השנה |
| `@fullcalendar/interaction` | אינטראקציות בלוח השנה, כמו בחירה ולחיצה |

### Development Dependencies

| Package | Purpose |
| --- | --- |
| `vite` | שרת פיתוח ובנייה ל-React |
| `@vitejs/plugin-react` | תמיכת React בתוך Vite |
| `eslint` | בדיקת איכות קוד |
| `@eslint/js` | הגדרות ESLint בסיסיות |
| `eslint-plugin-react-hooks` | בדיקות חוקי React Hooks |
| `eslint-plugin-react-refresh` | תמיכה ב-React Fast Refresh |
| `globals` | הגדרות משתנים גלובליים ל-ESLint |
| `@types/react` | טיפוסים עבור React |
| `@types/react-dom` | טיפוסים עבור React DOM |

### Install And Run

```bash
cd client
npm install
npm run dev
```

בדיקת build:

```bash
npm run build
```

בדיקת lint:

```bash
npm run lint
```

## Ports

| Service | Port | URL |
| --- | --- | --- |
| Client | `5173` | `http://localhost:5173` |
| Server | `5000` | `http://localhost:5000` |

## Git Notes

לא מעלים לגיט:

- `node_modules/`
- `.env`
- `dist/`
- `build/`

הקבצים החשובים להעלאה הם קוד המקור, `package.json`, `package-lock.json`, וקבצי התיעוד.
