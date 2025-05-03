import React from 'react';
import { Circle } from 'lucide-react';
import { LoanStatus } from '@/types/full';

// Componente Dot personalizado que renderiza un círculo con color basado en el estado
// y muestra el texto del estado
const DotBox = ({ status }: { status: LoanStatus }) => {
  // Mapa de colores según el estado
  const statusColors = {
    'Pendiente': 'text-yellow-500',
    'Aprobado': 'text-green-500',
    'Aplazado': 'text-blue-500',
    'Borrador': 'text-gray-500',
    'Archivado': 'text-red-500',
  };
  
  // Obtener el color basado en el estado, con un valor predeterminado
  const color = statusColors[status] || 'text-gray-400';
  
  return (
    <div className="flex items-center">
      <Circle className={`${color} mr-2 fill-current h-4 w-4 drop-shadow-md`} />
      <span className={`${color} text-sm font-medium`}>{status}</span>
    </div>
  );
};

export default DotBox;