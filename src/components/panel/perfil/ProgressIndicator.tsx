import usePanel from "@/hooks/usePanel";
import { UserCheck, ArrowRight, Sparkles } from "lucide-react"

function ProgressPerfilIndicator() {
    const { userComplete } = usePanel();

    // Calculate completion percentage
    const requiredFields = [
        userComplete?.names,
        userComplete?.firstLastName,
        userComplete?.email,
        userComplete?.birth_day,
        userComplete?.Document?.[0]?.number,
        userComplete?.Document?.[0]?.imageWithCC,
        userComplete?.Document?.[0]?.documentSides
    ];

    const completedFields = requiredFields.filter(field =>
        field && field !== "No definido" && field.toString().trim() !== ""
    ).length;

    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
    const isComplete = completionPercentage === 100;

    const handleCreateLoan = () => {
        // Lógica para crear solicitud de préstamo
        console.log("Crear solicitud de préstamo");
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
            {/* Header compacto */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                        <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            Progreso del Perfil
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate sm:hidden">
                            {completedFields}/{requiredFields.length} campos
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {completionPercentage}%
                    </span>
                    {isComplete && (
                        <Sparkles className="w-4 h-4 text-green-500 animate-pulse" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                        {completedFields}/{requiredFields.length}
                    </span>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isComplete 
                                ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600" 
                                : "bg-gradient-to-r from-green-500 to-green-600"
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Botón responsivo */}
            {isComplete && (
                <button
                    onClick={handleCreateLoan}
                    className="w-full group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 ease-out flex items-center justify-center gap-2 relative overflow-hidden text-sm sm:text-base"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                    
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
                    
                    <span className="truncate">
                        <span className="hidden sm:inline">Crear Solicitud de Préstamo</span>
                        <span className="sm:hidden">Crear Solicitud</span>
                    </span>
                    
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                </button>
            )}
        </div>
    )
}

export default ProgressPerfilIndicator