import { ILoanApplication } from "@/types/full"
import { Files } from "lucide-react"
import DocumentCard from "./DocumentCard"
import { useState } from "react";

function DocumentsRequired({ loan }: { loan: ILoanApplication }) {
    // State to track uploaded documents
    const [uploadedDocs, setUploadedDocs] = useState({
        laborCard: null,
        firstFlyer: null,
        secondFlyer: null,
        thirdFlyer: null
    });

    // Handle successful upload
    const handleUploadSuccess = (documentType: string, data: any) => {
        console.log(`Documento ${documentType} subido exitosamente:`, data);
        
        // Update the state based on document type
        switch (documentType) {
            case 'labor_card':
                setUploadedDocs(prev => ({ ...prev, laborCard: data }));
                break;
            case 'fisrt_flyer': // Note: this typo is in the original code
                setUploadedDocs(prev => ({ ...prev, firstFlyer: data }));
                break;
            case 'second_flyer':
                setUploadedDocs(prev => ({ ...prev, secondFlyer: data }));
                break;
            case 'third_flyer':
                setUploadedDocs(prev => ({ ...prev, thirdFlyer: data }));
                break;
        }
    };

    // Handle upload error
    const handleUploadError = (errorMessage: string) => {
        console.error('Error al subir documento:', errorMessage);
        // Implement error handling (show notification, etc.)
    };

    return (
        <div className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-7">
                <div className="mr-3 dark:bg-gray-700 bg-green-100/70 p-2 rounded-full">
                    <Files className="text-green-500 dark:text-green-400 w-4 h-4 drop-shadow" />
                </div>
                <div>
                    <h2 className="font-medium text-sm text-green-700 dark:text-green-50 pb-0.5">Documentos Requeridos</h2>
                    <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">Estos documentos verifican que tienes como pagar el prestamo</p>
                </div>
            </div>
            <div className="space-y-3">
                <DocumentCard
                    title="Carta Laboral"
                    value={loan.upid_labor_card}
                    documentUrl={loan.labor_card}
                    loanId={loan.id}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                />
                
                <DocumentCard
                    title="Primer Volante de Pago"
                    value={loan.upid_first_flyer}
                    documentUrl={loan.fisrt_flyer}
                    loanId={loan.id}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                />
                
                <DocumentCard
                    title="Segundo Volante de Pago"
                    value={loan.upid_second_flyer}
                    documentUrl={loan.second_flyer}
                    loanId={loan.id}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                />
                
                <DocumentCard
                    title="Tercer Volante de Pago"
                    value={loan.upid_third_flyer}
                    documentUrl={loan.third_flyer}
                    loanId={loan.id}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                />
            </div>
        </div>
    )
}

export default DocumentsRequired