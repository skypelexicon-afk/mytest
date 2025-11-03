'use client';
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
    data?: string;
}

const SearchBar = ({ data }: SearchBarProps) => {
    const router = useRouter();
    const [input, setInput] = useState(data ? data : '');
    const onSearchHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/course-list/' + input);
    };

    return (
        <form
            onSubmit={onSearchHandler}
            className="max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/20 rounded"
        >
            <FaSearch className="text-gray-500/80 md:w-6 md:h-6 w-5 h-5 mx-3" />
            <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                type="text"
                className="w-full h-full outline-none text-gray-500/80"
                placeholder="Search for courses"
            />
            <button
                type="submit"
                className="rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1 bg-violet-600 hover:bg-violet-700 transition duration-200 cursor-pointer"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;
