"use client"

import Image from "next/image";
import logoCY from "@/assets/logos/only_object_logo.png";
import useAuth from "@/hooks/useAuth";
import SelectEmpresa from "@/components/panel/selectCompani";
import { UserCompany } from "@/types/full";
import { ShieldCheck } from "lucide-react";

function AuthPage() {
    const {
        isLogin,
        error,
        handleSubmit,
        names,
        firstLastName,
        secondLastName,
        password,
        email,
        isLoading,
        setIsLogin,
        setNames,
        setFirstLastName,
        setSecondLastName,
        setEmail,
        setPassword,
        handleCompanyChange,
        generateMagicRecovery,
        handleRecoveryPassword,
        currentCompanie,
        isRecovery,
        isActiveRecovery
    } = useAuth();

    return (
        <main className="flex flex-col md:flex-row min-h-screen dark:bg-black overflow-hidden">
            {/* Panel izquierdo (logo e información) */}
            <div className="hidden md:block md:w-1/2 lg:w-2/5 dark:bg-black p-4 fixed left-0 top-0 h-full">
                <div className="flex flex-col justify-center items-center h-full">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-6 flex justify-center">
                            <Image
                                src={logoCY}
                                alt="Logo"
                                width={120}
                                height={120}
                                priority
                                className="object-contain drop-shadow-md"
                            />
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Credito Ya</h2>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 max-w-xs mx-auto font-thin">
                            Gestiona tu solicitud de préstamo desde cualquier lugar, en cualquier momento.
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel derecho (formulario) */}
            <div className="w-full md:w-1/2 md:ml-auto lg:w-3/5 flex items-center justify-center p-4 md:p-6 lg:p-8 dark:bg-black min-h-screen overflow-y-auto">
                <div className="w-full max-w-md py-6">
                    {/* Logo móvil (visible solo en móvil) */}
                    <div className="md:hidden flex justify-center mb-4 sm:pt-0 pt-8">
                        <Image
                            src={logoCY}
                            alt="Logo"
                            width={100}
                            height={100}
                            priority
                            className="object-contain"
                        />
                    </div>

                    <div className="space-y-1 mb-6 mt-10">
                        <h1 className="text-xl font-medium text-gray-700 dark:text-gray-200 text-center">
                            {isLogin && !isRecovery && "Bienvenido de nuevo"}
                            {!isLogin && !isRecovery && "Registro"}
                            {isRecovery && "Recuperacion de contraseña"}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            {isLogin && !isRecovery && "Ingresa tus credenciales para acceder"}
                            {!isLogin && !isRecovery && "Completa tus datos para crear una cuenta"}
                            {isRecovery && "Recupera el acceso a tu cuenta y a tus datos personales"}
                        </p>
                    </div>

                    {error && (
                        <div className="p-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md mb-4">
                            {"Credenciales inválidas, verifica tus datos e intenta nuevamente."}
                        </div>
                    )}

                    <form onSubmit={isRecovery ? handleRecoveryPassword : handleSubmit} className="space-y-3">
                        {!isLogin && !isRecovery && (
                            <>
                                <div>
                                    <label htmlFor="names" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                        Nombres
                                    </label>
                                    <input
                                        id="names"
                                        name="names"
                                        type="text"
                                        autoComplete="name"
                                        required={!isLogin}
                                        value={names}
                                        onChange={(e) => setNames(e.target.value)}
                                        className="w-full text-base text-gray-700 dark:text-gray-200 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                                        placeholder="Nombres"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="firstLastName" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                        Primer Apellido
                                    </label>
                                    <input
                                        id="firstLastName"
                                        name="firstLastName"
                                        type="text"
                                        required={!isLogin}
                                        value={firstLastName}
                                        onChange={(e) => setFirstLastName(e.target.value)}
                                        className="w-full text-base text-gray-700 dark:text-gray-200 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                                        placeholder="Primer apellido"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="secondLastName" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                        Segundo Apellido (opcional)
                                    </label>
                                    <input
                                        id="secondLastName"
                                        name="secondLastName"
                                        type="text"
                                        value={secondLastName}
                                        onChange={(e) => setSecondLastName(e.target.value)}
                                        className="w-full text-base text-gray-700 dark:text-gray-200 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                                        placeholder="Segundo apellido (opcional)"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="company" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                        Empresa asociada
                                    </label>
                                    <SelectEmpresa isRegister onChange={handleCompanyChange} defaultValue={currentCompanie as UserCompany} />
                                </div>
                            </>
                        )}

                        {!isActiveRecovery ? (
                            <>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full text-base text-gray-700 dark:text-gray-200 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                                        placeholder="nombre@empresa.com"
                                    />
                                </div>

                                {!isRecovery && (
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                            Contraseña
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete={isLogin ? "current-password" : "new-password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full text-base text-gray-700 dark:text-gray-200 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                )}

                                {isLogin && !isRecovery && (
                                    <div className="text-right" onClick={() => generateMagicRecovery({})}>
                                        <button type="button" className="text-xs text-green-600 dark:text-green-400 hover:underline">
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                )}

                                {isRecovery && (
                                    <div className="text-right" onClick={() => generateMagicRecovery({ isCancel: true })}>
                                        <button type="button" className="text-xs text-green-600 dark:text-green-400 hover:underline">
                                            Cancelar recuperacion de contraseña
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid place-content-center">
                                <div className="flex flex-row gap-2 bg-gray-100 p-4 rounded-md dark:bg-gray-800">
                                    <div className="grid place-content-center">
                                        <ShieldCheck size={35} className="text-blue-300" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-100">¡RECUPERACIÓN COMPLETADA!</h3>
                                        <p className="text-xs dark:text-gray-400">Instrucciones enviadas a tu correo electrónico. Verifica tu bandeja de entrada para finalizar el proceso de seguridad.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 py-2 px-4 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors disabled:opacity-50"
                        >
                            {isLogin && !isRecovery && (isLoading ? "Ingresando..." : "Ingresar")}
                            {!isLogin && !isRecovery && (isLoading ? "Registrando..." : "Registrarse")}
                            {isRecovery && (isLoading ? "Validando..." : "Validar")}
                        </button>
                    </form>

                    {!isRecovery && (
                        <div className="mt-4 text-center pb-8">
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                                {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-1 text-green-600 dark:text-green-400 hover:underline font-medium"
                                >
                                    {isLogin && !isRecovery ? "Regístrate" : "Inicia sesión"}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default AuthPage;