
"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { useDarkMode } from "@/context/DarkModeContext";

interface BoxUploadFilesProps {
    title: string;
    accept?: string;
    maxSize?: number;
    required?: boolean;
    onChange?: (file: File | null) => void;
}

function BoxUploadFiles({
    title,
    accept = ".pdf,.jpg,.jpeg,.png",
    maxSize = 5, // Default 5MB
    required = false,
    onChange
}: BoxUploadFilesProps) {
    const { darkmode } = useDarkMode();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        validateAndSetFile(selectedFile);
    };

    // Validate file size and type
    const validateAndSetFile = (selectedFile: File | null) => {
        if (!selectedFile) {
            setFile(null);
            setError(null);
            if (onChange) onChange(null);
            return;
        }

        // Check file size
        const fileSizeInMB = selectedFile.size / (1024 * 1024);
        if (fileSizeInMB > maxSize) {
            setError(`El archivo excede el tamaño máximo de ${maxSize}MB`);
            return;
        }

        // Check file type if accept is specified
        const fileType = selectedFile.type;
        const acceptedTypes = accept.split(',').map(type => type.trim().replace('.', ''));

        // Handle special case for images and PDFs
        if (accept !== '*' && !acceptedTypes.some(type =>
            fileType.includes(type) ||
            (type === 'jpg' && fileType === 'image/jpeg')
        )) {
            setError(`Tipo de archivo no aceptado. Use: ${accept}`);
            return;
        }

        setFile(selectedFile);
        setError(null);
        if (onChange) onChange(selectedFile);
    };

    // Trigger file input click
    const handleBoxClick = () => {
        if (!file) {
            fileInputRef.current?.click();
        }
    };

    // Remove selected file
    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onChange) onChange(null);
    };

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0] || null;
        validateAndSetFile(droppedFile);
    };

    // Get file icon based on file type
    const getFileIcon = () => {
        if (!file) return null;

        const fileType = file.type;

        if (fileType.includes('pdf')) {
            return (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        } else if (fileType.includes('image')) {
            return (
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    return (
        <div className="flex flex-col w-full">
            <h5 className={`text-sm font-medium mb-2 ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                {title}
                {required && <span className="text-red-500 ml-1">*</span>}
            </h5>

            <div
                onClick={handleBoxClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative flex flex-col items-center justify-center w-full p-4
          border-2 border-dashed rounded-lg cursor-pointer transition-all
          ${file ? 'h-32' : 'h-40'}
          ${isDragging
                        ? `${darkmode ? 'border-blue-400 bg-blue-900/20' : 'border-blue-500 bg-blue-50'}`
                        : `${darkmode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                    }
          ${darkmode ? 'bg-gray-800' : 'bg-white'}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    required={required && !file}
                />

                {file ? (
                    <div className="flex flex-col items-center">
                        {getFileIcon()}
                        <p className={`mt-2 text-sm font-medium truncate max-w-full ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className={`
                mt-2 px-2 py-1 text-xs rounded
                ${darkmode ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-100 text-red-600 hover:bg-red-200'}
              `}
                        >
                            Eliminar
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <svg
                            className={`w-10 h-10 mb-3 ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className={`mb-1 text-sm ${darkmode ? 'text-gray-300' : 'text-gray-500'}`}>
                            <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
                        </p>
                        <p className={`text-xs ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {accept === "*" ? "Cualquier tipo de archivo" : accept.replaceAll(".", "")} (Máx. {maxSize}MB)
                        </p>
                    </div>
                )}

                {error && (
                    <p className="absolute bottom-1 left-0 right-0 text-center text-xs text-red-500 mt-1">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

export default BoxUploadFiles