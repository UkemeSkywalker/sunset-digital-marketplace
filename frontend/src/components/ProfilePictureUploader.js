import React, { useState, useRef } from 'react';

const ProfilePictureUploader = ({ imagePreview, onFileChange, uploadProgress, onCancel }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleDragEnter = (e) => {
    if (!showUploader) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    if (!showUploader) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    if (!showUploader) return;
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = (e) => {
    if (!showUploader) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange({ target: { files: e.dataTransfer.files } });
      e.dataTransfer.clearData();
      setShowUploader(false);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileSelected = (e) => {
    onFileChange(e);
    setShowUploader(false);
  };
  
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">Profile Picture</label>
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        
        {!showUploader ? (
          <button
            type="button"
            onClick={() => setShowUploader(true)}
            className="px-4 py-2 text-sm bg-white border border-sunset-orange text-sunset-orange rounded-md hover:bg-sunset-orange hover:text-white transition-colors"
          >
            Change Image
          </button>
        ) : (
          <div 
            className={`border-2 border-dashed ${isDragging ? 'border-sunset-orange bg-sunset-orange/10' : 'border-gray-300'} rounded-lg p-6 w-full text-center mb-4`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop an image here, or click to select
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="hidden"
            />
            
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 text-sm bg-white border border-sunset-orange text-sunset-orange rounded-md hover:bg-sunset-orange hover:text-white transition-colors"
              >
                Choose File
              </button>
              
              <button
                type="button"
                onClick={() => setShowUploader(false)}
                className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {uploadProgress > 0 && (
          <div className="w-full mt-4">
            <div className="text-xs font-medium text-gray-500 mb-1">
              Uploading: {uploadProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-sunset-orange h-1.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUploader;