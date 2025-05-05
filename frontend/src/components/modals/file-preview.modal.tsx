"use client";

import { downloadFile, getFileViewUrl } from "@/actions/files.actions";
import { Button } from "@/components/ui/button";
import { Download, File, FileAudio, FileImage, FileText, FileVideo, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
  };
}

export const FilePreviewModal = ({ isOpen, onClose, file }: FilePreviewModalProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useGoogleDocs, setUseGoogleDocs] = useState(false);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  useEffect(() => {
    const loadFilePreview = async () => {
      if (!isOpen || !file) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getFileViewUrl(file.id);

        if (result.error) {
          console.error("Error getting file view URL:", result.error);
          setError(result.error);
          return;
        }

        if (result.viewUrl) {
          console.log("File view URL:", result.viewUrl);
          setFileUrl(result.viewUrl);

          const mimeType = file.type.toLowerCase();
          const fileExtension = file.name.split(".").pop()?.toLowerCase();

          const isGoogleDocsPreviewable =
            mimeType.includes("document") ||
            mimeType.includes("msword") ||
            mimeType.includes("vnd.openxmlformats-officedocument.wordprocessingml") ||
            fileExtension === "doc" ||
            fileExtension === "docx" ||
            fileExtension === "ppt" ||
            fileExtension === "pptx" ||
            fileExtension === "xls" ||
            fileExtension === "xlsx" ||
            fileExtension === "rtf";

          console.log("File type:", mimeType, "Extension:", fileExtension, "Is previewable:", isGoogleDocsPreviewable);

          setUseGoogleDocs(isGoogleDocsPreviewable);

          try {
            const response = await fetch(result.viewUrl);

            if (!response.ok) {
              console.error(`Failed to load file: ${response.status} ${response.statusText}`);
              setError(`Failed to load file: ${response.statusText}`);
              return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            console.log("Created blob URL:", url);
            setBlobUrl(url);
          } catch (fetchError) {
            console.error("Error fetching file content:", fetchError);
            setError("Failed to load file content");
          }
        } else {
          console.error("No view URL returned");
          setError("Could not load file preview");
        }
      } catch (error) {
        console.error("Error loading preview:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadFilePreview();
  }, [isOpen, file]);

  const handleDownload = async () => {
    try {
      const result = await downloadFile(file.id, file.name);

      if (result.error) {
        console.error("Download error:", result.error);
        return;
      }

      if (result.downloadUrl) {
        const link = document.createElement("a");
        link.download = result.fileName || file.name;

        fetch(result.downloadUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          });
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const getFileIcon = () => {
    const mimeType = file.type.toLowerCase();

    if (mimeType.includes("image")) {
      return <FileImage size={40} className="text-green-500" />;
    } else if (mimeType.includes("audio")) {
      return <FileAudio size={40} className="text-purple-500" />;
    } else if (mimeType.includes("video")) {
      return <FileVideo size={40} className="text-red-500" />;
    } else if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
      return <FileText size={40} className="text-orange-500" />;
    } else {
      return <File size={40} className="text-gray-500" />;
    }
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    else if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    else if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    else return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="mb-4">{getFileIcon()}</div>
          <h3 className="text-lg font-medium mb-2">{file.name}</h3>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    const mimeType = file.type.toLowerCase();
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    const isOfficeDoc =
      fileExtension === "doc" ||
      fileExtension === "docx" ||
      fileExtension === "ppt" ||
      fileExtension === "pptx" ||
      fileExtension === "xls" ||
      fileExtension === "xlsx" ||
      mimeType.includes("word") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation");

    if ((fileExtension === "doc" || fileExtension === "docx") && fileUrl) {
      return (
        <div className="h-full w-full flex flex-col">
          <div className="flex-1 relative">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              className="w-full h-full"
              title={file.name}
              onError={() => {
                console.error("Failed to load document in Google Docs viewer");
                setError("Failed to load document preview");
              }}
            ></iframe>
            <div className="absolute bottom-4 right-4">
              <Button onClick={handleDownload} variant="secondary" size="sm" className="bg-white/90 hover:bg-white shadow-md">
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
          <div className="p-2 text-xs text-center text-gray-500">If the preview doesn&apos;t load, please download the file to view it.</div>
        </div>
      );
    } else if (isOfficeDoc && blobUrl) {
      return (
        <div className="h-full w-full flex flex-col">
          <div className="flex-1 relative">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + "/api/proxy?url=" + encodeURIComponent(blobUrl))}`}
              className="w-full h-full"
              title={file.name}
              frameBorder="0"
              onError={() => {
                console.error("Failed to load document in Office viewer");
                setError("Failed to load document preview");
              }}
            ></iframe>
            <div className="absolute bottom-4 right-4">
              <Button onClick={handleDownload} variant="secondary" size="sm" className="bg-white/90 hover:bg-white shadow-md">
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
          <div className="p-2 text-xs text-center text-gray-500">If the preview doesn&apos;t load, please download the file to view it.</div>
        </div>
      );
    } else if (useGoogleDocs && fileUrl && !isOfficeDoc) {
      const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

      return (
        <div className="h-full w-full relative">
          <iframe src={googleDocsViewerUrl} className="w-full h-full" title={file.name} frameBorder="0" onError={() => setError("Failed to load document preview")}></iframe>
          <div className="absolute bottom-4 right-4">
            <Button onClick={handleDownload} variant="secondary" size="sm" className="bg-white/90 hover:bg-white shadow-md">
              <Download size={16} className="mr-2" />
              Download to view
            </Button>
          </div>
        </div>
      );
    } else if (mimeType.includes("image")) {
      return <div className="flex items-center justify-center h-full">{blobUrl && <img src={blobUrl} alt={file.name} className="max-h-full max-w-full object-contain" onError={() => setError("Failed to load image")} />}</div>;
    } else if (mimeType.includes("video")) {
      return (
        <div className="flex items-center justify-center h-full">
          {blobUrl && (
            <video controls className="max-h-full max-w-full" onError={() => setError("Failed to load video")}>
              <source src={blobUrl} type={file.type} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      );
    } else if (mimeType.includes("audio")) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-4">
            <FileAudio size={64} className="text-purple-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">{file.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{formatFileSize(file.size)}</p>
          {blobUrl && (
            <audio controls className="w-full max-w-md" onError={() => setError("Failed to load audio")}>
              <source src={blobUrl} type={file.type} />
              Your browser does not support the audio tag.
            </audio>
          )}
        </div>
      );
    } else if (mimeType.includes("pdf")) {
      return <div className="h-full w-full">{blobUrl && <iframe src={blobUrl} className="w-full h-full" title={file.name} onError={() => setError("Failed to load PDF")}></iframe>}</div>;
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="mb-4">{getFileIcon()}</div>
          <h3 className="text-lg font-medium mb-2">{file.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{formatFileSize(file.size)}</p>
          <p className="text-gray-600">Preview not available</p>
          <Button onClick={handleDownload} className="mt-4 flex items-center">
            <Download size={16} className="mr-2" />
            Download
          </Button>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col w-[90%] h-[90%] max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-3">
              <h2 className="text-lg font-medium">{file.name}</h2>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleDownload} variant="outline" size="sm" className="flex items-center">
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-500">
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">{renderPreviewContent()}</div>
      </div>
    </div>
  );
};
