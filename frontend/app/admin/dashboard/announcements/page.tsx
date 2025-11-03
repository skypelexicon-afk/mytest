'use client';

import { useDashboardStore } from '@/store/useAdminDataStore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
    getGeneralAnnouncements,
    GeneralAnnouncement,
} from '@/lib/api/generalAnnouncements';
import { fetchApi } from '@/lib/doFetch';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export default function AnnouncementPage() {
    const { enrollmentData, dashboardData, error, fetchDashboardData } =
        useDashboardStore();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    // ---- 🔒 Auth Guard ----
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || user?.role !== 'super_admin') {
                router.push('/');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    // ---- Dashboard Data ----
    useEffect(() => {
        if (
            isAuthenticated &&
            user?.role === 'super_admin' &&
            !enrollmentData &&
            !dashboardData
        ) {
            try {
                fetchDashboardData();
            } catch {
                console.log(error);
            }
        }
    }, [
        enrollmentData,
        dashboardData,
        fetchDashboardData,
        isAuthenticated,
        user,
    ]);

    // ---- General Announcements ----
    const [announcements, setAnnouncements] = useState<GeneralAnnouncement[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [editing, setEditing] = useState<GeneralAnnouncement | null>(null);

    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await getGeneralAnnouncements(page, limit);
            setAnnouncements(res.announcements);
            setTotal(res.total);
        } catch (err) {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [page]);

    // ---- Create / Update ----
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [pinned, setPinned] = useState(false);

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setPinned(false);
        setEditing(null);
    };

    const handleSave = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error('Title and message are required');
            return;
        }

        try {
            if (editing) {
                // Update existing
                await fetchApi.patch(
                    `api/general-announcements/${editing.id}`,
                    {
                        title,
                        message,
                        pinned,
                    },
                );
                toast.success('Announcement updated!');
            } else {
                // Create new
                await fetchApi.post('api/general-announcements', {
                    title,
                    message,
                    pinned,
                });
                toast.success('Announcement created!');
            }
            resetForm();
            setOpenDialog(false);
            fetchAnnouncements();
        } catch (err) {
            toast.error('Failed to save announcement');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this announcement?'))
            return;
        try {
            await fetchApi.delete(`api/general-announcements/${id}`, {});
            toast.success('Announcement deleted');
            fetchAnnouncements();
        } catch (err) {
            toast.error('Failed to delete announcement');
        }
    };

    if (isLoading)
        return (
            <div className="p-6 text-center">Checking authentication...</div>
        );
    if (!isAuthenticated || user?.role !== 'super_admin')
        return <div className="p-6 text-center">Unauthorized</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6 space-y-10">
            {/* ---------------------- General Announcements Section ---------------------- */}
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-700">
                        📢 General Announcements
                    </h2>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                + New Announcement
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editing
                                        ? 'Edit Announcement'
                                        : 'Create New Announcement'}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-3 py-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="Announcement title"
                                    />
                                </div>
                                <div>
                                    <Label>Message</Label>
                                    <RichTextEditor
                                        value={message}
                                        onChange={setMessage}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Pinned</Label>
                                    <Switch
                                        checked={pinned}
                                        onCheckedChange={setPinned}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="secondary"
                                    onClick={() => setOpenDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>
                                    {editing ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">
                        Loading announcements...
                    </p>
                ) : (
                    <div className="space-y-4">
                        {announcements.length === 0 ? (
                            <p className="text-gray-500 text-center">
                                No announcements found.
                            </p>
                        ) : (
                            announcements.map((a) => (
                                <div
                                    key={a.id}
                                    className={`p-4 rounded-lg border ${
                                        a.pinned
                                            ? 'border-yellow-500 bg-yellow-50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {a.title}
                                            </h3>
                                            <p
                                                className="text-sm text-gray-600 mt-1 prose max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: a.message,
                                                }}
                                            />
                                            <span className="text-xs text-gray-400 block mt-1">
                                                {new Date(
                                                    a.created_at,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditing(a);
                                                    setTitle(a.title);
                                                    setMessage(a.message);
                                                    setPinned(a.pinned);
                                                    setOpenDialog(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(a.id)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination className="mt-6">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                        />
                                    </PaginationItem>
                                    <span className="px-3 text-sm text-gray-500">
                                        Page {page} of {totalPages}
                                    </span>
                                    <PaginationItem>
                                        <PaginationNext
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(totalPages, p + 1),
                                                )
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>

            {/* ---------------------- Course-Specific Announcements ---------------------- */}
            <div className="min-h-screen flex justify-center">
                <table className="border-separate border-spacing-0 rounded-lg overflow-hidden shadow-lg h-fit bg-white">
                    <thead className="bg-gray-300">
                        <tr>
                            <th className="p-2 text-left">Course Name</th>
                            <th className="p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollmentData?.enrollments.map((course) => (
                            <tr
                                key={course.course_id}
                                className="hover:bg-gray-100"
                            >
                                <td className="p-2 border-b">
                                    {course.course_title}
                                </td>
                                <td className="p-2 border-b">
                                    <button
                                        className="text-blue-500 hover:underline text-sm"
                                        onClick={() =>
                                            router.push(
                                                `/admin/dashboard/announcements/${course.course_id}`,
                                            )
                                        }
                                    >
                                        View / Add Announcements
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
