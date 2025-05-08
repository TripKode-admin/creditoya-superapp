"use client"

import { ILoanApplication } from "@/types/full"
import { CircleX, FileX2 } from "lucide-react"

function CardDocsReject({ loan }: { loan: ILoanApplication }) {
    return (
        <div
            className="max-w-7xl border-l-4 border-l-red-400 border border-blue-100 dark:border-gray-700 dark:border-l-red-500 rounded-lg shadow-sm mb-8 bg-white dark:bg-gray-800 mx-auto"
        >
            <div className="flex items-start">
                {/* Contenido principal */}
                <div className="flex p-5 gap-4 grow">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2 flex-shrink-0 self-start">
                        <FileX2 size={20} className="text-red-500" />
                    </div>

                    <div className="space-y-3 grow">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">Un documento ha sido rechazado</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Revisa la información para continuar con tu solicitud</p>
                        </div>

                        <div className="rounded-md bg-gray-50 dark:bg-gray-700 p-3 w-full">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Razón del rechazo</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{loan.reasonReject || "No hay una razón especificada"}</p>
                        </div>
                    </div>
                </div>

                {/* Botón cerrar */}
                <button className="p-4 text-gray-400 hover:text-red-500 transition-colors self-start">
                    <CircleX size={18} />
                </button>
            </div>
        </div>
    )
}

export default CardDocsReject