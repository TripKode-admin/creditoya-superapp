import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

/**
 * Hook para manejar el flujo de recuperación de contraseña
 */
export const usePasswordReset = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Token del magic link
  const token = searchParams.get('token');
  // Tipo de usuario (cliente o intranet)
  const userType = searchParams.get('type');
  
  // Estados
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verificar token al cargar el componente
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/password-reset/validate?token=${token}`);
        setIsValidToken(true);
        setEmail(response.data.email);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error validando token:', err);
        setError(err.response?.data?.error || 'Token inválido o expirado');
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // Función para restablecer la contraseña
  const resetPassword = async () => {
    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post('/api/password-reset/reset', {
        token,
        newPassword: password
      });
      
      setResetSuccess(true);
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err);
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    userType,
  };
};