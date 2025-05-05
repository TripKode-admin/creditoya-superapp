import { ILoanApplication } from "@/types/full"
import { Files } from "lucide-react"
import DocumentCard from "./DocumentCard"

function DocumentsRequired({ loan }: { loan: ILoanApplication }) {

    /**
     * Maneja la subida de un documento
     * @param type Tipo de documento
     * @param file Archivo a subir
     */
    const handleUploadDocument = async (type: string, file: File) => {
        try {
            // Aquí iría la lógica para subir el archivo
            console.log(`Subiendo documento ${type}:`, file.name);

            // Ejemplo de FormData para enviar a API
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', type);
            formData.append('loanId', loan.id);

            // Llamada API
            // const response = await axios.post('/api/documents/upload', formData);

            // Actualizamos el estado local o recargamos datos
            // refreshLoanData();

            return true;
        } catch (error) {
            console.error("Error al subir documento:", error);
            return false;
        }
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
                    title="Primer Volante de Pago"
                    value={loan.upid_first_flyer}
                    showButton={!!loan.upid_first_flyer}
                    documentUrl={loan.fisrt_flyer}
                    onUpload={(file) => handleUploadDocument('first_flyer', file)}
                />

                <DocumentCard
                    title="Segundo Volante de Pago"
                    value={loan.upid_second_flyer}
                    showButton={!!loan.upid_second_flyer}
                    documentUrl={loan.second_flyer}
                    onUpload={(file) => handleUploadDocument('second_flyer', file)}
                />

                <DocumentCard
                    title="Tercer Volante de Pago"
                    value={loan.upid_third_flyer}
                    showButton={!!loan.upid_third_flyer}
                    documentUrl={loan.third_flyer}
                    onUpload={(file) => handleUploadDocument('third_flyer', file)}
                />

                <DocumentCard
                    title="Carta laboral"
                    value={loan.upid_labor_card}
                    showButton={!!loan.upid_labor_card}
                    documentUrl={loan.labor_card}
                    onUpload={(file) => handleUploadDocument('labor_card', file)}
                />
            </div>
        </div>
    )
}

export default DocumentsRequired