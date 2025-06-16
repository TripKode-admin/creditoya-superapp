import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { Driver } from "driver.js";

interface CustomDriver extends Driver {
    getActiveIndex: () => number | undefined;
    moveNext: () => void;
    destroy: () => void;
    drive: () => void;
}

let currentDriverObj: CustomDriver | null = null;

export const startTutorial = () => {
    currentDriverObj = driver({
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
                    description: "Haz clic en el botón 'Nueva solicitud' para continuar con el tutorial. Te llevaremos al formulario donde podrás crear tu solicitud.",
                    side: "bottom",
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
        onHighlighted: (element) => {
            // Este evento se ejecuta cuando se resalta un elemento
            if (currentDriverObj) {
                const currentStepIndex = currentDriverObj.getActiveIndex();
                
                if (currentStepIndex === 1) { // Paso del botón "Nueva solicitud"
                    sessionStorage.setItem('tutorial-step', 'new-request-step');
                    // Ocultar el botón siguiente después de que se renderice
                    setTimeout(() => hideNextButton(), 100);
                }
            }
        },
        onDestroyStarted: () => {
            sessionStorage.removeItem('tutorial-active');
            sessionStorage.removeItem('tutorial-step');
            sessionStorage.removeItem('tutorial-continue');
            if (currentDriverObj) {
                currentDriverObj.destroy();
            }
            currentDriverObj = null;
        }
    });

    // Función para ocultar el botón siguiente dinámicamente
    const hideNextButton = () => {
        setTimeout(() => {
            const nextButton = document.querySelector('.driver-popover-next-btn') as HTMLElement | null;
            if (nextButton) {
                nextButton.style.display = 'none';
            }
        }, 100);
    };

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

    if (currentDriverObj) {
        currentDriverObj.drive();
    }
};

// Función para continuar el tutorial cuando se hace clic en "Nueva solicitud"
export const proceedTutorial = () => {
    if (currentDriverObj && sessionStorage.getItem('tutorial-step') === 'new-request-step') {
        // Marcar que debe continuar en la nueva página
        sessionStorage.setItem('tutorial-continue', 'true');
        sessionStorage.removeItem('tutorial-step');
    }
};

// Función para continuar el tutorial desde la página nueva-solicitud
export const continueTutorial = () => {
    const shouldContinue = sessionStorage.getItem('tutorial-continue') === 'true';
    
    if (shouldContinue) {
        // Limpiar el flag
        sessionStorage.removeItem('tutorial-continue');
        
        // Recrear el driver para continuar
        currentDriverObj = driver({
            showProgress: true,
            progressText: "{{current}} de {{total}}",
            nextBtnText: "Siguiente",
            prevBtnText: "Anterior",
            doneBtnText: "Finalizar",
            popoverClass: "driverjs-theme",
            steps: [
                {
                    element: '[data-tour="form-section"]',
                    popover: {
                        title: "Formulario de Solicitud 📋",
                        description: "Ahora estás en el formulario para crear tu nueva solicitud. Completa todos los campos requeridos.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="personal-data"]',
                    popover: {
                        title: "Datos Personales 👤",
                        description: "Información básica para verificar tu identidad. Completa todos los campos con tu información personal.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="contact-info"]',
                    popover: {
                        title: "Información de Contacto 📞",
                        description: "Datos de ubicación y medios de comunicación. Necesitamos esta información para contactarte.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="financial-info"]',
                    popover: {
                        title: "Información Financiera 💰",
                        description: "Entidad bancaria, cuenta de desembolso y monto solicitado. Verifica que toda la información sea correcta.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="digital-signature"]',
                    popover: {
                        title: "Firma Digital ✍️",
                        description: "Firma para validar tu solicitud de préstamo. Tu firma digital es legalmente vinculante.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="terms-conditions"]',
                    popover: {
                        title: "Términos y Condiciones 📄",
                        description: "Al marcar esta casilla, confirmas que has leído y aceptas nuestros términos de servicio y política de privacidad.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="submit-button"]',
                    popover: {
                        title: "Enviar Solicitud 📤",
                        description: "Haz clic en 'Enviar Solicitud' para procesar tu aplicación de préstamo.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="verification-message"]',
                    popover: {
                        title: "Verificación por Correo 📧",
                        description: "Te llegará un código de seguridad a tu correo electrónico. Verifica el código y con eso estará lista tu solicitud.",
                        side: "top",
                        align: "center"
                    }
                }
            ],
            onHighlighted: (element) => {
                if (currentDriverObj) {
                    const currentStepIndex = currentDriverObj.getActiveIndex();
                    
                    if (currentStepIndex === 6) { // Paso del botón "Enviar Solicitud"
                        sessionStorage.setItem('tutorial-step', 'submit-step');
                        // Ocultar el botón siguiente
                        setTimeout(() => hideNextButton(), 100);
                    }
                }
            },
            onDestroyStarted: () => {
                sessionStorage.removeItem('tutorial-active');
                sessionStorage.removeItem('tutorial-step');
                sessionStorage.removeItem('tutorial-continue');
                if (currentDriverObj) {
                    currentDriverObj.destroy();
                }
                currentDriverObj = null;
            }
        });

        // Aplicar estilos
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
        `;
        document.head.appendChild(style);

        currentDriverObj.drive();
    }
};

// Función para continuar el tutorial cuando se hace clic en "Enviar Solicitud"
export const proceedToVerification = () => {
    if (currentDriverObj && sessionStorage.getItem('tutorial-step') === 'submit-step') {
        // Avanzar al siguiente paso (verificación)
        currentDriverObj.moveNext();
        sessionStorage.removeItem('tutorial-step');
    }
};

// Función para ocultar el botón siguiente dinámicamente
function hideNextButton(): void {
    setTimeout(() => {
        const nextButton = document.querySelector('.driver-popover-next-btn') as HTMLElement | null;
        if (nextButton) {
            nextButton.style.display = 'none';
        }
    }, 100);
}

