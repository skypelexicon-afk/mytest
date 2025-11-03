"use client";

import React, { useState } from "react";
import { FaShareAlt, FaWhatsapp, FaTelegram, FaEnvelope, FaLink } from "react-icons/fa";
import { toast } from "sonner";

interface PdfShareProps {
  title: string;
}

const PdfShareDropdown: React.FC<PdfShareProps> = ({ title }) => {
  const [open, setOpen] = useState(false);

  const pdfUrl = `https://tendingtoinfinityacademy.com/pdfnotes`;

  const handleCopyLink = () => {
    const shareMessage = `Hey! Check out this free lecture note: "${title}". Download here: ${pdfUrl}`;

    navigator.clipboard.writeText(shareMessage)
      .then(() => toast.success("Link copied!"))
      .catch(() => toast.error("Failed to copy link!"));
  };

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `Hey! Check out this free lecture note: "${title}". Download here: ${pdfUrl}`
  )}`;

  const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(pdfUrl)}&text=${encodeURIComponent(title)}`;

  // Gmail web share link
  const gmailLink = `https://mail.google.com/mail/?view=cm&to=&su=${encodeURIComponent(
    title
  )}&body=${encodeURIComponent(`Hey! Check out this free lecture note: "${title}". Download here: ${pdfUrl}`)}`;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
       // className="flex items-center border border-black text-black px-3 py-1 rounded-md text-sm font-medium hover:bg-purple-50"
       className="flex items-center border border-yellow-900 text-yellow-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-900 hover:text-yellow-200"
      >
        <FaShareAlt className="mr-1" /> Share
      </button>

      {open && (
        <div //className="absolute z-10 mt-2 w-32 bg-white border rounded-md shadow-lg"
        className="absolute z-10 mt-2 w-32 bg-yellow-900 border rounded-md shadow-lg"
        >
          <button
            onClick={handleCopyLink}
           // className="flex w-full items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded text-left"
           className="flex w-full items-center gap-2 hover:bg-yellow-800 px-2 py-1 rounded text-left"
          >
            <FaLink className="text-gray-600" /> Copy Link
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            //className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded"
            className="flex items-center gap-2 hover:bg-yellow-800 px-2 py-1 rounded"
          >
            <FaWhatsapp className="text-green-600" /> WhatsApp
          </a>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            //className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded"
            className="flex items-center gap-2 hover:bg-yellow-800 px-2 py-1 rounded"
          >
            <FaTelegram className="text-blue-500" /> Telegram
          </a>
          <a
            href={gmailLink}
            target="_blank"
            rel="noopener noreferrer"
           // className="flex items-center gap-2 hover:bg-gray-100 px-2 py-0.5 rounded text-left"
           className="flex items-center gap-2 hover:bg-yellow-800 px-2 py-0.5 rounded text-left"
          >
            <FaEnvelope className="text-red-500" /> Email
          </a>
        </div>
      )}
    </div>
  );
};

export default PdfShareDropdown;
