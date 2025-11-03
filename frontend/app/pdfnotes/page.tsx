"use client";//

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/doFetch";
import { Download, FileText, Search } from "lucide-react";
import OfferPopup from "@/components/LandingComponents/OfferPopup";

type Pdf = {
  id: number;
  title: string;
  file_url: string;
  created_at: string;
};

type PdfResponse = {
  message: string;
  pdfs: Pdf[];
};

export default function PdfNotesPage() {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  

  useEffect(() => {
    const fetchPdfs = async () => {
     try {
        const res = await fetchApi.get<PdfResponse>("api/free-pdfs/all");
      
        const sortedPdfs = (res.pdfs || []).sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setPdfs(sortedPdfs);}
         catch (err: unknown) {
        console.error("Error fetching PDFs:", err);
        setError("Failed to load notes. Please try again later.");
      } 
    };

    fetchPdfs();
  }, []);

  

  if (error)
    return <div className="p-6 text-center text-red-600">{error}</div>;

  
  const filteredPdfs = pdfs.filter((pdf) =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-violet-700">
        Lecture Notes
      </h1>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {filteredPdfs.length === 0 ? (
        <p className="text-center text-gray-600">No notes found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="group p-5 border rounded-xl shadow-md bg-white hover:shadow-xl hover:scale-105 transform transition duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="text-violet-600 w-6 h-6" />
                <h2 className="font-semibold text-lg text-gray-800">
                  {pdf.title}
                </h2>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Uploaded on{" "}
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md text-xs">
                  {new Date(pdf.created_at).toLocaleDateString()}
                </span>
              </p>

              <a
                href={pdf.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-600 transition"
              >
                <Download className="w-4 h-4" /> View / Download
              </a>
            </div>
          ))}
        </div>
      )}
       
      <OfferPopup
  imageSrc="/images/popup2.png"
  title=" Bumper Offer – All-in-One Course Bundle!"
  description="Boost your engineering journey with our special bundles! "
/>

    </div>
  );
}
