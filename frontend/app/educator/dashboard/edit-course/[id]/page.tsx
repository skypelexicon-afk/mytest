'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaLink,
    FaListUl,
    FaListOl,
    FaSuperscript,
} from 'react-icons/fa';
import { useCourseStore } from '@/store/useCourseStore';
import { fetchApi } from '@/lib/doFetch';

const EditCoursePage = () => {
    const router = useRouter();
    const selectedCourse = useCourseStore((state) => state.selectedCourse);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [activeCommands, setActiveCommands] = useState<string[]>([]);
    const [targetFor, setTargetFor] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [discount, setDiscount] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [educatorName, setEducatorName] = useState('');
    const [educatorImage, setEducatorImage] = useState('');
    const [demoVideoUrls, setDemoVideoUrls] = useState<string[]>(['']);
    const [contents, setContents] = useState<string[]>(['']);
    const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([
        { question: '', answer: '' },
    ]);

    useEffect(() => {
        if (!selectedCourse) {
            alert('No course selected. Redirecting...');
            router.push('/educator/dashboard/my-courses');
            return;
        }

        setTitle(selectedCourse.title);
        setDescription(selectedCourse.description);
        setTargetFor(selectedCourse.target);
        setStartDate(selectedCourse.startDate);
        setEndDate(selectedCourse.endDate);
        setPrice(String(selectedCourse.price));
        setOriginalPrice(String(selectedCourse.originalPrice));
        setDiscount(
            selectedCourse.discountLabel?.toString().replace('% Off', '') || '',
        );
        setThumbnailUrl(selectedCourse.image);
        setEducatorName(selectedCourse.educatorName);
        setEducatorImage(selectedCourse.educatorImage);
        setDemoVideoUrls(
            selectedCourse.demoVideos.length ? selectedCourse.demoVideos : [''],
        );
        setContents(
            selectedCourse.contents.length ? selectedCourse.contents : [''],
        );
        setFaqs(
            selectedCourse.faqs && selectedCourse.faqs.length
                ? selectedCourse.faqs
                : [{ question: '', answer: '' }],
        );
    }, [selectedCourse]);

    const handleCommand = (command: string) => {
        document.execCommand(command, false, '');
        toggleCommandState(command);
    };

    const toggleCommandState = (command: string) => {
        setActiveCommands((prev) =>
            prev.includes(command)
                ? prev.filter((cmd) => cmd !== command)
                : [...prev, command],
        );
    };

    const isActive = (command: string) => activeCommands.includes(command);

    const handleLink = () => {
        const url = prompt('Enter the URL');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    };

    const handleUpdateCourse = async () => {
        try {
            if (!selectedCourse) return;

            const payload = {
                title,
                image: thumbnailUrl,
                description,
                price: Number(price),
                originalPrice: Number(originalPrice),
                discountLabel: discount ? `${discount}% Off` : '',
                target: targetFor,
                startDate,
                endDate,
                educatorName,
                educatorImage,
                demoVideos: demoVideoUrls.filter((url) => url.trim() !== ''),
                contents: contents.filter((data) => data.trim() !== ''),
                faqs: faqs.filter(
                    (faq) =>
                        faq.question.trim() !== '' && faq.answer.trim() !== '',
                ),
            };

            await fetchApi.put<typeof payload, { success: boolean }>(
                `api/courses/updateCourse/${selectedCourse.id}`,
                payload,
                true,
            );

            alert('Course updated successfully!');
            router.push('/educator/dashboard/my-courses');
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Something went wrong!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-20 py-8">
            <h2 className="text-2xl font-bold mb-6">Edit Course</h2>

            <div className="mb-6">
                <label className="block text-md font-medium text-gray-700 mb-2">
                    Course Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-140 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-purple-200"
                    placeholder="Type here"
                />
            </div>

            <label className="block text-md font-medium text-gray-700 mb-2">
                Course Description
            </label>
            <div className="bg-white border w-140 h-48 border-gray-300 rounded-md overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center gap-2 flex-wrap border-b border-gray-200 bg-white px-3 py-2">
                    <button
                        onClick={() => handleCommand('bold')}
                        className={`p-2 rounded ${isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                    >
                        <FaBold />
                    </button>
                    <button
                        onClick={() => handleCommand('italic')}
                        className={`p-2 rounded ${isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                    >
                        <FaItalic />
                    </button>
                    <button
                        onClick={() => handleCommand('underline')}
                        className={`p-2 rounded ${isActive('underline') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                    >
                        <FaUnderline />
                    </button>
                    <button
                        onClick={handleLink}
                        className="p-2 hover:bg-gray-200 rounded"
                    >
                        <FaLink />
                    </button>
                    <button
                        onClick={() => handleCommand('insertUnorderedList')}
                        className={`p-2 rounded ${isActive('insertUnorderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                    >
                        <FaListUl />
                    </button>
                    <button
                        onClick={() => handleCommand('insertOrderedList')}
                        className={`p-2 rounded ${isActive('insertOrderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                    >
                        <FaListOl />
                    </button>
                    <button
                        onClick={() => handleCommand('superscript')}
                        className={`p-2 rounded ${isActive('superscript') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                    >
                        <FaSuperscript />
                    </button>
                </div>

                <div
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: description }}
                    className="min-h-[300px] w-full p-4 focus:outline-none whitespace-pre-wrap break-words"
                ></div>
            </div>

            <div className="mt-6 flex flex-col gap-6">
                <div className="flex flex-wrap gap-6">
                    <div className="min-w-[1px]">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Target For
                        </label>
                        <input
                            type="text"
                            value={targetFor}
                            onChange={(e) => setTargetFor(e.target.value)}
                            className="w-44 px-4 py-3 border border-gray-300 rounded-md"
                            placeholder="1st Year Students"
                        />
                    </div>

                    <div className="min-w-[1px]">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Original Course Price
                        </label>
                        <input
                            type="number"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md"
                            placeholder="Course Price"
                        />
                    </div>

                    <div className="min-w-[1px]">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Discounted Course Price
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md"
                            placeholder="Course Price"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    <div className="min-w-[1px]">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Starts On
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-44 px-4 py-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="min-w-[1px]">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Discount (%)
                        </label>
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setDiscount(value);
                                }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md"
                            placeholder="e.g. 50"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 items-end">
                    <div className="min-w-[1px]">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Ends On
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="min-w-[1px]">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Thumbnail Image URL (from BunnyCDN)
                        </label>
                        <input
                            type="text"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md"
                            placeholder="https://storage.bunnycdn.com/..."
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-6">
                    <div className="flex flex-wrap gap-6">
                        <div className="min-w-[1px]">
                            <label className="block text-md font-medium text-gray-700 mb-2">
                                Educator Name
                            </label>
                            <input
                                type="text"
                                value={educatorName}
                                onChange={(e) =>
                                    setEducatorName(e.target.value)
                                }
                                className="w-64 px-4 py-3 border border-gray-300 rounded-md"
                                placeholder="Dr. John Doe"
                            />
                        </div>

                        <div className="min-w-[1px]">
                            <label className="block text-md font-medium text-gray-700 mb-2">
                                Educator Image URL
                            </label>
                            <input
                                type="text"
                                value={educatorImage}
                                onChange={(e) =>
                                    setEducatorImage(e.target.value)
                                }
                                className="w-96 px-4 py-3 border border-gray-300 rounded-md"
                                placeholder="https://example.com/educator-image.jpg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Demo Video URLs (YouTube)
                        </label>
                        {demoVideoUrls.map((url, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 mb-2"
                            >
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => {
                                        const newUrls = [...demoVideoUrls];
                                        newUrls[index] = e.target.value;
                                        setDemoVideoUrls(newUrls);
                                    }}
                                    className="w-96 px-4 py-2 border border-gray-300 rounded-md"
                                    placeholder="https://youtube.com/..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newUrls = demoVideoUrls.filter(
                                            (_, i) => i !== index,
                                        );
                                        setDemoVideoUrls(newUrls);
                                    }}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-700 hover:cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                setDemoVideoUrls([...demoVideoUrls, ''])
                            }
                            className="text-sm bg-blue-500 p-2 text-white rounded hover:bg-blue-700 hover:cursor-pointer mt-2"
                        >
                            + Add another video
                        </button>
                    </div>

                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            What you will get
                        </label>
                        {contents.map((url, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 mb-2"
                            >
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => {
                                        const newData = [...contents];
                                        newData[index] = e.target.value;
                                        setContents(newData);
                                    }}
                                    className="w-96 px-4 py-2 border border-gray-300 rounded-md"
                                    placeholder="Recorded lectures..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newData = contents.filter(
                                            (_, i) => i !== index,
                                        );
                                        setContents(newData);
                                    }}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-700 hover:cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setContents([...contents, ''])}
                            className="text-sm bg-blue-500 p-2 text-white rounded hover:bg-blue-700 hover:cursor-pointer mt-2"
                        >
                            + Add
                        </button>
                    </div>

                    <div className="mt-6">
                        <label className="block text-md font-medium text-gray-700 mb-2">
                            FAQs (Frequently Asked Questions)
                        </label>

                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-2 mb-4 border border-gray-300 p-4 rounded-md"
                            >
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => {
                                        const updatedFaqs = [...faqs];
                                        updatedFaqs[index].question =
                                            e.target.value;
                                        setFaqs(updatedFaqs);
                                    }}
                                    placeholder="Enter question"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />

                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => {
                                        const updatedFaqs = [...faqs];
                                        updatedFaqs[index].answer =
                                            e.target.value;
                                        setFaqs(updatedFaqs);
                                    }}
                                    placeholder="Enter answer"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    rows={2}
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedFaqs = faqs.filter(
                                            (_, i) => i !== index,
                                        );
                                        setFaqs(updatedFaqs);
                                    }}
                                    className="self-end text-sm text-red-600 hover:underline mt-1"
                                >
                                    Remove FAQ
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setFaqs([...faqs, { question: '', answer: '' }])
                            }
                            className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            + Add FAQ
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={handleUpdateCourse}
                className="mt-8 mx-4 bg-blue-600 text-white px-7 py-2 rounded shadow hover:bg-blue-800"
            >
                Update Course
            </button>
        </div>
    );
};

export default EditCoursePage;
