'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getDocument,//
  GlobalWorkerOptions,
  PDFDocumentProxy,
} from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { FaSearchMinus, FaSearchPlus, FaExpand, FaTimes } from 'react-icons/fa';
import { FaCheck, FaRegCircle } from "react-icons/fa";
GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

interface PDFViewerProps {
  fileUrl: string;
  username: string;
  email: string;
  
 
}
const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, username, email, }) => {
  // const fileUrlDummy = fileUrl.replace("notenew", "devnote");
  // console.log(fileUrlDummy);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
const [completed, setCompleted] = useState(false);
const watermarkText = `   ${username}   ${email}   `;

  const rootElement = fullscreenContainerRef.current ?? null;


  const enterFullscreen = () => {
    setFullscreen(true);
  };




  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setFullscreen(false);
  };

  useEffect(() => {
  if (currentPage === pageImages.length && pageImages.length > 0) {
    setCompleted(true);
  }
}, [currentPage, pageImages.length]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 500) setScale(1.5);
      else if (width < 768) setScale(1.2);
      else setScale(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (!fileUrl) return;
    getDocument(fileUrl)
      .promise.then((pdf) => {
        setPdfDoc(pdf);
      })
      .catch((err) => console.error('Error loading PDF:', err));
  }, [fileUrl]);


  useEffect(() => {
  if (!pdfDoc) return;

  const renderAllPages = async () => {
  setLoading(true);
  const images: string[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({ canvasContext: context, viewport }).promise;

      //  Draw single diagonal watermark in center
       let watermarkText = `${username}  `;
      if (email) {
        watermarkText += `  ${email}`;
      }

      context.save();
      context.font = "bold 28px Arial";
       context.fillStyle = "rgba(57, 255, 20, 0.3)"; // color
      context.textAlign = "center";
      context.textBaseline = "middle";

      // move origin to center, rotate, draw, reset
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((-30 * Math.PI) / 180); 
      context.fillText(watermarkText, 0, 0);
      context.restore();

      images.push(canvas.toDataURL());//
    }
  }

  setPageImages(images);
  setLoading(false);
};


  renderAllPages();
}, [pdfDoc]);

  useEffect(() => {
    if (!pageRefs.current || pageRefs.current.length === 0) return;

    // ✅ define rootElement here inside the effect
    const rootElement = fullscreenContainerRef.current ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisibleEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (!mostVisibleEntry ||
              entry.intersectionRatio > mostVisibleEntry.intersectionRatio)
          ) {
            mostVisibleEntry = entry;
          }
        }

        if (mostVisibleEntry) {
          const indexAttr = mostVisibleEntry.target.getAttribute("data-index");
          const pageIndex = indexAttr ? Number(indexAttr) : NaN;
          if (!isNaN(pageIndex)) {
            setCurrentPage(pageIndex + 1);
          }
        }
      },
      {
        root: rootElement, // 👈 make sure the container is used as root
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      pageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, [pageImages, fullscreen]);



  useEffect(() => {
    if (fullscreen && fullscreenContainerRef.current) {
      fullscreenContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting fullscreen:", err);
      });
    }

    // listen for ESC key exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [fullscreen]);

  return (
    <>
      {loading && <p>Loading...</p>}

{/*  top-right complete/tick button */}
  <div className="fixed top-4  right-4 z-50">
    <button
      onClick={() => setCompleted((prev) => !prev)} // toggle
      className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition ${
        completed
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {completed ? <FaCheck /> : <FaRegCircle />}
      {completed ? "Completed (Undo)" : "Mark Complete"}
    </button>
  </div>

      <div //className="sticky top-0 z-10 flex flex-wrap gap-2 items-center bg-gray-100 py-2 px-4 justify-center shadow"
      className="sticky top-0 z-10 flex flex-wrap gap-2 items-center bg-yellow-200 py-2 px-4 justify-center shadow"
      >
        <div className="controls">
          <button  //className="bg-gray-200 p-2 mx-2 rounded" 
          className="bg-yellow-500 p-2 mx-2 rounded" 
          
          onClick={() => setScale((s) => s + 0.2)}><FaSearchPlus /></button>
          <button //className="bg-gray-200 p-2 rounded" 
          className="bg-yellow-500 p-2 rounded"
          onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>
            <FaSearchMinus />
          </button>
        </div>
        <button
          onClick={enterFullscreen}
          //className="ml-4 bg-purple-600 text-white p-2 px-3 rounded hover:bg-purple-700 flex items-center gap-1 text-sm"
          className="ml-4 bg-yellow-800 text-yellow-200 p-2 px-3 rounded hover:bg-yellow-200 hover:text-yellow-800 flex items-center gap-1 text-sm"
        >
          <FaExpand /> Fullscreen
        </button>

      </div>


      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center px-2 pb-16 select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {pageImages.map((src, index) => (
          <div
            key={index}
            className="pdf-page mb-6"
            ref={(el) => {
              pageRefs.current[index] = el;
            }}
            data-index={index}
          >
            <img
              src={src}
              alt={`Page ${index + 1}`}
              className="bg-white block h-auto my-4"
              draggable={false}
              style={{
                width: `${scale * 100}%`, 
                maxWidth: "none",      
              }}
            />

          </div>
        ))}

        <div //className="fixed bottom-4 mr-28 flex content-center items-center right-4 bg-violet-600 text-white px-3 py-1 rounded-lg shadow"
        className="fixed bottom-4 mr-28 flex content-center items-center right-4 bg-yellow-800 text-yellow-200 px-3 py-1 rounded-lg shadow"
        >
          Page {currentPage} of {pageImages.length}
        </div>



      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            ref={fullscreenContainerRef}
            //className="flex-1 h-full w-full flex flex-col items-center bg-white p-4 select-none overflow-y-auto min-h-0"
            className="flex-1 h-full w-full flex flex-col items-center  p-4 select-none overflow-y-auto min-h-0"
          >
            {/*  top-right complete/tick button */}
  <div className="fixed top-4 right-4 z-50">
    <button
      onClick={() => setCompleted((prev) => !prev)} // toggle
      className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition ${
        completed
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {completed ? <FaCheck /> : <FaRegCircle />}
      {completed ? "Completed (Undo)" : "Mark Complete"}
    </button>
  </div>
            {/* Controls */}
            <div className="controls sticky top-0 bg-white p-2 shadow z-50 flex gap-2">
              <button
                className="bg-gray-200 p-2 rounded"
                onClick={() => setScale((s) => s + 0.2)}
              >
                <FaSearchPlus />
              </button>
              <button
                className="bg-gray-200 p-2 rounded"
                onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
              >
                <FaSearchMinus />
              </button>
            </div>

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-4">
              <p className="font-bold text-lg">PDF Viewer (Fullscreen)</p>
              <button
                onClick={exitFullscreen}
                className="text-red-600 hover:underline flex items-center gap-1"
              >
                <FaTimes /> Close
              </button>
            </div>

            {/* PDF pages */}
            {pageImages.map((src, index) => (
              <div
                key={index}
                className="pdf-page mb-6"
                ref={(el: HTMLDivElement | null) => {
                  pageRefs.current[index] = el;
                }}
                data-index={index}
              >
                <img
                  src={src}
                  alt={`Page ${index + 1}`}
                  className="bg-white block max-w-full h-auto my-4"
                  draggable={false}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    display: "block",
                    marginBottom: "1rem",
                  }}
                />
              </div>
            ))}

            {/* Floating "current page" indicator */}
            <div //className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white px-3 py-1 rounded-lg shadow"
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-800 text-yellow-200 px-3 py-1 rounded-lg shadow"
            
            >
              Page {currentPage} of {pageImages.length}
            </div>

     



          </div>
        </div>
      )}




    </>
  );
};

export default PDFViewer;
