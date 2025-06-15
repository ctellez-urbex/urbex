"use client";

import { useTheme } from "next-themes";
import { useState, useCallback, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, CheckCircle, AlertCircle } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactInfo {
  icon: typeof Mail;
  title: string;
  value: string;
  href: string;
}

const contactInfo: ContactInfo[] = [
  {
    icon: Mail,
    title: "Correo electrónico",
    value: "alejandro@urbex.com.co",
    href: "mailto:alejandro@urbex.com.co"
  },
  {
    icon: Phone,
    title: "Teléfono",
    value: "+57 310 8780 049",
    href: "tel:+573108780049"
  },
  {
    icon: MapPin,
    title: "Dirección",
    value: "Ciudad de Bogotá, Colombia",
    href: "https://maps.google.com"
  }
];

const Contact = memo(() => {
  const { theme, resolvedTheme } = useTheme();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const isDark = useMemo(() => 
    theme === 'dark' || resolvedTheme === 'dark', 
    [theme, resolvedTheme]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof ContactFormData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'email' ? e.target.value.toLowerCase().trim() : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setStatus("sending");
    setSubmitMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setStatus("success");
      setSubmitMessage("Gracias! Tu mensaje ha sido enviado exitosamente. Nos pondremos en contacto contigo pronto.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Error al enviar el mensaje. Por favor, inténtalo de nuevo.";
      setSubmitMessage(errorMessage);
      setErrors({ message: errorMessage });
    }
  }, [formData, validateForm]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    setSubmitMessage("");
    setErrors({});
  }, []);

  const isFormValid = useMemo(() => 
    formData.name.trim() && 
    formData.email.trim() && 
    formData.message.trim() && 
    Object.keys(errors).length === 0,
    [formData, errors]
  );

  const contactInfoItems = useMemo(() => 
    contactInfo.map((info, index) => {
      const IconComponent = info.icon;
      return (
        <a
          key={index}
          href={info.href}
          className={`flex items-center space-x-4 p-4 rounded-lg transition-colors duration-200 ${
            isDark 
              ? 'hover:bg-gray-700' 
              : 'hover:bg-gray-50'
          }`}
          target={info.href.startsWith('http') ? '_blank' : undefined}
          rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <div className={`p-3 rounded-full ${
            isDark ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <IconComponent className={`w-6 h-6 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h4 className={`font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {info.title}
            </h4>
            <p className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {info.value}
            </p>
          </div>
        </a>
      );
    }), 
    [isDark]
  );

  return (
    <section 
      id="contact" 
      className="py-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            id="contact-heading"
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-neutral-800'
            }`}
          >
            Contactanos
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            isDark ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            Listo para revolucionar tus operaciones inmobiliarias? Contactanos hoy y descubre cómo Urbex puede ayudarte a tomar decisiones basadas en datos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className={`lg:col-span-1 p-8 rounded-2xl ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h3 className={`text-xl font-semibold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Información de contacto
            </h3>
            <div className="space-y-4">
              {contactInfoItems}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Normalmente respondemos dentro de 24 horas durante los días hábiles.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-2 p-8 rounded-2xl shadow-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-semibold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Envíanos un mensaje
            </h3>

            {/* Status Messages */}
            {status === "success" && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {submitMessage}
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {submitMessage}
                    </p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="name" 
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Nombre completo *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    disabled={status === "sending"}
                    error={errors.name}
                    className="w-full"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="email" 
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Correo electrónico *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={status === "sending"}
                    error={errors.email}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="phone" 
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Teléfono (opcional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+57 (317) 823-4567"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  disabled={status === "sending"}
                  error={errors.phone}
                  className="w-full"
                />
              </div>

              <div>
                <label 
                  htmlFor="message" 
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Cuéntanos sobre tu proyecto o cómo podemos ayudarte..."
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  disabled={status === "sending"}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-vertical ${
                    errors.message ? 'border-red-500' : ''
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary-blue"
                disabled={status === "sending" || !isFormValid}
                loading={status === "sending"}
                className="w-full"
                size="lg"
              >
                {status === "sending" ? 'Enviando mensaje...' : 'Enviar mensaje'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
});

Contact.displayName = 'Contact';

export default Contact; 