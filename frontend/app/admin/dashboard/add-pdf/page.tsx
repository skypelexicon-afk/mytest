'use client'
import { useEffect, useState } from "react"
import { fetchApi } from "@/lib/doFetch"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

interface PDFData {
    id?: number;
    title: string;
    file_url: string;
}

export default function AddFreePDF() {
    const [pdfData, setPdfData] = useState<PDFData[]>([]);
    const [currPdf, setCurrPdf] = useState<PDFData>({ title: "", file_url: "" });
    const [isEditing, setIsEditing] = useState<boolean>(false);
 const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

     // Auth guard
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/');
            } else if (user?.role !== 'super_admin') {
                router.push('/');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const fetchPDFData = async () => {
        const res = await fetchApi.get<{ message: string, pdfs: PDFData[] }>(`api/free-pdfs/all`);
        setPdfData(res.pdfs);
    }

    useEffect(() => {
        if (isAuthenticated && user?.role === 'super_admin') {
            fetchPDFData();
        }
    }, [isAuthenticated, user]);

    const handleCreate = async () => {
        if (currPdf.title.trim() === "" || currPdf.file_url.trim() === "") {
            alert("Add name and title!");
            return;
        }
        try {
            const res = await fetchApi.post<PDFData, { message: string, pdf: PDFData }>(`api/free-pdfs/create`, currPdf);
            setPdfData((prev) => [...prev, res.pdf]);
            setCurrPdf({ title: "", file_url: "" });
        } catch (err) {
            console.error("Error creating pdf link: ", err);
        }
    }

    const handleEdit = async (pdf: PDFData) => {
        setIsEditing(true);
        setCurrPdf(pdf);
    }

    const handleDelete = async (pdf: PDFData) => {
        const res = window.confirm(`Do you want to delete this link for: ${pdf.title}`);
        if (res) {
            try {
                const res = await fetchApi.delete<undefined, { message: string }>(`api/free-pdfs/delete/${pdf.id}`, undefined);
                setPdfData(prev => prev.filter((e) => e.id !== pdf.id));
                alert(res.message);
            } catch (err) {
                console.error("Error deleting pdf link: ", err);
            }
        }
    }

    const handleUpdate = async () => {
        if (currPdf.title.trim() === "" || currPdf.file_url.trim() === "") {
            alert("Add name and title!");
            return;
        }
        try {

            const res = await fetchApi.put<PDFData, { message: string, pdf: PDFData }>(`api/free-pdfs/update/${currPdf.id}`, currPdf);
            setPdfData((prev) =>
                prev.map((pdf) =>
                    pdf.id === currPdf.id ? res.pdf : pdf
                )
            );
            setCurrPdf({ title: "", file_url: "" });
            setIsEditing(false);
        } catch (err) {
            console.error("Error editing pdf link: ", err)
        }
    }

    if (isLoading) {
        return <div className="p-6 text-center">Checking authentication...</div>;
    }

    if (!isAuthenticated || user?.role !== 'super_admin') {
        return <div className="p-6 text-center">Unauthorized</div>;
    }

    return (
        <>
            <div className="text-center text-2xl font-bold my-10">Add PDF download links for courses</div>
            <div className="flex flex-col items-center">
                <div className="max-w-11/12 min-w-10/12 flex gap-2 flex-wrap items-center justify-center">
                    <input type="text" placeholder="Name"
                        value={currPdf?.title}
                        onChange={(e) => setCurrPdf((prev) => ({ ...prev, title: e.target.value }))}
                        className="border border-gray-400 rounded px-3 py-2 w-1/3"
                    />
                    <input type="text" placeholder="PDF Link"
                        value={currPdf?.file_url}
                        onChange={(e) => setCurrPdf((prev) => ({ ...prev, file_url: e.target.value }))}
                        className="border border-gray-400 rounded px-3 py-2 w-1/3"
                    />
                    {isEditing ?
                        <button className="text-xl bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                            onClick={handleUpdate}
                        >
                            Update
                        </button>
                        :
                        <button className="text-xl bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                            onClick={handleCreate}
                        >
                            Add
                        </button>
                    }
                </div>
                {pdfData.length === 0 &&
                    <div className="max-w-11/12 min-w-10/12 my-10">
                        <p className="text-xl text-gray-500">No pdf links created yet.</p>
                    </div>}
                {pdfData.length !== 0 &&
                    <div className="max-w-11/12 min-w-10/12 my-10">
                        <p className="text-xl font-bold">Created links</p>
                        <table className="table-auto w-full border-collapse border border-gray-300 my-4 text-lg">
                            <thead>
                                <tr className="bg-gray-200 font-bold">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Link</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pdfData.map((pdf, idx) => (
                                    <tr key={idx} className="hover:bg-gray-100 border border-gray-300">
                                        <td className="border-r border-gray-300 px-4 py-2">{pdf.title}</td>
                                        <td className="border-r border-gray-300 px-4 py-2">
                                            <a className="text-blue-500 underline" href={pdf.file_url} target="blank">
                                                {pdf.file_url}
                                            </a>
                                        </td>
                                        <td className="px-4 py-2 flex gap-2">
                                            <button className="px-4 py-1 rounded text-md cursor-pointer text-white bg-slate-700 hover:bg-slate-900"
                                                onClick={() => handleEdit(pdf)}
                                            >
                                                Edit
                                            </button>
                                            <button className="px-4 py-1 rounded text-md cursor-pointer text-white bg-red-500 hover:bg-red-800"
                                                onClick={() => handleDelete(pdf)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </>
    )
}