import usePanel from "@/hooks/usePanel";
import { CircleHelp, CircleMinus, CirclePlus, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTutorial } from "../drivejs/ConfigStart";

function HeaderPanel({ isReq, isOpen }: { isReq?: boolean, isOpen?: boolean }) {
    const router = useRouter();
    const { toggleNewReq } = usePanel();

    const handleOpenNewReq = () => {
        isReq ? toggleNewReq(isReq) : toggleNewReq();
    }

    return (
        <div className="w-full bg-gradient-to-br ">
            <div className="w-full">
                {/* Compact Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    {/* Title Section */}
                    <div className="flex items-center gap-3 min-w-0 flex-1" data-tour="main-title">
                        <div className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center shrink-0
                            ${isOpen
                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                : "bg-gradient-to-br from-blue-500 to-blue-600"
                            }
                        `}>
                            <CirclePlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                                {isOpen ? "Nueva solicitud" : "Gestión de préstamos"}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-1 sm:line-clamp-2">
                                {isOpen
                                    ? "Completa todos los campos requeridos"
                                    : "Solicita, consulta y realiza seguimiento de tus créditos"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Primary Action */}
                        <button
                            onClick={handleOpenNewReq}
                            data-tour="new-request-btn"
                            className={`
                                group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl 
                                font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                                ${isReq
                                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
                                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                                }
                            `}
                        >
                            {isReq ? (
                                <CircleMinus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-200" />
                            ) : (
                                <CirclePlus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-200" />
                            )}
                            <span className="hidden sm:inline">{isReq ? "Cancelar" : "Nueva solicitud"}</span>
                            <span className="sm:hidden">{isReq ? "Cancelar" : "Nueva solicitud"}</span>
                            {!isReq && (
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
                            )}
                        </button>

                        {/* Help Button */}
                        {!isReq && (
                            <button
                                onClick={startTutorial}
                                className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md backdrop-blur-sm"
                            >
                                <CircleHelp className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                                <span className="hidden sm:inline font-medium">Tutorial</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Form Indicator */}
                {isOpen && (
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800/50">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200">
                                Formulario activo
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-1 sm:line-clamp-none">
                                Completa todos los campos para continuar
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HeaderPanel;