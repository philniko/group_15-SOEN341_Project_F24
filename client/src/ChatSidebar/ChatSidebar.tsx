import { useState, useEffect } from "react";
import axios from "axios";
import "./ChatSidebar.css";
import { useUser } from "../hooks/UseUser";
import "bootstrap-icons/font/bootstrap-icons.css";

const ChatSidebar = ({ isOpen, onClose }) => {
  const user = useUser(); // Get the current user's data
  const [contacts, setContacts] = useState([]); // List of contacts
  const [selectedContact, setSelectedContact] = useState(null); // Selected contact
  const [messages, setMessages] = useState([]); // Chat messages
  const [newMessage, setNewMessage] = useState(""); // Input for the new message

  // Fetch contacts from the API
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/getContacts", {
        headers: { "x-access-token": token },
      });
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
    }
  };

  // Fetch messages for the selected contact
  const fetchMessages = async (contactId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/getPrivateMessages",
        { contactId },
        { headers: { "x-access-token": token } }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Ignore empty messages

    try {
      const token = localStorage.getItem("token");
      const userId = user.id; // Get the current user's ID
      const message = {
        sender: userId, // Set the sender to the current user's ID
        recipient: selectedContact._id, // Set the recipient to the selected contact
        message: newMessage.trim(), // Trim whitespace from the message
      };

      await axios.post("http://localhost:3001/sendPrivateMessage", message, {
        headers: { "x-access-token": token },
      });

      // Add the new message to the state
      setMessages((prev) => [
        ...prev,
        { ...message, sender: userId, timestamp: new Date() },
      ]);

      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch contacts when the sidebar is opened
  useEffect(() => {
    if (isOpen) fetchContacts();
  }, [isOpen]);

  return (
    <div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
      {selectedContact ? (
        // Chat interface when a contact is selected
        <div className="chat">
          <div className="chat-header">
            {/* Return Button with Bootstrap Icon */}
            <button
              className="return-btn"
              onClick={() => setSelectedContact(null)}
            >
              <i className="bi bi-arrow-left"></i>
            </button>

            {/* Chat Header Title */}
            <h2>Chat with {selectedContact.firstName}</h2>

            {/* Close Button with Bootstrap Icon */}
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="messages">
            {messages.map((msg, idx) => {
              const isSentByCurrentUser =
                msg.sender?.toString() === user.id.toString(); // Compare sender ID with the current user ID

              return (
                <div
                  key={idx}
                  className={`message ${
                    isSentByCurrentUser ? "sent" : "received"
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
          </div>

          <div className="message-input">
            <input
              type="text"
              value={newMessage} // Bind input value to `newMessage` state
              onChange={(e) => setNewMessage(e.target.value)} // Update state on input change
              placeholder="Type a message"
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      ) : (
        // Contact list when no contact is selected
        <div className="contacts">
          <div className="contacts-header">
            <h2>Contacts</h2>
            {/* Close Button */}
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <ul>
            {contacts.map((contact) => (
              <li
                key={contact._id}
                onClick={() => {
                  setSelectedContact(contact);
                  fetchMessages(contact._id);
                }}
              >
                {/* Placeholder Avatar with Initials */}
                <div className="avatar">
                  {contact.firstName.charAt(0)}
                  {contact.lastName.charAt(0)}
                </div>
                <div className="contact-info">
                  <div className="name">
                    {contact.firstName} {contact.lastName}
                  </div>
                  <div className="email">{contact.email}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
