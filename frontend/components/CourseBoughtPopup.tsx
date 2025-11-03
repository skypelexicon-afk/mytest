"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { fetchApi } from "@/lib/doFetch";
import Link from "next/link";
import { FaRegCircleUser } from "react-icons/fa6";

const allowedPathPatterns: RegExp[] = [
    /^\/$/, // strictly "/"
    /^\/student\/?$/, // strictly "/student" or "/student/" (trailing slash optional)
    /^\/all-courses\/?$/, // strictly "/all-courses"
    /^\/all-courses\/exploreBundle\/[^/]+$/, // dynamic bundle ID
    /^\/all-courses\/course\/[^/]+$/, // dynamic course ID
];

interface messageData {
    createdAt: string;
    days: number;
    hours: number;
    itemId: number;
    itemTitle: string;
    itemType: "course" | "bundle";
    userName: string;
}

const CourseBoughtPopup: React.FC = () => {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);
    const [messages, setMessages] = useState<messageData[]>([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        // check if current path matches or starts with any allowed path
        const matches = allowedPathPatterns.some((regex) => regex.test(pathname));
        setIsAllowed(matches);
    }, [pathname])

    useEffect(() => {
        if (!isAllowed) return;

        let timeoutId: NodeJS.Timeout;
        let hideTimeoutId: NodeJS.Timeout;

        const showPopupLoop = () => {
            setVisible(true);

            // hide popup after 5s
            hideTimeoutId = setTimeout(() => setVisible(false), 5500);

            // move to next message (looping)
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);

            // next popup after random 22s–28s
            const nextDelay = Math.floor(Math.random() * (28000 - 22000 + 1)) + 22000;
            timeoutId = setTimeout(showPopupLoop, nextDelay);
        };

        // initial random delay before first popup (5s–20s)
        const initialDelay = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;
        timeoutId = setTimeout(showPopupLoop, initialDelay);

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(hideTimeoutId);
        };
    }, [isAllowed, messages]);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const res: { recentOrders: messageData[], success: boolean } = await fetchApi.get("api/notifications/")
                if (res.success && res.recentOrders.length !== 0) {
                    setIsAllowed(true);
                    setMessages(res.recentOrders);
                } else {
                    setIsAllowed(false);
                }
            } catch (err) {
                setIsAllowed(false);
                console.log("Error fetching recent orders: ", err);
            }
        }

        fetchRecentOrders();
    }, [])

    if (!isAllowed) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-5 left-5 z-50 max-w-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-center align-middle gap-3 border backdrop-blur-md bg-white/90 border-gray-200/40"
                >
                    <div className="text-purple-600 p-2">
                        <FaRegCircleUser size={38} />
                    </div>
                    <Link href={messages[currentMessageIndex].itemType == "course" ? `/all-courses/explore/${messages[currentMessageIndex].itemId}` : `/all-courses/exploreBundle/${messages[currentMessageIndex].itemId}`}>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium flex-1"><span className="text-bold">{messages[currentMessageIndex].userName}</span>{" "}enrolled in the <span className="font-bold text-blue-600 hover:text-blue-800 hover:underline">{messages[currentMessageIndex].itemTitle}</span>{" "}{messages[currentMessageIndex].itemType}</p>
                            <p className="text-sm mt-2">{messages[currentMessageIndex].days > 0 ? messages[currentMessageIndex].days + (messages[currentMessageIndex].days > 1 ? "days" : "day") : ""}{" "}{messages[currentMessageIndex].hours > 0 ? messages[currentMessageIndex].hours : ""}{" "}{messages[currentMessageIndex].hours > 0 ? messages[currentMessageIndex].hours > 1 ? "hours" : "hour" : "less than an hour"}{" "}ago</p>
                        </div>
                    </Link>
                    <div>
                        <button
                            onClick={() => setVisible(false)}
                            className="text-black/70 hover:text-black transition-colors hover:cursor-pointer absolute top-4 right-2"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CourseBoughtPopup;
