import { Building, CircleCheck, ShieldUser } from "lucide-react"

interface ContentListsProps {
    title: string,
    type: "client" | "company"
    options: string[],
}

function AdvantagesComponent() {
    const contentLists: ContentListsProps[] = [
        {
            title: "Ventajas para los empleados",
            type: "client",
            options: [
                "Super facil",
                "Super rapido",
                "Sin moverse del sitio de trabajo",
                "Aprobacion y desembolso por nomina",
                "Descuento de cuotas por nomina",
                "Cuotas fijas de acuerdo a su capacidad de endeudamiento y salario",
                "Desembolsos por transferencia a la cuenta personal",
                "No requieres experiencia crediticia",
                "Tasas competitivas con el sector financiero"
            ]
        },
        {
            title: "Ventajas para su empresa",
            type: "company",
            options: [
                "100% digital facil y rapido",
                "No interviene en su desempeño laboral",
                "La empresa no es codeudor solidario y no compromete el capital de trabajo de la empresa",
                "No tiene ningún costo ni riesgo",
                "Representa un valor agregado de su compañía frente a sus empleados",
                "Mejora el bienestar y la relación de sus empleados frente a su empresa (mayor productividad)",
                "Cobertura nacional",
                "Control de endeudamiento",
            ]
        }
    ]
    return (
        <>
            <main className="min-h-dvh dark:bg-gray-900 px-[5%] grid place-content-center pt-20">
                <div className="flex flex-wrap gap-10">
                    {contentLists.map((content, index) => (
                        <div className="flex flex-col basis-[400px] grow gap-2" key={index}>
                            <div>
                                <div className="flex flex-row gap-1 mb-4">
                                    <div className="grid place-content-center bg-gray-100 p-2 rounded-full shadow-md border border-gray-200">
                                        { content.type == "client" && <ShieldUser size={20} className="drop-shadow-md text-gray-700" /> }
                                        { content.type == "company" && <Building size={20} className="drop-shadow-md text-gray-700" /> }
                                    </div>
                                    <h3 className="drop-shadow-md grid place-content-center text-gray-700 font-bold text-2xl dark:text-gray-100 pb-0.5">{content.title}</h3>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {content.options.map((option, index) => (
                                    <div className="flex flex-row gap-20 sm:gap-36" key={index}>
                                        <p className="grow text-sm font-thin dark:text-white">{option}</p>
                                        <div><CircleCheck className="text-green-300 drop-shadow-md" /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    )
}

export default AdvantagesComponent