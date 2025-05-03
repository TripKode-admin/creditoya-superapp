import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Bank logo imports
import iconBancolombia from "@/assets/logos/banks/bancolombia.png";
import iconBancoBog from "@/assets/logos/banks/banco-de-bogota.png";
import iconDavivienda from "@/assets/logos/banks/davivienda.webp";
// Import placeholder for BBVA until you have the proper image
import iconAvVillas from "@/assets/logos/banks/AVVillas.webp";
import iconBancoPopular from "@/assets/logos/banks/BancoPopular.webp";
import iconColpatria from "@/assets/logos/banks/colpatria.png";
import iconBancoCajaSocial from "@/assets/logos/banks/banco-caja-social.webp";
import iconItau from "@/assets/logos/banks/Itau.png";
import iconScotiabank from "@/assets/logos/banks/Scotiabank.png";
import iconCitibank from "@/assets/logos/banks/citi-bank.png";
import iconGnbSudameris from "@/assets/logos/banks/sudameris.png";
import iconBancoomeva from "@/assets/logos/banks/bancomeva.png";
import iconBancoPichincha from "@/assets/logos/banks/Banco-Pichincha.png";
import iconBancoAgrario from "@/assets/logos/banks/banco-agrario.png";
import iconBancamia from "@/assets/logos/banks/bancamia.png";
import iconBancoOccidente from "@/assets/logos/banks/BancodeOccidente.webp";
import iconBancoFalabella from "@/assets/logos/banks/banco-fallabela.png";

// Bank options definition
const bankOptions = [
    {
        value: "bancolombia",
        label: "Bancolombia",
        logo: iconBancolombia
    },
    {
        value: "banco-bogota",
        label: "Banco de Bogotá",
        logo: iconBancoBog
    },
    {
        value: "davivienda",
        label: "Davivienda",
        logo: iconDavivienda
    },
    {
        value: "bbva",
        label: "BBVA Colombia",
        // Using Bancolombia as a temporary fallback for BBVA
        logo: iconBancolombia 
    },
    {
        value: "av-villas",
        label: "Banco AV Villas",
        logo: iconAvVillas
    },
    {
        value: "banco-popular",
        label: "Banco Popular",
        logo: iconBancoPopular
    },
    {
        value: "colpatria",
        label: "Banco Colpatria",
        logo: iconColpatria
    },
    {
        value: "banco-caja-social",
        label: "Banco Caja Social",
        logo: iconBancoCajaSocial
    },
    {
        value: "itau",
        label: "Banco Itaú",
        logo: iconItau
    },
    {
        value: "scotiabank-colpatria",
        label: "Scotiabank Colpatria",
        logo: iconScotiabank
    },
    {
        value: "citibank",
        label: "Citibank Colombia",
        logo: iconCitibank
    },
    {
        value: "gnb-sudameris",
        label: "GNB Sudameris",
        logo: iconGnbSudameris
    },
    {
        value: "bancoomeva",
        label: "Bancoomeva",
        logo: iconBancoomeva
    },
    {
        value: "banco-pichincha",
        label: "Banco Pichincha",
        logo: iconBancoPichincha
    },
    {
        value: "banco-agrario",
        label: "Banco Agrario de Colombia",
        logo: iconBancoAgrario
    },
    {
        value: "bancamia",
        label: "Bancamía",
        logo: iconBancamia
    },
    {
        value: "banco-occidente",
        label: "Banco de occidente",
        logo: iconBancoOccidente
    },
    {
        value: "banco-falabella",
        label: "Banco Falabella",
        logo: iconBancoFalabella
    },
];

interface SelectBanksProps {
    select: (option: string) => void;
}

function SelectBanks({ select }: SelectBanksProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<(typeof bankOptions)[0] | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle dark mode detection
    useEffect(() => {
        const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDarkMode(darkModeQuery.matches || document.documentElement.classList.contains("dark"));

        const darkModeHandler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        darkModeQuery.addEventListener("change", darkModeHandler);

        // Observe changes to the 'dark' class on HTML for manual themes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    setIsDarkMode(document.documentElement.classList.contains("dark"));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });

        return () => {
            darkModeQuery.removeEventListener("change", darkModeHandler);
            observer.disconnect();
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Filter banks based on search term
    const filteredBanks = bankOptions.filter(bank =>
        bank.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBankSelect = (bank: typeof bankOptions[0]) => {
        setSelectedBank(bank);
        setIsOpen(false);
        setSearchTerm("");
        select(bank.value);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen && inputRef.current) {
            // Focus the input when opening the dropdown
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    };

    return (
        <div className="w-full mb-4">
            <h5 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Entidad bancaria
            </h5>
            <div ref={dropdownRef} className="relative">
                {/* Custom dropdown button */}
                <button
                    type="button"
                    onClick={toggleDropdown}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm 
                    ${isDarkMode 
                        ? 'bg-gray-800 text-gray-200 border-gray-600 hover:border-gray-500' 
                        : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
                    } border rounded-md focus:outline-none focus:ring-2 
                    ${isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}`}
                >
                    <div className="flex items-center">
                        {selectedBank ? (
                            <>
                                <div className="flex-shrink-0 w-5 h-5 mr-2 relative">
                                    <Image
                                        src={selectedBank.logo}
                                        alt={`${selectedBank.label} logo`}
                                        fill
                                        sizes="20px"
                                        className="object-contain"
                                        onError={(e) => {
                                            // Fallback to Bancolombia logo on error
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = iconBancolombia.src;
                                        }}
                                    />
                                </div>
                                <span>{selectedBank.label}</span>
                            </>
                        ) : (
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Selecciona tu entidad bancaria
                            </span>
                        )}
                    </div>
                    <svg
                        className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                    <div
                        className={`absolute z-10 w-full mt-1 ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border rounded-md shadow-lg`}
                    >
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Buscar banco..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full px-3 py-1 text-sm ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-gray-200 border-gray-600 focus:border-blue-500' 
                                        : 'bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-400'
                                } border rounded-md focus:outline-none`}
                            />
                        </div>

                        {/* Options list */}
                        <div className="max-h-60 overflow-y-auto py-1">
                            {filteredBanks.length > 0 ? (
                                filteredBanks.map((bank) => (
                                    <div
                                        key={bank.value}
                                        onClick={() => handleBankSelect(bank)}
                                        className={`flex items-center px-3 py-2 cursor-pointer ${
                                            selectedBank?.value === bank.value
                                                ? 'bg-blue-500 text-white'
                                                : isDarkMode
                                                ? 'text-gray-200 hover:bg-gray-700'
                                                : 'text-gray-800 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 w-5 h-5 mr-2 relative">
                                            <Image
                                                src={bank.logo}
                                                alt={`${bank.label} logo`}
                                                fill
                                                sizes="20px"
                                                className="object-contain"
                                                onError={(e) => {
                                                    // Fallback to Bancolombia logo on error
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = iconBancolombia.src;
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm">{bank.label}</span>
                                    </div>
                                ))
                            ) : (
                                <div className={`px-3 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SelectBanks;