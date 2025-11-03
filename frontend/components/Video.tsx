'use client';
import { useState, useEffect, useRef } from 'react';
import { CourseDetails, Section, SubSection } from '@/lib/types/courseType';
import { useAuthStore } from '@/store/useAuthStore';
import { toggleSubsectionCompletion, getCourseProgress } from '@/lib/api/Progress';

import {
    FaChevronRight,
    FaChevronLeft,
    FaVideo,
    FaFileAlt,
    FaTimes,
    FaFileCode,
    FaExpand,
    FaCompress,
    FaCheckCircle,
    FaCircle,
} from 'react-icons/fa';
import PDFViewer from '@/components/PDFViewer';
import CodeViewer from '@/components/CodeViewer';
interface VideoPlayerProps {
    courseDetails: CourseDetails | null;
    initialSubSectionId?: number;
    onClose: () => void;
}

export default function Video({
    courseDetails,
    initialSubSectionId,
    onClose,
}: VideoPlayerProps) {
    const currentUser = useAuthStore((state) => state.user);
    const [currentSubSection, setCurrentSubSection] =
        useState<SubSection | null>(null);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [openSections, setOpenSections] = useState<{
        [key: number]: boolean;
    }>({});

    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);

    // Progress tracking state
    const [completedSubsections, setCompletedSubsections] = useState<number[]>([]);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () =>
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange,
            );
    }, []);

    // Fetch progress when component mounts or courseDetails changes
    useEffect(() => {
        if (courseDetails?.id && currentUser) {
            fetchProgress();
        }
    }, [courseDetails?.id, currentUser]);

    const fetchProgress = async () => {
        if (!courseDetails?.id) return;
        try {
            const progress = await getCourseProgress(courseDetails.id);
            setCompletedSubsections(progress.completedSubsections || []);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const handleToggleComplete = async () => {
        if (!currentSubSection || !currentUser) return;
        
        setIsMarkingComplete(true);
        try {
            const response = await toggleSubsectionCompletion(currentSubSection.subSectionId);
            
            if (response.isCompleted) {
                setCompletedSubsections(prev => [...prev, currentSubSection.subSectionId]);
            } else {
                setCompletedSubsections(prev => 
                    prev.filter(id => id !== currentSubSection.subSectionId)
                );
            }
        } catch (error) {
            console.error('Error toggling completion:', error);
        } finally {
            setIsMarkingComplete(false);
        }
    };

    const isCurrentSubsectionCompleted = currentSubSection 
        ? completedSubsections.includes(currentSubSection.subSectionId)
        : false;

    const toggleSubsectionFromSidebar = async (subsectionId: number) => {
        if (!currentUser) return;
        
        setIsMarkingComplete(true);
        try {
            const response = await toggleSubsectionCompletion(subsectionId);
            
            if (response.isCompleted) {
                setCompletedSubsections(prev => [...prev, subsectionId]);
            } else {
                setCompletedSubsections(prev => 
                    prev.filter(id => id !== subsectionId)
                );
            }
        } catch (error) {
            console.error('Error toggling completion:', error);
        } finally {
            setIsMarkingComplete(false);
        }
    };

    useEffect(() => {
        if (courseDetails?.sections?.length) {
            let targetSubSection: SubSection | null = null;
            let targetSection: Section | null = null;

            if (initialSubSectionId) {
                for (const section of courseDetails.sections) {
                    const found = section.subSections.find(
                        (sub) => sub.subSectionId === initialSubSectionId,
                    );
                    if (found) {
                        targetSubSection = found;
                        targetSection = section;
                        break;
                    }
                }
            }

            if (!targetSubSection) {
                for (const section of courseDetails.sections) {
                    const firstVideo = section.subSections.find(
                        (sub) => sub.type === 'video' && sub.file_url,
                    );
                    if (firstVideo) {
                        targetSubSection = firstVideo;
                        targetSection = section;
                        break;
                    }
                }
            }

            if (targetSubSection && targetSection) {
                setCurrentSubSection(targetSubSection);
                setCurrentSection(targetSection);
                setOpenSections((prev) => ({
                    ...prev,
                    [targetSection.id]: true,
                }));
            }
        }
    }, [courseDetails, initialSubSectionId]);

    const toggleSection = (sectionId: number) => {
        setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleSubSectionClick = (sub: SubSection, sec: Section) => {
        if (sub.file_url) {
            setCurrentSubSection(sub);
            setCurrentSection(sec);
        }
    };

    const getAllDisplayableSubSections = () => {
        const all: Array<{ subSection: SubSection; section: Section }> = [];
        courseDetails?.sections?.forEach((section) => {
            section.subSections
                .filter((sub) => sub.file_url) // Keep only items that can be shown
                .forEach((sub) => all.push({ subSection: sub, section }));
        });
        return all;
    };

    const getNextSubSection = () => {
        if (!currentSubSection) return null;
        const all = getAllDisplayableSubSections();
        const index = all.findIndex(
            (item) =>
                item.subSection.subSectionId === currentSubSection.subSectionId,
        );
        return index < all.length - 1 ? all[index + 1] : null;
    };

    const getPreviousSubSection = () => {
        if (!currentSubSection) return null;
        const all = getAllDisplayableSubSections();
        const index = all.findIndex(
            (item) =>
                item.subSection.subSectionId === currentSubSection.subSectionId,
        );
        return index > 0 ? all[index - 1] : null;
    };

    const goToNext = () => {
        const next = getNextSubSection();
        if (next) handleSubSectionClick(next.subSection, next.section);
    };

    const goToPrevious = () => {
        const prev = getPreviousSubSection();
        if (prev) handleSubSectionClick(prev.subSection, prev.section);
    };

    if (!courseDetails) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                Loading course details...
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col md:flex-row min-h-screen text-yellow-800">
            {/* Sidebar */}
            <div //className="order-2 md:order-1 lg:min-w-80 w-full md:w-80 max-h-[50vh] md:max-h-full overflow-y-auto bg-white border-t md:border-t-0 md:border-r border-gray-300"
            className="order-2 md:order-1 lg:min-w-80 w-full md:w-80 max-h-[50vh] md:max-h-full overflow-y-auto bg-yellow-200 border-t md:border-t-0 md:border-r border-yellow-800"
            >
                {/* Sidebar header */}
                <div //className="p-4 border-b border-gray-200 bg-purple-50"
                className="p-4 border-b border-yellow-800 bg-yellow-200"
                >
                    <div className="flex items-center justify-between">
                        <h2 //className="text-lg font-semibold text-gray-800 truncate"
                        className="text-lg font-semibold text-yellow-800 truncate"
                        >
                            {courseDetails.title}
                        </h2>
                        <button
                            onClick={onClose}
                            //className="p-1 hover:bg-gray-200 rounded-full"
                            className="p-1 hover:bg-yellow-500 rounded-full"
                        >
                            <FaTimes //className="w-5 h-5 text-gray-600"
                            className="w-5 h-5 text-yellow-800"
                             />
                        </button>
                    </div>
                </div>

                {/* Course Content */}
                <div className="p-4">
                    <h3 //className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide"
                    className="text-sm font-semibold text-yellow-800 mb-3 uppercase tracking-wide"
                    >
                        Course Content
                    </h3>
                    {courseDetails.sections
                        .map((section, sectionIndex) => (
                            <div key={section.id} className="mb-2">
                                <div
                                    onClick={() => toggleSection(section.id)}
                                    className={`flex items-center justify-between p-3 cursor-pointer rounded-lg border ${
                                        currentSection?.id === section.id
                                           // ? 'bg-purple-100 border-purple-300'
                                            //: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                              ? 'bg-yellow-800  text-yellow-200 border-yellow-200'
                                            : 'bg-yellow-800 text-yellow-200 border-yellow-200 '
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <FaChevronRight
                                           // className={`w-3 h-3 text-gray-500 transition-transform ${
                                           className={`w-3 h-3 text-yellow-200 transition-transform ${
                                                openSections[section.id]
                                                    ? 'rotate-90'
                                                    : ''
                                            }`}
                                        />
                                        <span //className="text-sm font-medium text-gray-800"
                                        className="text-sm font-medium text-yellow-200"
                                        >
                                            {sectionIndex + 1}. {section.name}
                                        </span>
                                    </div>
                                    <span //className="text-xs text-gray-500"
                                    className="text-xs text-yellow-200"
                                    >
                                        {section.subSections.length} items
                                    </span>
                                </div>

                                {openSections[section.id] && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {section.subSections
                                            .map((subSection, subIndex) => (
                                                <div
                                                    key={
                                                        subSection.subSectionId
                                                    }
                                                    onClick={() =>
                                                        handleSubSectionClick(
                                                            subSection,
                                                            section,
                                                        )
                                                    }
                                                    className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-all ${
                                                        currentSubSection?.subSectionId ===
                                                        subSection.subSectionId
                                                           // ? 'bg-purple-200 border border-purple-300'
                                                           ? 'bg-yellow-400 border border-yellow-200'
                                                            : subSection.type ===
                                                                    'video' &&
                                                                subSection.file_url
                                                              //? 'hover:bg-purple-50 border border-transparent hover:border-purple-200'
                                                             // : 'hover:bg-gray-50 border border-transparent'
                                                               ? 'hover:bg-yellow-400  border border-transparent hover:border-yellow-200'
                                                              : 'hover:bg-yellow-400  border border-transparent'
                                                    }`}
                                                >
                                                    {/* Completion checkbox - Left side */}
                                                    <div 
                                                        className="flex-shrink-0 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Set current subsection first, then toggle
                                                            if (currentSubSection?.subSectionId !== subSection.subSectionId) {
                                                                setCurrentSubSection(subSection);
                                                                setCurrentSection(section);
                                                            }
                                                            // Use subsection directly for toggle
                                                            toggleSubsectionFromSidebar(subSection.subSectionId);
                                                        }}
                                                        title={
                                                            completedSubsections.includes(subSection.subSectionId)
                                                                ? 'Mark as incomplete'
                                                                : 'Mark as complete'
                                                        }
                                                    >
                                                        {completedSubsections.includes(subSection.subSectionId) ? (
                                                            <FaCheckCircle //className="w-5 h-5 text-green-600"
                                                            className="w-5 h-5 text-yellow-800 "
                                                             />
                                                        ) : (
                                                            <FaCircle //className="w-5 h-5 text-gray-300"
                                                            className="w-5 h-5 text-yellow-800 "
                                                             />
                                                        )}
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        {subSection.type ===
                                                            'video' &&
                                                        subSection.file_url ? (
                                                            <>
                                                                <p className="hidden md:block font-semibold">
                                                                    {
                                                                        subSection.duration
                                                                    }
                                                                </p>
                                                                <FaVideo //className="w-4 h-4 text-blue-600"
                                                                className="w-4 h-4 text-yellow-800 " 
                                                                />
                                                            </>
                                                        ) : subSection.type ===
                                                          'attachment' ? (
                                                            <FaFileAlt //className="w-4 h-4 text-gray-400"
                                                            className="w-4 h-4 text-yellow-800  "
                                                             />
                                                        ) : (
                                                            <FaFileCode //className="w-4 h-4 text-gray-400" 
                                                            className="w-4 h-4 text-yellow-800 " 
                                                            />
                                                        )}
                                                    </div>
                                                    <p
                                                        className={`text-sm truncate ${
                                                            currentSubSection?.subSectionId ===
                                                            subSection.subSectionId
                                                                //? 'font-semibold text-purple-800'
                                                                //: 'text-gray-700'
                                                                ? 'font-semibold text-yellow-800 '
                                                                : 'text-yellow-800 '
                                                        }`}
                                                    >
                                                        {sectionIndex + 1}.
                                                        {subIndex + 1}{' '}
                                                        {subSection.name}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>

            {/* Video Player */}
            <div className="order-1 md:order-2 flex-1 flex flex-col">
                {currentSubSection ? (
                    <>
                        {/* Video Header */}
                        <div //className="bg-white p-4 border-b border-gray-200"
                        className="bg-white p-4 border-b border-yellow-800"
                        >
                            <h1 //className="text-xl font-semibold text-gray-800"
                            className="text-xl font-semibold text-yellow-800"
                            >
                                {currentSubSection.name}
                            </h1>
                            <p //className="text-sm text-gray-600"
                            className="text-sm text-yellow-800"
                            >
                                {currentSection?.name}
                            </p>
                        </div>

                        {/* Video or PDF section */}
                        <div
                            ref={videoContainerRef}
                            className="flex-1 bg-black flex items-center justify-center overflow-y-auto relative"
                        >
                            <div className="w-full h-full mx-auto aspect-video">
                                {currentSubSection.file_url &&
                                    (currentSubSection.type === 'video' ? (
                                        <div className="relative w-full h-full">
                                            <iframe
                                                src={currentSubSection.file_url}
                                                className="w-full h-full"
                                                style={{ border: 0 }}
                                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                            />

                                            {/* Watermark overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                                                <p
                                                    className="text-sm font-bold"
                                                    style={{
                                                        color: 'rgba(57, 255, 20, 0.2)',
                                                        transform:
                                                            'rotate(-20deg)',
                                                    }}
                                                >
                                                    {currentUser?.name ||
                                                        'Guest'}{' '}
                                                    ·{' '}
                                                    {currentUser?.email ||
                                                        'guest@example.com'}
                                                </p>
                                            </div>

                                            {isFullscreen && (
                                                <button
                                                    onClick={() => {
                                                        document.exitFullscreen();
                                                        setIsFullscreen(false);
                                                    }}
                                                    className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-2 text-white rounded-lg z-50 hover:text-gray-300 bg-black/40"
                                                >
                                                    <span className="text-xs sm:text-sm md:text-base">
                                                        Exit Fullscreen
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    ) : currentSubSection.type ===
                                      'attachment' ? (
                                        <PDFViewer
                                            fileUrl={currentSubSection.file_url}
                                            username={
                                                currentUser?.name || 'Guest'
                                            }
                                            email={
                                                currentUser?.email ||
                                                'guest@example.com'
                                            }
                                        />
                                    ) : currentSubSection.type ===
                                      'code_file' ? (
                                        <CodeViewer
                                            fileUrl={currentSubSection.file_url}
                                        />
                                    ) : (
                                        <div className="text-white text-center">
                                            <p className="text-xl">
                                                No file available for this
                                                lesson
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="bg-white border-t border-gray-200">
                            {/* Mark as Complete Button - Above navigation */}
                            {currentSubSection && currentUser && (
                                <div //className="px-4 pt-3 pb-2 border-b border-gray-200"
                                className="px-4 pt-3 pb-2 border-b  border-yellow-800"
                                >
                                    <button
                                        onClick={handleToggleComplete}
                                        disabled={isMarkingComplete}
                                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                            isCurrentSubsectionCompleted
                                              //  ? 'bg-green-50 text-green-700 border-2 border-green-600 hover:bg-green-100'
                                               // : 'bg-purple-600 text-white hover:bg-purple-700'
                                               ? 'bg-yellow-200 text-yellow-800 border-2 border-yellow-800 hover:bg-yellow-200'
                                               : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-800 hover:text-yellow-200'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isCurrentSubsectionCompleted ? (
                                            <>
                                                <FaCheckCircle className="w-5 h-5" />
                                                <span>Completed ✓</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCircle className="w-5 h-5" />
                                                <span>Mark as Complete</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Mobile view: compact row */}
                            <div className="flex items-center justify-between px-8 py-2 sm:hidden w-full">
                                <button
                                    onClick={goToPrevious}
                                    disabled={!getPreviousSubSection()}
                                    //className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                    className="p-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-800 hover:text-yellow-200 disabled:opacity-50"
                                >
                                    <FaChevronLeft size={10} />
                                </button>

                                {/* Fullscreen button (now also in mobile) */}
                                <button
                                    onClick={toggleFullscreen}
                                  //  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-800 hover:text-yellow-200"
                                >
                                    {isFullscreen ? (
                                        <>
                                            <FaCompress size={14} />
                                            <span>Exit Fullscreen</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaExpand size={14} />
                                            <span>Fullscreen</span>
                                        </>
                                    )}
                                </button>

                                <p //className="text-sm text-gray-600 text-center"
                                className="text-sm text-yellow-800 text-center"
                                >
                                    {getAllDisplayableSubSections().findIndex(
                                        (item) =>
                                            item.subSection.subSectionId ===
                                            currentSubSection.subSectionId,
                                    ) + 1}{' '}
                                    of {getAllDisplayableSubSections().length}
                                </p>

                                <button
                                    onClick={goToNext}
                                    disabled={!getNextSubSection()}
                                   // className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                   className="p-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-800 hover:text-yellow-200 disabled:opacity-50"
                                >
                                    <FaChevronRight size={10} />
                                </button>
                            </div>

                            {/* Desktop view: full layout */}
                            <div className="hidden sm:flex flex-row items-center justify-between p-4 gap-2">
                                <button
                                    onClick={goToPrevious}
                                    disabled={!getPreviousSubSection()}
                                  //  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-800 text-yellow-200 rounded-lg hover:bg-yellow-200 hover:text-yellow-800 disabled:opacity-50"
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                    <span>Previous</span>
                                </button>

                                <p className="text-sm text-gray-600 text-center">
                                    Subsection{' '}
                                    {getAllDisplayableSubSections().findIndex(
                                        (item) =>
                                            item.subSection.subSectionId ===
                                            currentSubSection.subSectionId,
                                    ) + 1}{' '}
                                    of {getAllDisplayableSubSections().length}
                                </p>

                                <div className="flex items-center gap-2">
                                    {/* Fullscreen button */}
                                    <button
                                        onClick={toggleFullscreen}
                                      //  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-800 text-yellow-200 rounded-lg hover:bg-yellow-200 hover:text-yellow-800"
                                    >
                                        {isFullscreen ? (
                                            <>
                                                <FaCompress className="w-4 h-4" />
                                                <span>Exit Fullscreen</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaExpand className="w-4 h-4" />
                                                <span>Fullscreen</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={goToNext}
                                        disabled={!getNextSubSection()}
                                        //className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-800 text-yellow-200 rounded-lg hover:bg-yellow-200 hover:text-yellow-800 disabled:opacity-50"
                                    >
                                        <span>Next</span>
                                        <FaChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div //className="flex-1 flex items-center justify-center text-white"
                    className="flex-1 flex items-center justify-center text-yellow-800"
                    >
                        <div className="text-center">
                            <FaVideo //className="w-16 h-16 mx-auto mb-4 text-gray-400"
                            className="w-16 h-16 mx-auto mb-4 text-yellow-800"
                             />
                            <h2 className="text-2xl font-semibold mb-2">
                                No Lecture Selected
                            </h2>
                            <p className="text-gray-400">
                                Select a lecture from the course content to
                                start learning.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
