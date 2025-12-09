'use client';

import { useState, useEffect, useMemo } from 'react';
// Session removed

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: 'event' | 'deadline' | 'meeting' | 'reminder';
  color: string;
  isAllDay: boolean;
  userId: string;
  teamId?: string;
  relatedTicketId?: string;
  createdAt: string;
}

interface TicketDeadline {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
}

const eventColors = [
  { name: 'Indigo', value: 'indigo' },
  { name: 'Blu', value: 'blue' },
  { name: 'Verde', value: 'green' },
  { name: 'Giallo', value: 'yellow' },
  { name: 'Arancione', value: 'orange' },
  { name: 'Rosso', value: 'red' },
  { name: 'Viola', value: 'purple' },
  { name: 'Rosa', value: 'pink' },
];

const eventTypes = [
  { name: 'Evento', value: 'event' },
  { name: 'Scadenza', value: 'deadline' },
  { name: 'Riunione', value: 'meeting' },
  { name: 'Promemoria', value: 'reminder' },
];

export default function CalendarPage() {
  const session = { user: { id: 'admin-patrick', name: 'Patrick', email: 'patrickanthonystudio@gmail.com', teamId: 'team-default', role: 'admin' } };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [ticketDeadlines, setTicketDeadlines] = useState<TicketDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // New event form
  const [newEvent, setNewEvent] = useState<{
    title: string;
    description: string;
    date: string;
    endDate: string;
    type: 'event' | 'deadline' | 'meeting' | 'reminder';
    color: string;
    isAllDay: boolean;
  }>({
    title: '',
    description: '',
    date: '',
    endDate: '',
    type: 'event',
    color: 'indigo',
    isAllDay: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const [eventsRes, ticketsRes] = await Promise.all([
        fetch(`/api/calendar?year=${year}&month=${month + 1}`),
        fetch('/api/tickets?hasDeadline=true'),
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data);
      }

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        const deadlines = data
          .filter((t: TicketDeadline) => t.dueDate && t.status !== 'closed')
          .map((t: TicketDeadline) => ({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate,
            status: t.status,
            priority: t.priority,
          }));
        setTicketDeadlines(deadlines);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysCount = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start

    const days: (Date | null)[] = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    const calendarEvents = events.filter((e) => {
      const eventDate = e.date.split('T')[0];
      return eventDate === dateStr;
    });

    const deadlines = ticketDeadlines.filter((t) => {
      const deadlineDate = t.dueDate.split('T')[0];
      return deadlineDate === dateStr;
    });

    return { events: calendarEvents, deadlines };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewEvent((prev) => ({
      ...prev,
      date: date.toISOString().split('T')[0],
    }));
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (res.ok) {
        const created = await res.json();
        setEvents((prev) => [...prev, created]);
        setIsEventModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !newEvent.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/calendar/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setIsEventModalOpen(false);
        setEditingEvent(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/calendar/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        setSelectedDate(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      endDate: '',
      type: 'event',
      color: 'indigo',
      isAllDay: true,
    });
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      date: event.date.split('T')[0],
      endDate: event.endDate?.split('T')[0] || '',
      type: event.type,
      color: event.color,
      isAllDay: event.isAllDay,
    });
    setIsEventModalOpen(true);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      yellow: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[color] || colors.indigo;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="skeleton h-10 w-48 mb-4" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="card">
          <div className="skeleton h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Calendario</h1>
            <p className="page-subtitle">Gestisci eventi e scadenze</p>
          </div>
          <button
            onClick={() => {
              setEditingEvent(null);
              resetForm();
              setIsEventModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuovo evento
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevMonth} className="btn btn-ghost p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-white capitalize min-w-[180px] text-center">
              {formatMonthYear(currentDate)}
            </h2>
            <button onClick={handleNextMonth} className="btn btn-ghost p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleToday} className="btn btn-secondary">
              Oggi
            </button>
            <div className="flex rounded-xl overflow-hidden border border-white/[0.06]">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 text-[13px] font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Mese
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-[13px] font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Settimana
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 card p-0 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center text-[13px] font-semibold text-zinc-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {daysInMonth.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-[100px] border-b border-r border-white/[0.04] bg-zinc-900/30" />;
              }

              const { events: dayEvents, deadlines } = getEventsForDate(date);
              const hasEvents = dayEvents.length > 0 || deadlines.length > 0;
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[100px] border-b border-r border-white/[0.04] p-2 cursor-pointer transition-colors hover:bg-white/[0.02] ${
                    isSelected ? 'bg-indigo-500/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[14px] font-medium ${
                        isToday(date)
                          ? 'bg-indigo-500 text-white'
                          : 'text-zinc-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                        className={`text-[11px] px-2 py-1 rounded truncate border ${getColorClasses(event.color)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {deadlines.slice(0, 1).map((deadline) => (
                      <div
                        key={deadline.id}
                        className="text-[11px] px-2 py-1 rounded truncate bg-red-500/20 text-red-400 border border-red-500/30"
                      >
                        {deadline.title}
                      </div>
                    ))}
                    {(dayEvents.length + deadlines.length) > 3 && (
                      <p className="text-[11px] text-zinc-500 px-2">
                        +{dayEvents.length + deadlines.length - 3} altri
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Panel */}
        <div className="card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-[15px] font-semibold text-white">
              {selectedDate
                ? selectedDate.toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                : 'Seleziona un giorno'}
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {selectedDate ? (
              <>
                {(() => {
                  const { events: dayEvents, deadlines } = getEventsForDate(selectedDate);
                  if (dayEvents.length === 0 && deadlines.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-zinc-500 text-[13px]">Nessun evento</p>
                        <button
                          onClick={() => {
                            setEditingEvent(null);
                            resetForm();
                            setIsEventModalOpen(true);
                          }}
                          className="btn btn-ghost text-indigo-400 text-[13px] mt-3"
                        >
                          + Aggiungi evento
                        </button>
                      </div>
                    );
                  }

                  return (
                    <>
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-xl border ${getColorClasses(event.color)}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-[14px]">{event.title}</h4>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditModal(event)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-[12px] opacity-80">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-[11px] opacity-60">
                            <span className="capitalize">{event.type}</span>
                            {event.isAllDay && <span>• Tutto il giorno</span>}
                          </div>
                        </div>
                      ))}
                      {deadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className="p-4 rounded-xl border bg-red-500/10 border-red-500/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[11px] text-red-400 font-medium uppercase">Scadenza Ticket</span>
                          </div>
                          <h4 className="font-medium text-[14px] text-red-400">{deadline.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`badge text-[10px] ${
                              deadline.priority === 'critical'
                                ? 'badge-red'
                                : deadline.priority === 'high'
                                ? 'badge-amber'
                                : 'badge-blue'
                            }`}>
                              {deadline.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-[13px]">
                  Clicca su un giorno per vedere i dettagli
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      {isEventModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEventModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEvent ? 'Modifica evento' : 'Nuovo evento'}
              </h2>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Titolo</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="input"
                  placeholder="Nome dell'evento"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Descrizione (opzionale)</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="input min-h-[80px] resize-none"
                  placeholder="Dettagli sull'evento"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Data inizio</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Data fine (opzionale)</label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                    className="select"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Colore</label>
                  <select
                    value={newEvent.color}
                    onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                    className="select"
                  >
                    {eventColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNewEvent({ ...newEvent, isAllDay: !newEvent.isAllDay })}
                  className={`toggle ${newEvent.isAllDay ? 'active' : ''}`}
                />
                <span className="text-[14px] text-zinc-300">Tutto il giorno</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setIsEventModalOpen(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="btn btn-ghost"
              >
                Annulla
              </button>
              <button
                onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                disabled={!newEvent.title.trim() || !newEvent.date || isSubmitting}
                className="btn btn-primary disabled:opacity-40"
              >
                {isSubmitting
                  ? 'Salvataggio...'
                  : editingEvent
                  ? 'Salva modifiche'
                  : 'Crea evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
