"use client"

import { stringToPriceCOP } from "@/handlers/stringToCop"
import useLoan from "@/hooks/useLoan"
import { ILoanApplication } from "@/types/full"
import { BanknoteArrowDown, CircleCheck, CircleX, Loader2 } from "lucide-react"
import { useState } from "react"

function CardChangeCantity({ loan }: { loan: ILoanApplication }) {
    const {
        respondingToCantity,
        cantityResponse,
        acceptNewCantity,
        rejectNewCantity,
        refreshLoan
    } = useLoan({ loanId: loan.id });

    const [isResponding, setIsResponding] = useState(false);

    // Manejar la acción de aceptar la nueva cantidad
    const handleAccept = async () => {
        setIsResponding(true);
        try {
            const result = await acceptNewCantity();
            if (result) {
                toast.success("Has aceptado la nueva cantidad del préstamo");
                refreshLoan(); // Actualizar los datos del préstamo
            }
        } catch (error) {
            toast.error("Ocurrió un error al aceptar la nueva cantidad");
            console.error("Error al aceptar nueva cantidad:", error);
        } finally {
            setIsResponding(false);
        }
    };

    // Manejar la acción de rechazar la nueva cantidad
    const handleReject = async () => {
        setIsResponding(true);
        try {
            const result = await rejectNewCantity();
            if (result) {
                toast.success("Has rechazado la nueva cantidad del préstamo");
                refreshLoan(); // Actualizar los datos del préstamo
            }
        } catch (error) {
            toast.error("Ocurrió un error al rechazar la nueva cantidad");
            console.error("Error al rechazar nueva cantidad:", error);
        } finally {
            setIsResponding(false);
        }
    };

    // Si ya respondió a la propuesta, mostrar mensaje correspondiente
    if (cantityResponse) {
        return (
            <div className="max-w-7xl border-l-4 border-l-green-400 border border-green-100 dark:border-gray-700 dark:border-l-green-500 rounded-lg shadow-sm mb-8 bg-white dark:bg-gray-800 mx-auto p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 flex-shrink-0">
                        <CircleCheck size={20} className="text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Respuesta registrada</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{cantityResponse.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="max-w-7xl border-l-4 border-l-blue-400 border border-blue-100 dark:border-gray-700 dark:border-l-blue-500 rounded-lg shadow-sm mb-8 bg-white dark:bg-gray-800 mx-auto"
        >
            {/* Encabezado con icono */}
            <div className="flex items-center gap-3 border-b border-blue-100 dark:border-gray-700 p-5">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 flex-shrink-0">
                    <BanknoteArrowDown size={20} className="text-blue-500" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">La cantidad de tu solicitud ha cambiado</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tu solicitud está pre-aprobada pero con una cantidad diferente</p>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md bg-gray-50 dark:bg-gray-700 p-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cantidad Aprobada</p>
                        <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{stringToPriceCOP(loan.newCantity!) || "No especificada"}</p>
                    </div>
                    <div className="rounded-md bg-gray-50 dark:bg-gray-700 p-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Razón</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{loan.reasonChangeCantity || "No hay una razón especificada"}</p>
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="flex border-t border-blue-100 dark:border-gray-700">
                <button
                    onClick={handleReject}
                    disabled={respondingToCantity || isResponding}
                    className="flex-1 py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {(respondingToCantity || isResponding) ? (
                        <Loader2 size={18} className="text-red-500 animate-spin" />
                    ) : (
                        <CircleX size={18} className="text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rechazar</span>
                </button>
                <div className="w-px h-full bg-blue-100 dark:bg-gray-700"></div>
                <button
                    onClick={handleAccept}
                    disabled={respondingToCantity || isResponding}
                    className="flex-1 py-3 px-4 flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {(respondingToCantity || isResponding) ? (
                        <Loader2 size={18} className="text-green-500 animate-spin" />
                    ) : (
                        <CircleCheck size={18} className="text-green-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aceptar</span>
                </button>
            </div>
        </div>
    )
}
import { toast } from "sonner"

export default CardChangeCantity