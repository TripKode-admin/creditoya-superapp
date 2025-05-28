"use client"

import usePanelApi from "@/hooks/usePanelApi";
import FormInput from "../PerfilFormInput";
import SelectInput from "@/components/panel/SelectInput";
import SelectEmpresa from "../selectCompani";

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
        <>
            <div className="space-y-3 mt-10">
                <div className="mb-5">
                    <h3 className="font-semibold text-lg text-gray-600 dark:text-gray-50">Datos Personales</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Información para procesar tus solicitudes de crédito.</p>
                </div>

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

                <FormInput
                    label="Segundo Apellido (Opcional)"
                    initialValue={formatFieldValue('secondLastName', userComplete.secondLastName)}
                    onUpdate={handleUpdate}
                    fieldName="secondLastName"
                    isValid={true}
                />

                <FormInput
                    label="Correo Electronico"
                    initialValue={formatFieldValue('email', userComplete.email)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="email"
                    isValid={isFieldValid('email', userComplete.email)}
                />

                <FormInput
                    label="Fecha de nacimiento"
                    initialValue={formatFieldValue('birth_day', userComplete.birth_day)}
                    required={true}
                    type="date"
                    onUpdate={handleUpdate}
                    fieldName="birth_day"
                    isValid={isFieldValid('birth_day', userComplete.birth_day)}
                />

                <FormInput
                    label="Numero de documento"
                    initialValue={formatFieldValue('number', userComplete.Document[0].number)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="Document[0].number" // ✅ CAMBIAR ESTO
                    isValid={isFieldValid('number', userComplete.Document[0].number)}
                />

                <SelectEmpresa />
            </div>
        </>
    )
}

export default FormDatesPerfil;