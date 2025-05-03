"use client"

import usePanelApi from "@/hooks/usePanelApi";
import FormInput from "../PerfilFormInput";
import SelectInput from "@/components/panel/SelectInput";

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

    const genreOptions = [
        { value: "Masculino", label: "Masculino" },
        { value: "Femenino", label: "Femenino" }
    ];

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
                    label="Fecha de nacimiento"
                    initialValue={formatFieldValue('birth_day', userComplete.birth_day)}
                    required={true}
                    type="date"
                    onUpdate={handleUpdate}
                    fieldName="birth_day"
                    isValid={isFieldValid('birth_day', userComplete.birth_day)}
                />

                <SelectInput
                    label="Género"
                    initialValue={formatFieldValue('genre', userComplete.genre || '')}
                    options={genreOptions}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="genre"
                    isValid={isFieldValid('genre', userComplete.genre)}
                />

                <FormInput
                    label="Numero de documento"
                    initialValue={formatFieldValue('number', userComplete.Document[0].number)}
                    required={true}
                    onUpdate={(field, value) => handleUpdate("Document[0].number", value)}
                    fieldName="number"
                    isValid={isFieldValid('number', userComplete.Document[0].number)}
                />

                <div className="mb-5">
                    <h3 className="font-semibold text-lg text-gray-600 dark:text-gray-50 mt-5">Datos de Contacto</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Información para cualquier comunicación relacionada con tu solicitud.</p>
                </div>

                <FormInput
                    label="Correo Electronico"
                    initialValue={formatFieldValue('email', userComplete.email)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="email"
                    isValid={isFieldValid('email', userComplete.email)}
                />

                <FormInput
                    label="Numero de Celular"
                    initialValue={formatFieldValue('phone', userComplete.phone)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="phone"
                    isValid={isFieldValid('phone', userComplete.phone)}
                />

                <FormInput
                    label="Numero de Whatsapp"
                    initialValue={formatFieldValue('phone_whatsapp', userComplete.phone_whatsapp)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="phone_whatsapp"
                    isValid={isFieldValid('phone_whatsapp', userComplete.phone_whatsapp)}
                />

                <FormInput
                    label="Ciudad"
                    initialValue={formatFieldValue('city', userComplete.city)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="city"
                    isValid={isFieldValid('city', userComplete.city)}
                />

                <FormInput
                    label="Direccion de residencia"
                    initialValue={formatFieldValue('residence_address', userComplete.residence_address)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="residence_address"
                    isValid={isFieldValid('residence_address', userComplete.residence_address)}
                />

                <FormInput
                    label="Telefono de residencia"
                    initialValue={formatFieldValue('residence_phone_number', userComplete.residence_phone_number)}
                    required={true}
                    onUpdate={handleUpdate}
                    fieldName="residence_phone_number"
                    isValid={isFieldValid('residence_phone_number', userComplete.residence_phone_number)}
                />
            </div>
        </>
    )
}

export default FormDatesPerfil;