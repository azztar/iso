import React, { useState, useEffect } from 'react';
import { FileText, Upload, Edit, Download } from 'lucide-react';
import { api } from '../../services/api';
import { Template } from '../../types';
import UploadTemplateModal from '../../components/platform/UploadTemplateModal';

const TemplateListPage: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);


    const fetchTemplates = () => {
        setLoading(true);
        api.getTemplates()
            .then(setTemplates)
            .catch(err => console.error("Failed to fetch templates", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleOpenCreateModal = () => {
        setTemplateToEdit(null);
        setUploadModalOpen(true);
    };

    const handleOpenEditModal = (template: Template) => {
        setTemplateToEdit(template);
        setUploadModalOpen(true);
    };

    const handleCloseModal = () => {
        setUploadModalOpen(false);
        setTemplateToEdit(null);
    };

    const handleDownloadTemplate = (template: Template) => {
        const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${template.nombre}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: bold; color: #1e3a8a; }
    .meta { font-size: 12px; color: #6b7280; }
    .content-box { border: 1px dashed #93c5fd; background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">SISTEMA INTEGRADO DE GESTIÓN ISO 9001:2015</div>
    <div class="meta">Plantilla Maestra: ${template.nombre} | Tipo: ${template.tipo} | Versión: v${template.version} | Actualización: ${template.lastUpdated}</div>
  </div>
  <div class="content-box">
    <h3>Estructura del Formato Dinámico</h3>
    <p>Este archivo representa el esqueleto base HTML/Handlebars utilizado por el generador de documentos del ERP ISO Gestión.</p>
    <code>{{#each items}} ... {{/each}}</code>
  </div>
</body>
</html>`;
        const blob = new Blob([sampleHtml], { type: 'text/html;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `plantilla_${template.tipo.toLowerCase()}_v${template.version}.html`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div>Cargando plantillas...</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Biblioteca de Plantillas Globales</h1>
                        <p className="text-gray-600 mt-1">Administre las plantillas base para los formularios de los tenants.</p>
                    </div>
                    <button onClick={handleOpenCreateModal} className="px-4 py-2 border rounded-md text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary flex items-center shadow-sm">
                        <Upload size={16} className="mr-2"/> Subir Nueva Plantilla
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de la Plantilla</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actualización</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templates.map(template => (
                                    <tr key={template.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.tipo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.version}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.lastUpdated}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                            <button onClick={() => handleDownloadTemplate(template)} className="text-gray-600 hover:text-brand-primary p-1 rounded-full hover:bg-gray-100 transition-colors" title="Descargar archivo base">
                                                <Download size={16} />
                                            </button>
                                            <button onClick={() => handleOpenEditModal(template)} className="text-brand-primary hover:text-brand-secondary p-1 rounded-full hover:bg-blue-100 transition-colors" title="Editar plantilla">
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <UploadTemplateModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchTemplates}
                template={templateToEdit}
            />
        </>
    );
};

export default TemplateListPage;