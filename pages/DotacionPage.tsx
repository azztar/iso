import React from 'react';
import DotacionForm from '../components/DotacionForm';

const DotacionPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Entrega de Dotación y Elementos de Protección Personal (EPP)</h1>
        <p className="text-gray-600 mt-1">
          Formato oficial de entrega individual para cumplimiento de normativas de Gestión Humana y SG-SST (ISO 9001 / ISO 45001).
        </p>
      </div>
      <DotacionForm />
    </div>
  );
};

export default DotacionPage;
