import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentUrl: string;
    documentName: string;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
    isOpen,
    onClose,
    documentUrl,
    documentName
}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            // Reset loading state when a new document is displayed
            const timer = setTimeout(() => setIsLoading(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, documentUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl h-full max-h-[90vh] mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {documentName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Document Viewer */}
                <div className="flex-grow relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <iframe
                            src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                            className="w-full h-full rounded-b-lg"
                            title={`Document: ${documentName}`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerModal;