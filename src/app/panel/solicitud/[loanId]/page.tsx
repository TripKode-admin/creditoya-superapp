"use client"

import LoadingPanel from "@/components/panel/Loading";
import useLoan from "@/hooks/useLoan";
import { use } from "react";
import DotBox from "@/components/panel/perfil/DotBox";
import {
    CircleDollarSign,
    WalletMinimal,
    CircleUser,
    Smartphone,
    Mail,
    MapPin,
    Earth,
    Building2,
    CalendarClock,
    ArrowLeft
} from "lucide-react";
import { stringToPriceCOP } from "@/handlers/stringToCop";
import { BankTypes, handleKeyToStringBank } from "@/handlers/stringToBank";
import Image from "next/image";
import DocumentsRequired from "@/components/panel/solicitud/DocumentRequired";
import { useRouter } from "next/navigation";
import CardChangeCantity from "@/components/panel/solicitud/CardChangeCantity";
import CardDocsReject from "@/components/panel/solicitud/CardDocsReject";

function LoanInfoPage({ params }: { params: Promise<{ loanId: string }> }) {
    const resolveParams = use(params);
    const { loanId } = resolveParams;
    const {
        loan,
        loading,
        error,
    } = useLoan({ loanId });

    const router = useRouter()

    // Formatear el nombre de la empresa para mostrar
    const formatCompanyName = (company: string): string => {
        return company.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // console.log("current Loan: ", loan)

    // Si está cargando, mostrar un indicador de carga
    if (loading) return <LoadingPanel message="Cargando datos de la solicitud de prestamo" />

    // Si hay un error, mostrar el mensaje de error
    if (error) {
        return (
            <main className="pt-26 min-h-dvh dark:bg-gray-900">
                <div className="max-w-7xl mx-auto py-3 px-4 flex justify-center items-center min-h-[200px]">
                    <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
                        <p className="font-medium">Error al cargar el préstamo</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </main>
        )
    }

    // Si no hay préstamo aún después de cargar, mostrar mensaje
    if (!loan) {
        return (
            <main className="pt-26 min-h-dvh dark:bg-gray-900">
                <div className="max-w-7xl mx-auto py-3 px-4 flex justify-center items-center min-h-[200px]">
                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                        <p className="text-gray-700">No se encontró información del préstamo solicitado.</p>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-dvh dark:bg-black py-8 px-4 pt-24">

            <div className="max-w-7xl mx-auto mb-16 mt-5 dark:text-gray-100">
                <div className="flex flex-row gap-2" onClick={() => router.push('/panel')}>
                    <div className="grid place-content-center">
                        <ArrowLeft size={20} />
                    </div>
                    <p className="grid place-content-center mb-0.5">Todos los prestamos</p>
                </div>
            </div>

            {/* Top Card - Loan Amount */}
            <div className="max-w-7xl mx-auto rounded-lg mb-8">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg">
                            <CircleDollarSign className="text-green-500 drop-shadow-sm" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-300 text-sm">Monto Solicitado</p>
                            {loan.newCantity ? (
                                <div className="flex items-baseline gap-2">
                                    <h1 className="text-1xl font-medium text-gray-400 dark:text-gray-500 line-through">
                                        {stringToPriceCOP(loan.cantity)}
                                    </h1>
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <h1 className="text-1xl font-semibold text-green-700 dark:text-green-300">
                                        {stringToPriceCOP(loan.newCantity)}
                                    </h1>
                                </div>
                            ) : (
                                <h1 className="text-1xl font-semibold text-green-700 dark:text-green-300">
                                    {stringToPriceCOP(loan.cantity)}
                                </h1>
                            )}
                            {loan.newCantityOpt && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {loan.newCantityOpt}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DotBox status={loan.status} />
                    </div>
                </div>
            </div>

            {loan.EventLoanApplication && loan.EventLoanApplication.length !== 0 && loan.EventLoanApplication.map(events => (
                events.type == "CHANGE_CANTITY" && events.isAnswered == false && <CardChangeCantity key={events.id} loan={loan} />
            ))
            }

            {loan.EventLoanApplication && loan.EventLoanApplication.length !== 0 && loan.EventLoanApplication.map(events => (
                events.type == "DOCS_REJECT" && events.isAnswered == false && <CardDocsReject key={events.id} loan={loan} />
            ))}

            {/* Main Content - Two Column Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Financial and Documents */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Financial Information */}
                    <div className="border border-gray-100 hover:border-gray-200 dark:hover:border-gray-600 dark:border-gray-700 dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center mb-8">
                            <div className="mr-3 dark:bg-gray-700 bg-green-100/70 p-2 rounded-full">
                                <WalletMinimal className="text-green-500 dark:text-green-400 w-4 h-4 drop-shadow" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-green-700 dark:text-green-400">Información Financiera</p>
                                <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">Datos en los que el dinero de tu prestamo fui depositado</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-1">Entidad Bancaria</p>
                                <p className="font-thin text-lg dark:text-gray-100">{handleKeyToStringBank(loan.entity as BankTypes)}</p>
                            </div>
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-1">Número de Cuenta</p>
                                <p className="font-thin text-lg dark:text-gray-100">{loan.bankNumberAccount}</p>
                            </div>
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-1">Tipo de Cuenta</p>
                                <p className="font-thin text-lg dark:text-gray-100">Ahorros</p>
                            </div>
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-1">ID de Solicitud</p>
                                <p className="font-thin text-xs text-gray-600 dark:text-gray-200">{loan.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Required Documents */}
                    <DocumentsRequired loan={loan} />
                </div>

                {/* Right Column - Personal Info and Status */}
                <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center mb-8">
                            <div className="mr-3 dark:bg-gray-700 bg-green-100/70 p-2 rounded-full">
                                <CircleUser className="text-green-500 dark:text-green-400 w-4 h-4 drop-shadow" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-green-700 dark:text-green-400">Información Personal</p>
                                <p className="text-gray-500 dark:text-gray-300 text-xs mt-1">Datos del creador de la solicitud</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-2">Nombre Completo</p>
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={loan.user.avatar}
                                        alt={"Avatar de " + loan.user.names}
                                        width={30}
                                        height={30}
                                        className="rounded-full drop-shadow-md object-cover aspect-square overflow-hidden"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{loan.user.names} {loan.user.firstLastName} {loan.user.secondLastName}</p>
                                        <p onClick={() => router.push('/panel/perfil')} className="text-xs text-gray-400 hover:text-gray-500 dark:text-gray-400 cursor-pointer">Ir al perfil</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-1">Contacto</p>
                                <div className="flex flex-col space-y-3 mt-2">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="drop-shadow-md dark:text-gray-200" size={15} />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{loan.user.phone}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="drop-shadow-md dark:text-gray-200" size={15} />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{loan.user.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-1">Ubicación</p>
                                <div className="flex flex-col space-y-3 mt-2">
                                    <div className="flex items-center gap-2">
                                        <Earth className="drop-shadow-md dark:text-gray-200" size={15} />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{loan.user.city}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="drop-shadow-md dark:text-gray-200" size={15} />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{loan.user.residence_address}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-green-600 dark:text-green-500 text-sm mb-1">Empresa Actual</p>
                                <div className="flex items-center gap-2">
                                    <Building2 className="drop-shadow-md dark:text-gray-200" size={15} />
                                    <p className="text-normal text-gray-600 dark:text-gray-300">{formatCompanyName(loan.user.currentCompanie)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Status */}
                    <div className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <CalendarClock size={20} className="drop-shadow-md text-green-600 dark:text-green-300" />
                            <h2 className="text-lg dark:text-gray-200 font-semibold">Estado de Solicitud</h2>
                        </div>
                        <div>
                            <p className="text-green-600 dark:text-green-500 text-sm mb-1">Fecha de Solicitud</p>
                            <p className="font-normal text-sm dark:text-gray-100">{new Intl.DateTimeFormat('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            }).format(new Date(loan.created_at))}</p>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    )
}

export default LoanInfoPage