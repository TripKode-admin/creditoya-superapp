import { Eye, Paperclip, Upload } from "lucide-react";
import { useRef, useState } from "react";
import DocumentViewerModal from "./DocumentoViewModal";
import axios from "axios";

/**
 * Componente de Card para documentos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del documento
 * @param {string} props.value - Valor o ID del documento (puede ser undefined)
 * @param {string} props.documentUrl - URL del documento para visualizar (puede ser undefined)
 * @param {boolean} props.showButton - Indica si debe mostrar el botón "Mostrar"
 * @param {string} props.loanId - ID del préstamo asociado al documento
 * @param {Function} props.onUploadSuccess - Callback que se ejecuta cuando se sube un archivo con éxito
 * @param {Function} props.onUploadError - Callback que se ejecuta cuando hay un error al subir un archivo
 */
interface DocumentCardProps {
    title: string;
    value?: string;
    documentUrl?: string;
    showButton?: boolean;
    loanId: string;
    onUploadSuccess?: (documentType: string, data: any) => void;
    onUploadError?: (errorMessage: string) => void;
}

interface UploadResponse {
    documentUrl?: string;
    documentId?: string;
    id?: string;
    [key: string]: any;
}

interface UploadItem {
    type: string;
    response?: UploadResponse;
    [key: string]: any;
}

const DocumentCard = ({
    title,
    value,
    documentUrl: initialDocumentUrl,
    showButton = true,
    loanId,
    onUploadSuccess,
    onUploadError
}: DocumentCardProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [documentUrl, setDocumentUrl] = useState(initialDocumentUrl);
    const [documentId, setDocumentId] = useState(value);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Sube el archivo a la API
     * @param file Archivo a subir
     */
    const uploadFileToApi = async (file: File) => {
        try {
            setIsUploading(true);
            setUploadProgress(0);

            // Crear FormData para enviar el archivo
            const formData = new FormData();

            // Agregar el archivo con el nombre correcto según el título del documento
            const fileFieldName = title.toLowerCase().includes('carta laboral')
                ? 'labor_card'
                : title.toLowerCase().includes('primer volante')
                    ? 'fisrt_flyer'
                    : title.toLowerCase().includes('segundo volante')
                        ? 'second_flyer'
                        : 'third_flyer';

            formData.append(fileFieldName, file);

            // Agregar el ID del préstamo
            if (!loanId) {
                throw new Error('ID del préstamo no disponible');
            }
            formData.append('loanId', loanId);

            // Simular progreso de subida con intervalos
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + Math.random() * 15;
                    return newProgress > 90 ? 90 : newProgress;
                });
            }, 500);

            // Realizar la petición a la API
            const response = await axios.post('/api/loan/reject-doc', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress > 90 ? 90 : progress); // Mantener en 90% máximo hasta confirmación
                    }
                }
            });

            clearInterval(progressInterval);

            // Verificar la respuesta
            if (!response.data || response.status !== 200) {
                throw new Error('Error al subir el archivo');
            }

            const data = response.data;

            // Actualizar el estado con la URL y ID del documento
            // Asumiendo que la respuesta contiene estos campos
            if (data.uploads && data.uploads.length > 0) {
                const upload = (data.uploads as UploadItem[]).find((u: UploadItem) => u.type === fileFieldName);
                if (upload && upload.response) {
                    setDocumentUrl(upload.response.documentUrl || upload.response[fileFieldName]);
                    setDocumentId(upload.response.documentId || upload.response.id);
                }
            }

            setUploadProgress(100);

            // Simular finalización del proceso
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                // Notificar éxito si se proporciona una función de callback
                if (onUploadSuccess) {
                    onUploadSuccess(fileFieldName, data);
                }
            }, 500);

        } catch (error) {
            console.error("Error al subir el archivo:", error);
            setIsUploading(false);
            setUploadProgress(0);

            // Mostrar el error al usuario
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir el archivo';
            alert(errorMessage);

            // Notificar error si se proporciona una función de callback
            if (onUploadError) {
                onUploadError(errorMessage);
            }
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
            uploadFileToApi(e.dataTransfer.files[0]);
        }
    };

    /**
     * Maneja el evento de cambio en el input de archivo
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFileToApi(e.target.files[0]);
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

    // Si no hay URL de documento, mostrar el componente de subida
    if (!documentUrl) {
        return (
            <div
                className={`bg-green-50/80 dark:bg-gray-700 backdrop-blur-sm border-2 border-dashed ${isDragging ? 'border-green-400 bg-green-100/90' : 'border-green-200'} shadow-sm hover:border-green-300 transition-all duration-300 p-4 rounded-lg flex flex-col justify-center items-center mb-3 min-h-[100px] cursor-pointer`}
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
                    <div className="mb-2 bg-green-100/70 dark:bg-gray-600 p-3 rounded-full">
                        {isUploading ? (
                            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Upload className="text-green-500 dark:text-green-400 w-6 h-6" />
                        )}
                    </div>
                    <p className="font-medium text-green-700 dark:text-green-400">{title}</p>
                    {isUploading ? (
                        <div className="w-full mt-2">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">
                                Subiendo archivo... {Math.round(uploadProgress)}%
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">
                            Arrastra o selecciona un documento
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Si hay URL de documento, mostrar la tarjeta normal
    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700 hover:shadow-sm p-4 rounded-lg flex flex-row justify-between mb-3">
                <div className="flex items-center">
                    <div className="mr-3 dark:bg-gray-700 bg-green-100/70 p-2 rounded-full">
                        <Paperclip className="text-green-500 dark:text-green-400 w-4 h-4 drop-shadow" />
                    </div>
                    <div>
                        <p className="font-medium text-sm text-green-700 dark:text-green-400">{title}</p>
                        <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">ID: {documentId}</p>
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