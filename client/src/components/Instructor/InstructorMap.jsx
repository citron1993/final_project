import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// תיקון לאייקון של Leaflet (לפעמים הוא לא נטען נכון ב-React)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const InstructorMap = ({ clients, addressFieldId }) => {
  // מרכז המפה (תל אביב כברירת מחדל)
  const center = [32.0853, 34.7818];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {clients.filter(c => c.lat && c.lng).map(client => (
          <Marker key={client.id} position={[client.lat, client.lng]}>
            <Popup>
              <div style={{ direction: 'rtl', textAlign: 'right' }}>
                <strong>{client.firstName || 'דייר'} {client.lastName || ''}</strong><br />
                {client[addressFieldId]}<br />
                <hr />
                <button 
                  onClick={() => window.open(`https://www.waze.com/ul?ll=${client.lat},${client.lng}&navigate=yes`)}
                  style={wazeBtnStyle}
                >
                  🚗 ניווט ב-Waze
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const wazeBtnStyle = {
  backgroundColor: '#33ccff',
  color: 'white',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  width: '100%',
  fontWeight: 'bold'
};

export default InstructorMap;