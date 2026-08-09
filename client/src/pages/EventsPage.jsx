import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    CalendarDays,
    Plus,
    Sparkles,
    MapPin,
    Clock3,
    Trash2,
    CheckCircle2,
    Users,
    ListChecks
} from 'lucide-react';

const EventsPage = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [myRsvps, setMyRsvps] = useState([]);
    const [attendees, setAttendees] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        isVirtual: false
    });

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('accessToken');
    const isAlumni = user.role === 'alumni';

    const fetchUpcomingEvents = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/events/upcoming', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                setEvents(response.data.events || []);
            }
        } catch (err) {
            toast.error('Unable to load events right now.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyEvents = async () => {
        if (!token || !isAlumni) return;
        try {
            const response = await axios.get('http://localhost:8000/api/events/my-events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                setMyEvents(response.data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyRsvps = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8000/api/events/my-rsvps', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                setMyRsvps(response.data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAttendees = async (eventId) => {
        if (!token || !isAlumni) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/events/${eventId}/attendees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                setAttendees(prev => ({ ...prev, [eventId]: response.data.attendees || [] }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUpcomingEvents();
        fetchMyRsvps();
        if (isAlumni) fetchMyEvents();
    }, [token]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.eventDate || !form.location) {
            toast.error('Please complete all required event fields.');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('http://localhost:8000/api/events/create', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Event created successfully.');
            setForm({ title: '', description: '', eventDate: '', location: '', isVirtual: false });
            fetchUpcomingEvents();
            fetchMyEvents();
            setActiveTab('manage');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to create event.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Event deleted.');
            fetchUpcomingEvents();
            fetchMyEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to delete event.');
        }
    };

    const handleRsvp = async (eventId) => {
        try {
            await axios.post(`http://localhost:8000/api/events/${eventId}/rsvp`, { rsvpStatus: 'attending' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('You are now RSVP’d for this event.');
            fetchUpcomingEvents();
            fetchMyRsvps();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to RSVP.');
        }
    };

    const formatDate = (value) => {
        if (!value) return 'TBD';
        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Community Events</h1>
                <p className="text-sm text-gray-500">Join webinars, campus meetups, and alumni-led sessions from your network.</p>
            </div>

            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-3 px-5 text-sm font-semibold border-b-2 transition ${activeTab === 'upcoming' ? 'border-[#004AC6] text-[#004AC6]' : 'border-transparent text-gray-500'}`}
                >
                    Upcoming Events
                </button>
                {isAlumni && (
                    <>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`pb-3 px-5 text-sm font-semibold border-b-2 transition ${activeTab === 'create' ? 'border-[#004AC6] text-[#004AC6]' : 'border-transparent text-gray-500'}`}
                        >
                            Create Event
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`pb-3 px-5 text-sm font-semibold border-b-2 transition ${activeTab === 'manage' ? 'border-[#004AC6] text-[#004AC6]' : 'border-transparent text-gray-500'}`}
                        >
                            My Events
                        </button>
                    </>
                )}
            </div>

            {activeTab === 'upcoming' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="page-card rounded-3xl p-10 text-center text-sm text-gray-500">Loading events…</div>
                    ) : events.length > 0 ? (
                        events.map((event) => (
                            <div key={event._id} className="page-card rounded-3xl p-6 shadow-sm">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays size={16} className="text-[#004AC6]" />
                                            <span className="text-sm font-semibold text-[#004AC6]">{formatDate(event.eventDate)}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                            <span className="inline-flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                                            <span className="inline-flex items-center gap-1"><Users size={14} /> Hosted by {event.organizer?.firstName || 'Alumni'}</span>
                                            {event.isVirtual && <span className="inline-flex items-center gap-1"><Sparkles size={14} /> Virtual</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isAlumni && (
                                            <button
                                                onClick={() => fetchAttendees(event._id)}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                <ListChecks size={16} /> Attendees
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRsvp(event._id)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#004AC6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0038A8]"
                                        >
                                            <CheckCircle2 size={16} /> RSVP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="page-card rounded-3xl p-10 text-center text-sm text-gray-500">No events are available yet. Check back soon.</div>
                    )}
                </div>
            )}

            {activeTab === 'create' && isAlumni && (
                <div className="page-card rounded-3xl p-8 shadow-sm">
                    <div className="mb-6 flex items-center gap-2">
                        <Plus size={18} className="text-[#004AC6]" />
                        <h2 className="text-lg font-bold text-gray-900">Host a New Event</h2>
                    </div>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Title</label>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border px-3 py-2" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Location</label>
                                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl border px-3 py-2" required />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 w-full rounded-xl border px-3 py-2" required />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Date & Time</label>
                                <input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="w-full rounded-xl border px-3 py-2" required />
                            </div>
                            <label className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold text-gray-700">
                                <input type="checkbox" checked={form.isVirtual} onChange={(e) => setForm({ ...form, isVirtual: e.target.checked })} />
                                Virtual event
                            </label>
                        </div>
                        <button type="submit" disabled={submitting} className="rounded-xl bg-[#004AC6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0038A8] disabled:opacity-70">
                            {submitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'manage' && isAlumni && (
                <div className="space-y-4">
                    {myEvents.length > 0 ? myEvents.map((event) => (
                        <div key={event._id} className="page-card rounded-3xl p-5 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900">{event.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">{formatDate(event.eventDate)} • {event.location}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => fetchAttendees(event._id)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                    <ListChecks size={14} /> View Attendees
                                </button>
                                <button onClick={() => handleDeleteEvent(event._id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                            {attendees[event._id] && attendees[event._id].length > 0 && (
                                <div className="w-full rounded-xl border bg-gray-50 p-3 text-sm text-gray-600">
                                    <p className="mb-2 font-semibold text-gray-800">Attendees</p>
                                    <div className="flex flex-wrap gap-2">
                                        {attendees[event._id].map((attendee) => (
                                            <span key={attendee._id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                                {attendee.userId?.firstName || 'Guest'} {attendee.userId?.lastName || ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="page-card rounded-3xl p-10 text-center text-sm text-gray-500">You have not created any events yet.</div>
                    )}
                </div>
            )}

            {activeTab === 'rsvps' && (
                <div className="space-y-4">
                    {myRsvps.length > 0 ? myRsvps.map((entry) => (
                        <div key={entry._id} className="page-card rounded-3xl p-5 shadow-sm">
                            <h3 className="font-bold text-gray-900">{entry.eventId?.title || 'Event'}</h3>
                            <p className="mt-1 text-sm text-gray-500">{formatDate(entry.eventId?.eventDate)} • {entry.eventId?.location || 'Location TBD'}</p>
                            <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#004AC6]">Status: {entry.rsvpStatus}</span>
                        </div>
                    )) : (
                        <div className="page-card rounded-3xl p-10 text-center text-sm text-gray-500">You have not RSVP’d to any events yet.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
