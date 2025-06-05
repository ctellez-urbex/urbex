"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { Mail } from "lucide-react";

export default function Contact() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el mensaje");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Error al enviar el mensaje");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 ${
          theme === 'dark' ? 'text-white' : 'text-neutral-800'
        }`}>
          Contáctanos
        </h2>

        <div className={`rounded-2xl p-6 sm:p-8 ${
          theme === 'dark' ? 'bg-neutral-800' : 'bg-white'
        } shadow-lg`}>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="name" className={`block text-sm sm:text-base font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-neutral-700 border-neutral-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
              <div>
                <label htmlFor="email" className={`block text-sm sm:text-base font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-neutral-700 border-neutral-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className={`block text-sm sm:text-base font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-neutral-700 border-neutral-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === "sending" ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
} 