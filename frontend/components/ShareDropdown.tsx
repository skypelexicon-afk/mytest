'use client';
import React, { useState } from 'react';
import {//
  FaShareAlt,
  FaWhatsapp,
  FaTelegram,
  FaEnvelope,
  
  FaLink,
} from 'react-icons/fa';
import { generateShareLinks } from '@/lib/utils/shareUtils';
import { toast } from 'sonner';

interface ShareProps {
  title: string;
  price: number;
  id: number;
  type?: 'course' | 'bundle';
}

const ShareDropdown: React.FC<ShareProps> = ({ title, price, id, type }) => {
  const [open, setOpen] = useState(false);
  const links = generateShareLinks({ title, price, id, type });

  const handleCopyLink = () => {
  const courseUrl = type === 'bundle'
    ? `https://tendingtoinfinityacademy.com/all-courses/exploreBundle/${id}`
    : `https://tendingtoinfinityacademy.com/all-courses/explore/${id}`;

  const shareMessage = `Hey! Check out this amazing ${type === 'bundle' ? 'bundle' : 'course'}: "${title}" for just ₹${price}. Join now: ${courseUrl}`;

  navigator.clipboard.writeText(shareMessage)
    .then(() => {
      toast.success('Link copied!');
    })
    .catch((err) => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy link!');
    });
};

  

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        //className="flex items-center border border-black text-black px-10 mr-5 py-1 rounded-md text-sm font-medium hover:bg-purple-50"
        className="flex items-center border border-yellow-900 text-yellow-900 px-10 mr-5 py-1 rounded-md text-sm font-medium hover:bg-yellow-800 hover:text-yellow-200"
      >
        <FaShareAlt />
      </button>

      {open && (
        <div //className="absolute z-10  mt-2 w-30 bg-white border rounded-md shadow-lg"
        className="absolute z-10  mt-2 w-30 bg-yellow-900 text-yellow-200 border rounded-md shadow-lg"
        >
          <button
            onClick={handleCopyLink}
           // className="flex w-full items-center gap-2 hover:bg-gray-100 px-2 py-0.5 rounded text-left"
           className="flex w-full items-center  gap-2 hover:bg-yellow-800 px-2 py-0.5 rounded text-left"
          >
            <FaLink className="text-gray-600" /> Copy Link
          </button>
          <a href={links.whatsapp} target="_blank" //className="flex items-center gap-2 hover:bg-gray-100 px-2 py-0.5 rounded"
          className="flex items-center gap-2 hover:bg-yellow-800 px-2 py-0.5 rounded"
          >
            <FaWhatsapp className="text-green-600" /> WhatsApp
          </a>
          <a href={links.telegram} target="_blank" //className="flex items-center gap-2 hover:bg-gray-100 px-2 py-0.5 rounded"
          className="flex items-center gap-2 hover:bg-yellow-800 px-2 py-0.5 rounded"
          >
            <FaTelegram className="text-blue-500" /> Telegram
          </a>
          <a href={links.email} //className="flex items-center gap-2 hover:bg-gray-100 px-2 py-0.5 rounded"
          className="flex items-center gap-2 hover:bg-yellow-800 px-2 py-0.5 rounded"
          >
            <FaEnvelope className="text-red-500" /> Email
          </a>
         
          
        </div>
      )}
    </div>
  );
};

export default ShareDropdown;
