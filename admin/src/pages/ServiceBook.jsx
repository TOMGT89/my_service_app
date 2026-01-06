import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, Globe, Download, ChevronDown, ChevronUp, Loader2, History, Wrench, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../config';

const ServiceBook = ({ providedPlate }) => {
    const { plate: urlPlate } = useParams();
    const plate = providedPlate || urlPlate;
    const [data, setData] = useState(null);
    const [expandedVisit, setExpandedVisit] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        // Σύνδεση με το Public API
        if (plate) {
            axios.get(`${API_URL}/api/public/book/${plate}`)
                .then(res => setData(res.data))
                .catch(err => {
                    console.error(err);
                    setData({ error: true });
                });
        } else {
            setData(null);
        }
    }, [plate, API_URL]);

    const calculateNextService = () => {
        if (!data || !data.services) return null;

        // Εύρεση τελευταίας αλλαγής λαδιών
        const lastOilChange = data.services.find(s =>
            s.servicesPerformed.some(cat =>
                cat.items.some(item => item.name === 'ΛΑΔΙ ΜΗΧΑΝΗΣ' && item.action === 'ΑΛΛΑΓΗ')
            )
        );

        if (!lastOilChange) return { msg: 'Προτείνεται Έλεγχος', color: 'text-orange-600' };

        const lastKmMatch = lastOilChange.generalNotes?.match(/ΧΛΜ: (\d+)/);
        const lastKm = lastKmMatch ? parseInt(lastKmMatch[1]) : 0;
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
            msg: isOverdue ? 'ΕΚΠΡΟΘΕΣΜΟ!' : `Επόμενο: ${nextKm} χλμ / ${nextDate.toLocaleDateString()}`,
            color: isOverdue ? 'text-red-600' : 'text-green-600'
        };
    };

    const handleDownloadPDF = () => {
        setIsPrinting(true);
        // Give React time to re-render with printing styles
        setTimeout(() => {
            const element = contentRef.current;
            const opt = {
                margin: 0.2, // Small margin for PDF
                filename: `ServiceBook_${plate}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save().then(() => {
                setIsPrinting(false);
            });
        }, 500);
    };

    if (!plate) return <div className="p-10 text-center text-gray-500">Πληκτρολογήστε μια πινακίδα για αναζήτηση...</div>;
    if (data?.error) return <div className="p-10 text-center text-red-500">Το όχημα {plate} δεν βρέθηκε.</div>;
    if (!data) return <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3"><Loader2 className="animate-spin" size={32} /> Φόρτωση βιβλίου...</div>;

    const nextService = calculateNextService();
    const { settings, services } = data;

    return (
        <div className="bg-slate-100 p-0 md:p-4 font-sans text-slate-800">
            <div className="max-w-2xl mx-auto bg-white shadow-2xl md:rounded-2xl overflow-hidden border border-slate-200" ref={contentRef}>

                {/* HEADER */}
                <div className={`bg-[#1e293b] text-center relative overflow-hidden text-white transition-all ${isPrinting ? 'p-4' : 'p-8'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
                    {/* Background Decoration */}
                    {!isPrinting && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>}

                    {settings?.logoUrl && <img src={settings.logoUrl} className={`mx-auto object-contain filter drop-shadow-md transition-all ${isPrinting ? 'h-12 mb-2' : 'h-16 mb-4'}`} alt="Logo" />}
                    <h1 className={`font-bold uppercase tracking-widest ${isPrinting ? 'text-xl' : 'text-2xl'}`}>{settings?.shopName || 'Συνεργείο'}</h1>
                    <div className="mt-2 inline-block">
                        <span className={`text-blue-400 font-mono border border-white/10 px-6 py-1 rounded-lg bg-white/5 backdrop-blur-sm shadow-inner ${isPrinting ? 'text-sm' : 'text-lg'}`}>
                            {plate}
                        </span>
                    </div>
                    <div className="absolute top-6 right-6 flex gap-2">
                        <a
                            href={`https://peppy-crostata-98bbc1.netlify.app/book/${plate}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors text-white border border-white/10"
                            title="Άνοιγμα Δημόσιας Σελίδας"
                            data-html2canvas-ignore
                        >
                            <Globe size={20} />
                        </a>
                        <button onClick={handleDownloadPDF} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors text-white border border-white/10" title="Λήψη PDF" data-html2canvas-ignore>
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* NEXT SERVICE CARD */}
                {nextService && (
                    <div className={`bg-blue-50 border-b border-blue-100 text-center relative overflow-hidden transition-all ${isPrinting ? 'p-3' : 'p-8'}`}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <p className={`text-blue-900/40 font-bold uppercase tracking-[0.2em] mb-2 ${isPrinting ? 'text-[8px] mb-1' : 'text-[10px]'}`}>ΚΑΤΑΣΤΑΣΗ ΣΥΝΤΗΡΗΣΗΣ</p>
                        <h2 className={`font-black tracking-tight ${nextService.color} ${isPrinting ? 'text-xl' : 'text-3xl'}`}>{nextService.msg}</h2>
                        {!isPrinting && <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">Ψηφιακό Βιβλίο Service Geoter v2.0</p>}
                    </div>
                )}

                {/* HISTORY LIST */}
                <div className="p-0 md:p-6 space-y-6">
                    <div className="p-4 md:p-0">
                        <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest flex items-center gap-2">
                            <History size={16} className="text-blue-600" /> Ιστορικό Εργασιών
                        </h3>
                    </div>

                    {services.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 m-4 md:m-0">
                            <FileText className="mx-auto text-slate-300 mb-3" size={32} />
                            <p className="text-slate-400 text-sm">Δεν υπάρχουν καταχωρημένες εργασίες.</p>
                        </div>
                    )}

                    <div className={isPrinting ? 'space-y-3' : 'space-y-4'}>
                        {services.map((srv, idx) => {
                            const visitShop = srv.shop || settings; // Fallback to global if single-shop data
                            const isExpanded = expandedVisit === srv._id;

                            return (
                                <div key={srv._id} className="bg-white md:rounded-2xl md:border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group border-b last:border-b-0">
                                    <button
                                        onClick={() => setExpandedVisit(isExpanded ? null : srv._id)}
                                        className={`w-full p-5 flex justify-between items-center transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                                        data-html2canvas-ignore
                                    >
                                        <div className="text-left flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-blue-600'}`}>
                                                <Wrench size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-lg">{new Date(srv.completedAt).toLocaleDateString()}</p>
                                                <p className="text-xs text-slate-500 font-mono italic">
                                                    {srv.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[0] || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{visitShop.shopName}</p>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* ALWAYS VISIBLE DURING PRINTING OR WHEN EXPANDED */}
                                    <div className={`${(isExpanded || isPrinting) ? 'block' : 'hidden'} border-t border-slate-100 relative`}>
                                        <div className={`relative ${isPrinting ? 'p-3' : 'p-6'}`}>
                                            {/* ΣΦΡΑΓΙΔΑ ΣΤΟ ΦΟΝΤΟ */}
                                            {visitShop.stampUrl && (
                                                <img
                                                    src={visitShop.stampUrl}
                                                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none grayscale mix-blend-multiply ${isPrinting ? 'w-32' : 'w-48'}`}
                                                    alt="Stamp"
                                                />
                                            )}

                                            <div className={`relative z-10 ${isPrinting ? 'space-y-3' : 'space-y-6'}`}>
                                                {/* Header for individual visit in PDF */}
                                                {isPrinting && (
                                                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                                                        <span className="font-bold text-sm text-slate-800">Ημ/νία: {new Date(srv.completedAt).toLocaleDateString()}</span>
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase italic">{visitShop.shopName}</span>
                                                    </div>
                                                )}

                                                {srv.servicesPerformed.map((cat, i) => (
                                                    <div key={i} className={`space-y-2 ${isPrinting ? 'space-y-1' : 'space-y-2'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`rounded-full bg-blue-500 ${isPrinting ? 'w-1 h-3' : 'w-1.5 h-4'}`}></span>
                                                            <span className={`font-bold text-slate-500 uppercase tracking-widest ${isPrinting ? 'text-[9px]' : 'text-[11px]'}`}>{cat.categoryTitle}</span>
                                                        </div>
                                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 ${isPrinting ? 'grid-cols-2 gap-1' : ''}`}>
                                                            {cat.items.map((item, j) => (
                                                                <div key={j} className={`text-slate-700 flex justify-between items-center bg-slate-50 rounded-lg border border-slate-100 transition-all ${isPrinting ? 'text-xs p-1.5 shadow-none' : 'text-sm p-3 shadow-sm'}`}>
                                                                    <span className="font-medium">{item.name}</span>
                                                                    <span className={`font-bold rounded uppercase tracking-tighter ${isPrinting ? 'text-[8px] px-1.5' : 'text-[9px] px-2 py-0.5'} ${item.action === 'ΑΛΛΑΓΗ' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                        {item.action}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {srv.generalNotes && (
                                                <div className={`bg-slate-50 border-l-4 border-slate-300 rounded-r-xl text-slate-600 leading-relaxed italic ${isPrinting ? 'mt-2 p-2 text-xs' : 'mt-6 p-4 text-sm'}`}>
                                                    <span className={`font-bold text-slate-800 not-italic block mb-1 uppercase tracking-widest ${isPrinting ? 'text-[8px]' : 'text-[10px]'}`}>Σημειώσεις:</span>
                                                    {srv.generalNotes}
                                                </div>
                                            )}

                                            {/* STAMP IN PDF FOOTER PER VISIT */}
                                            {isPrinting && (
                                                <div className="flex justify-end mt-4 pt-2 border-t border-slate-100">
                                                    <div className="text-center">
                                                        {visitShop.stampUrl ? (
                                                            <img src={visitShop.stampUrl} className="w-16 opacity-90 mix-blend-multiply rotate-[-3deg]" alt="Stamp" />
                                                        ) : (
                                                            <div className="w-16 h-8 border border-slate-200 border-dashed rounded flex items-center justify-center text-[8px] text-slate-300">ΣΦΡΑΓΙΔΑ</div>
                                                        )}
                                                        <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">{visitShop.shopName}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER CONTACT */}
                <div className={`bg-[#1e293b] border-t border-slate-200 flex flex-wrap justify-center mt-auto ${isPrinting ? 'p-2 gap-4' : 'p-8 gap-6 print:hidden'}`}>
                    {settings?.phones?.map(phone => (
                        <a key={phone} href={`tel:${phone}`} className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white no-underline ${isPrinting ? 'px-4 py-2' : 'px-6 py-3'}`}>
                            <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                                <Phone size={isPrinting ? 14 : 20} />
                            </div>
                            <span className={`font-bold tracking-wider ${isPrinting ? 'text-xs' : ''}`}>{phone}</span>
                        </a>
                    ))}
                    {settings?.website && (
                        <a href={settings.website} target="_blank" rel="noreferrer" className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white no-underline ${isPrinting ? 'px-4 py-2' : 'px-6 py-3'}`}>
                            <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                                <Globe size={isPrinting ? 14 : 20} />
                            </div>
                            <span className={`font-bold uppercase tracking-widest ${isPrinting ? 'text-xs' : ''}`}>Website</span>
                        </a>
                    )}
                </div>

                {/* SMALL PRINT FOOTER */}
                {isPrinting && (
                    <div className="text-center border-t border-slate-100 py-2">
                        <p className="text-[8px] text-slate-600 font-bold">
                            {settings?.shopName} | Τηλ: {settings?.phones?.join(', ')} | {settings?.website}
                        </p>
                        <p className="text-[7px] text-slate-400 mt-1 uppercase">Powered by Geoter Service App</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceBook;