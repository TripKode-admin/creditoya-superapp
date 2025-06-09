"use client";

import usePanelApi from "@/hooks/usePanelApi";
import FormInput from "../PerfilFormInput";
import SelectEmpresa from "../selectCompani";
import { User, UserCheck } from "lucide-react";

function FormDatesPerfil() {
    const {
        userComplete,
        updateUserField,
        isFieldValid,
        formatFieldValue
    } = usePanelApi();

    // Helper function to handle updates with proper return type
    const handleUpdate = async (fieldName: string, value: string): Promise<boolean> => {
        const result = await updateUserField(fieldName, value);
        return result;
    }

    if (userComplete == null) return null;


    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/30">
                        <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight">
                            Datos Personales
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                            Información necesaria para procesar tus solicitudes de crédito de forma segura.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5 sm:space-y-6">
                {/* Personal Names Grid */}
                <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                    <FormInput
                        label="Nombres"
                        initialValue={formatFieldValue('names', userComplete.names)}
                        required={true}
                        onUpdate={handleUpdate}
                        fieldName="names"
                        isValid={isFieldValid('names', userComplete.names)}
                    />

                    <FormInput
                        label="Primer Apellido"
                        initialValue={formatFieldValue('firstLastName', userComplete.firstLastName)}
                        required={true}
                        onUpdate={handleUpdate}
                        fieldName="firstLastName"
                        isValid={isFieldValid('firstLastName', userComplete.firstLastName)}
                    />
                </div>

                <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                    <FormInput
                        label="Segundo Apellido (Opcional)"
                        initialValue={formatFieldValue('secondLastName', userComplete.secondLastName)}
                        onUpdate={handleUpdate}
                        fieldName="secondLastName"
                        isValid={true}
                    />

                    <FormInput
                        label="Correo Electrónico"
                        initialValue={formatFieldValue('email', userComplete.email)}
                        required={true}
                        onUpdate={handleUpdate}
                        fieldName="email"
                        isValid={isFieldValid('email', userComplete.email)}
                    />
                </div>

                {/* Document and Date Grid */}
                <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                    <FormInput
                        label="Fecha de Nacimiento"
                        initialValue={formatFieldValue('birth_day', userComplete.birth_day)}
                        required={true}
                        type="date"
                        onUpdate={handleUpdate}
                        fieldName="birth_day"
                        isValid={isFieldValid('birth_day', userComplete.birth_day)}
                    />

                    <FormInput
                        label="Número de Documento"
                        initialValue={formatFieldValue('number', userComplete.Document[0].number)}
                        required={true}
                        onUpdate={handleUpdate}
                        fieldName="Document[0].number"
                        isValid={isFieldValid('number', userComplete.Document[0].number)}
                    />
                </div>

                {/* Company Selection */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <SelectEmpresa />
                </div>
            </div>
        </div>
    );
}

export default FormDatesPerfil;