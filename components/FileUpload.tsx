import React, { useCallback } from 'react';
import { Upload, FolderInput } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isProcessing }) => {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileArray = Array.from(event.target.files) as File[];
      // Filter for images and PDFs
      const validFiles = fileArray.filter(f => 
        f.type.startsWith('image/') || f.type === 'application/pdf'
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      } else {
        alert("Please select valid image (JPG, PNG) or PDF files.");
      }
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-white hover:bg-slate-50 transition-colors text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-brand-50 rounded-full text-brand-600">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Upload Invoices</h3>
            <p className="text-slate-500 text-sm mt-1">Select a folder or multiple files (Images, PDF)</p>
          </div>
          
          <div className="flex gap-4">
             {/* Standard File Input */}
            <label className={`relative cursor-pointer px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>Select Files</span>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isProcessing}
                accept="image/*,application/pdf"
              />
            </label>

            {/* Folder Input - Note: directory="" is non-standard but supported by most modern browsers for folders */}
             <label className={`relative cursor-pointer px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <FolderInput size={18} />
              <span>Select Folder</span>
              <input 
                type="file" 
                multiple 
                // @ts-ignore
                webkitdirectory=""
                directory="" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;