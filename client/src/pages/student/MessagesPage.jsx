import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "sonner";

import {
    MessageSquare,
    Send,
    Trash2,
    UserCircle2,
    MoreVertical,
    Search,
    Paperclip,
    Image as ImageIcon,
    Info,
    X,
    ChevronLeft,
    Check,
    CheckCheck,
    Loader2,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";


const API_URL = "http://localhost:8000/api";
const SOCKET_URL = "http://localhost:8000";


const MessagesPage = () => {

    /* =====================================================
       AUTH
    ===================================================== */

    const token =
        sessionStorage.getItem(
            "accessToken"
        );

    const storedUser =
        sessionStorage.getItem("user");

    const currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;

    const currentUserId =
        currentUser?._id?.toString();


    /* =====================================================
       ROUTER
    ===================================================== */

    const [searchParams] =
        useSearchParams();

    const chatUserId =
        searchParams.get("chat");


    /* =====================================================
       STATE
    ===================================================== */

    const [
        conversations,
        setConversations,
    ] = useState([]);

    const [
        activeConversation,
        setActiveConversation,
    ] = useState(null);

    const [
        messages,
        setMessages,
    ] = useState([]);

    const [
        messageText,
        setMessageText,
    ] = useState("");

    const [
        conversationSearch,
        setConversationSearch,
    ] = useState("");

    const [
        loadingConversations,
        setLoadingConversations,
    ] = useState(false);

    const [
        loadingMessages,
        setLoadingMessages,
    ] = useState(false);

    const [
        sending,
        setSending,
    ] = useState(false);

    const [
        deletingConversation,
        setDeletingConversation,
    ] = useState(false);

    const [
        showMobileChat,
        setShowMobileChat,
    ] = useState(false);


    /* =====================================================
       REFS
    ===================================================== */

    const socketRef =
        useRef(null);

    const messagesEndRef =
        useRef(null);

    const inputRef =
        useRef(null);


    /* =====================================================
       ACTIVE USER
    ===================================================== */

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
        currentUserId,
    ]);


    /* =====================================================
       FILTERED CONVERSATIONS
    ===================================================== */

    const filteredConversations =
        useMemo(() => {

            const query =
                conversationSearch
                    .trim()
                    .toLowerCase();

            if (!query) {
                return conversations;
            }

            return conversations.filter(
                (conversation) => {

                    const participant =
                        conversation.participants?.find(
                            (participant) =>
                                participant._id?.toString() !==
                                currentUserId
                        );

                    const name =
                        `${participant?.firstName || ""} ${participant?.lastName || ""
                            }`.trim();

                    const lastMessage =
                        conversation
                            .lastMessage
                            ?.text || "";

                    return `${name} ${lastMessage}`
                        .toLowerCase()
                        .includes(query);
                }
            );

        }, [
            conversations,
            conversationSearch,
            currentUserId,
        ]);


    /* =====================================================
       SCROLL
    ===================================================== */

    const scrollToBottom = (
        behavior = "smooth"
    ) => {

        messagesEndRef.current?.scrollIntoView(
            {
                behavior,
            }
        );

    };


    useEffect(() => {

        if (!loadingMessages) {
            scrollToBottom();
        }

    }, [
        messages,
        loadingMessages,
    ]);


    /* =====================================================
       FETCH CONVERSATIONS
    ===================================================== */

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
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const rawConversations =
                response.data?.data || [];

            /*
             * Enrich each participant with
             * their Profile data.
             */
            const enrichedConversations =
                await Promise.all(
                    rawConversations.map(
                        async (conversation) => {

                            const participants =
                                await Promise.all(
                                    (
                                        conversation.participants ||
                                        []
                                    ).map(
                                        async (participant) => {

                                            const participantId =
                                                participant?._id;

                                            if (
                                                !participantId
                                            ) {
                                                return participant;
                                            }

                                            /*
                                             * If profile information
                                             * is already populated,
                                             * don't fetch again.
                                             */
                                            if (
                                                participant.firstName ||
                                                participant.lastName ||
                                                participant.profilePicture
                                            ) {
                                                return participant;
                                            }

                                            try {

                                                const profileResponse =
                                                    await axios.get(
                                                        `${API_URL}/profile/get-profile/${participantId}`,
                                                        {
                                                            headers: {
                                                                Authorization:
                                                                    `Bearer ${token}`,
                                                            },
                                                        }
                                                    );

                                                const profile =
                                                    profileResponse
                                                        .data
                                                        ?.profile;

                                                if (
                                                    profile
                                                ) {

                                                    return {
                                                        ...participant,
                                                        firstName:
                                                            profile.firstName,
                                                        lastName:
                                                            profile.lastName,
                                                        profilePicture:
                                                            profile.profilePicture,
                                                        professionalHeadline:
                                                            profile.professionalHeadline,
                                                        skills:
                                                            profile.skills,
                                                        location:
                                                            profile.location,
                                                    };

                                                }

                                            } catch (
                                            profileError
                                            ) {

                                                console.error(
                                                    `Unable to fetch profile for ${participantId}:`,
                                                    profileError
                                                );

                                            }

                                            return participant;
                                        }
                                    )
                                );

                            return {
                                ...conversation,
                                participants,
                            };
                        }
                    )
                );

            console.log(
                "Enriched conversations:",
                enrichedConversations
            );

            setConversations(
                enrichedConversations
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


    /* =====================================================
       FETCH MESSAGES
    ===================================================== */

    const fetchMessages =
        async (receiverId) => {

            if (
                !receiverId ||
                !token
            ) {
                return;
            }

            try {

                setLoadingMessages(
                    true
                );

                const response =
                    await axios.get(
                        `${API_URL}/message/${receiverId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                setMessages(
                    response.data?.data ||
                    []
                );

            } catch (error) {

                console.error(
                    "Fetch messages error:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to load messages."
                );

            } finally {

                setLoadingMessages(
                    false
                );

            }

        };


    /* =====================================================
       SELECT CONVERSATION
    ===================================================== */

    const handleSelectConversation =
        async (conversation) => {

            setActiveConversation(
                conversation
            );

            setMessages([]);

            setShowMobileChat(
                true
            );

            const otherUser =
                conversation.participants?.find(
                    (participant) =>
                        participant._id?.toString() !==
                        currentUserId
                );

            if (otherUser?._id) {

                await fetchMessages(
                    otherUser._id
                );

            }

        };


    /* =====================================================
       OPEN CHAT FROM MENTORSHIP
    ===================================================== */

    useEffect(() => {

        if (
            !chatUserId ||
            !conversations.length ||
            !currentUserId
        ) {
            return;
        }

        const conversation =
            conversations.find(
                (item) =>
                    item.participants?.some(
                        (participant) =>
                            participant._id?.toString() ===
                            chatUserId
                    )
            );

        if (conversation) {

            handleSelectConversation(
                conversation
            );

        }

    }, [
        chatUserId,
        conversations,
        currentUserId,
    ]);


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchConversations();

    }, []);


    /* =====================================================
       SOCKET.IO
    ===================================================== */

    useEffect(() => {

        if (!currentUserId) {
            return;
        }

        const socket =
            io(SOCKET_URL, {
                query: {
                    userId:
                        currentUserId,
                },
            });

        socketRef.current =
            socket;


        socket.on(
            "connect",
            () => {

                console.log(
                    "Socket connected:",
                    socket.id
                );

            }
        );


        socket.on(
            "connect_error",
            (error) => {

                console.error(
                    "Socket connection error:",
                    error.message
                );

            }
        );


        socket.on(
            "newMessage",
            (newMessage) => {

                console.log(
                    "New message:",
                    newMessage
                );


                const senderId =
                    newMessage.senderId?.toString();

                const activeUserId =
                    activeUser?._id?.toString();


                /*
                 * Only append if the
                 * message belongs to
                 * currently opened chat.
                 */

                if (
                    senderId ===
                    activeUserId
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
                                newMessage,
                            ];

                        }
                    );

                }


                /*
                 * Always refresh inbox
                 * because the latest
                 * message may belong
                 * to another chat.
                 */

                fetchConversations();

            }
        );


        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    "Socket disconnected:",
                    reason
                );

            }
        );


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

            socketRef.current =
                null;

        };

    }, [
        currentUserId,
        activeUser?._id,
    ]);


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    const handleSendMessage =
        async (event) => {

            event.preventDefault();

            if (
                !messageText.trim() ||
                !activeUser?._id ||
                sending
            ) {
                return;
            }

            try {

                setSending(true);

                const response =
                    await axios.post(
                        `${API_URL}/message/send`,
                        {
                            receiverId:
                                activeUser._id,

                            text:
                                messageText.trim(),
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                const sentMessage =
                    response.data?.data;


                /*
                 * Sender does not necessarily
                 * receive its own socket event,
                 * so immediately append the
                 * response.
                 */

                if (sentMessage) {

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
                                sentMessage,
                            ];

                        }
                    );

                }


                setMessageText("");

                await fetchConversations();

                inputRef.current?.focus();

            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to send message."
                );

            } finally {

                setSending(false);

            }

        };


    /* =====================================================
       DELETE MESSAGE
    ===================================================== */

    const handleDeleteMessage =
        async (messageId) => {

            try {

                await axios.delete(
                    `${API_URL}/message/${messageId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
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
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to delete message."
                );

            }

        };


    /* =====================================================
       DELETE CONVERSATION
    ===================================================== */

    const handleDeleteConversation =
        async (conversationId) => {

            const confirmed =
                window.confirm(
                    "Delete this entire conversation?"
                );

            if (!confirmed) {
                return;
            }

            try {

                setDeletingConversation(
                    true
                );

                await axios.delete(
                    `${API_URL}/message/conversation/${conversationId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
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


                if (
                    activeConversation?._id?.toString() ===
                    conversationId.toString()
                ) {

                    setActiveConversation(
                        null
                    );

                    setMessages([]);

                    setShowMobileChat(
                        false
                    );

                }


                toast.success(
                    "Conversation deleted."
                );

            } catch (error) {

                console.error(
                    "Delete conversation error:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to delete conversation."
                );

            } finally {

                setDeletingConversation(
                    false
                );

            }

        };


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    const formatTime = (
        date
    ) => {

        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    /* =====================================================
       FORMAT CONVERSATION TIME
    ===================================================== */

    const formatConversationTime =
        (date) => {

            if (!date) {
                return "";
            }

            const messageDate =
                new Date(date);

            const now =
                new Date();

            const diff =
                now - messageDate;

            const minutes =
                Math.floor(
                    diff / 60000
                );

            if (
                minutes < 1
            ) {
                return "now";
            }

            if (
                minutes < 60
            ) {
                return `${minutes}m`;
            }

            const hours =
                Math.floor(
                    minutes / 60
                );

            if (
                hours < 24
            ) {
                return `${hours}h`;
            }

            const days =
                Math.floor(
                    hours / 24
                );

            if (
                days < 7
            ) {
                return `${days}d`;
            }

            return messageDate.toLocaleDateString(
                [],
                {
                    day: "numeric",
                    month: "short",
                }
            );

        };


    /* =====================================================
       DISPLAY NAME
    ===================================================== */

    const getDisplayName =
        (user) => {

            if (!user) {
                return "Unknown User";
            }

            const name =
                `${user.firstName || ""} ${user.lastName || ""
                    }`.trim();

            return (
                name ||
                user.email ||
                "Unknown User"
            );

        };


    /* =====================================================
       INITIALS
    ===================================================== */

    const getInitials =
        (user) => {

            const name =
                getDisplayName(
                    user
                );

            return name
                .split(" ")
                .filter(Boolean)
                .map(
                    (word) =>
                        word[0]
                )
                .join("")
                .slice(0, 2)
                .toUpperCase();

        };


    /* =====================================================
       NO LOGIN
    ===================================================== */

    if (!currentUserId) {

        return (

            <div className="flex min-h-[70vh] items-center justify-center">

                <div className="text-center">

                    <MessageSquare
                        size={40}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="mt-4 text-xl font-semibold text-gray-900">
                        Session expired
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Please login again to
                        access your messages.
                    </p>

                </div>

            </div>

        );

    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="h-[calc(100vh-100px)] min-h-[600px]">

            <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_300px]">


                    {/* =================================================
                       CONVERSATION LIST
                    ================================================= */}

                    <section
                        className={`
                            flex h-full flex-col border-r border-gray-200 bg-white
                            ${showMobileChat
                                ? "hidden lg:flex"
                                : "flex"
                            }
                        `}
                    >

                        {/* HEADER */}

                        <header className="border-b border-gray-200 p-5">

                            <div className="mb-4 flex items-center justify-between">

                                <div>

                                    <h2 className="text-lg font-bold text-gray-900">
                                        Messages
                                    </h2>

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        Your conversations
                                    </p>

                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">
                                    <MessageSquare
                                        size={
                                            17
                                        }
                                    />
                                </div>

                            </div>


                            {/* SEARCH */}

                            <div className="relative">

                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    value={
                                        conversationSearch
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setConversationSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search conversations..."
                                    className="h-9 w-full rounded-lg border border-gray-200 bg-[#F8F9FF] pl-9 pr-3 text-xs outline-none transition focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </header>


                        {/* CONVERSATIONS */}

                        <div className="flex-1 overflow-y-auto p-2">

                            {loadingConversations ? (

                                <div className="flex h-40 items-center justify-center">

                                    <Loader2
                                        size={
                                            20
                                        }
                                        className="animate-spin text-[#004AC6]"
                                    />

                                </div>

                            ) : filteredConversations.length ===
                                0 ? (

                                <div className="flex h-full flex-col items-center justify-center px-5 text-center">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">

                                        <MessageSquare
                                            size={
                                                22
                                            }
                                            className="text-[#004AC6]"
                                        />

                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-gray-700">
                                        No conversations
                                    </p>

                                    <p className="mt-1 text-[11px] leading-5 text-gray-400">
                                        Start a conversation
                                        with someone from
                                        your network.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-1">

                                    {filteredConversations.map(
                                        (
                                            conversation
                                        ) => {

                                            const participant =
                                                conversation.participants?.find(
                                                    (
                                                        participant
                                                    ) =>
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
                                                        group flex items-center gap-3 rounded-xl p-3 transition
                                                        ${isActive
                                                            ? "border-r-2 border-[#004AC6] bg-blue-50"
                                                            : "hover:bg-gray-50"
                                                        }
                                                    `}
                                                >

                                                    {/* PROFILE */}

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

                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#004AC6] text-xs font-bold text-white">

                                                                {getInitials(
                                                                    participant
                                                                )}

                                                            </div>

                                                        )}


                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-center justify-between gap-2">

                                                                <p className="truncate text-xs font-bold text-gray-900">

                                                                    {getDisplayName(
                                                                        participant
                                                                    )}

                                                                </p>

                                                                <span className="shrink-0 text-[9px] text-gray-400">

                                                                    {formatConversationTime(
                                                                        conversation.lastMessage?.createdAt ||
                                                                        conversation.updatedAt
                                                                    )}

                                                                </span>

                                                            </div>


                                                            <p className="mt-1 truncate text-[10px] text-gray-500">

                                                                {conversation.lastMessage?.text ||
                                                                    "No messages yet"}

                                                            </p>

                                                        </div>

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            deletingConversation
                                                        }
                                                        onClick={() =>
                                                            handleDeleteConversation(
                                                                conversation._id
                                                            )
                                                        }
                                                        className="hidden rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 group-hover:block"
                                                    >

                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />

                                                    </button>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                        </div>

                    </section>


                    {/* =================================================
                       CHAT
                    ================================================= */}

                    <section
                        className={`
                            flex h-full min-w-0 flex-col bg-white
                            ${showMobileChat
                                ? "flex"
                                : "hidden lg:flex"
                            }
                        `}
                    >

                        {activeUser ? (

                            <>

                                {/* CHAT HEADER */}

                                <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-5">

                                    <div className="flex min-w-0 items-center gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowMobileChat(
                                                    false
                                                )
                                            }
                                            className="mr-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                                        >
                                            <ChevronLeft
                                                size={
                                                    18
                                                }
                                            />
                                        </button>


                                        {activeUser.profilePicture ? (

                                            <img
                                                src={
                                                    activeUser.profilePicture
                                                }
                                                alt=""
                                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                            />

                                        ) : (

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004AC6]">

                                                {getInitials(
                                                    activeUser
                                                )}

                                            </div>

                                        )}


                                        <div className="min-w-0">

                                            <h3 className="truncate text-sm font-bold text-gray-900">
                                                {getDisplayName(
                                                    activeUser
                                                )}
                                            </h3>

                                            <p className="truncate text-[10px] text-gray-400">
                                                AlumniConnect
                                            </p>

                                        </div>

                                    </div>


                                    <div className="flex items-center gap-1">

                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            <Info
                                                size={
                                                    17
                                                }
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            <MoreVertical
                                                size={
                                                    17
                                                }
                                            />
                                        </button>

                                    </div>

                                </header>


                                {/* MENTORSHIP BANNER */}

                                <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50/50 px-5 py-3">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#004AC6]">
                                        <MessageSquare
                                            size={
                                                15
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#004AC6]">
                                            Professional
                                            Conversation
                                        </p>

                                        <p className="truncate text-[10px] font-semibold text-gray-700">
                                            Connect, ask questions,
                                            and share career guidance.
                                        </p>

                                    </div>

                                </div>


                                {/* MESSAGES */}

                                <div className="flex-1 overflow-y-auto bg-[#F8F9FF] p-4 sm:p-6">

                                    {loadingMessages ? (

                                        <div className="flex h-full items-center justify-center">

                                            <div className="text-center">

                                                <Loader2
                                                    size={
                                                        24
                                                    }
                                                    className="mx-auto animate-spin text-[#004AC6]"
                                                />

                                                <p className="mt-3 text-xs text-gray-400">
                                                    Loading messages...
                                                </p>

                                            </div>

                                        </div>

                                    ) : messages.length ===
                                        0 ? (

                                        <div className="flex h-full flex-col items-center justify-center text-center">

                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">

                                                <MessageSquare
                                                    size={
                                                        28
                                                    }
                                                    className="text-[#004AC6]"
                                                />

                                            </div>

                                            <h3 className="mt-4 text-sm font-bold text-gray-800">
                                                Start a conversation
                                            </h3>

                                            <p className="mt-1 max-w-xs text-[11px] leading-5 text-gray-400">
                                                Say hello to{" "}
                                                {
                                                    activeUser.firstName
                                                }{" "}
                                                and start
                                                connecting.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="space-y-4">

                                            {messages.map(
                                                (
                                                    message
                                                ) => {

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
                                                            className={`flex ${isMine
                                                                ? "justify-end"
                                                                : "justify-start"
                                                                }`}
                                                        >

                                                            <div
                                                                className={`
                                                                    group relative max-w-[80%] sm:max-w-[70%]
                                                                    rounded-2xl px-4 py-2.5 shadow-sm
                                                                    ${isMine
                                                                        ? "rounded-br-md bg-[#004AC6] text-white"
                                                                        : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                                                                    }
                                                                `}
                                                            >

                                                                <p className="break-words text-xs leading-5 sm:text-sm sm:leading-6">
                                                                    {
                                                                        message.text
                                                                    }
                                                                </p>


                                                                <div
                                                                    className={`
                                                                        mt-1 flex items-center justify-end gap-2 text-[9px]
                                                                        ${isMine
                                                                            ? "text-blue-100"
                                                                            : "text-gray-400"
                                                                        }
                                                                    `}
                                                                >

                                                                    <span>
                                                                        {formatTime(
                                                                            message.createdAt
                                                                        )}
                                                                    </span>


                                                                    {isMine && (
                                                                        <CheckCheck
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    )}


                                                                    {isMine && (

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteMessage(
                                                                                    message._id
                                                                                )
                                                                            }
                                                                            className="ml-1 rounded p-0.5 opacity-0 transition group-hover:opacity-100 hover:bg-white/10"
                                                                            title="Delete message"
                                                                        >
                                                                            <Trash2
                                                                                size={
                                                                                    11
                                                                                }
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


                                {/* COMPOSER */}

                                <footer className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">

                                    <form
                                        onSubmit={
                                            handleSendMessage
                                        }
                                    >

                                        <div className="rounded-xl border border-gray-200 bg-[#F8F9FF] p-2 transition focus-within:border-[#004AC6] focus-within:ring-2 focus-within:ring-blue-100">

                                            <textarea
                                                ref={
                                                    inputRef
                                                }
                                                value={
                                                    messageText
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setMessageText(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                onKeyDown={(
                                                    event
                                                ) => {

                                                    if (
                                                        event.key ===
                                                        "Enter" &&
                                                        !event.shiftKey
                                                    ) {

                                                        event.preventDefault();

                                                        handleSendMessage(
                                                            event
                                                        );

                                                    }

                                                }}
                                                rows={
                                                    2
                                                }
                                                maxLength={
                                                    2000
                                                }
                                                placeholder={`Write a message to ${activeUser.firstName || "your connection"}...`}
                                                className="w-full resize-none border-none bg-transparent px-2 py-1.5 text-xs leading-5 text-gray-700 outline-none focus:ring-0 sm:text-sm"
                                            />


                                            <div className="flex items-center justify-between border-t border-gray-200/70 pt-2">

                                                <div className="flex gap-1"></div>

                                                <div className="flex items-center gap-2">

                                                    <span className="hidden text-[9px] text-gray-400 sm:block">
                                                        Enter to
                                                        send ·
                                                        Shift+Enter
                                                        for new line
                                                    </span>

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            sending ||
                                                            !messageText.trim()
                                                        }
                                                        className="flex h-9 items-center gap-2 rounded-lg bg-[#004AC6] px-4 text-xs font-semibold text-white transition hover:bg-[#0038A8] disabled:cursor-not-allowed disabled:opacity-50"
                                                    >

                                                        {sending ? (

                                                            <Loader2
                                                                size={
                                                                    14
                                                                }
                                                                className="animate-spin"
                                                            />

                                                        ) : (

                                                            <Send
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                        )}

                                                        <span>
                                                            Send
                                                        </span>

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </form>

                                </footer>

                            </>

                        ) : (

                            <div className="flex h-full flex-col items-center justify-center bg-[#F8F9FF] px-5 text-center">

                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">

                                    <MessageSquare
                                        size={
                                            32
                                        }
                                        className="text-[#004AC6]"
                                    />

                                </div>

                                <h3 className="mt-5 text-base font-bold text-gray-800">
                                    Select a conversation
                                </h3>

                                <p className="mt-2 max-w-sm text-xs leading-5 text-gray-400">
                                    Select a conversation from
                                    the left to start messaging
                                    with your network.
                                </p>

                            </div>

                        )}

                    </section>


                    {/* =================================================
                       PROFILE PANEL
                    ================================================= */}

                    {activeUser && (

                        <aside className="hidden h-full overflow-y-auto border-l border-gray-200 bg-white xl:block">

                            <div className="p-5">

                                <div className="text-center">

                                    {activeUser.profilePicture ? (

                                        <img
                                            src={
                                                activeUser.profilePicture
                                            }
                                            alt=""
                                            className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-blue-50"
                                        />

                                    ) : (

                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-[#004AC6]">
                                            {getInitials(
                                                activeUser
                                            )}
                                        </div>

                                    )}


                                    <h3 className="mt-4 text-sm font-bold text-gray-900">
                                        {getDisplayName(
                                            activeUser
                                        )}
                                    </h3>

                                    <p className="mt-1 text-[10px] text-[#004AC6]">
                                        AlumniConnect
                                    </p>


                                    <div className="mt-4">

                                        <button
                                            type="button"
                                            className="w-full rounded-lg bg-[#004AC6] py-2.5 text-xs font-semibold text-white transition hover:bg-[#0038A8]"
                                        >
                                            View Profile
                                        </button>

                                    </div>

                                </div>


                                <div className="my-6 border-t border-gray-200" />


                                <div>

                                    <h4 className="text-[9px] font-black uppercase tracking-[2px] text-gray-400">
                                        Conversation
                                    </h4>

                                    <div className="mt-3 rounded-xl border border-gray-200 bg-[#F8F9FF] p-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">
                                                <MessageSquare
                                                    size={
                                                        16
                                                    }
                                                />
                                            </div>

                                            <div>

                                                <p className="text-[10px] font-bold text-gray-700">
                                                    Direct Message
                                                </p>

                                                <p className="mt-0.5 text-[9px] text-gray-400">
                                                    Professional
                                                    connection
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                <div className="mt-5">

                                    <h4 className="text-[9px] font-black uppercase tracking-[2px] text-gray-400">
                                        Quick Actions
                                    </h4>

                                    <div className="mt-2 space-y-1">

                                        <button
                                            type="button"
                                            className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-50"
                                        >

                                            <Info
                                                size={
                                                    15
                                                }
                                            />

                                            View connection
                                            details

                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                activeConversation &&
                                                handleDeleteConversation(
                                                    activeConversation._id
                                                )
                                            }
                                            className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-xs font-medium text-red-500 hover:bg-red-50"
                                        >

                                            <Trash2
                                                size={
                                                    15
                                                }
                                            />

                                            Delete conversation

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </aside>

                    )}

                </div>

            </div>

        </div>

    );

};


export default MessagesPage;