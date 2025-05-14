import React from 'react';
import { usePasswordReset } from '@/hooks/useResetPassword';

// Componentes de UI
const Input = ({ 
  type, 
  value, 
  onChange, 
  placeholder,
  id
}: {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  id: string;
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

// Componente principal
export default function ResetPasswordPage() {
  const {
    isValidToken,
    isLoading,
    error,
    email,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    resetPassword,
    resetSuccess,
    userType
  } = usePasswordReset();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Error
            </h1>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-4 text-sm text-gray-500">
              Este enlace no es válido o ha expirado. Por favor, solicita un nuevo enlace de recuperación de contraseña.
            </p>
            <button 
              onClick={() => window.location.href = '/forgot-password'}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Solicitar nuevo enlace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-2xl font-bold text-green-500">¡Contraseña actualizada!</h1>
            <p className="mt-2 text-gray-600">
              Tu contraseña ha sido actualizada correctamente.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Serás redirigido a la página de inicio de sesión en unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Restablecer contraseña</h1>
          <p className="mt-2 text-gray-600">
            {userType === 'client' ? 'CreditoYa' : 'CreditoYa Intranet'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Establece una nueva contraseña para tu cuenta: <span className="font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); resetPassword(); }} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Cambiar contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}