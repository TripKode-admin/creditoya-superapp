import React, { useState } from 'react';
import { Plus, X, Edit2, Check, Phone } from 'lucide-react';

interface PhoneListProps {
    phones: string[];
    onAddPhone: (phone: string) => void;
    onRemovePhone: (index: number) => void;
    onEditPhone: (index: number, newPhone: string) => void;
    required?: boolean;
}

const PhoneList: React.FC<PhoneListProps> = ({
    phones,
    onAddPhone,
    onRemovePhone,
    onEditPhone,
    required = false
}) => {
    const [newPhone, setNewPhone] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingPhone, setEditingPhone] = useState('');
    const [error, setError] = useState('');

    const validatePhone = (phone: string): boolean => {
        // Validación básica para números de teléfono (10 dígitos)
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const handleAddPhone = () => {
        if (!newPhone.trim()) {
            setError('Ingrese un número de teléfono');
            return;
        }

        if (!validatePhone(newPhone)) {
            setError('El número debe tener 10 dígitos');
            return;
        }

        if (phones.includes(newPhone.trim())) {
            setError('Este número ya está agregado');
            return;
        }

        onAddPhone(newPhone.trim());
        setNewPhone('');
        setError('');
    };

    const handleEditStart = (index: number) => {
        setEditingIndex(index);
        setEditingPhone(phones[index]);
    };

    const handleEditSave = () => {
        if (!editingPhone.trim()) {
            return;
        }

        if (!validatePhone(editingPhone)) {
            return;
        }

        if (editingIndex !== null) {
            onEditPhone(editingIndex, editingPhone.trim());
            setEditingIndex(null);
            setEditingPhone('');
        }
    };

    const handleEditCancel = () => {
        setEditingIndex(null);
        setEditingPhone('');
    };

    const formatPhone = (phone: string): string => {
        // Formatear número de teléfono para mostrar
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Números de contacto {required && <span className="text-red-500">*</span>}
                </label>
                
                {/* Input para agregar nuevo teléfono */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="tel"
                                value={newPhone}
                                onChange={(e) => {
                                    setNewPhone(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Ingrese número de teléfono"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddPhone();
                                    }
                                }}
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddPhone}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar
                    </button>
                </div>
            </div>

            {/* Lista de teléfonos */}
            {phones.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Números agregados ({phones.length})
                    </h4>
                    <div className="space-y-2">
                        {phones.map((phone, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                                {editingIndex === index ? (
                                    <>
                                        <div className="flex-1">
                                            <input
                                                type="tel"
                                                value={editingPhone}
                                                onChange={(e) => setEditingPhone(e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleEditSave();
                                                    }
                                                    if (e.key === 'Escape') {
                                                        handleEditCancel();
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleEditSave}
                                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                            title="Guardar"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleEditCancel}
                                            className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                                            title="Cancelar"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 flex-1">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatPhone(phone)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleEditStart(index)}
                                            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onRemovePhone(index)}
                                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                            title="Eliminar"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Indicador de validación */}
            {phones.length < 2 && (
                <p className="text-amber-600 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                    Debe agregar al menos 2 números de contacto
                </p>
            )}
            {phones.length >= 2 && (
                <p className="text-green-600 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Números de contacto válidos ({phones.length}/2 mínimo)
                </p>
            )}
        </div>
    );
};

export default PhoneList;