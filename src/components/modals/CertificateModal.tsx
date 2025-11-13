import React, { useRef } from 'react';
import type { User, TrainingModule, CertificateSettings } from '../../types';
import { Award, X, Printer } from 'lucide-react';

interface CertificateModalProps {
    user: User;
    module: TrainingModule;
    settings: CertificateSettings;
    onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ user, module, settings, onClose }) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    
    const handlePrint = () => {
        const printContent = certificateRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=1100');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Print Certificate</title>');
                printWindow.document.write('<style>');
                printWindow.document.write(`
                    body { font-family: 'Times New Roman', serif; margin: 0; }
                    .certificate-bg { background: linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%); }
                    .certificate-content { padding: 50px; text-align: center; border: 10px solid #a5b4fc; height: calc(100vh - 120px); display: flex; flex-direction: column; justify-content: center; position: relative; }
                    h1 { font-size: 50px; color: #312e81; margin: 0; }
                    h2 { font-size: 24px; color: #4338ca; margin: 10px 0; }
                    p { font-size: 18px; color: #475569; }
                    .user-name { font-size: 40px; color: #1e293b; font-weight: bold; margin: 20px 0; border-bottom: 2px solid #6366f1; display: inline-block; padding-bottom: 5px; }
                    .module-name { font-style: italic; font-weight: bold; }
                    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 80px; padding: 0 50px; }
                    .signature-line { border-top: 2px solid #475569; padding-top: 5px; text-align: center; width: 250px; }
                    .logo { position: absolute; }
                `);
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(certificateRef.current.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl transform transition-all relative" onClick={e => e.stopPropagation()}>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button onClick={handlePrint} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700" title="Print Certificate">
                        <Printer className="h-5 w-5 text-gray-700 dark:text-slate-300" />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700" title="Close">
                        <X className="h-5 w-5 text-gray-700 dark:text-slate-300" />
                    </button>
                </div>
                <div ref={certificateRef}>
                    <div className="aspect-[1.414/1] certificate-bg p-4">
                        <div className="certificate-content border-8 border-indigo-300 dark:border-indigo-700 h-full w-full flex flex-col items-center justify-center text-center p-8 relative">
                             {settings.logoUrl && (
                                <img
                                    src={settings.logoUrl}
                                    alt="Organization Logo"
                                    className={`logo`}
                                    style={{
                                        width: settings.logoSize === 'small' ? '80px' : settings.logoSize === 'medium' ? '120px' : '160px',
                                        height: 'auto',
                                        top: settings.logoPosition.includes('top') ? '32px' : undefined,
                                        bottom: settings.logoPosition.includes('bottom') ? '32px' : undefined,
                                        left: settings.logoPosition.includes('left') ? '32px' : settings.logoPosition.includes('center') ? '50%' : undefined,
                                        right: settings.logoPosition.includes('right') ? '32px' : undefined,
                                        transform: settings.logoPosition.includes('center') ? 'translateX(-50%)' : undefined,
                                    }}
                                />
                            )}
                            <Award className="h-20 w-20 text-yellow-500 mb-4" />
                            <p className="uppercase tracking-widest text-sm font-semibold text-gray-500 dark:text-slate-400">Certificate of Completion</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-slate-100 mt-2">
                                {user.name}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-slate-300 mt-4">has successfully completed the training module</p>
                            <h2 className="text-2xl md:text-3xl font-semibold text-blue-700 dark:text-blue-400 mt-2">
                                "{module.title}"
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-6 max-w-xl">
                                {settings.customMessage}
                            </p>
                            <div className="mt-auto pt-10 w-full flex justify-between items-end text-sm text-gray-700 dark:text-slate-300">
                                <div>
                                    <p className="font-semibold">{settings.certificateId}</p>
                                    <p>Issued on: {new Date(settings.issueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-center">
                                    {settings.includeSignature && <div className="border-b-2 border-gray-600 dark:border-slate-400 w-56 mb-1"></div>}
                                    <p className="font-semibold">{settings.proctorName}</p>
                                    <p className="text-xs">{settings.organizationName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
