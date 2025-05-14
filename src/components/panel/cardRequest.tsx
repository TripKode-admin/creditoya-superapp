import { BankTypes, handleKeyToStringBank } from "@/handlers/stringToBank";
import { stringToPriceCOP } from "@/handlers/stringToCop";
import { eventLoanApplication, ILoanApplication } from "@/types/full";
import { Bell, ChevronRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

function CardRequest({ loan }: { loan: ILoanApplication }) {
    const router = useRouter();
    const redirectInfoLoan = () => router.push(`/panel/solicitud/${loan.id}`);

    // Formatear fecha
    const formatDate = (date: Date) => {
        const day = date.getDate();
        const year = date.getFullYear();
        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        const month = capitalize(date.toLocaleDateString('es-ES', { month: 'long' }));
        const hour = date.toLocaleTimeString('es-ES', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace('.', '');


        return `${day} de ${month} del ${year} a las ${hour}`;
    };

    const CountEvents = () => {
        return loan.EventLoanApplication.filter(
            (events) => events.isAnswered === false
        ).length
    }

    const createdDate = formatDate(new Date(loan.created_at));

    return (
        <div onClick={redirectInfoLoan} className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm hover:shadow transition-shadow duration-300 p-4 border border-gray-100 dark:border-gray-700 cursor-pointer">
            {/* Header con estado y monto */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-50/80 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-green-600 dark:text-green-400 border border-green-100/70 dark:border-green-800/40">
                        {loan.status}
                    </span>
                    <span className="text-xl font-medium text-gray-700 dark:text-gray-200">
                        {stringToPriceCOP(loan.cantity)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-full bg-gray-50/80 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-100/80 dark:border-gray-600/80 cursor-pointer transition-all duration-200 flex items-center">
                        <Bell size={14} className="text-gray-500 dark:text-gray-400" />
                        <span className="ml-1 text-xs text-gray-600 dark:text-gray-300">{CountEvents()}</span>
                    </button>
                    <ChevronRight size={16} className="text-green-500 dark:text-green-400" />
                </div>
            </div>

            {/* Info bancaria y fechas en formato compacto */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center">
                    <span className="font-medium mr-1">Banco:</span>
                    <span className="text-gray-700 font-thin dark:text-gray-300">{handleKeyToStringBank(loan.entity as BankTypes)}</span>
                </span>
                <span className="flex items-center">
                    <span className="font-medium mr-1">Cuenta:</span>
                    <span className="text-gray-700 font-thin dark:text-gray-300">{loan.bankNumberAccount.replace(/\d(?=\d{4})/g, "*")}</span>
                </span>
            </div>

            {/* Fechas en formato ultra compacto */}
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={12} className="mr-1" />
                <span>Creado: {createdDate}</span>
            </div>
        </div>
    );
}

export default CardRequest;