import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Contacto, CotizacionItem, ProcessType, DocumentType } from '../types';
import { PlusCircle, Trash2, Send, FileText, Loader2 } from 'lucide-react';

const QuotationForm: React.FC = () => {
  const [clientes, setClientes] = useState<Contacto[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [vigencia, setVigencia] = useState('30 días calendario');
  const [condiciones, setCondiciones] = useState('50% de anticipo y 50% al entregar el informe final de consultoría.');
  const [items, setItems] = useState<CotizacionItem[]>([
    { id: `item-${Date.now()}`, descripcion: '', cantidad: 1, precioUnitario: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { fetchData: refreshDocuments } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    api.getClientes().then(setClientes);
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      alert('La cotización debe tener al menos un ítem.');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof Omit<CotizacionItem, 'id'>, value: string) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const numericValue = field === 'descripcion' ? value : parseFloat(value) || 0;
        return { ...item, [field]: numericValue };
      }
      return item;
    });
    setItems(newItems);
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
    const impuestos = subtotal * 0.19; // IVA 19%
    const total = subtotal + impuestos;
    return { subtotal, impuestos, total };
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || items.some(i => !i.descripcion || i.cantidad <= 0 || i.precioUnitario <= 0)) {
      setError('Por favor seleccione un cliente y complete la descripción y valores de todos los ítems.');
      return;
    }
    if (!user) {
      setError('Sesión expirada. Por favor inicie sesión de nuevo.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await api.createCotizacion({
        clienteId,
        fecha: new Date().toISOString().split('T')[0],
        vigencia,
        condiciones,
        items,
        ...totals,
      }, user);

      alert('Cotización creada exitosamente. El formato de cotización se ha registrado bajo el proceso Misional.');
      await refreshDocuments();
      navigate(`/drive/${ProcessType.MISIONAL}/documentos/${DocumentType.FORMATO}`);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al crear la cotización comercial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      {/* Client and conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente Solicitante</label>
          <select
            id="cliente"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
          >
            <option value="" disabled>Seleccione un cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.razonSocial} (NIT: {c.rut_nit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vigencia" className="block text-sm font-medium text-gray-700 mb-1">Vigencia de la Oferta</label>
          <input
            type="text"
            id="vigencia"
            value={vigencia}
            onChange={e => setVigencia(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="condiciones" className="block text-sm font-medium text-gray-700 mb-1">Condiciones Comerciales y de Pago</label>
          <textarea
            id="condiciones"
            rows={2}
            value={condiciones}
            onChange={e => setCondiciones(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
          ></textarea>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Servicios o Productos a Cotizar</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs text-brand-primary hover:text-brand-secondary flex items-center font-medium"
          >
            <PlusCircle size={14} className="mr-1" /> Agregar Ítem
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="col-span-12 md:col-span-6">
                <input
                  type="text"
                  placeholder={`Descripción del servicio #${index + 1}`}
                  value={item.descripcion}
                  onChange={e => handleItemChange(item.id, 'descripcion', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border rounded-md text-sm"
                  required
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input
                  type="number"
                  placeholder="Cant."
                  min="1"
                  value={item.cantidad}
                  onChange={e => handleItemChange(item.id, 'cantidad', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border rounded-md text-sm text-right"
                  required
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <input
                  type="number"
                  placeholder="Precio Unitario"
                  min="0"
                  step="1000"
                  value={item.precioUnitario || ''}
                  onChange={e => handleItemChange(item.id, 'precioUnitario', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border rounded-md text-sm text-right"
                  required
                />
              </div>
              <div className="col-span-2 md:col-span-1 text-center">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-gray-100"
                  title="Eliminar ítem"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end pt-4 border-t">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{totals.subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>IVA (19%):</span>
            <span>{totals.impuestos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2">
            <span>Total Oferta:</span>
            <span>{totals.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg flex items-center shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
          Generar Cotización y Registrar Documento
        </button>
      </div>
    </form>
  );
};

export default QuotationForm;
