import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Globe, Download, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { API_URL } from './config';

const ServiceBook = () => {
    const { plate } = useParams();
    const [data, setData] = useState(null);
    const [expandedVisit, setExpandedVisit] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        // API Call to get Full History
        fetch(`${API_URL}/api/public/book/${plate}`)
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error(err));
    }, [plate]);

    const calculateNextService = () => {
        if (!data || !data.services) return null;

        // Find last oil change
        const lastOilChange = data.services.find(s =>
            s.servicesPerformed.some(cat =>
                cat.items.some(item => item.name === 'ΛΑΔΙ ΜΗΧΑΝΗΣ' && item.action === 'ΑΛΛΑΓΗ')
            )
        );

        if (!lastOilChange) return { msg: 'Προτείνεται Έλεγχος', color: 'text-orange-500' };

        const lastKm = parseInt(lastOilChange.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[1] || 0);
        const lastDate = new Date(lastOilChange.completedAt);

        // Logic: +10,000 km OR 1 Year
        const nextKm = lastKm + 10000;
        const nextDate = new Date(lastDate);
        nextDate.setFullYear(nextDate.getFullYear() + 1);

        const today = new Date();
        const isOverdue = today > nextDate; // Basic date check, could also check mileage if we knew current km

        return {
            km: nextKm,
            date: nextDate.toLocaleDateString('el-GR'),
            isOverdue,
            msg: isOverdue ? 'ΕΚΠΡΟΘΕΣΜΟ!' : `Επόμενο: ${nextKm} χλμ ή ${nextDate.toLocaleDateString('el-GR')}`,
            color: isOverdue ? 'text-red-600' : 'text-green-600',
            icon: isOverdue ? <AlertTriangle /> : null
        };
    };

    const handleDownloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: 0, // Zero margin for full bleed look if desired, or standard
            filename: `ServiceBook_${plate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true }, // useCORS for external images
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    if (!data) return <div className="p-10 text-center text-white">Φόρτωση...</div>;
    if (data.error) return <div className="p-10 text-center text-red-500">Το όχημα δεν βρέθηκε.</div>;

    const nextService = calculateNextService();
    const { settings, services, vehicle } = data;

    return (
        <div className="min-h-screen bg-slate-100 p-0 md:p-4 font-sans text-slate-800">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl md:rounded-2xl overflow-hidden min-h-screen md:min-h-0 flex flex-col" ref={contentRef}>

                {/* HEADER */}
                <div className="bg-[#1e293b] text-white p-8 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        {settings?.logoUrl && <img src={settings.logoUrl} className="h-20 mb-4 object-contain filter drop-shadow-md" alt="Logo" />}
                        <h1 className="text-2xl font-bold uppercase tracking-wider">{settings?.shopName || 'Service Book'}</h1>
                        <p className="text-slate-400 text-sm mb-4">Ψηφιακό Βιβλίο Συντήρησης</p>

                        <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                            <span className="font-mono text-2xl font-bold text-blue-400 tracking-widest">{plate}</span>
                            <div className="h-8 w-px bg-white/20"></div>
                            <span className="text-sm text-slate-300">{vehicle?.brand} {vehicle?.model}</span>
                        </div>
                    </div>

                    <button onClick={handleDownloadPDF} data-html2canvas-ignore className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white" title="Λήψη PDF">
                        <Download size={20} />
                    </button>
                </div>

                {/* NEXT SERVICE INFO */}
                {nextService && (
                    <div className="bg-blue-50 border-b border-blue-100 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500"></div>
                        <p className="text-blue-900/60 text-xs font-bold uppercase tracking-widest mb-1">ΕΠΟΜΕΝΟΣ ΕΛΕΓΧΟΣ</p>
                        <div className="flex items-center gap-3 text-3xl font-black text-slate-800">
                            {nextService.icon && <span className="text-red-500">{nextService.icon}</span>}
                            <span className={nextService.color}>{nextService.msg}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-2">Βάσει της τελευταίας αλλαγής λαδιών</p>
                    </div>
                )}



                {/* SERVICE HISTORY */}
                <div className="p-0 md:p-6 flex-1 bg-white">
                    <div className="p-4 md:p-0">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <span className="bg-blue-600 w-2 h-6 rounded-full"></span>
                            Ιστορικό Εργασιών
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {services.length === 0 && <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300"><p className="text-slate-400">Δεν υπάρχουν καταχωρημένες εργασίες.</p></div>}

                        {services.map((srv, idx) => (
                            <div key={srv._id} className="group border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white">
                                <button
                                    onClick={() => setExpandedVisit(expandedVisit === srv._id ? null : srv._id)}
                                    className="w-full p-5 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="bg-slate-100 text-slate-600 font-mono font-bold text-sm px-3 py-1 rounded border border-slate-200">#{services.length - idx}</span>
                                        <div className="text-left">
                                            <p className="font-bold text-lg text-slate-800">{new Date(srv.completedAt).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide">
                                                {srv.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[0] || 'ΧΛΜ: -'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full transition-transform duration-300 ${expandedVisit === srv._id ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>

                                {/* EXPANDED DETAILS */}
                                {expandedVisit === srv._id && (
                                    <div className="border-t border-slate-100 relative bg-slate-50/50">
                                        {/* STAMP WATERMARK */}
                                        {settings?.stampUrl && (
                                            <div className="absolute right-10 top-10 opacity-10 pointer-events-none rotate-[-12deg]">
                                                <img src={settings.stampUrl} className="w-48 grayscale contrast-125" alt="Stamp" />
                                            </div>
                                        )}

                                        <div className="p-6 space-y-6 relative z-10">
                                            {srv.servicesPerformed.map((cat, i) => (
                                                <div key={i}>
                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">{cat.categoryTitle}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {cat.items.map((item, j) => (
                                                            <div key={j} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-slate-100 shadow-sm">
                                                                <span className="text-slate-700 font-medium">{item.name}</span>
                                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.action.includes('ΑΛΛΑΓΗ') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{item.action}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            {srv.generalNotes && (
                                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mt-4">
                                                    <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Σημειωσεις</p>
                                                    <p className="text-sm text-yellow-900 italic whitespace-pre-wrap leading-relaxed">{srv.generalNotes}</p>
                                                </div>
                                            )}

                                            {/* STAMP VISIBLE FOR PDF */}
                                            <div className="flex justify-end mt-8 pt-8 border-t border-slate-200/50">
                                                <div className="text-center">
                                                    {settings?.stampUrl ? (
                                                        <img src={settings.stampUrl} className="w-32 opacity-80 mix-blend-multiply transform rotate-[-5deg]" alt="Stamp" />
                                                    ) : (
                                                        <div className="w-32 h-12 border-2 border-slate-300 border-dashed rounded flex items-center justify-center text-xs text-slate-400">Σφραγίδα</div>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Υπογραφη / Σφραγιδα</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-[#1e293b] p-6 text-white mt-auto print:hidden">
                    <div className="flex flex-wrap justify-center gap-4">
                        {settings?.phones?.map(phone => (
                            <a key={phone} href={`tel:${phone}`} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-white/10 group">
                                <div className="bg-green-500/20 text-green-400 p-2 rounded-full group-hover:scale-110 transition-transform"><Phone size={20} /></div>
                                <span className="font-bold tracking-wider">{phone}</span>
                            </a>
                        ))}
                        {settings?.website && (
                            <a href={settings.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-white/10 group">
                                <div className="bg-blue-500/20 text-blue-400 p-2 rounded-full group-hover:scale-110 transition-transform"><Globe size={20} /></div>
                                <span className="font-bold tracking-wider">Website</span>
                            </a>
                        )}
                    </div>
                    <p className="text-center text-slate-500 text-xs mt-6">Powered by Geoter Service App</p>
                </div>
            </div>
        </div>
    );
};

export default ServiceBook;
