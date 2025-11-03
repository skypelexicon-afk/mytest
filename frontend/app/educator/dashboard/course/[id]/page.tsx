'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/doFetch';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { removeInlineStyles } from '@/lib/utils/cleanHtml';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SubSection = {
    id?: number; // Backend uses 'id', not 'subSectionId'
    subSectionId?: number; // Keep for compatibility
    name: string;
    file_url: string;
    youtube_video_url?: string; // YouTube video URL
    is_free?: boolean; // Whether video is free
    type: 'video' | 'attachment' | 'code_file';
    section_id?: number;
    isEditing?: boolean; // For UI state management
};

type Section = {
    id: number;
    name: string;
    subSections: SubSection[];
    course_id?: number;
};

type NewSection = {
    sectionName: string;
    subSections: SubSection[];
};

type Course = {
    id: number;
    title: string;
    description: string;
    image: string;
    sections: Section[];
};

// Sortable Section Component
function SortableSection({
    section,
    sectionIndex,
    handleSubSectionDragEnd,
    sensors,
}: {
    section: Section;
    sectionIndex: number;
    handleSubSectionDragEnd: (sectionId: number, event: DragEndEvent) => void;
    sensors: ReturnType<typeof useSensors>;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border border-gray-200 rounded-lg overflow-hidden"
        >
            {/* Section Header with Drag Handle */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                            </svg>
                        </button>
                        <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                            {sectionIndex + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            {section.name}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {section.subSections?.length || 0} topics
                        </span>
                    </div>
                </div>
            </div>

            {/* Section Content with Sortable Subsections */}
            <div className="p-6">
                {section.subSections?.length === 0 ? (
                    <p className="text-gray-500 italic">
                        No topics in this module yet.
                    </p>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) =>
                            handleSubSectionDragEnd(section.id, event)
                        }
                    >
                        <SortableContext
                            items={section.subSections.map(
                                (sub) => sub.id || sub.subSectionId || 0,
                            )}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid gap-4">
                                {section.subSections?.map((sub, subIndex) => (
                                    <SortableSubSection
                                        key={sub.id || sub.subSectionId}
                                        sub={sub}
                                        subIndex={subIndex}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}

// Sortable SubSection Component
function SortableSubSection({
    sub,
    subIndex,
}: {
    sub: SubSection;
    subIndex: number;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sub.id || sub.subSectionId || 0 });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border-4 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors duration-200"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                    {/* Drag Handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                        </svg>
                    </button>
                    <div className="bg-gray-100 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                        {subIndex + 1}
                    </div>
                    <h4 className="font-semibold text-gray-900">{sub.name}</h4>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sub.type === 'video'
                                ? 'bg-red-100 text-red-800'
                                : sub.type === 'attachment'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                        {sub.type}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function EducatorCoursePage() {
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [newSections, setNewSections] = useState<NewSection[]>([]);
    const [sectionIdToReplace, setSectionIdToReplace] = useState<number | null>(
        null,
    );
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(
        null,
    );
    const [arrangeMode, setArrangeMode] = useState(false);
    const [tempSections, setTempSections] = useState<Section[]>([]);
    const [isSavingArrangement, setIsSavingArrangement] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const toggleArrangeMode = () => {
        if (!arrangeMode && course) {
            // Entering arrange mode - copy sections to temp
            setTempSections(JSON.parse(JSON.stringify(course.sections)));
        }
        setArrangeMode(!arrangeMode);
    };

    const cancelArrangeMode = () => {
        setTempSections([]);
        setArrangeMode(false);
    };

    const handleSectionDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTempSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSubSectionDragEnd = (sectionId: number, event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTempSections((sections) => {
                const sectionIndex = sections.findIndex((s) => s.id === sectionId);
                if (sectionIndex === -1) return sections;

                const newSections = [...sections];
                const subSections = [...newSections[sectionIndex].subSections];
                const oldIndex = subSections.findIndex((sub) => (sub.id || sub.subSectionId) === active.id);
                const newIndex = subSections.findIndex((sub) => (sub.id || sub.subSectionId) === over.id);

                newSections[sectionIndex] = {
                    ...newSections[sectionIndex],
                    subSections: arrayMove(subSections, oldIndex, newIndex),
                };

                return newSections;
            });
        }
    };

    const saveArrangement = async () => {
        if (!course) return;

        setIsSavingArrangement(true);
        try {
            const courseId = Array.isArray(id) ? id[0] : id;

            // Save section orders
            const sectionOrders = tempSections.map((section, index) => ({
                id: section.id,
                order: index,
            }));

            await fetchApi.put(`api/courses/reorder-sections/${courseId}`, {
                sectionOrders,
            });

            // Save subsection orders for each section
            for (const section of tempSections) {
                const subSectionOrders = section.subSections.map((sub, index) => ({
                    id: sub.id || sub.subSectionId,
                    order: index,
                }));

                if (subSectionOrders.length > 0) {
                    await fetchApi.put(
                        `api/courses/reorder-subsections/${section.id}`,
                        { subSectionOrders },
                    );
                }
            }

            // Update the course state and exit arrange mode
            setCourse({ ...course, sections: tempSections });
            setArrangeMode(false);
            setTempSections([]);
            
            alert('✅ Arrangement saved successfully!');
            await fetchCourseDetails();
        } catch (error) {
            console.error('Failed to save arrangement:', error);
            alert('❌ Error: Could not save arrangement. Please try again.');
        } finally {
            setIsSavingArrangement(false);
        }
    };

    const fetchCourseDetails = async () => {
        try {
            // Handle both string and array cases from useParams
            const courseId = Array.isArray(id) ? id[0] : id;

            if (!courseId || isNaN(Number(courseId))) {
                console.error(
                    'Invalid course ID:',
                    courseId,
                    'Original id:',
                    id,
                );
                setLoading(false);
                return;
            }
            const data = await fetchApi.get<{ course: Course }>(
                `api/courses/${courseId}`,
            );
            setCourse(data.course);
        } catch (err) {
            console.error('Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const handleAddNewSection = () => {
        setNewSections([...newSections, { sectionName: '', subSections: [] }]);
        setSectionIdToReplace(null);
    };

    const undoSection = (secIdx: number) => {
        setNewSections((prev) => prev.filter((_, i) => i !== secIdx));
        setSectionIdToReplace(null);
    };

    const handleChangeSectionName = (index: number, value: string) => {
        const s = [...newSections];
        s[index].sectionName = value;
        setNewSections(s);
    };

    const addSubToSection = (secIdx: number) => {
        const s = [...newSections];
        s[secIdx].subSections.push({
            name: '',
            file_url: '',
            youtube_video_url: '',
            type: 'video',
            id: undefined,
            subSectionId: undefined,
            isEditing: true, // Set to true for new subsections
        });
        setNewSections(s);
    };

    const removeSubFromSection = (secIdx: number, subIdx: number) => {
        const s = [...newSections];
        s[secIdx].subSections.splice(subIdx, 1);
        setNewSections(s);
    };

    const handleChangeSubsection = (
        secIdx: number,
        subIdx: number,
        field: keyof SubSection,
        value: string,
    ) => {
        const s = [...newSections];
        const subsection = s[secIdx].subSections[subIdx];

        if (field === 'name' || field === 'file_url' || field === 'youtube_video_url') {
            subsection[field] = value;
        } else if (
            field === 'type' &&
            ['video', 'attachment', 'code_file'].includes(value)
        ) {
            subsection.type = value as 'video' | 'attachment' | 'code_file';
        }

        setNewSections(s);
    };

    const handleDeleteSection = async (sectionId: number) => {
        try {
            if (!sectionId || isNaN(sectionId)) {
                console.error('Invalid section ID:', sectionId);
                return;
            }

            const confirmed = window.confirm(
                'Are you sure you want to delete this section?',
            );
            if (!confirmed) return;

            await fetchApi.delete(`api/courses/deleteSection/${sectionId}`,{});

            setCourse((prev) => ({
                ...prev!,
                sections: prev!.sections.filter(
                    (section) => section.id !== sectionId,
                ),
            }));

            setSectionIdToReplace(null);
            fetchCourseDetails();
        } catch (error) {
            console.error('Failed to delete section:', error);
            alert('Error: Could not delete section. Please try again.');
        }
    };

    const handleSubSectionDelete = async (id: number) => {
        if (!id || isNaN(id)) {
            console.error('Invalid subsection ID provided for deletion:', id);
            alert('Error: Could not delete topic because its ID is missing.');
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this topic?',
        );
        if (!confirmed) return;

        try {
            await fetchApi.delete(`api/courses/deleteSubsection/${id}`,{});

            setCourse((prevCourse) => {
                if (!prevCourse) return null;

                const updatedCourse = JSON.parse(JSON.stringify(prevCourse));

                for (const section of updatedCourse.sections) {
                    const subIndex = section.subSections.findIndex(
                        (sub: SubSection) => sub.id === id,
                    );
                    if (subIndex > -1) {
                        section.subSections.splice(subIndex, 1);
                        break;
                    }
                }

                return updatedCourse;
            });
        } catch (error) {
            console.error('Failed to delete subsection:', error);
            alert('Error: Could not delete topic. Please try again.');
        }
    };

    const handleSubmitSection = async (secIdx: number) => {
        const section = newSections[secIdx];

        // Validation
        if (!section.sectionName?.trim()) {
            alert('Please enter a section name');
            return;
        }

        try {
            if (sectionIdToReplace !== null) {
                // Update section name
                await fetchApi.put(
                    `api/courses/updateSection/${sectionIdToReplace}`,
                    {
                        name: section.sectionName,
                        course_id: Number(course?.id),
                    },
                );

                // Update subsections - only existing ones with valid IDs
                // const existingSubsections = section.subSections.filter(sub =>
                //   (sub.id || sub.subSectionId) && sub.name?.trim()
                // );

                // if (existingSubsections.length > 0) {
                //   const subsectionsToUpdate = existingSubsections.map((sub) => ({
                //     id: sub.id || sub.subSectionId, // Use id first, fallback to subSectionId
                //     name: sub.name?.trim() || "",
                //     type: sub.type || "video",
                //     file_url: sub.file_url?.trim() || "",
                //   }));

                //   console.log("Updating subsections:", subsectionsToUpdate);

                //   // Update each subsection by id
                //   for (const subsection of subsectionsToUpdate) {
                //     await fetchApi.put(`api/courses/updateSubsection/${subsection.id}`, {
                //       name: subsection.name,
                //       type: subsection.type,
                //       file_url: subsection.file_url,
                //     });
                //   }
                // }

                // Add new subsections (ones without IDs)
                const newSubsections = section.subSections.filter(
                    (sub) => !sub.id && !sub.subSectionId && sub.name?.trim(),
                );

                if (newSubsections.length > 0) {
                    await fetchApi.put(
                        `api/courses/addSubsection/${sectionIdToReplace}`,
                        {
                            subSections: newSubsections.map((sub) => ({
                                name: sub.name?.trim() || '',
                                type: sub.type || 'video',
                                file_url: sub.file_url?.trim() || '',
                            })),
                        },
                    );
                }
            } else {
                // Create new section
                const validSubsections = section.subSections.filter((sub) =>
                    sub.name?.trim(),
                );

                const courseId = Array.isArray(id) ? id[0] : id;
                await fetchApi.post(
                    `api/courses/createCourse/${courseId}/section`,
                    {
                        name: section.sectionName,
                        subSections: validSubsections.map((sub) => ({
                            name: sub.name?.trim() || '',
                            type: sub.type || 'video',
                            file_url: sub.file_url?.trim() || '',
                        })),
                    },
                );
            }

            setNewSections([]);
            setSectionIdToReplace(null);
            await fetchCourseDetails();
        } catch (err) {
            console.error('Failed to submit section:', err);
            alert(
                'Error: Could not submit section. Please check your inputs and try again.',
            );
        }
    };

    const toggleEditSubsection = (
        secIdx: number,
        subIdx: number,
        editing: boolean,
    ) => {
        setNewSections((prevSections) => {
            const updated = [...prevSections];
            if (!updated[secIdx] || !updated[secIdx].subSections[subIdx])
                return updated;

            updated[secIdx].subSections[subIdx].isEditing = editing;
            return updated;
        });
    };

    const handleUpdateSubsection = async (
        subsectionId: string | number,
        updates: {
            name?: string;
            type?: string;
            file_url?: string;
            youtube_video_url?: string;
        },
    ) => {
        // Find the subsection by its actual ID, not by index
        const subSection = newSections
            .flatMap((sec) => sec.subSections)
            .find(
                (sub) =>
                    (sub.id && sub.id === subsectionId) ||
                    (sub.subSectionId && sub.subSectionId === subsectionId),
            );

        if (!subSection || (!subSection.id && !subSection.subSectionId)) {
            alert('Error: Subsection not found or missing ID.');
            return;
        }

        try {
            const actualId = subSection.id || subSection.subSectionId;

            await fetchApi.put(`api/courses/updateSubsection/${actualId}`, {
                name: updates.name?.trim(),
                type: updates.type || 'video',
                file_url: updates.file_url?.trim(),
                youtube_video_url: updates.youtube_video_url?.trim() || null,
            });
            setNewSections([]);
            await fetchCourseDetails();
        } catch (err) {
            console.error('Failed to update subsection:', err);
            alert('Error updating subsection.');
        }
    };

    const onEditSection = (section: Section) => {
        const clone: NewSection = {
            sectionName: section.name,
            subSections: section.subSections.map((sub) => ({
                id: sub.id || sub.subSectionId, // Preserve the ID
                subSectionId: sub.subSectionId || sub.id, // Keep both for compatibility
                name: sub.name,
                file_url: sub.file_url,
                youtube_video_url: sub.youtube_video_url,
                is_free: sub.is_free,
                type: sub.type,
                section_id: sub.section_id,
            })),
        };
        setNewSections([clone]);
        setSectionIdToReplace(section.id);
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="ml-3 text-gray-600">Loading course...</p>
            </div>
        );

    if (!course)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Course not found
                    </h2>
                    <p className="text-gray-600">
                        The course you&apos;re looking for doesn&apos;t exist or
                        you don&apos;t have permission to access it.
                    </p>
                </div>
            </div>
        );

    const displaySections = arrangeMode ? tempSections : course.sections;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Course Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className=" lg:flex-row items-start lg:items-center gap-6">
                        <div className="flex-shrink-0">
                            <Image
                                src={course.image}
                                alt={course.title}
                                height={250}
                                width={250}
                                className="object-cover rounded-lg border border-gray-200 my-4"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {course.title}
                            </h1>
                            <div
                                className="my-4 mx-4 py-4 text-gray-700 prose prose-sm md:prose-base max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: removeInlineStyles(
                                        course.description,
                                    ),
                                }}
                            />
                            <div className="mt-4 flex flex-wrap gap-4">
                                <div className="text-gray-500 px-3 py-1 rounded-full text-sm font-medium">
                                    Course ID: {course.id}
                                </div>
                                <div className="text-gray-500 px-3 py-1 rounded-full text-sm font-medium">
                                    {course.sections?.length || 0} Modules
                                </div>
                                <div className="text-gray-500 px-3 py-1 rounded-full text-sm font-medium">
                                    {course.sections?.reduce(
                                        (total, section) =>
                                            total +
                                            (section.subSections?.length || 0),
                                        0,
                                    ) || 0}{' '}
                                    Topics
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Module Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {sectionIdToReplace !== null
                                ? 'Edit Module'
                                : 'Add New Module'}
                        </h2>
                        {newSections.length === 0 && (
                            <button
                                onClick={handleAddNewSection}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Add Module
                            </button>
                        )}
                    </div>

                    {newSections.map((sec, secIdx) => (
                        <div
                            key={secIdx}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50"
                        >
                            {/* Section Name Input */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Module Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter module name (e.g., Introduction to Calculus)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        value={sec.sectionName || ''}
                                        onChange={(e) =>
                                            handleChangeSectionName(
                                                secIdx,
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <button
                                    onClick={() => undoSection(secIdx)}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mt-6"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Cancel
                                </button>
                            </div>

                            {/* Subsections */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Topics
                                    </h3>
                                    <button
                                        onClick={() => addSubToSection(secIdx)}
                                        className="text-purple-500 hover:text-purple-600 border bg-white hover:bg-gray-300  border-purple-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        Add Topic
                                    </button>
                                </div>

                                {sec.subSections.map((sub, subIdx) => (
                                    <div
                                        key={`${secIdx}-${subIdx}`}
                                        className="bg-white border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-800">
                                                Topic {subIdx + 1}
                                            </h4>
                                            <button
                                                onClick={() =>
                                                    removeSubFromSection(
                                                        secIdx,
                                                        subIdx,
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-14 gap-4">
                                            <div className="lg:col-span-4">
                                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                                    Topic Name
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter topic name"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    value={sub.name || ''}
                                                    onChange={(e) =>
                                                        handleChangeSubsection(
                                                            secIdx,
                                                            subIdx,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={sub.id || sub.subSectionId ? !sub.isEditing : false}
                                                />
                                            </div>

                                            <div className="lg:col-span-6">
                                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                                    {sub.type === 'video'
                                                        ? 'Bunny CDN Video URL (For Paid Students)'
                                                        : sub.type ===
                                                            'attachment'
                                                          ? 'File URL'
                                                          : 'Code File URL'}
                                                </label>
                                                <input
                                                    type="url"
                                                    placeholder={`Paste BunnyCDN ${sub.type} URL`}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    value={sub.file_url || ''}
                                                    onChange={(e) =>
                                                        handleChangeSubsection(
                                                            secIdx,
                                                            subIdx,
                                                            'file_url',
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={sub.id || sub.subSectionId ? !sub.isEditing : false}
                                                />
                                            </div>

                                            {/* YouTube URL Field - Only for videos */}
                                            {sub.type === 'video' && (
                                                <div className="lg:col-span-6">
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                        YouTube Video URL (Optional - For Free/Non-Paid Students)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        placeholder="Paste YouTube URL to make this video free for non-paid students"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                        value={sub.youtube_video_url || ''}
                                                        onChange={(e) =>
                                                            handleChangeSubsection(
                                                                secIdx,
                                                                subIdx,
                                                                'youtube_video_url',
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={sub.id || sub.subSectionId ? !sub.isEditing : false}
                                                    />
                                                    {sub.youtube_video_url && (
                                                        <p className="text-xs text-green-600 mt-1">
                                                            ✓ This video will be FREE for non-paid students (YouTube)
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="lg:col-span-2">
                                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={sub.type}
                                                    onChange={(e) =>
                                                        handleChangeSubsection(
                                                            secIdx,
                                                            subIdx,
                                                            'type',
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={sub.id || sub.subSectionId ? !sub.isEditing : false}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="video">
                                                        Video
                                                    </option>
                                                    <option value="attachment">
                                                        Attachment
                                                    </option>
                                                    <option value="code_file">
                                                        Code File
                                                    </option>
                                                </select>
                                            </div>
                                            <div className="lg:col-span-2 flex gap-2">
                                                {(sub.id || sub.subSectionId) && !sub.isEditing ? (
                                                    <button
                                                        onClick={() =>
                                                            toggleEditSubsection(
                                                                secIdx,
                                                                subIdx,
                                                                true,
                                                            )
                                                        }
                                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-lg font-medium w-full"
                                                    >
                                                        Edit
                                                    </button>
                                                ) : (sub.id || sub.subSectionId) ? (
                                                    <button
                                                        onClick={() => {
                                                            const subsectionId =
                                                                sub.id ||
                                                                sub.subSectionId;
                                                            if (subsectionId) {
                                                                handleUpdateSubsection(
                                                                    subsectionId,
                                                                    {
                                                                        name: sub.name,
                                                                        type: sub.type,
                                                                        file_url:
                                                                            sub.file_url,
                                                                        youtube_video_url:
                                                                            sub.youtube_video_url,
                                                                    },
                                                                ).then(() =>
                                                                    toggleEditSubsection(
                                                                        secIdx,
                                                                        subIdx,
                                                                        false,
                                                                    ),
                                                                );
                                                            } else {
                                                                alert(
                                                                    'Error: Subsection ID is missing.',
                                                                );
                                                            }
                                                        }}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full"
                                                    >
                                                        Save
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-500 px-2 py-2">
                                                        Ready to create
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* ID display for debugging */}
                                        {(sub.id || sub.subSectionId) && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                ID: {sub.id || sub.subSectionId}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {sec.subSections.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg
                                            className="w-12 h-12 mx-auto mb-3 text-gray-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            />
                                        </svg>
                                        <p>
                                            No topics added yet. Click &quot;Add
                                            Topic&quot; to get started.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleSubmitSection(secIdx)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    {sectionIdToReplace !== null
                                        ? 'Update Module'
                                        : 'Create Module'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Existing Modules */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Course Modules
                        </h2>
                        {course.sections && course.sections.length > 0 && (
                            <div className="flex gap-3">
                                {arrangeMode ? (
                                    <>
                                        <button
                                            onClick={cancelArrangeMode}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveArrangement}
                                            disabled={isSavingArrangement}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            {isSavingArrangement
                                                ? 'Saving...'
                                                : 'Save Arrangement'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={toggleArrangeMode}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                        Arrange Modules
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {!displaySections || displaySections.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                No modules created yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Start building your course by adding your first
                                module.
                            </p>
                        </div>
                    ) : arrangeMode ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleSectionDragEnd}
                        >
                            <SortableContext
                                items={tempSections.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-6">
                                    {tempSections.map((section, sectionIndex) => (
                                        <SortableSection
                                            key={section.id}
                                            section={section}
                                            sectionIndex={sectionIndex}
                                            handleSubSectionDragEnd={handleSubSectionDragEnd}
                                            sensors={sensors}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="space-y-6">
                            {displaySections.map((section, sectionIndex) => (
                                <div
                                    key={section.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    {/* Section Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                                                    {sectionIndex + 1}
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {section.name}
                                                </h3>
                                                {/* <button
                          disabled={sectionIndex === 0}
                          onClick={() => swapSections(sectionIndex, sectionIndex - 1)}
                          className="mr-2 hover:text-blue-500"
                        >
                          ↑ Move Up
                        </button>
                        <button
                          disabled={sectionIndex === course.sections.length - 1}
                          onClick={() => swapSections(sectionIndex, sectionIndex + 1)}
                          className="hover:text-blue-500"
                        >
                          ↓ Move Down
                        </button> */}
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    {section.subSections
                                                        ?.length || 0}{' '}
                                                    topics
                                                </span>
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteSection(
                                                                section.id,
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    onEditSection(section)
                                                }
                                                className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                                Edit Module
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section Content */}
                                    <div className="p-6">
                                        {section.subSections?.length === 0 ? (
                                            <p className="text-gray-500 italic">
                                                No topics in this module yet.
                                            </p>
                                        ) : (
                                            <div className="grid gap-4">
                                                {section.subSections?.map(
                                                    (sub, subIndex) => (
                                                        <div
                                                            key={
                                                                sub.id ||
                                                                sub.subSectionId ||
                                                                uuidv4()
                                                            }
                                                            className="border-4 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors duration-200"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="bg-gray-100 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                                                                            {subIndex +
                                                                                1}
                                                                        </div>
                                                                        <h4 className="font-semibold text-gray-900">
                                                                            {
                                                                                sub.name
                                                                            }
                                                                        </h4>
                                                                        <span
                                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                                sub.type ===
                                                                                'video'
                                                                                    ? 'bg-red-100 text-red-800'
                                                                                    : sub.type ===
                                                                                        'attachment'
                                                                                      ? 'bg-green-100 text-green-800'
                                                                                      : 'bg-blue-100 text-blue-800'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                sub.type
                                                                            }
                                                                        </span>
                                                                        <div>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleSubSectionDelete(
                                                                                        sub.subSectionId! ||
                                                                                            sub.id!,
                                                                                    )
                                                                                }
                                                                                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                                                            >
                                                                                <svg
                                                                                    className="w-4 h-4"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={
                                                                                            2
                                                                                        }
                                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {sub.file_url && (
                                                                        <div className="ml-9">
                                                                            {sub.type ===
                                                                            'video' ? (
                                                                                <div className="aspect-video w-full max-w-lg bg-black rounded-lg overflow-hidden">
                                                                                    <iframe
                                                                                        src={
                                                                                            sub.file_url
                                                                                        }
                                                                                        className="w-full h-full"
                                                                                        allow="accelerometer; encrypted-media; gyroscope; fullscreen"
                                                                                        allowFullScreen
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <a
                                                                                    href={
                                                                                        sub.file_url
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                                                                >
                                                                                    <svg
                                                                                        className="w-4 h-4"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        viewBox="0 0 24 24"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            strokeWidth={
                                                                                                2
                                                                                            }
                                                                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                                                        />
                                                                                    </svg>
                                                                                    View{' '}
                                                                                    {sub.type ===
                                                                                    'attachment'
                                                                                        ? 'Attachment'
                                                                                        : 'Code File'}
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
