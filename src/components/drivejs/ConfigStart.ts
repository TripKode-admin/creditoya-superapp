import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startTutorial = () => {
    const driverObj = driver({
        showProgress: true,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Finalizar",
        popoverClass: "driverjs-theme",
        steps: [
            {
                element: '[data-tour="main-title"]',
                popover: {
                    title: "¡Bienvenido a tu Panel de Préstamos! 🎉",
                    description: "Aquí podrás gestionar todas tus solicitudes de préstamo de manera fácil y organizada.",
                    side: "bottom",
                    align: "center"
                }
            },
            {
                element: '[data-tour="new-request-btn"]',
                popover: {
                    title: "Crear Nueva Solicitud 📝",
                    description: "Haz clic aquí para crear una nueva solicitud de préstamo. El proceso es rápido y sencillo.",
                    side: "bottom",
                    align: "center"
                }
            },
            {
                element: '[data-tour="search-bar"]',
                popover: {
                    title: "Buscar Solicitudes 🔍",
                    description: "Utiliza esta barra de búsqueda para encontrar solicitudes específicas por ID, estado o monto.",
                    side: "bottom",
                    align: "start"
                }
            },
            {
                element: '[data-tour="filters"]',
                popover: {
                    title: "Filtros y Ordenamiento 🎯",
                    description: "Filtra tus solicitudes por estado y ordénalas según tus preferencias para encontrar exactamente lo que buscas.",
                    side: "bottom",
                    align: "center"
                }
            },
            {
                element: '[data-tour="view-mode"]',
                popover: {
                    title: "Modo de Vista 👁️",
                    description: "Cambia entre vista de lista y cuadrícula según tu preferencia de visualización.",
                    side: "left",
                    align: "center"
                }
            },
            {
                element: '[data-tour="loans-section"]',
                popover: {
                    title: "Tus Solicitudes 📋",
                    description: "Aquí aparecerán todas tus solicitudes de préstamo. Cada tarjeta muestra información importante como el monto, estado y fecha.",
                    side: "top",
                    align: "center"
                }
            }
        ],
        onDestroyStarted: () => {
            driverObj.destroy();
        }
    });

    // Personalizar estilos del tour
    const style = document.createElement('style');
    style.textContent = `
            .driver-popover {
                border-radius: 12px !important;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
                border: 1px solid #e5e7eb !important;
            }
            .driver-popover-title {
                color: #1f2937 !important;
                font-weight: 600 !important;
                font-size: 16px !important;
                margin-bottom: 8px !important;
            }
            .driver-popover-description {
                color: #6b7280 !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            .driver-popover-next-btn, .driver-popover-prev-btn, .driver-popover-done-btn {
                background: linear-gradient(to right, #2563eb, #1d4ed8) !important;
                border: none !important;
                border-radius: 8px !important;
                padding: 8px 16px !important;
                font-weight: 500 !important;
                transition: all 0.2s ease !important;
            }
            .driver-popover-next-btn:hover, .driver-popover-prev-btn:hover, .driver-popover-done-btn:hover {
                background: linear-gradient(to right, #1d4ed8, #1e40af) !important;
                transform: translateY(-1px) !important;
            }
            .driver-popover-close-btn {
                color: #9ca3af !important;
                font-size: 18px !important;
            }
            .driver-popover-close-btn:hover {
                color: #374151 !important;
            }
            .driver-popover-progress-text {
                color: #6b7280 !important;
                font-size: 12px !important;
            }
        `;
    document.head.appendChild(style);

    driverObj.drive();
};