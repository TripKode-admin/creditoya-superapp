import ilustrationExplain from "@/assets/ilustrations/services/imageService01.svg"
import ilustrationExplain01 from "@/assets/ilustrations/services/imageService02.svg"
import ilustrationExplain02 from "@/assets/ilustrations/services/push-docs.svg"
import Image from "next/image"

function StepsComponent() {
    const videoUrl =
        "https://res.cloudinary.com/dvquomppa/video/upload/v1724228923/videos_guia/u51npgvxsebnkhnhsh0x.mp4";

    return (
        <>
            <main className="min-h-dvh dark:bg-gray-900 pt-20 space-y-2 grid place-content-center px-[5%]">
                <div className="flex flex-col">
                    <div className="mb-10 space-y-2">
                        <h3 className="text-center font-semibold text-xl sm:text-5xl text-gray-700 dark:text-gray-200">¡Solicita tu credito en menos de 5 minutos!</h3>
                        <p className="text-center font-thin text-sm sm:text-base text-gray-600 dark:text-gray-300">Observa como lo puedes lograr</p>
                    </div>

                    <div className="flex flex-wrap justify-between gap-5">
                        <div className="basis-[300px] flex flex-col grow">
                            <div className="bg-white dark:bg-gray-300 rounded-md grid place-content-center">
                                <Image
                                    src={ilustrationExplain01}
                                    alt={"icon"}
                                    width={300}
                                    height={300}
                                    className="drop-shadow-md"
                                />
                            </div>
                            <div className="flex flex-col space-y-2 mt-1">
                                <div className="flex justify-start">
                                    <div className="flex flex-row gap-2">
                                        <p className="text-3xl font-bold text-green-500 drop-shadow-md">1</p>
                                        <h3 className="font-bold text-xl dark:text-white grid place-content-center">Registrate y crea una cuenta en Credito Ya</h3>
                                    </div>
                                </div>
                                <p className="font-thin dark:text-gray-300">Usa tu correo electrónico y una contraseña que puedas recordar para crear tu propia cuenta en nuestra aplicación. Con esta cuenta, podrás pedir préstamos fácilmente.</p>
                            </div>
                        </div>

                        <div className="basis-[300px] flex flex-col grow">
                            <div className="bg-white dark:bg-gray-300 rounded-md grid place-content-center">
                                <Image
                                    src={ilustrationExplain}
                                    alt={"icon"}
                                    width={300}
                                    height={300}
                                    className="drop-shadow-md"
                                />
                            </div>
                            <div className="flex flex-col space-y-2 mt-1">
                                <div className="flex justify-start">
                                    <div className="flex flex-row gap-2">
                                        <p className="text-3xl font-bold text-green-500 drop-shadow-md">2</p>
                                        <h3 className="font-bold text-xl dark:text-white grid place-content-center">Ingresa los documentos requeridos</h3>
                                    </div>
                                </div>
                                <p className="font-thin dark:text-gray-300">Usa tu correo electrónico y una contraseña que puedas recordar para crear tu propia cuenta en nuestra aplicación. Con esta cuenta, podrás pedir préstamos fácilmente.</p>
                            </div>
                        </div>

                        <div className="basis-[300px] flex flex-col grow">
                            <div className="bg-white dark:bg-gray-300 rounded-md grid place-content-center">
                                <Image
                                    src={ilustrationExplain02}
                                    alt={"icon"}
                                    width={300}
                                    height={300}
                                    className="drop-shadow-md"
                                />
                            </div>
                            <div className="flex flex-col space-y-2 mt-1">
                                <div className="flex justify-start">
                                    <div className="flex flex-row gap-2">
                                        <p className="text-3xl font-bold text-green-500 drop-shadow-md">3</p>
                                        <h3 className="font-bold text-xl dark:text-white grid place-content-center">Solicita tu prestamo</h3>
                                    </div>
                                </div>
                                <p className="font-thin dark:text-gray-300">Usa tu correo electrónico y una contraseña que puedas recordar para crear tu propia cuenta en nuestra aplicación. Con esta cuenta, podrás pedir préstamos fácilmente.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid place-content-center mt-20">
                        <video src={videoUrl}
                            controls
                            width={700}
                            height={300}
                            className="rounded-md shadow-md"
                        />
                    </div>
                </div>
            </main>
        </>
    )
}

export default StepsComponent