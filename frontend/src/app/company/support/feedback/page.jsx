"use client";
import { useState } from "react";
import emailjs from "emailjs-com";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const SERVICE_ID = "service_x2ightj";
  const TEMPLATE_ID = "template_5w2bprn";
  const PUBLIC_KEY = "zWdFWhS6JrHquLK3t";

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    emailjs
      .send(
        SERVICE_ID,
        TEMPLATE_ID,
        { from_name: name, from_email: fromEmail, message },
        PUBLIC_KEY
      )
      .then(
        () => {
          setSent(true);
          setName("");
          setFromEmail("");
          setMessage("");
        },
        () => {
          setError("Илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
        }
      );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Санал хүсэлт илгээх</h1>
      {sent && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Таны санал хүсэлт амжилттай илгээгдлээ!
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Таны нэр</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            name="from_name"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Таны и-мэйл</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={fromEmail}
            onChange={e => setFromEmail(e.target.value)}
            required
            name="from_email"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Санал хүсэлт</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            name="message"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
        >
          Илгээх
        </button>
      </form>
    </div>
  );
}