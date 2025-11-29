import React, { useState, useEffect, useRef, useMemo } from "react";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import socket, {
  authenticateSocket,
  joinRoom,
  onReceiveMessage,
  offReceiveMessage,
} from "../services/websocket";

const UserChatDashboard = () => {
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get user ID and fetch conversations on mount
  useEffect(() => {
    const getUserAndFetchConversations = async () => {
      try {
        const response = await axios.get("/api/user/is-auth", {
          withCredentials: true,
        });
        if (response.data.success && response.data.userId) {
          setUserId(response.data.userId);
          // Authenticate socket connection
          authenticateSocket(response.data.userId, "user");
          await fetchConversations();
        } else {
          toast.error("Please login to access messages");
        }
      } catch (error) {
        toast.error("Please login to access messages");
        console.error("Auth error:", error);
      }
    };

    getUserAndFetchConversations();

    // Set up socket event listeners
    const handleReceiveMessage = (messageData) => {
      // Check if message already exists to prevent duplication
      const messageExists = messages.some(
        (msg) =>
          msg.content === messageData.content &&
          new Date(msg.createdAt).getTime() ===
            new Date(messageData.timestamp).getTime()
      );

      if (!messageExists) {
        // Add received message to messages list
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now() + Math.random(), // unique ID
            content: messageData.content,
            sender: { _id: messageData.senderId },
            receiver: {
              _id:
                messageData.senderId === userId
                  ? messageData.otherUserId
                  : userId,
            },
            createdAt: messageData.timestamp,
          },
        ]);
      }
    };

    onReceiveMessage(handleReceiveMessage);

    // Clean up socket event listeners
    return () => {
      offReceiveMessage(handleReceiveMessage);
    };
  }, [userId, messages]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (
      selectedConversation?.otherUser?._id &&
      selectedConversation?.product?._id
    ) {
      console.log("Fetching messages for:", {
        productId: selectedConversation.product._id,
        otherUserId: selectedConversation.otherUser._id,
        conversation: selectedConversation,
      });

      // Join the chat room
      joinRoom(
        selectedConversation.product._id,
        selectedConversation.otherUser._id
      );
      fetchMessages(
        selectedConversation.product._id,
        selectedConversation.otherUser._id
      );
    } else {
      console.log("Cannot fetch messages - missing data:", {
        otherUser: selectedConversation?.otherUser,
        product: selectedConversation?.product,
        selectedConversation,
      });
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Memoize filtered conversations
  const validConversations = useMemo(
    () =>
      conversations.filter(
        (conv) =>
          conv &&
          conv._id &&
          conv.product &&
          conv.otherUser &&
          conv.lastMessage &&
          conv.lastMessage.content
      ),
    [conversations]
  );

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await axios.get("/api/message/conversations", {
        withCredentials: true,
      });
      if (response.data.success) {
        const conversations = response.data.data || [];
        setConversations(conversations);
        console.log("Conversations loaded:", conversations);

        // Auto-select the first conversation if none is selected and conversations exist
        if (conversations.length > 0 && !selectedConversation) {
          const firstConv = conversations[0];
          if (firstConv?.otherUser?._id && firstConv?.product?._id) {
            setSelectedConversation(firstConv);
          }
        }
      } else {
        toast.error(response.data.message || "Failed to load conversations");
        setConversations([]);
      }
    } catch (error) {
      toast.error("Failed to load conversations");
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (productId, otherUserId) => {
    try {
      setLoadingMessages(true);
      const response = await axios.get(
        `/api/message/product/${productId}/user/${otherUserId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to load messages");
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !selectedConversation?.product?._id ||
      !selectedConversation?.otherUser?._id ||
      !userId
    ) {
      toast.error("Please select a conversation and enter a message");
      return;
    }

    try {
      setSending(true);
      const messageContent = newMessage.trim();

      // Send via WebSocket for real-time delivery
      socket.emit("sendMessage", {
        productId: selectedConversation.product._id,
        otherUserId: selectedConversation.otherUser._id,
        content: messageContent,
        senderId: userId,
        senderType: "user",
      });

      // Add message to UI immediately (optimistic update)
      const tempMessage = {
        _id: Date.now() + Math.random(),
        content: messageContent,
        sender: { _id: userId },
        receiver: { _id: selectedConversation.otherUser._id },
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      // Also send via HTTP for persistence
      const response = await axios.post(
        "/api/message",
        {
          receiverId: selectedConversation.otherUser._id,
          productId: selectedConversation.product._id,
          content: messageContent,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Replace temporary message with the actual one from server
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg._id !== tempMessage._id);
          return [...filtered, response.data.data];
        });

        // Refresh conversations to update the last message
        fetchConversations();
        toast.success("Message sent successfully");
      } else {
        // Remove temporary message if failed
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== tempMessage._id)
        );
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diffHours = (now - msgTime) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return msgTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return msgTime.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex h-screen flex-1">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r h-full overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Conversations</h2>
          <p className="text-sm text-gray-500">
            User ID: {userId || "Not loaded"}
          </p>
          <button
            onClick={fetchConversations}
            className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Refresh Conversations
          </button>
        </div>

        {loadingConversations ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : validConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-2" />
            <p>No conversations yet</p>
            <p className="text-sm mt-2">
              Start a conversation by clicking the message icon on any product
            </p>
          </div>
        ) : (
          validConversations.map((conv) => (
            <div
              key={conv._id}
              className={`p-4 hover:bg-gray-100 cursor-pointer border-b ${
                selectedConversation?._id === conv._id ? "bg-gray-100" : ""
              }`}
              onClick={() => {
                console.log("Selecting conversation:", conv);
                if (conv?.otherUser?._id && conv?.product?._id) {
                  setSelectedConversation(conv);
                } else {
                  console.error("Invalid conversation data:", conv);
                  toast.error("Invalid conversation data. Please try again.");
                }
              }}
            >
              <h3 className="text-sm font-medium truncate">
                {conv.product?.name || "Unknown Product"}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {conv.otherUser?.name || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-1">
                {conv.lastMessage?.content || "No messages"}
              </p>
              {conv.unreadCount > 0 && (
                <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5 mt-1 inline-block">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Messages Panel */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-white p-4 border-b flex items-center gap-4">
              <button
                onClick={() => setSelectedConversation(null)}
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedConversation.product?.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Chatting with {selectedConversation.otherUser?.name}
                </p>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle size={48} className="mb-4" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages
                  .map((msg, index) => {
                    try {
                      // Comprehensive null checks to prevent undefined errors
                      if (!msg || !msg._id) {
                        console.warn("Invalid message object:", msg);
                        return null;
                      }

                      // Safe sender ID extraction with additional validation
                      const senderId = msg.sender?._id;
                      const isUserMessage =
                        senderId && userId && senderId === userId;

                      return (
                        <div
                          key={msg._id || `msg-${index}`}
                          className={`flex ${
                            isUserMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
                              isUserMessage
                                ? "bg-green-600 text-white rounded-br-sm"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm">
                              {msg.content || "No content"}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isUserMessage
                                  ? "text-green-200"
                                  : "text-gray-500"
                              }`}
                            >
                              {msg.createdAt
                                ? formatTime(msg.createdAt)
                                : "No timestamp"}
                            </p>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error("Error rendering message:", error, msg);
                      return null;
                    }
                  })
                  .filter(Boolean) // Remove any null entries
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Improved layout */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={sendMessage} className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChatDashboard;
