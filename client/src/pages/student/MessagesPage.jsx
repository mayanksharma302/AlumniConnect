import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "sonner";

import {
    MessageSquare,
    Send,
    Trash2,
    UserCircle2,
    MoreVertical
} from "lucide-react";

const API_URL = "http://localhost:8000/api";
const SOCKET_URL = "http://localhost:8000";

const MessagesPage = () => {

    /* -------------------------------------------------------
       AUTH
    ------------------------------------------------------- */

    const token = sessionStorage.getItem("accessToken");

    const storedUser = sessionStorage.getItem("user");

    const currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;

    const currentUserId =
        currentUser?._id?.toString();


    /* -------------------------------------------------------
       STATE
    ------------------------------------------------------- */

    const [conversations, setConversations] = useState([]);

    const [activeConversation, setActiveConversation] =
        useState(null);

    const [messages, setMessages] = useState([]);

    const [messageText, setMessageText] =
        useState("");

    const [loadingConversations, setLoadingConversations] =
        useState(false);

    const [loadingMessages, setLoadingMessages] =
        useState(false);

    const [sending, setSending] =
        useState(false);

    const socketRef = useRef(null);

    const messagesEndRef = useRef(null);


    /* -------------------------------------------------------
       ACTIVE OTHER USER
    ------------------------------------------------------- */

    const activeUser = useMemo(() => {

        if (!activeConversation) {
            return null;
        }

        return (
            activeConversation.participants?.find(
                (participant) =>
                    participant._id?.toString() !==
                    currentUserId
            ) || null
        );

    }, [
        activeConversation,
        currentUserId
    ]);


    /* -------------------------------------------------------
       SCROLL TO BOTTOM
    ------------------------------------------------------- */

    const scrollToBottom = () => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    };


    useEffect(() => {

        scrollToBottom();

    }, [messages]);


    /* -------------------------------------------------------
       GET CONVERSATIONS
    ------------------------------------------------------- */

    const fetchConversations = async () => {

        if (!token) {
            return;
        }

        try {

            setLoadingConversations(true);

            const response = await axios.get(
                `${API_URL}/message/conversations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setConversations(
                response.data?.data || []
            );

        } catch (error) {

            console.error(
                "Fetch conversations error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load conversations."
            );

        } finally {

            setLoadingConversations(false);

        }
    };


    /* -------------------------------------------------------
       INITIAL CONVERSATIONS
    ------------------------------------------------------- */

    useEffect(() => {

        fetchConversations();

    }, []);


    /* -------------------------------------------------------
       GET MESSAGES
    ------------------------------------------------------- */

    const fetchMessages = async (receiverId) => {

        if (!receiverId || !token) {
            return;
        }

        try {

            setLoadingMessages(true);

            const response = await axios.get(
                `${API_URL}/message/${receiverId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessages(
                response.data?.data || []
            );

        } catch (error) {

            console.error(
                "Fetch messages error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load messages."
            );

        } finally {

            setLoadingMessages(false);

        }
    };


    /* -------------------------------------------------------
       SELECT CONVERSATION
    ------------------------------------------------------- */

    const handleSelectConversation = (
        conversation
    ) => {

        setActiveConversation(
            conversation
        );

        setMessages([]);

        const otherUser =
            conversation.participants?.find(
                (participant) =>
                    participant._id?.toString() !==
                    currentUserId
            );

        if (otherUser?._id) {

            fetchMessages(
                otherUser._id
            );
        }

    };


    /* -------------------------------------------------------
       SOCKET.IO
    ------------------------------------------------------- */

    useEffect(() => {

        if (!currentUserId) {

            console.warn(
                "Socket.IO: current user ID is missing."
            );

            return;
        }


        console.log(
            "Connecting Socket.IO for:",
            currentUserId
        );


        const socket = io(
            SOCKET_URL,
            {
                query: {
                    userId: currentUserId
                }
            }
        );


        socketRef.current = socket;


        /* CONNECT */

        socket.on("connect", () => {

            console.log(
                "Socket connected:",
                socket.id
            );

        });


        /* CONNECTION ERROR */

        socket.on(
            "connect_error",
            (error) => {

                console.error(
                    "Socket connection error:",
                    error.message
                );

            }
        );


        /* NEW MESSAGE */

        socket.on(
            "newMessage",
            (newMessage) => {

                console.log(
                    "New message received:",
                    newMessage
                );


                const senderId =
                    newMessage.senderId?.toString();


                const activeUserId =
                    activeUser?._id?.toString();


                /*
                 * Only append the message if
                 * it belongs to currently opened chat.
                 */

                if (
                    senderId === activeUserId
                ) {

                    setMessages(
                        (previous) => {

                            const exists =
                                previous.some(
                                    (message) =>
                                        message._id?.toString() ===
                                        newMessage._id?.toString()
                                );


                            if (exists) {
                                return previous;
                            }


                            return [
                                ...previous,
                                newMessage
                            ];

                        }
                    );

                }


                /*
                 * Refresh conversations so
                 * last message appears immediately.
                 */

                fetchConversations();

            }
        );


        /* DISCONNECT */

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    "Socket disconnected:",
                    reason
                );

            }
        );


        /* CLEANUP */

        return () => {

            socket.off(
                "connect"
            );

            socket.off(
                "connect_error"
            );

            socket.off(
                "newMessage"
            );

            socket.off(
                "disconnect"
            );

            socket.disconnect();

            socketRef.current = null;

        };

    }, [currentUserId]);


    /* -------------------------------------------------------
       SEND MESSAGE
    ------------------------------------------------------- */

    const handleSendMessage = async (
        event
    ) => {

        event.preventDefault();


        if (
            !messageText.trim() ||
            !activeUser?._id
        ) {
            return;
        }


        try {

            setSending(true);


            const response = await axios.post(

                `${API_URL}/messages/send`,

                {
                    receiverId:
                        activeUser._id,

                    text:
                        messageText.trim()
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            const sentMessage =
                response.data?.data;


            if (sentMessage) {

                /*
                 * Receiver gets this through Socket.IO.
                 *
                 * Sender does NOT receive the socket event
                 * according to your backend controller,
                 * so add the response manually.
                 */

                setMessages(
                    (previous) => {

                        const exists =
                            previous.some(
                                (message) =>
                                    message._id?.toString() ===
                                    sentMessage._id?.toString()
                            );


                        if (exists) {
                            return previous;
                        }


                        return [
                            ...previous,
                            sentMessage
                        ];

                    }
                );

            }


            setMessageText("");

            fetchConversations();


        } catch (error) {

            console.error(
                "Send message error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to send message."
            );

        } finally {

            setSending(false);

        }
    };


    /* -------------------------------------------------------
       DELETE MESSAGE
    ------------------------------------------------------- */

    const handleDeleteMessage = async (
        messageId
    ) => {

        try {

            await axios.delete(

                `${API_URL}/messages/${messageId}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            setMessages(
                (previous) =>
                    previous.filter(
                        (message) =>
                            message._id?.toString() !==
                            messageId.toString()
                    )
            );


            toast.success(
                "Message deleted."
            );


            fetchConversations();


        } catch (error) {

            console.error(
                "Delete message error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete message."
            );

        }
    };


    /* -------------------------------------------------------
       DELETE CONVERSATION
    ------------------------------------------------------- */

    const handleDeleteConversation = async (
        conversationId
    ) => {

        try {

            await axios.delete(

                `${API_URL}/messages/conversation/${conversationId}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            setConversations(
                (previous) =>
                    previous.filter(
                        (conversation) =>
                            conversation._id?.toString() !==
                            conversationId.toString()
                    )
            );


            setActiveConversation(null);

            setMessages([]);


            toast.success(
                "Conversation deleted."
            );


        } catch (error) {

            console.error(
                "Delete conversation error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete conversation."
            );

        }
    };


    /* -------------------------------------------------------
       FORMAT TIME
    ------------------------------------------------------- */

    const formatTime = (date) => {

        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    /* -------------------------------------------------------
       NO LOGIN
    ------------------------------------------------------- */

    if (!currentUserId) {

        return (

            <div className="flex min-h-[70vh] items-center justify-center">

                <div className="text-center">

                    <h2 className="text-xl font-semibold text-gray-900">
                        Session expired
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Please login again to access your messages.
                    </p>

                </div>

            </div>

        );

    }


    /* -------------------------------------------------------
       UI
    ------------------------------------------------------- */

    return (

        <div className="mx-auto max-w-7xl">

            {/* HEADER */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-gray-900">
                    Messages
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Connect and communicate with your network.
                </p>

            </div>


            {/* MESSAGE CONTAINER */}

            <div className="grid h-[calc(100vh-180px)] min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[340px_1fr]">


                {/* ------------------------------------------------
                   LEFT: CONVERSATIONS
                ------------------------------------------------ */}

                <div className="flex flex-col border-r border-gray-200">

                    {/* SEARCH / TITLE */}

                    <div className="border-b border-gray-200 p-5">

                        <div className="flex items-center gap-2">

                            <MessageSquare
                                size={20}
                                className="text-[#004AC6]"
                            />

                            <h2 className="font-semibold text-gray-900">
                                Conversations
                            </h2>

                        </div>

                    </div>


                    {/* CONVERSATION LIST */}

                    <div className="flex-1 overflow-y-auto p-3">

                        {loadingConversations ? (

                            <div className="p-5 text-center text-sm text-gray-500">
                                Loading conversations...
                            </div>

                        ) : conversations.length === 0 ? (

                            <div className="p-5 text-center">

                                <MessageSquare
                                    size={32}
                                    className="mx-auto text-gray-300"
                                />

                                <p className="mt-3 text-sm text-gray-500">
                                    No conversations yet.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-1">

                                {conversations.map(
                                    (conversation) => {

                                        const participant =
                                            conversation.participants?.find(
                                                (participant) =>
                                                    participant._id?.toString() !==
                                                    currentUserId
                                            );


                                        const isActive =
                                            activeConversation?._id?.toString() ===
                                            conversation._id?.toString();


                                        return (

                                            <div
                                                key={
                                                    conversation._id
                                                }

                                                className={`
                                                    group
                                                    flex
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    p-3
                                                    transition
                                                    ${isActive
                                                        ? "bg-blue-50"
                                                        : "hover:bg-gray-50"
                                                    }
                                                `}
                                            >

                                                {/* USER BUTTON */}

                                                <button
                                                    type="button"

                                                    onClick={() =>
                                                        handleSelectConversation(
                                                            conversation
                                                        )
                                                    }

                                                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                                >

                                                    {participant?.profilePicture ? (

                                                        <img
                                                            src={
                                                                participant.profilePicture
                                                            }

                                                            alt=""

                                                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                                                        />

                                                    ) : (

                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#004AC6] font-semibold text-white">

                                                            {
                                                                participant?.firstName?.charAt(
                                                                    0
                                                                ) || "U"
                                                            }

                                                        </div>

                                                    )}


                                                    <div className="min-w-0 flex-1">

                                                        <p className="truncate text-sm font-semibold text-gray-900">

                                                            {
                                                                participant
                                                                    ? `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
                                                                    : "Unknown User"
                                                            }

                                                        </p>


                                                        <p className="truncate text-xs text-gray-500">

                                                            {
                                                                conversation.lastMessage?.text ||
                                                                "No messages yet"
                                                            }

                                                        </p>

                                                    </div>

                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    type="button"

                                                    onClick={() =>
                                                        handleDeleteConversation(
                                                            conversation._id
                                                        )
                                                    }

                                                    className="hidden rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 group-hover:block"
                                                >

                                                    <Trash2
                                                        size={15}
                                                    />

                                                </button>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>

                </div>


                {/* ------------------------------------------------
                   RIGHT: CHAT
                ------------------------------------------------ */}

                <div className="flex min-w-0 flex-col">


                    {activeUser ? (

                        <>

                            {/* CHAT HEADER */}

                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

                                <div className="flex items-center gap-3">

                                    {activeUser.profilePicture ? (

                                        <img
                                            src={
                                                activeUser.profilePicture
                                            }

                                            alt=""

                                            className="h-10 w-10 rounded-full object-cover"
                                        />

                                    ) : (

                                        <UserCircle2
                                            size={40}
                                            className="text-gray-400"
                                        />

                                    )}


                                    <div>

                                        <h3 className="font-semibold text-gray-900">

                                            {
                                                `${activeUser.firstName || ""} ${activeUser.lastName || ""}`.trim()
                                            }

                                        </h3>

                                        <p className="text-xs text-gray-500">
                                            AlumniConnect
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                                >

                                    <MoreVertical
                                        size={18}
                                    />

                                </button>

                            </div>


                            {/* MESSAGES */}

                            <div className="flex-1 overflow-y-auto bg-[#F8F9FF] p-6">

                                {loadingMessages ? (

                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">

                                        Loading messages...

                                    </div>

                                ) : messages.length === 0 ? (

                                    <div className="flex h-full flex-col items-center justify-center text-center">

                                        <MessageSquare
                                            size={40}
                                            className="text-gray-300"
                                        />

                                        <p className="mt-3 font-medium text-gray-700">
                                            No messages yet
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Start the conversation.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="space-y-3">

                                        {messages.map(
                                            (message) => {

                                                const senderId =
                                                    message.senderId?.toString();


                                                const isMine =
                                                    senderId ===
                                                    currentUserId;


                                                return (

                                                    <div
                                                        key={
                                                            message._id
                                                        }

                                                        className={`
                                                            flex
                                                            ${isMine
                                                                ? "justify-end"
                                                                : "justify-start"
                                                            }
                                                        `}
                                                    >

                                                        <div
                                                            className={`
                                                                group
                                                                max-w-[70%]
                                                                rounded-2xl
                                                                px-4
                                                                py-2.5
                                                                shadow-sm
                                                                ${isMine
                                                                    ? "rounded-br-md bg-[#004AC6] text-white"
                                                                    : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                                                                }
                                                            `}
                                                        >

                                                            <p className="break-words text-sm leading-6">

                                                                {
                                                                    message.text
                                                                }

                                                            </p>


                                                            <div
                                                                className={`
                                                                    mt-1
                                                                    flex
                                                                    items-center
                                                                    justify-end
                                                                    gap-2
                                                                    text-[10px]
                                                                    ${isMine
                                                                        ? "text-blue-100"
                                                                        : "text-gray-400"
                                                                    }
                                                                `}
                                                            >

                                                                <span>

                                                                    {
                                                                        formatTime(
                                                                            message.createdAt
                                                                        )
                                                                    }

                                                                </span>


                                                                {isMine && (

                                                                    <button
                                                                        type="button"

                                                                        onClick={() =>
                                                                            handleDeleteMessage(
                                                                                message._id
                                                                            )
                                                                        }

                                                                        className="opacity-0 transition group-hover:opacity-100"
                                                                    >

                                                                        <Trash2
                                                                            size={11}
                                                                        />

                                                                    </button>

                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>

                                                );

                                            }
                                        )}

                                        <div
                                            ref={
                                                messagesEndRef
                                            }
                                        />

                                    </div>

                                )}

                            </div>


                            {/* MESSAGE INPUT */}

                            <form
                                onSubmit={
                                    handleSendMessage
                                }

                                className="border-t border-gray-200 bg-white p-4"
                            >

                                <div className="flex items-center gap-3">

                                    <input

                                        type="text"

                                        value={
                                            messageText
                                        }

                                        onChange={(
                                            event
                                        ) =>
                                            setMessageText(
                                                event.target.value
                                            )
                                        }

                                        placeholder="Write a message..."

                                        className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#004AC6] focus:ring-4 focus:ring-[#004AC6]/10"

                                    />


                                    <button

                                        type="submit"

                                        disabled={
                                            sending ||
                                            !messageText.trim()
                                        }

                                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004AC6] text-white transition hover:bg-[#0038A8] disabled:cursor-not-allowed disabled:opacity-50"

                                    >

                                        <Send
                                            size={18}
                                        />

                                    </button>

                                </div>

                            </form>

                        </>

                    ) : (

                        <div className="flex h-full flex-col items-center justify-center text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">

                                <MessageSquare
                                    size={28}
                                    className="text-[#004AC6]"
                                />

                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900">
                                Select a conversation
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-gray-500">
                                Select a conversation from the left to start messaging.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
};

export default MessagesPage;