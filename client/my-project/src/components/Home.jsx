// src/components/Home.js
import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import "../styles/home.css";

function Home() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addClient, setAddClient] = useState(false);
  const inputEmailRef = useRef();

  useEffect(() => {
    const fetchClients = async () => {
      const data = await api.getCustomers();
      console.log(data);

      setClients(data);
      setLoading(false);
    };
    fetchClients();
  }, []);

  if (loading) return <p>טוען...</p>;

  const sendEmail = async () => {
    const email = inputEmailRef.current.value;
    console.log(email);
    try {
      const data = await api.sendEmail(email);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="home">
      <h1>ברוך הבא, צלם!</h1>
      <div className="logout">
        <button className="logout-button">יציאה</button>
      </div>
      <h2>הלקוחות שלך</h2>
      <div className="add-client">
        <button
          className="add-client-button"
          onClick={() => {
            setAddClient(!addClient);
          }}
        >
          הוספת לקוח
        </button>
        {addClient && (
          <div className="email-form">
            <input
              type="email"
              placeholder="הזן כתובת אימייל "
              ref={inputEmailRef}
              required
            />
            <button className="send-button" onClick={sendEmail}>
              שלח
            </button>
          </div>
        )}
      </div>
      <div className="clients-list">
        {clients &&
          clients.map((client) => (
            <div key={client.id} className="client-folder">
              <h3>{client.fullName}</h3>
              <button>הצג גלריה</button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Home;
