import { Eye, Paperclip, Upload } from "lucide-react";
import { useRef, useState } from "react";
import DocumentViewerModal from "./DocumentoViewModal";

/**
 * Componente de Card para documentos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del documento
 * @param {string} props.value - Valor o ID del documento (puede ser undefined)
 * @param {string} props.documentUrl - URL del documento para visualizar (puede ser undefined)
 * @param {boolean} props.showButton - Indica si debe mostrar el botón "Mostrar"
 * @param {function} props.onUpload - Función para procesar la subida del documento
 */
interface DocumentCardProps {
    title: string;
    value?: string;
    documentUrl?: string;
    showButton?: boolean;
    onUpload?: (file: File) => void;
}

const DocumentCard = ({
    title,
    value,
    documentUrl,
    showButton = true,
    onUpload
}: DocumentCardProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    console.log({ value, documentUrl })

    /**
     * Maneja el proceso de subida de archivo
     * @param file Archivo a procesar
     */
    const handleFileUpload = async (file: File) => {
        if (!onUpload) return;

        try {
            setIsUploading(true);
            onUpload(file);
        } catch (error) {
            console.error("Error al procesar el archivo:", error);
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Maneja el evento de soltar archivo
     */
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    /**
     * Maneja el evento de cambio en el input de archivo
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };

    /**
     * Abre el selector de archivos
     */
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    /**
     * Abre el modal para visualizar el documento
     */
    const handleShowDocument = () => {
        setIsModalOpen(true);
    };

    // Si no hay valor, mostrar el componente de subida
    if (!documentUrl) {
        return (
            <div
                className={`bg-green-50/80 backdrop-blur-sm border-2 border-dashed ${isDragging ? 'border-green-400 bg-green-100/90' : 'border-green-200'} shadow-sm hover:border-green-300 transition-all duration-300 p-4 rounded-lg flex flex-col justify-center items-center mb-3 min-h-[100px] cursor-pointer`}
                onClick={triggerFileInput}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                }}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf,image/jpeg,image/png"
                />

                <div className="flex flex-col items-center text-center">
                    <div className="mb-2 bg-green-100/70 p-3 rounded-full">
                        {isUploading ? (
                            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Upload className="text-green-500 dark:text-green-400 w-6 h-6" />
                        )}
                    </div>
                    <p className="font-medium text-green-700 dark:text-green-400">{title}</p>
                    <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">
                        {isUploading ? "Procesando..." : "Arrastra o selecciona un documento"}
                    </p>
                </div>
            </div>
        );
    }

    // Si hay valor, mostrar la tarjeta normal
    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700 hover:shadow-sm p-4 rounded-lg flex flex-row justify-between mb-3">
                <div className="flex items-center">
                    {/* <div className="mr-3 dark:bg-gray-700 bg-green-100/70 p-2 rounded-full">
                        <Paperclip className="text-green-500 dark:text-green-400 w-4 h-4 drop-shadow" />
                    </div> */}
                    <div>
                        <p className="font-medium text-sm text-green-700 dark:text-green-400">{title}</p>
                        <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">ID: {value}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {showButton && documentUrl && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowDocument();
                            }}
                            className="text-xs bg-white dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600 text-green-600 dark:text-green-300 px-3 py-1.5 rounded-md border border-green-200 dark:border-gray-600 shadow-sm transition-colors duration-200 flex items-center gap-1"
                        >
                            <Eye className="w-3 h-3" />
                            Mostrar
                        </button>
                    )}
                </div>

                {/* Input oculto para cambiar el documento */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf,image/jpeg,image/png"
                />
            </div>

            {/* Modal para visualizar el documento */}
            {documentUrl && (
                <DocumentViewerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    documentUrl={documentUrl}
                    documentName={title}
                />
            )}
        </>
    );
};

export default DocumentCard;