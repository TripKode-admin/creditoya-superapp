import { BankTypes, handleKeyToStringBank } from "@/handlers/stringToBank";
import { stringToPriceCOP } from "@/handlers/stringToCop";
import { ILoanApplication } from "@/types/full";
import { Bell, CheckCircle2, Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";

function CardRequest({ loan }: { loan: ILoanApplication }) {
    const router = useRouter();
    const redirectInfoLoan = () => router.push(`/panel/solicitud/${loan.id}`);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700">
            {/* Header con estado y acciones */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                        Pendiente
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors flex flex-row gap-1">
                        <div className="grid place-content-center">
                            <Bell size={15} className="text-gray-500 dark:text-gray-400 drop-shadow-md" />
                        </div>
                        <p className="text-xs grid place-content-center text-gray-600 dark:text-gray-400 font-thin">Eventos</p>
                        <div className="grid place-content-center ml-4">
                            <p className="text-[8px] bg-gray-200 dark:bg-gray-500 font-thin px-2 py-1 rounded-full dark:text-gray-100 text-gray-700">1</p>  
                        </div>
                    </button>
                </div>
            </div>

            {/* Monto principal */}
            <div className="mb-4">
                <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto solicitado</h2>
                <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{stringToPriceCOP(loan.cantity)}</p>
            </div>

            {/* Información bancaria */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Entidad bancaria</span>
                    <span className="text-gray-700 dark:text-gray-300">{handleKeyToStringBank(loan.entity as BankTypes)}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Número de cuenta</span>
                    <span className="text-gray-700 dark:text-gray-300">{loan.bankNumberAccount.replace(/\d(?=\d{4})/g, "*")}</span>
                </div>
            </div>

            {/* Fecha de solicitud */}
            <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex flex-wrap gap-3 grow">
                    <p className="border border-blue-100 dark:border-blue-800 text-[10px] text-blue-600 dark:bg-blue-800/10 bg-blue-50 dark:text-blue-400 rounded-md p-2 text-center grow">
                        Solicitud creada el {new Date(loan.created_at).toLocaleString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })} ( {new Date(loan.created_at).toLocaleString('es-ES', {
                            hour: 'numeric',
                            minute: 'numeric',
                            // second: 'numeric'
                        })} {new Date(loan.created_at).getHours() >= 12 ? 'PM' : 'AM'} )
                    </p>

                    <p className="border border-blue-100 dark:border-blue-800 text-[10px] text-blue-600 dark:bg-blue-800/10 bg-blue-50 dark:text-blue-400 rounded-md p-2 text-center grow">
                        Solicitud Aprobada el {new Date(loan.created_at).toLocaleString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })} ( {new Date(loan.created_at).toLocaleString('es-ES', {
                            hour: 'numeric',
                            minute: 'numeric',
                            // second: 'numeric'
                        })} {new Date(loan.created_at).getHours() >= 12 ? 'PM' : 'AM'} )
                    </p>
                </div>
                <div onClick={redirectInfoLoan} className="grow flex justify-start sm:justify-end">
                    <p className="border border-green-200 dark:border-green-700 cursor-pointer text-xs text-green-600 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 bg-green-50 dark:text-green-400 rounded-md p-2 text-center">
                        Expandir
                    </p>
                </div>
            </div>
        </div>
    )
}


export default CardRequest