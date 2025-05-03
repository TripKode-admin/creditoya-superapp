"use client"

import Image from "next/image"
import ilustrtionHeader from "@/assets/ilustrations/Farmer-bro.svg"
import ilustrationLogo from "@/assets/ilustrations/creditoya_logo.png"
import { ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"

function HeroSection() {
    const router = useRouter();
    const DirectToNewReq = () => router.push("/panel/nueva-solicitud");

    return (
        <main className="min-h-dvh dark:bg-gray-900 flex flex-wrap px-[5%]">
            <div className="flex justify-start basis-[400px] grow">
                <div className="flex justify-start sm:pt-0 pt-20">
                    <Image
                        src={ilustrtionHeader}
                        alt={"icon"}
                        width={500}
                        height={500}
                        className="drop-shadow-md"
                    />
                </div>
            </div>
            <div className="sm:grid flex flex-col sm:place-content-center basis-[400px] grow space-y-6">
                <div className="flex justify-start">
                    <Image
                        src={ilustrationLogo}
                        alt={"icon"}
                        width={400}
                        height={400}
                        className="drop-shadow-md dark:invert dark:brightness-[0.87] dark:hue-rotate-180"
                    />
                </div>
                <p className="font-thin text-gray-500">Facilitando el crecimiento de los trabajadores agrícolas con créditos oportunos y servicios de deuda acorde a sus ingresos. Construyendo confianza y apoyando su desarrollo familiar y social.</p>
                <div className="sm:flex sm:justify-start">
                    <button className="border border-green-100 dark:border-transparent dark:hover:bg-gray-700 dark:hover:border-transparent hover:border-green-200 flex flex-row text-sm px-3 py-2 bg-green-50 dark:bg-gray-800 rounded-md text-green-500 font-normal hover:bg-green-100 cursor-pointer gap-2">
                        <p onClick={DirectToNewReq} className="font-thin drop-shadow-sm">Solicita un prestamo ahora</p>
                        <div className="grid place-content-center">
                            <ArrowUpRight size={17} className="text-green-300 pt-1 drop-shadow-sm" />
                        </div>
                    </button>
                </div>
            </div>
        </main>
    )
}

export default HeroSection