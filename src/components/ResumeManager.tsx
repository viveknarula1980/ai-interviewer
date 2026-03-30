"use client";

import { useState } from "react";
import { Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Resume {
  id: string;
  fileName: string;
}

export default function ResumeManager({ initialResume }: { initialResume: Resume | null }) {
  const [resume, setResume] = useState<Resume | null>(initialResume);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("resumeFile", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResume({ id: "temp", fileName: file.name });
      toast.success("Resume uploaded and parsed successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch("/api/resume/delete", { method: "DELETE" });
      if (res.ok) {
        setResume(null);
        toast.success("Resume deleted.");
      }
    } catch (err) {
      toast.error("Failed to delete resume.");
    }
  };

  return (
    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <FileText className="text-blue-500" /> Resume Profile
      </h2>
      
      {resume ? (
        <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-xl mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-blue-400 mb-1">Active Resume</h3>
              <p className="text-white font-medium">{resume.fileName}</p>
              <p className="text-xs text-gray-400 mt-2">Parsed securely. Ready for AI integration.</p>
            </div>
            <button 
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition" 
              title="Delete Resume"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 mb-6 font-medium">No resume uploaded. The AI will only provide subject-based interviews until you upload a CV.</p>
      )}

      <div className="relative group cursor-pointer">
        <input 
          type="file" 
          accept=".pdf,.docx" 
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
        />
        <div className={`border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center transition ${uploading ? 'opacity-50' : 'group-hover:border-blue-500 group-hover:bg-blue-500/5'}`}>
          <Upload size={32} className={`text-gray-400 mb-4 transition ${uploading ? 'animate-bounce' : 'group-hover:text-blue-500'}`} />
          <p className="font-medium text-center">
            {uploading ? "Parsing Resume..." : resume ? "Click or Drag & Drop to replace CV" : "Click or Drag & Drop to upload CV"}
          </p>
          <p className="text-xs text-gray-500 mt-2">Supports PDF & DOCX (Max 5MB)</p>
        </div>
      </div>
    </section>
  );
}
