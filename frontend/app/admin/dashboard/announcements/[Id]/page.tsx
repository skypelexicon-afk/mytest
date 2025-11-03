'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/doFetch';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaListUl,
  FaListOl,
  FaSuperscript,
} from 'react-icons/fa';
import { removeInlineStyles } from '@/lib/utils/cleanHtml';

interface Announcement {
  id: number;
  course_id: number;
  title: string;
  message: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface FetchError {
  message?: string;
}

const AnnouncementPage = () => {
  const params = useParams();
  const courseId = Number(params.Id);

  console.log('Course ID:', courseId); // Debugging line


  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [pinned, setPinned] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeCommands, setActiveCommands] = useState<string[]>([]);

  const messageBoxRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!courseId) return; // wait for courseId

    async function fetchAnnouncements() {
      setError(null);
      try {
        const data = await fetchApi.get<{ announcements: Announcement[] }>(`api/courses/${courseId}/announcement`);
        setAnnouncements(data.announcements);
      } catch (err) {
        const typedErr = err as FetchError;
        setError(typedErr.message || 'Failed to load announcements');
      }
    }
    fetchAnnouncements();
  }, [courseId]);
  const handleCommand = (command: string) => {
    document.execCommand(command, false, '');
    toggleCommandState(command);
  };

  const toggleCommandState = (command: string) => {
    setActiveCommands((prev) =>
      prev.includes(command)
        ? prev.filter((cmd) => cmd !== command)
        : [...prev, command]
    );
  };
  const isActive = (command: string) => activeCommands.includes(command);

  const handleLink = () => {
    const url = prompt('Enter the URL');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setPinned(false);
    setEditId(null);
    setError(null);
    setSuccess(null);
    if (messageBoxRef.current) {
      messageBoxRef.current.innerHTML = '';
    }
  };

  const createAnnouncement = async () => {
    setError(null);
    setSuccess(null);

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      const newAnnouncement = await fetchApi.post<
        { title: string; message: string; pinned: boolean; course_id: number },
        { message: string; announcement: Announcement }
      >(`api/courses/${courseId}/announcement`, {
        title,
        message,
        pinned,
        course_id: courseId,
      });

      setAnnouncements((prev) => [...prev, newAnnouncement.announcement]);
      setSuccess('Announcement created successfully');
      resetForm();
      if (messageBoxRef.current) {
        messageBoxRef.current.innerHTML = '';
      }
    } catch (err) {
      const typedErr = err as FetchError;
      setError(typedErr.message || 'Failed to create announcement');
    }
  };

  const updateAnnouncement = async () => {
    if (editId === null) return;

    setError(null);
    setSuccess(null);

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      const updatedAnnouncement = await fetchApi.put<
        { title: string; message: string; pinned: boolean; course_id: number },
        { message: string; announcement: Announcement }
      >(`api/courses/${editId}/announcement`, {
        title,
        message,
        pinned,
        course_id: courseId,
      });

      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editId ? updatedAnnouncement.announcement : a))
      );
      setSuccess('Announcement updated successfully');
      resetForm();
    } catch (err) {
      const typedErr = err as FetchError;
      setError(typedErr.message || 'Failed to update announcement');
    }
  };

  const handleDelete = async (a: Announcement) => {
    const res = await fetchApi.delete<undefined, { success: boolean, message: string }>(`api/courses/${courseId}/${a.id}/announcement`, undefined);
    if (res.success) {
      setSuccess(res.message);
      setAnnouncements(prev => prev.filter((anc) => anc.id !== a.id));
    } else {
      setError(res.message);
    }
  }

  // function renderMessage(message: string) {
  //   const urlRegex = /(https?:\/\/[^\s]+)/g;
  //   return message.split(urlRegex).map((part, i) => {
  //     if (part.match(urlRegex)) {
  //       return (
  //         <a
  //           key={i}
  //           href={part}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="text-blue-600 underline"
  //         >
  //           {part}
  //         </a>
  //       );
  //     }
  //     return part;
  //   });
  // }

  // Prefill form to edit announcement
  const edit = (a: Announcement) => {
    setTitle(a.title);
    setMessage(a.message);
    setPinned(a.pinned);
    setEditId(a.id);
    setError(null);
    setSuccess(null);
    if (messageBoxRef.current) {
      messageBoxRef.current.innerHTML = a.message;
    }
  };

  return (
    <div className="p-4 my-6 border rounded-md shadow-lg hover:shadow-2xl lg:max-w-1/2 mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {editId ? 'Edit Announcement' : 'Create Announcement'}
      </h2>

      {error && <p className="mb-2 text-red-600">{error}</p>}
      {success && <p className="mb-2 text-green-600">{success}</p>}

      <input
        type="text"
        placeholder="Title"
        className="w-full mb-3 p-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="bg-white border  h-48 border-gray-300 rounded-md overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center gap-2 flex-wrap border-b border-gray-200 bg-white px-3 py-2">
          <button onClick={() => handleCommand('bold')} className={`p-2 rounded ${isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
            <FaBold />
          </button>
          <button onClick={() => handleCommand('italic')} className={`p-2 rounded ${isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
            <FaItalic />
          </button>
          <button onClick={() => handleCommand('underline')} className={`p-2 rounded ${isActive('underline') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
            <FaUnderline />
          </button>
          <button onClick={handleLink} className="p-2 hover:bg-gray-200 rounded">
            <FaLink />
          </button>
          <button onClick={() => handleCommand('insertUnorderedList')} className={`p-2 rounded ${isActive('insertUnorderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
            <FaListUl />
          </button>
          <button onClick={() => handleCommand('insertOrderedList')} className={`p-2 rounded ${isActive('insertOrderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
            <FaListOl />
          </button>
          <button onClick={() => handleCommand('superscript')} className={`p-2 rounded ${isActive('superscript') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
            <FaSuperscript />
          </button>
        </div>

        <div
          ref={messageBoxRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setMessage(e.currentTarget.innerHTML)}
          id='message-box'
          className="min-h-[300px] w-full p-4 focus:outline-none whitespace-pre-wrap break-words"
        ></div>
      </div>
      <label className="inline-flex items-center mb-3">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="mr-2"
        />
        Pinned
      </label>

      <div className="flex space-x-3">
        {editId ? (
          <>
            <button
              onClick={updateAnnouncement}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={createAnnouncement}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Create
          </button>
        )}
      </div>

      <h3 className="mt-8 text-xl font-semibold">Announcements</h3>
      <ul className="mt-4 space-y-4">
        {announcements.length === 0 && <p>No announcements yet.</p>}
        {announcements.map((a, idx) => (
          <li
            key={idx}
            className="border p-3 rounded hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{a.title}</h3>
              {a.pinned && (
                <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded">
                  Pinned
                </span>
              )}
            </div>
            <div
              className="my-4 style-links"
              dangerouslySetInnerHTML={{ __html: removeInlineStyles(a.message) }}
            />
            <small className="text-gray-500">
              Created at: {new Date(a.created_at).toLocaleString()}
            </small>
            <div className='space-x-2'>
              <button className='bg-slate-800 hover:bg-slate-900 py-1 px-4 my-2 text-white rounded cursor-pointer'
                onClick={() => edit(a)}
              >
                Edit
              </button>
              <button className='bg-red-600 hover:bg-red-800 py-1 px-4 my-2 text-white rounded cursor-pointer'
                onClick={() => handleDelete(a)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnnouncementPage;
