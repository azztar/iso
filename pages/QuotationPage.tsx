import React from 'react';
import QuotationForm from '../components/QuotationForm';

const QuotationPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nueva Cotización de Servicios</h1>
        <p className="text-gray-600 mt-1">Diligencie la propuesta comercial para el cliente. El formato oficial se registrará en el proceso Misional.</p>
      </div>
      <QuotationForm />
    </div>
  );
};

export default QuotationPage;
