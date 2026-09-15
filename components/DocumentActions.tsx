import React, { useState, useRef, useEffect } from 'react';
import { Document, DocumentStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { MoreVertical, CheckCircle, Send, Eye, Download, Edit, Archive, History, ThumbsDown } from 'lucide-react';
import DocumentPreviewModal from './shared/DocumentPreviewModal';
import EditDocumentModal from './EditDocumentModal';

interface DocumentActionsProps {
    doc: Document;
    onStatusChange: (docId: string, status: DocumentStatus) => Promise<void>;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ doc, onStatusChange }) => {
    const { user, hasPermission } = useAuth();
    const { createNewVersion } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGenericClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const handleCreateNewVersion = async () => {
        const note = prompt(`Ingrese la justificación de cambios para la nueva versión de "${doc.nombre}":`);
        if (note === null) return;
        try {
            await createNewVersion(doc.id, note.trim() || 'Creación de nueva versión de trabajo.');
            alert(`Nueva versión iniciada con éxito. El documento ${doc.codigo} ahora está en Borrador.`);
        } catch (err) {
            console.error(err);
            alert('Error al crear la nueva versión del documento.');
        }
    };

    const handleDownload = () => {
        const content = `=====================================================
SISTEMA DE GESTIÓN DE CALIDAD ISO 9001:2015
ACME CORP S.A.S. - DOCUMENTO CONTROLADO
=====================================================
Título: ${doc.nombre}
Código: ${doc.codigo}
Versión: v${doc.version}
Proceso: ${doc.proceso} ${doc.subproceso ? `(${doc.subproceso})` : ''}
Tipo: ${doc.tipo}
Estado: ${doc.estado}
Responsable: ${doc.responsableNombre}
Fecha Emisión: ${doc.fechaEmision}
Fecha Próxima Revisión: ${doc.fechaRevision}
=====================================================
Historial de Versiones:
${(doc.historial || []).map(h => `* [v${h.version} | ${new Date(h.fecha).toLocaleDateString()}]: ${h.cambios} (por: ${h.autor})`).join('\n') || 'Documento en primera versión sin historial adicional.'}
=====================================================
`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${doc.codigo}_v${doc.version}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderActions = () => {
        const canPublish = hasPermission('document:publish');
        const canSubmit = hasPermission('document:submit');
        const canDownload = hasPermission('document:download');
        const canCreate = hasPermission('document:create');
        const canUpdate = hasPermission('document:update');

        return (
            <>
                {/* Edit document properties */}
                {canUpdate && (
                    <button onClick={() => handleGenericClick(() => setIsEditOpen(true))} className="action-item group">
                        <Edit size={16} className="mr-3 text-brand-primary" /> Editar Propiedades
                    </button>
                )}

                {/* Publish-level actions */}
                {canPublish && doc.estado === DocumentStatus.REVISION && (
                    <>
                        <button onClick={() => handleGenericClick(() => onStatusChange(doc.id, DocumentStatus.APROBADO))} className="action-item group text-green-600">
                            <CheckCircle size={16} className="mr-3" /> Aprobar
                        </button>
                        <button onClick={() => handleGenericClick(() => onStatusChange(doc.id, DocumentStatus.BORRADOR))} className="action-item group text-red-600">
                            <ThumbsDown size={16} className="mr-3" /> Rechazar
                        </button>
                    </>
                )}
                {canPublish && doc.estado === DocumentStatus.APROBADO && (
                    <button onClick={() => handleGenericClick(() => onStatusChange(doc.id, DocumentStatus.VIGENTE))} className="action-item group text-blue-600">
                        <Send size={16} className="mr-3" /> Publicar
                    </button>
                )}
                {canPublish && doc.estado === DocumentStatus.VIGENTE && (
                     <button onClick={() => handleGenericClick(() => onStatusChange(doc.id, DocumentStatus.OBSOLETO))} className="action-item group text-red-600">
                        <Archive size={16} className="mr-3" /> Declarar Obsoleto
                    </button>
                )}

                {/* Submit-level actions */}
                {canSubmit && doc.estado === DocumentStatus.BORRADOR && (
                     <button onClick={() => handleGenericClick(() => onStatusChange(doc.id, DocumentStatus.REVISION))} className="action-item group text-brand-primary">
                        <Send size={16} className="mr-3" /> Solicitar Revisión
                    </button>
                )}

                {/* Create-level actions (for new versions) */}
                {canCreate && doc.estado === DocumentStatus.VIGENTE && (
                    <button onClick={() => handleGenericClick(handleCreateNewVersion)} className="action-item group text-purple-600">
                        <History size={16} className="mr-3" /> Crear Nueva Versión
                    </button>
                )}
                
                {/* Download Actions */}
                 {canDownload && doc.estado === DocumentStatus.VIGENTE && (
                     <button onClick={() => handleGenericClick(handleDownload)} className="action-item group">
                        <Download size={16} className="mr-3 text-gray-500" /> Descargar
                    </button>
                )}
            </>
        );
    };

    return (
        <>
            <div className="relative inline-block text-left" ref={dropdownRef}>
                <style>{`.action-item { width: 100%; text-align: left; display: flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; color: #374151; } .action-item:hover { background-color: #f3f4f6; }`}</style>
                <div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                        className="inline-flex justify-center w-full rounded-md p-2 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>
                {isOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                             <button onClick={() => handleGenericClick(() => setIsPreviewOpen(true))} className="action-item group">
                                <Eye size={16} className="mr-3" /> Previsualizar
                            </button>
                             <div className="my-1 border-t border-gray-100"></div>
                            {renderActions()}
                        </div>
                    </div>
                )}
            </div>
            {isPreviewOpen && (
                <DocumentPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    document={doc}
                />
            )}
            {isEditOpen && (
                <EditDocumentModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    document={doc}
                />
            )}
        </>
    );
};

export default DocumentActions;