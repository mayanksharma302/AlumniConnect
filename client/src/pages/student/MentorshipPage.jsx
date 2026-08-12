import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Handshake, Send, Clock3, CheckCircle2, XCircle, MessageSquareHeart } from 'lucide-react';

const MentorshipPage = () => {
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [mentorId, setMentorId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const token = sessionStorage.getItem('accessToken');

    const fetchRequests = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [receivedRes, sentRes] = await Promise.all([
                axios.get('http://localhost:8000/api/mentorship/recieved', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/mentorship/sent', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setIncoming(receivedRes.data.requests || []);
            setOutgoing(sentRes.data.requests || []);
        } catch (err) {
            toast.error('Unable to load mentorship requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!mentorId || !message) {
            toast.error('Please enter a mentor ID and a short intro.');
            return;
        }
        setSubmitting(true);
        try {
            await axios.post('http://localhost:8000/api/mentorship/send', { mentorId, message }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Mentorship request sent.');
            setMentorId('');
            setMessage('');
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to send request.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (requestId, status) => {
        try {
            await axios.put(`http://localhost:8000/api/mentorship/status/${requestId}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Request ${status}.`);
            fetchRequests();
        } catch (err) {
            toast.error('Unable to update request.');
        }
    };

    const statusStyles = {
        pending: 'bg-amber-50 text-amber-700',
        accepted: 'bg-emerald-50 text-emerald-700',
        rejected: 'bg-rose-50 text-rose-700'
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mentorship Inbox</h1>
                <p className="text-sm text-gray-500">Manage incoming guidance requests and track the ones you have sent.</p>
            </div>

            <div className="page-card rounded-3xl p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Handshake size={18} className="text-[#004AC6]" />
                    <h2 className="text-lg font-bold text-gray-900">Request a Mentor</h2>
                </div>
                <form onSubmit={handleSendRequest} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Mentor User ID</label>
                            <input value={mentorId} onChange={(e) => setMentorId(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="Enter the alumni user ID" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Intro Message</label>
                            <input value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="Tell them what you need help with" required />
                        </div>
                    </div>
                    <button type="submit" disabled={submitting} className="rounded-xl bg-[#004AC6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0038A8] disabled:opacity-70">
                        {submitting ? 'Sending...' : 'Send Request'}
                    </button>
                </form>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="page-card rounded-3xl p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <MessageSquareHeart size={18} className="text-[#004AC6]" />
                        <h2 className="text-lg font-bold text-gray-900">Incoming Requests</h2>
                    </div>
                    {loading ? <div className="text-sm text-gray-500">Loading…</div> : incoming.length > 0 ? incoming.map((item) => (
                        <div key={item._id} className="mb-3 rounded-xl border p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{item.menteeId?.email || 'Student'}</p>
                                    <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[item.status] || statusStyles.pending}`}>{item.status}</span>
                            </div>
                            {item.status === 'pending' && (
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => handleStatusUpdate(item._id, 'accepted')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Accept</button>
                                    <button onClick={() => handleStatusUpdate(item._id, 'rejected')} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">Decline</button>
                                </div>
                            )}
                        </div>
                    )) : <div className="text-sm text-gray-500">No incoming mentorship requests yet.</div>}
                </div>

                <div className="page-card rounded-3xl p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Clock3 size={18} className="text-[#004AC6]" />
                        <h2 className="text-lg font-bold text-gray-900">Sent Requests</h2>
                    </div>
                    {loading ? <div className="text-sm text-gray-500">Loading…</div> : outgoing.length > 0 ? outgoing.map((item) => (
                        <div key={item._id} className="mb-3 rounded-xl border p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900">Mentor: {item.mentorId?.email || 'Alumni'}</p>
                                    <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[item.status] || statusStyles.pending}`}>{item.status}</span>
                            </div>
                        </div>
                    )) : <div className="text-sm text-gray-500">No sent mentorship requests yet.</div>}
                </div>
            </div>
        </div>
    );
};

export default MentorshipPage;
