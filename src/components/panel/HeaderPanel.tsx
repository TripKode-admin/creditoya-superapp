import usePanel from "@/hooks/usePanel"
import { CircleHelp, FolderPlus } from "lucide-react"

function HeaderPanel({ isReq }: { isReq?: boolean }) {

    const {
        toggleNewReq,
    } = usePanel();

    const handleOpenNewReq = () => {
        if (isReq) {
            toggleNewReq(isReq);
        } else if (!isReq) {
            toggleNewReq()
        }
    }

    return (
        <div className="flex flex-wrap justify-between">
            <header className="mb-8">
                <h1 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-100">Gestión de préstamos</h1>
                <p className="text-gray-500 text-sm mt-1">Solicita nuevos préstamos, consulta el estado de tus solicitudes y realiza seguimiento de tus créditos activos</p>
            </header>

            <div className="grid place-content-center">
                <div className="flex flex-row gap-3">
                    <button
                        className="inline-flex items-center dark:text-gray-100 gap-1 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700"
                        aria-label="Crear nueva solicitud"
                        onClick={handleOpenNewReq}
                    >
                        <FolderPlus size={14} className="flex-shrink-0" />
                        <span className="text-xs font-medium whitespace-nowrap">
                            {isReq ? "Cancelar" : "Nueva solicitud"}
                        </span>
                    </button>

                    {isReq && (
                        <button
                            className="inline-flex items-center dark:text-gray-100 gap-1 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700"
                            aria-label="Guardar borrador"
                        >
                            <FolderPlus size={14} className="flex-shrink-0" />
                            <span className="text-xs font-medium whitespace-nowrap">Guardar Borrador</span>
                        </button>
                    )}

                    {!isReq && (
                        <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                            aria-label="Ver instrucciones"
                        >
                            <CircleHelp size={14} className="flex-shrink-0 dark:text-gray-400" />
                            <span className="text-xs font-medium dark:text-gray-400 whitespace-nowrap">Instrucciones</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HeaderPanel