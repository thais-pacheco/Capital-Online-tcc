import React, { useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import './CalendarPopup.css';

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({ isOpen, onClose, userEmail }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r?email=${encodeURIComponent(userEmail)}`;

  return (
    <div className="calendar-overlay">
      <div className="calendar-popup" ref={popupRef}>
        <div className="calendar-header">
          <div className="calendar-header-content">
            <CalendarIcon size={24} />
            <h2>Google Calendar</h2>
          </div>
          <button className="calendar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="calendar-body">
          <div className="calendar-iframe-container">
            <iframe
              src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(userEmail)}&ctz=America/Sao_Paulo&mode=WEEK&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0`}
              className="calendar-iframe"
              frameBorder="0"
              scrolling="no"
              title="Google Calendar"
            ></iframe>
          </div>

          <div className="calendar-footer">
            <p className="calendar-info">
              Visualizando o calendário de: <strong>{userEmail}</strong>
            </p>
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-link-btn"
            >
              <ExternalLink size={16} />
              Abrir no Google Calendar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPopup;