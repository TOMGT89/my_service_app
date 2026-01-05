import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, Globe, Download, ChevronDown, ChevronUp } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const ServiceBook = () => {
    const { plate } = useParams();
    const [data, setData] = useState(null);
    const [expandedVisit, setExpandedVisit] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        // Σύνδεση με το Public API
        if (plate) {
            axios.get(`/api/public/book/${plate}`)
                .then(res => setData(res.data))
                .catch(err => console.error(err));
        }
    }, [plate]);

    const calculateNextService = () => {
        if (!data || !data.services) return null;

        // Εύρεση τελευταίας αλλαγής λαδιών
        const lastOilChange = data.services.find(s =>
            s.servicesPerformed.some(cat =>
                cat.items.some(item => item.name === 'ΛΑΔΙ ΜΗΧΑΝΗΣ' && item.action === 'ΑΛΛΑΓΗ')
            )
        );

        if (!lastOilChange) return { msg: 'Προτείνεται Έλεγχος', color: 'text-orange-500' };

        const lastKm = parseInt(lastOilChange.generalNotes.match(/ΧΛΜ: (\d+)/)?.[1] || 0);
        const lastDate = new Date(lastOilChange.completedAt);

        const nextKm = lastKm + 10000;
        const nextDate = new Date(lastDate);
        nextDate.setFullYear(nextDate.getFullYear() + 1);

        const today = new Date();
        const isOverdue = today > nextDate;

        return {
            km: nextKm,
            date: nextDate.toLocaleDateString(),
            isOverdue,
            msg: isOverdue ? 'ΕΚΠΡΟΘΕΣΜΟ!' : `Επόμενο: ${nextKm} χλμ ή ${nextDate.toLocaleDateString()}`,
            color: isOverdue ? 'text-red-600' : 'text-green-600'
        };
    };

    const handleDownloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: 0.5,
            filename: `ServiceBook_${plate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    if (!data) return <div className="p-10 text-center">Αναζήτηση οχήματος...</div>;
    if (!data.vehicle) return <div className="p-10 text-center text-red-500">Το όχημα δεν βρέθηκε.</div>;

    const nextService = calculateNextService();
    const { settings, services } = data;

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans">
            <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden" ref={contentRef}>

                {/* HEADER */}
                <div className="bg-slate-900 text-white p-6 text-center relative">
                    {settings?.logoUrl && <img src={settings.logoUrl} className="h-16 mx-auto mb-2 object-contain" alt="Logo" />}
                    <h1 className="text-xl font-bold uppercase">{settings?.shopName || 'Συνεργείο'}</h1>
                    <p className="text-slate-400 text-sm mt-1 border border-slate-600 inline-block px-3 py-1 rounded">{plate}</p>
                    <button onClick={handleDownloadPDF} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 print:hidden text-white">
                        <Download size={20} />
                    </button>
                </div>

                {/* NEXT SERVICE CARD */}
                {nextService && (
                    <div className="bg-blue-50 p-6 border-b border-blue-100 text-center">
                        <p className="text-slate-500 text-xs font-bold uppercase mb-1">ΚΑΤΑΣΤΑΣΗ SERVICE</p>
                        <h2 className={`text-2xl font-bold ${nextService.color}`}>{nextService.msg}</h2>
                        <p className="text-xs text-slate-400 mt-2">Βάσει τελευταίας αλλαγής λαδιών</p>
                    </div>
                )}

                {/* HISTORY LIST */}
                <div className="p-4 space-y-4">
                    <h3 className="font-bold text-slate-700 ml-2">Ιστορικό Εργασιών</h3>
                    {services.length === 0 && <p className="text-center text-slate-400 text-sm">Δεν υπάρχουν καταχωρημένες εργασίες.</p>}

                    {services.map((srv) => (
                        <div key={srv._id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setExpandedVisit(expandedVisit === srv._id ? null : srv._id)}
                                className="w-full bg-gray-50 p-4 flex justify-between items-center hover:bg-gray-100 transition-colors"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-slate-800">{new Date(srv.completedAt).toLocaleDateString()}</p>
                                    <p className="text-xs text-slate-500">{srv.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[0] || 'N/A'}</p>
                                </div>
                                {expandedVisit === srv._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {expandedVisit === srv._id && (
                                <div className="p-4 bg-white border-t border-gray-200 relative">
                                    {/* ΣΦΡΑΓΙΔΑ ΣΤΟ ΦΟΝΤΟ */}
                                    {settings?.stampUrl && (
                                        <img src={settings.stampUrl} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 opacity-10 pointer-events-none" alt="Stamp" />
                                    )}

                                    <ul className="space-y-2 relative z-10">
                                        {srv.servicesPerformed.map((cat, i) => (
                                            <li key={i}>
                                                <span className="font-bold text-xs text-blue-600 block">{cat.categoryTitle}</span>
                                                {cat.items.map((item, j) => (
                                                    <div key={j} className="text-sm text-slate-700 flex justify-between ml-2">
                                                        <span>• {item.name}</span>
                                                        <span className="font-bold text-xs bg-slate-100 px-1 rounded text-slate-600">{item.action}</span>
                                                    </div>
                                                ))}
                                            </li>
                                        ))}
                                    </ul>
                                    {srv.generalNotes && (
                                        <div className="mt-3 p-2 bg-yellow-50 text-xs text-yellow-800 rounded border border-yellow-100">
                                            <span className="font-bold">Σημειώσεις:</span> {srv.generalNotes}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* FOOTER CONTACT */}
                <div className="bg-slate-900 p-4 flex justify-around items-center print:hidden mt-auto">
                    {settings?.phones?.map(phone => (
                        <a key={phone} href={`tel:${phone}`} className="flex flex-col items-center text-white gap-1 active:scale-95 transition-transform no-underline">
                            <div className="bg-green-600 p-3 rounded-full"><Phone size={20} /></div>
                            <span className="text-xs">{phone}</span>
                        </a>
                    ))}
                    {settings?.website && (
                        <a href={settings.website} target="_blank" rel="noreferrer" className="flex flex-col items-center text-white gap-1 active:scale-95 transition-transform no-underline">
                            <div className="bg-blue-600 p-3 rounded-full"><Globe size={20} /></div>
                            <span className="text-xs">Website</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceBook;