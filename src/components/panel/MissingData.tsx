import Image from "next/image"
import CheckListIcon from "@/assets/ilustrations/checklist-bro.svg";
import { ArrowUpRight, CheckCircle, XCircle } from "lucide-react";
import usePanel from "@/hooks/usePanel";

function MissingData() {
    const {
        fieldStatuses,
        router
    } = usePanel();

    return (
        <main className="dark:bg-gray-900 min-h-dvh grid place-content-center px-[5%]">
            <div className="flex flex-wrap gap-6 sm:gap-20 pt-20 pb-10">
                <div className="grid place-content-center">
                    <Image
                        src={CheckListIcon}
                        alt="check"
                        className="drop-shadow-md"
                        priority={true}
                    />
                </div>
                <div>
                    <div className="mt-4">
                        <h3 className="dark:text-gray-50 text-lg font-medium">Datos personales y documentos necesarios</h3>
                        <p className="text-xs mb-6 dark:text-gray-300">Completalos para comenzar a solicitar prestamos</p>

                        <div className="mt-2 dark:text-gray-200 flex flex-col gap-3">
                            {fieldStatuses.map((field, index) => (
                                <div key={index} className="flex flex-row gap-10 justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 dark:hover:border-gray-600 hover:border-gray-200 rounded-md">
                                    <p className="font-thin grid place-content-center">{field.name}</p>
                                    <div>
                                        {field.completed ? (
                                            <CheckCircle size={18} className="text-green-500 drop-shadow-sm" />
                                        ) : (
                                            <XCircle size={18} className="text-red-400 drop-shadow-sm" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-start">
                            <button className="text-sm font-thin" onClick={() => router.push("/panel/perfil")}>
                                <div className="flex flex-row cursor-pointer gap-2 dark:text-gray-300 text-gray-600 hover:text-gray-800 dark:hover:text-gray-50">
                                    <p className="pb-0.5 ">Completa tus datos ahora</p>
                                    <div className="grid place-content-center">
                                        <ArrowUpRight size={20} className="text-gray-500" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default MissingData