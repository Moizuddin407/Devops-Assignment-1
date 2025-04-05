import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("/api/messages")
    .then(response => {
        setMessages(response.data);
      })
      .catch(error => {
        console.error("Error fetching messages:", error);
      });
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;

    axios.post("/api/messages", { message })
    .then(response => {
        setMessages([...messages, { message }]); // Update UI
        setMessage(""); // Clear input
      })
      .catch(error => {
        console.error("Error sending message:", error);
      });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>React Frontend</h1>
      <h2>Messages from MongoDB:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.message}</li>
        ))}
      </ul>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
