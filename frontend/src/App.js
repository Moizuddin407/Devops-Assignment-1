import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    axios.get("http://priceless_grothendieck:3000/")
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        setMessage("Error connecting to backend");
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>React Frontend</h1>
      <h2>Backend Response:</h2>
      <p>{message}</p>
    </div>
  );
}

export default App;
