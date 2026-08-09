import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { MessageSquare, Send, Trash2, ArrowLeft, UserCircle2, MessageCircleX } from 'lucide-react';

const MessagesPage = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatTarget, setChatTarget] = useState(location.state?.chatTarget || null);

    const token = sessionStorage.getItem('accessToken');
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchConversations = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8000/api/messages/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                const nextConversations = response.data.data || [];
                setConversations(nextConversations);

                if (chatTarget?._id) {
                    const matchingConversation = nextConversations.find((conv) =>
                        conv.participants?.some((participant) => participant._id?.toString() === chatTarget._id.toString())
                    );
                    if (matchingConversation) {
                        setActiveConversation(matchingConversation);
                        return;
                    }
                }

                if (!activeConversation && nextConversations.length > 0) {
                    setActiveConversation(nextConversations[0]);
                }
            }
        } catch (err) {
            toast.error('Unable to load conversations.');
        }
    };

    const fetchMessages = async (receiverId) => {
        if (!token || !receiverId) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/messages/${receiverId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                setMessages(response.data.data || []);
            }
        } catch (err) {
            toast.error('Unable to load messages.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [token]);

    useEffect(() => {
        const chatIdFromState = location.state?.chatTarget?._id;
        const chatIdFromUrl = new URLSearchParams(location.search).get('chat');
        const targetId = chatIdFromState || chatIdFromUrl;

        if (!targetId) {
            setChatTarget(null);
            return;
        }

        if (chatTarget?._id?.toString() === targetId.toString()) {
            return;
        }

        const loadChatTarget = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/profile/get-profile/${targetId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data?.profile) {
                    const profile = response.data.profile;
                    setChatTarget({
                        _id: targetId,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        profilePicture: profile.profilePicture
                    });
                } else {
                    setChatTarget({ _id: targetId, firstName: 'User', lastName: '' });
                }
            } catch (err) {
                setChatTarget({ _id: targetId, firstName: 'User', lastName: '' });
            }
        };

        loadChatTarget();
    }, [location.search, location.state, token]);

    useEffect(() => {
        if (chatTarget?._id) {
            fetchMessages(chatTarget._id);
            return;
        }

        if (!activeConversation) return;
        const participant = activeConversation.participants?.find((p) => p._id !== currentUser._id);
        if (participant) {
            fetchMessages(participant._id);
        }
    }, [activeConversation, chatTarget?._id]);

    const activeParticipant = useMemo(() => {
        if (chatTarget) {
            return chatTarget;
        }
        if (!activeConversation) return null;
        return activeConversation.participants?.find((p) => p._id !== currentUser._id) || null;
    }, [activeConversation, chatTarget, currentUser._id]);

    const handleSend = async (e) => {
        e.preventDefault();
        const recipientId = activeParticipant?._id || chatTarget?._id;
        if (!draft.trim() || !recipientId) return;
        try {
            await axios.post('http://localhost:8000/api/messages/send', {
                receiverId: recipientId,
                text: draft.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDraft('');
            fetchMessages(recipientId);
            fetchConversations();
        } catch (err) {
            toast.error('Unable to send message.');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await axios.delete(`http://localhost:8000/api/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Message deleted.');
            fetchMessages(activeParticipant?._id);
            fetchConversations();
        } catch (err) {
            toast.error('Unable to delete message.');
        }
    };

    const handleDeleteConversation = async (conversationId) => {
        try {
            await axios.delete(`http://localhost:8000/api/messages/conversation/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Conversation deleted.');
            setActiveConversation(null);
            setMessages([]);
            fetchConversations();
        } catch (err) {
            toast.error('Unable to delete conversation.');
        }
    };

    return (
        <div className="space-y-4 max-w-6xl mx-auto animate-fade-in pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-500">Continue conversations with your alumni and student network.</p>
            </div>

            <div className="grid min-h-[70vh] gap-4 page-card rounded-3xl overflow-hidden shadow-sm lg:grid-cols-[1fr_2fr]">
                <aside className="border-b p-4 lg:border-b-0 lg:border-r">
                    <div className="mb-4 flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#004AC6]" />
                        <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                    </div>
                    <div className="space-y-2">
                        {conversations.length > 0 ? conversations.map((conv) => {
                            const participant = conv.participants?.find((p) => p._id !== currentUser._id);
                            return (
                                <div key={conv._id} className={`rounded-xl border p-3 transition ${activeConversation?._id === conv._id ? 'border-[#004AC6] bg-blue-50' : 'hover:bg-gray-50'}`}>
                                    <button onClick={() => setActiveConversation(conv)} className="flex w-full items-center gap-3 text-left">
                                        {participant?.profilePicture ? <img src={participant.profilePicture} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004AC6] text-sm font-semibold text-white">{participant?.firstName?.[0] || 'U'}</div>}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-gray-900">{participant ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim() : 'Conversation'}</p>
                                            <p className="truncate text-sm text-gray-500">{conv.lastMessage?.text || 'Start a conversation'}</p>
                                        </div>
                                    </button>
                                    <button onClick={() => handleDeleteConversation(conv._id)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700">
                                        <MessageCircleX size={14} /> Delete conversation
                                    </button>
                                </div>
                            );
                        }) : <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">No conversations yet.</div>}
                    </div>
                </aside>

                <section className="flex flex-col p-4">
                    {activeParticipant ? (
                        <>
                            <div className="mb-4 flex items-center gap-3 border-b pb-4">
                                {activeParticipant.profilePicture ? <img src={activeParticipant.profilePicture} alt="" className="h-10 w-10 rounded-full object-cover" /> : <UserCircle2 size={40} className="text-gray-400" />}
                                <div>
                                    <h3 className="font-semibold text-gray-900">{`${activeParticipant.firstName || ''} ${activeParticipant.lastName || ''}`.trim()}</h3>
                                    <p className="text-sm text-gray-500">Direct message</p>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-gray-50 p-4">
                                {loading ? <div className="text-sm text-gray-500">Loading messages…</div> : messages.length > 0 ? messages.map((message) => {
                                    const isMine = message.senderId?.toString() === currentUser._id?.toString();
                                    return (
                                        <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-[#004AC6] text-white' : 'bg-white text-gray-700 border'}`}>
                                                <p>{message.text}</p>
                                                <div className={`mt-1 flex items-center justify-between gap-2 text-[10px] ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                                                    {isMine && (
                                                        <button onClick={() => handleDeleteMessage(message._id)} className="inline-flex items-center gap-1 hover:opacity-80">
                                                            <Trash2 size={12} /> delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : <div className="text-sm text-gray-500">No messages yet. Start the conversation.</div>}
                            </div>
                            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message..." className="flex-1 rounded-xl border px-3 py-2" />
                                <button type="submit" className="rounded-xl bg-[#004AC6] px-4 py-2 text-white">
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-sm text-gray-500">Select a conversation to start chatting.</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MessagesPage;
