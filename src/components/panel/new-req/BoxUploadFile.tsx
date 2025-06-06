"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Upload, FileText, X } from "lucide-react";

interface BoxUploadFilesProps {
    title: string;
    accept?: string;
    maxSize?: number;
    required?: boolean;
    onChange?: (file: File | null) => void;
}

function BoxUploadFiles({
    title,
    accept = "Solo archivos .pdf",
    maxSize = 5, // Default 5MB
    required = false,
    onChange
}: BoxUploadFilesProps) {
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

        // Check if file is PDF
        const fileType = selectedFile.type;
        if (fileType !== 'application/pdf') {
            setError('Solo se permiten archivos PDF');
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

    return (
        <div className="flex flex-col w-full">
            <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                        ? 'border-blue-400 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }
          bg-white dark:bg-gray-800
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    required={required && !file}
                />

                {file ? (
                    <div className="flex flex-col items-center">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <p className="mt-2 text-sm font-medium truncate max-w-full text-gray-700 dark:text-gray-300">
                            {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="mt-2 px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Eliminar
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <Upload className="w-10 h-10 mb-3 text-gray-500 dark:text-gray-400" />
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                            <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Solo archivos PDF (Máx. {maxSize}MB)
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

export default BoxUploadFiles;