"use client"

import { User, Moon, Sun, Menu, X, CircleX, UserCircle } from 'lucide-react';
import creditoyaLogo from "@/assets/logos/creditoya_logo_minimalist.png"
import Image from 'next/image';
import useNavBar from '@/hooks/useNavBar';
import { useClientAuth } from '@/context/AuthContext';

function NavBar() {

    const {
        scrolled,
        darkmode,
        isMenuOpen,
        router,
        changeDarkMode,
        setIsMenuOpen
    } = useNavBar();

    const {
        user,
        isAuthenticated,
        logout,
    } = useClientAuth();

    // Función para verificar si la URL del avatar es válida
    const isValidAvatar = (avatarUrl: string | undefined | null): boolean => {
        return Boolean(avatarUrl && avatarUrl !== "No definido" && avatarUrl.trim() !== "");
    };

    return (
        <div className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled
            ? `backdrop-blur-md ${darkmode ? 'bg-gray-900/80 dark' : 'bg-white/80'}`
            : `${darkmode ? 'bg-gray-900 dark' : 'bg-white'}`
            }`}>
            {/* Barra de navegación principal */}
            <nav className={`py-3 px-4 md:px-6 max-w-7xl mx-auto ${darkmode ? 'text-gray-100' : 'text-gray-800'}`}>
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Image
                            priority={true}
                            src={creditoyaLogo.src}
                            alt="logo"
                            width={150}
                            height={80}
                            className='drop-shadow-md dark:invert dark:brightness-[0.87] dark:hue-rotate-180 h-auto w-auto'
                            onClick={() => router.push("/")}
                        />
                    </div>

                    {/* Navegación escritorio */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <div>
                                <div className='flex flex-row gap-2'>
                                    <div className='grid place-content-center'>
                                        {isValidAvatar(user?.avatar) ? (
                                            <Image
                                                src={user?.avatar as string}
                                                alt={"avatar"}
                                                width={500}
                                                height={500}
                                                className='object-cover drop-shadow-sm w-8 h-8 rounded-full border-2 border-green-500'
                                                priority={true}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border-2 border-green-500 grid place-content-center bg-gray-100 dark:bg-gray-700">
                                                <UserCircle size={24} className="text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='text-sm font-semibold'>{user?.names} {user?.firstLastName}</p>
                                        <p className='text-xs font-thin text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer' onClick={() => router.push("/panel/perfil")}>Ver Cuenta</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => router.push("/auth")} className={`bg-green-50 hover:bg-green-100 cursor-pointer px-3 py-2 text-sm rounded-md ${darkmode ? 'dark:bg-gray-800 dark:hover:bg-gray-700 text-green-300' : 'text-green-500'}`}>
                                <span className="flex items-center font-normal">
                                    <User size={16} className={`mr-2 ${darkmode ? 'text-green-300' : 'text-green-500'}`} />
                                    Cuenta
                                </span>
                            </button>
                        )}

                        <button
                            onClick={changeDarkMode}
                            className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-green-400 dark:hover:text-green-300 text-green-600 hover:text-green-700 transition-colors p-2 rounded-md border border-gray-100 dark:border-gray-700"
                            aria-label={darkmode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        >
                            {darkmode ? <Sun className='drop-shadow-md' size={18} /> : <Moon size={18} className='drop-shadow-md' />}
                        </button>

                        {isAuthenticated && (
                            <div className='bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 p-2 rounded-md cursor-pointer' onClick={logout}>
                                <div className='flex flex-row gap-2'>
                                    <div className='grid place-content-center'>
                                        <CircleX size={20} className='drop-shadow-md text-red-400' />
                                    </div>
                                    <p className='text-xs grid place-content-center pb-0.5 font-semibold text-red-400'>Cerrar Sesion</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botón móvil */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`md:hidden ${darkmode ? 'text-gray-200' : 'text-gray-600'}`}
                        aria-label="Menú"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav >

            {/* Menú móvil */}
            {
                isMenuOpen && (
                    <div className={`md:hidden border-t ${darkmode ? 'border-gray-800 bg-gray-800/95 backdrop-blur-sm' : 'border-gray-100 bg-gray-50/95 backdrop-blur-sm'}`}>
                        <div className="max-w-6xl mx-auto py-3 px-4">
                            {/* Perfil de usuario en móvil */}
                            {isAuthenticated ? (
                                <div className="mb-3 pb-3 border-b border-opacity-10 border-gray-400">
                                    <div className="flex items-center gap-3">
                                        {isValidAvatar(user?.avatar) ? (
                                            <Image
                                                src={user?.avatar as string}
                                                alt={"avatar"}
                                                width={40}
                                                height={40}
                                                className='object-cover drop-shadow-sm w-10 h-10 rounded-full border-2 border-green-500'
                                                priority={true}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border-2 border-green-500 grid place-content-center bg-gray-100 dark:bg-gray-700">
                                                <UserCircle size={30} className="text-green-500" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <p className={`text-sm font-semibold ${darkmode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {user?.names} {user?.firstLastName}
                                            </p>
                                            <p
                                                className='text-xs font-thin text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer'
                                                onClick={() => {
                                                    router.push("/panel/perfil");
                                                    setIsMenuOpen(false);
                                                }}
                                            >
                                                Ver Cuenta
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-3 pb-3 border-b border-opacity-10 border-gray-400">
                                    <button
                                        onClick={() => {
                                            router.push("/auth");
                                            setIsMenuOpen(false);
                                        }}
                                        className={`flex items-center py-2 px-3 rounded-md w-full ${darkmode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-800'}`}
                                    >
                                        <User size={16} className={`mr-2 ${darkmode ? 'text-green-300' : 'text-green-500'}`} />
                                        <span>Iniciar Sesión</span>
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between py-2">
                                <span className={`text-sm ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Modo {darkmode ? 'oscuro' : 'claro'}
                                </span>
                                <button
                                    onClick={changeDarkMode}
                                    className={`${darkmode ? 'text-green-400' : 'text-green-600'}`}
                                    aria-label={darkmode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                                >
                                    {darkmode ? <Sun size={16} /> : <Moon size={16} />}
                                </button>
                            </div>

                            {/* Botón de cerrar sesión en móvil */}
                            {isAuthenticated && (
                                <div className="mt-3 pt-3 border-t border-opacity-10 border-gray-400">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md w-full ${darkmode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        <CircleX size={16} className="text-red-400" />
                                        <span className="text-sm font-semibold text-red-400">Cerrar Sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default NavBar;