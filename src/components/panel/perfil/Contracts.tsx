import { Download, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function DownloadContractsButton({ documentId }: { documentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contracts = [
    "Gestión de cobro",
    "Carta de instrucciones", 
    "Autorización de pago",
    "Pagaré"
  ];

  const handleDownload = async () => {
    if (!documentId) {
      setError("ID del documento no disponible");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/loan/document?document_id=${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear URL temporal para la descarga
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga temporal
      const link = document.createElement('a');
      link.href = url;
      
      // Intentar obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'contratos.rar';
      
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Contratos descargados exitosamente");
      
    } catch (err) {
      console.error("Error al descargar contratos:", err);
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Error al descargar los contratos"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-full">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
                
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100">
            Contratos Generados
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl">
            Documentos generados automáticamente al aprobar el crédito
          </p>
        </div>
                
        <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contracts.map((contract, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                <span className="font-medium">{contract}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="w-full max-w-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={isLoading || !documentId}
        className={`mt-10 w-full max-w-xs mx-auto flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 ${
          isLoading || !documentId
            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed scale-100"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent opacity-60"></div>
            <span>Descargando...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Descargar Contratos</span>
          </>
        )}
      </button>
            
      {isLoading && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center animate-pulse mt-3">
          Preparando archivo .rar con los 4 documentos PDF...
        </p>
      )}

      {!documentId && !isLoading && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-3">
          Esperando ID del documento para habilitar descarga
        </p>
      )}
    </div>
  );
}