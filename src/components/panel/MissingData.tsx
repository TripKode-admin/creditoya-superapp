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
                        <h3 className="dark:text-gray-50 text-lg font-medium">Tu información y papeles necesarios</h3>
                        <p className="text-xs mb-6 dark:text-gray-300">Llena estos datos para poder pedir un préstamo</p>

                        <div className="mt-2 dark:text-gray-200 flex flex-col gap-3">
                            {fieldStatuses.map((field, index) => (
                                <div key={index} className="flex flex-row gap-10 justify-between items-center p-2 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 dark:hover:border-gray-600 hover:border-gray-200 rounded-md">
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
                            <button className="cursor-pointer grow text-sm font-thin flex flex-row justify-between bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 hover:bg-green-200 p-3 rounded-md" onClick={() => router.push("/panel/perfil")}>
                                <p className="pb-0.5 text-green-600 dark:text-green-300 font-semibold">Completa tus datos ahora</p>
                                <div className="grid place-content-center">
                                    <ArrowUpRight size={20} className="text-green-600" />
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