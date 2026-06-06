import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const InstructorCalendar = ({ clients, onUpdateClient }) => {
  
  // הכנת האירועים ללוח השנה
  const events = clients
    .filter(c => c.scheduledDate && c.scheduledTime) // רק דיירים עם תור משובץ
    .map(c => ({
      id: c.id,
      title: `${c.firstName || 'דייר'} ${c.lastName || ''} - ${c.address || ''}`,
      start: `${c.scheduledDate}T${c.scheduledTime}`, 
      // צבע ירוק לבוצע, כחול לממתין
      backgroundColor: c.isTrained ? '#27ae60' : '#3498db',
      borderColor: 'transparent',
      // שמירת כל נתוני הדייר בתוך האירוע כדי שנוכל לשלוף אותם בלחיצה
      extendedProps: { ...c }
    }));

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="he"
        direction="rtl"
        events={events}
        slotMinTime="08:00:00" // שעת התחלה בלוח
        slotMaxTime="20:00:00" // שעת סיום בלוח
        allDaySlot={false}
        height="auto"
        // בעת לחיצה - פותח את מודל העריכה שהגדרנו ב-Dashboard
        eventClick={(info) => {
          if (onUpdateClient) {
            onUpdateClient(info.event.extendedProps);
          }
        }}
      />
    </div>
  );
};

export default InstructorCalendar;
