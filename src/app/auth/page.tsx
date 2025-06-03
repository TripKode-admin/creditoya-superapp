"use client"

import React, { useState, memo, useCallback } from 'react';
import { ShieldCheck, Eye, EyeOff, Building2, Mail, Lock, User, Check, AlertCircle, LucideIcon } from 'lucide-react';
import Image from 'next/image';
import logoCY from "@/assets/logos/only_object_logo.png"
import useAuth from '@/hooks/useAuth';

interface InputFieldProps {
    id: string;
    name: string;
    type?: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    autoComplete?: string;
    icon?: LucideIcon;
    showPasswordToggle?: boolean;
    error?: string;
}

// Memoizamos el componente InputField
const InputField = memo<InputFieldProps>(({
    id,
    name,
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    required = false,
    autoComplete,
    icon: Icon,
    showPasswordToggle = false,
    error
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const hasError = !!error;
    const hasValue = value && value.length > 0;

    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className={`h-4 w-4 transition-colors ${hasError ? 'text-red-400 dark:text-red-300' :
                            hasValue ? 'text-green-500 dark:text-green-400' :
                                'text-gray-400 dark:text-gray-500'
                            }`} />
                    </div>
                )}
                <input
                    id={id}
                    name={name}
                    type={showPasswordToggle && showPassword ? 'text' : type}
                    autoComplete={autoComplete}
                    required={required}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
                        w-full text-sm px-3 py-3 
                        ${Icon ? 'pl-10' : ''} 
                        ${(showPasswordToggle || (hasValue && !hasError)) ? 'pr-10' : ''}
                        bg-white dark:bg-gray-800 
                        border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-offset-1 
                        transition-all duration-200 ease-in-out
                        ${hasError
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-400 dark:focus:ring-red-800/30'
                            : hasValue
                                ? 'border-green-300 focus:border-green-500 focus:ring-green-200 dark:border-green-600 dark:focus:border-green-400 dark:focus:ring-green-800/30'
                                : 'border-gray-300 focus:border-green-500 focus:ring-green-200 dark:border-gray-600 dark:focus:border-green-400 dark:focus:ring-green-800/30'
                        }
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-500 dark:placeholder-gray-400
                        dark:focus:ring-offset-gray-800
                    `}
                    placeholder={placeholder}
                    aria-invalid={hasError ? 'true' : 'false'}
                    aria-describedby={hasError ? `${id}-error` : undefined}
                />

                {/* Right side icons container */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                    {/* Password toggle button */}
                    {showPasswordToggle && (
                        <button
                            type="button"
                            className="flex items-center justify-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                            )}
                        </button>
                    )}

                    {/* Validation check icon */}
                    {hasValue && !hasError && !showPasswordToggle && (
                        <div className="flex items-center justify-center pointer-events-none">
                            <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                        </div>
                    )}
                </div>
            </div>
            {hasError && (
                <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    );
});

InputField.displayName = 'InputField';

function AuthPage() {
    const {
        isLogin,
        email,
        password,
        names,
        firstLastName,
        secondLastName,
        currentCompanie,
        isLoading,
        error,
        isRecovery,
        isActiveRecovery,
        validationErrors,
        setIsLogin,
        handleEmailChange,
        handlePasswordChange,
        handleNamesChange,
        handleFirstLastNameChange,
        handleSecondLastNameChange,
        handleCompanyChange,
        handleSubmit,
        generateMagicRecovery,
        handleRecoveryPassword,
        showPassword,
        setShowPassword,
        companies
    } = useAuth();

    // Memoizamos el handler del password toggle
    const handlePasswordToggle = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword, setShowPassword]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex">
            {/* Left Panel - Logo and Info */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800 dark:from-green-800 dark:via-green-900 dark:to-black"></div>
                <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

                <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
                    <div className="text-center space-y-6">
                        {/* Logo */}
                        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-800">
                            <Image src={logoCY} alt={"logo"} className="w-12 h-12" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold mb-3">Credito Ya</h1>
                            <p className="text-green-100 dark:text-green-200 text-lg leading-relaxed max-w-md">
                                Gestiona tu solicitud de préstamo desde cualquier lugar, en cualquier momento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-start lg:items-center justify-center p-6 lg:p-12 min-h-screen overflow-y-auto">
                <div className="w-full max-w-md py-8 lg:py-0">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-6 mt-10">
                        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-800">
                            <Image src={logoCY} alt={"logo"} className="w-12 h-12" />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center sm:mt-20 mb-6 lg:mb-8">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            {isLogin && !isRecovery && "Bienvenido de nuevo"}
                            {!isLogin && !isRecovery && "Crear cuenta"}
                            {isRecovery && "Recuperar contraseña"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                            {isLogin && !isRecovery && "Ingresa tus credenciales para acceder"}
                            {!isLogin && !isRecovery && "Completa tus datos para crear una cuenta"}
                            {isRecovery && "Te enviaremos las instrucciones por correo"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Recovery Message */}
                    {isActiveRecovery && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                                        ¡Recuperación completada!
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Instrucciones enviadas a tu correo electrónico. Verifica tu bandeja de entrada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={isRecovery ? handleRecoveryPassword : handleSubmit} className="space-y-4">
                        {/* Registration Fields */}
                        {!isLogin && !isRecovery && (
                            <div className="space-y-4">
                                <InputField
                                    id="names"
                                    name="names"
                                    label="Nombres"
                                    placeholder="Ingresa tus nombres"
                                    value={names}
                                    onChange={handleNamesChange}
                                    required={!isLogin}
                                    autoComplete="given-name"
                                    icon={User}
                                    error={validationErrors.names}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InputField
                                        id="firstLastName"
                                        name="firstLastName"
                                        label="Primer apellido"
                                        placeholder="Primer apellido"
                                        value={firstLastName}
                                        onChange={handleFirstLastNameChange}
                                        required={!isLogin}
                                        autoComplete="family-name"
                                        icon={User}
                                        error={validationErrors.firstLastName}
                                    />

                                    <InputField
                                        id="secondLastName"
                                        name="secondLastName"
                                        label="Segundo apellido"
                                        placeholder="Segundo apellido"
                                        value={secondLastName}
                                        onChange={handleSecondLastNameChange}
                                        autoComplete="family-name"
                                        icon={User}
                                    />
                                </div>

                                {/* Company Select */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Empresa asociada <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <select
                                            value={currentCompanie || ''}
                                            onChange={(e) => {
                                                const selectedCompany = companies.find(c => c.value === e.target.value);
                                                if (selectedCompany) {
                                                    handleCompanyChange(selectedCompany.value);
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800/30 focus:border-green-500 dark:focus:border-green-400 text-gray-900 dark:text-gray-100 dark:focus:ring-offset-gray-800"
                                            required
                                        >
                                            <option value="">Selecciona tu empresa</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.value}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                        {currentCompanie && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email and Password Fields */}
                        {!isActiveRecovery && (
                            <div className="space-y-4">
                                <InputField
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Correo electrónico"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    autoComplete="email"
                                    icon={Mail}
                                    error={validationErrors.email}
                                />

                                {!isRecovery && (
                                    <InputField
                                        id="password"
                                        name="password"
                                        type="password"
                                        label="Contraseña"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete={isLogin ? "current-password" : "new-password"}
                                        icon={Lock}
                                        showPasswordToggle
                                        error={validationErrors.password}
                                    />
                                )}

                                {/* Forgot Password Link */}
                                {isLogin && !isRecovery && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => generateMagicRecovery({})}
                                            className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                )}

                                {/* Cancel Recovery Link */}
                                {isRecovery && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => generateMagicRecovery({ isCancel: true })}
                                            className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                        >
                                            Cancelar recuperación
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        {!isActiveRecovery && (
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 dark:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading && (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    )}
                                    {isLogin && !isRecovery && (isLoading ? "Ingresando..." : "Ingresar")}
                                    {!isLogin && !isRecovery && (isLoading ? "Registrando..." : "Crear cuenta")}
                                    {isRecovery && (isLoading ? "Enviando..." : "Enviar instrucciones")}
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Toggle Login/Register */}
                    {!isRecovery && (
                        <div className="mt-4 text-center pb-8 lg:pb-0">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                                >
                                    {isLogin ? "Regístrate" : "Inicia sesión"}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthPage;