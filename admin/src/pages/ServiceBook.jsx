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

        if (!lastOilChange) return { msg: 'Προτείνεται Έλεγχος', color: 'text-orange-400' };

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
            msg: isOverdue ? 'ΕΚΠΡΟΘΕΣΜΟ!' : `Επόμενο: ${nextKm} χλμ ή ${nextDate.toLocaleDateString()}`,
            color: isOverdue ? 'text-red-500' : 'text-emerald-400'
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

    if (!plate) return <div className="p-10 text-center text-gray-500">Πληκτρολογήστε μια πινακίδα για αναζήτηση...</div>;
    if (data?.error) return <div className="p-10 text-center text-red-500">Το όχημα {plate} δεν βρέθηκε.</div>;
    if (!data) return <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3"><Loader2 className="animate-spin" size={32} /> Φόρτωση βιβλίου...</div>;

    const nextService = calculateNextService();
    const { settings, services } = data;

    return (
        <div className="bg-[#0a0a0f] p-4 font-sans text-gray-300">
            <div className="max-w-2xl mx-auto bg-[#12121a]/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-amber-900/20" ref={contentRef}>

                {/* HEADER */}
                <div className="bg-[#0d0d14]/95 p-8 text-center relative border-b border-amber-900/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-yellow-500 opacity-50"></div>
                    {settings?.logoUrl && <img src={settings.logoUrl} className="h-16 mx-auto mb-4 object-contain" alt="Logo" />}
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-white">{settings?.shopName || 'Συνεργείο'}</h1>
                    <div className="mt-2 inline-block">
                        <span className="text-amber-500 text-lg font-mono border border-amber-900/30 px-6 py-1 rounded-lg bg-black/50 shadow-inner">
                            {plate}
                        </span>
                    </div>
                    <div className="absolute top-6 right-6 flex gap-2">
                        <a
                            href={`https://peppy-crostata-98bbc1.netlify.app/book/${plate}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors text-white border border-white/10"
                            title="Άνοιγμα Δημόσιας Σελίδας"
                        >
                            <Globe size={20} />
                        </a>
                        <button onClick={handleDownloadPDF} className="bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors text-white border border-white/10" title="Λήψη PDF">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* NEXT SERVICE CARD */}
                {nextService && (
                    <div className="bg-amber-900/10 p-8 border-b border-amber-900/20 text-center">
                        <p className="text-amber-500/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-glow-amber">ΚΑΤΑΣΤΑΣΗ SERVICE</p>
                        <h2 className={`text-3xl font-black ${nextService.color} tracking-tight`}>{nextService.msg}</h2>
                        <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest">Σύστημα αυτόματης πρόβλεψης Geoter v2.0</p>
                    </div>
                )}

                {/* HISTORY LIST */}
                <div className="p-6 space-y-6">
                    <h3 className="font-bold text-gray-400 ml-2 uppercase text-xs tracking-widest flex items-center gap-2">
                        <History size={14} className="text-amber-500" /> Ιστορικό Εργασιών
                    </h3>

                    {services.length === 0 && (
                        <div className="text-center py-12 bg-black/20 rounded-2xl border border-dashed border-gray-800">
                            <FileText className="mx-auto text-gray-700 mb-3" size={32} />
                            <p className="text-gray-600 text-sm">Δεν υπάρχουν καταχωρημένες εργασίες.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {services.map((srv) => (
                            <div key={srv._id} className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-amber-500/20 group">
                                <button
                                    onClick={() => setExpandedVisit(expandedVisit === srv._id ? null : srv._id)}
                                    className={`w-full p-5 flex justify-between items-center transition-colors ${expandedVisit === srv._id ? 'bg-amber-900/20' : 'hover:bg-white/5'}`}
                                >
                                    <div className="text-left flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${expandedVisit === srv._id ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/30' : 'bg-gray-900 text-amber-500 group-hover:text-amber-400'}`}>
                                            <Wrench size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg">{new Date(srv.completedAt).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500 font-mono italic">
                                                {srv.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[0] || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`transition-transform duration-300 ${expandedVisit === srv._id ? 'rotate-180 text-amber-500' : 'text-gray-600'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expandedVisit === srv._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-[#0d0d14]/50 border-t border-white/5 relative"
                                        >
                                            <div className="p-6 relative">
                                                {/* ΣΦΡΑΓΙΔΑ ΣΤΟ ΦΟΝΤΟ */}
                                                {settings?.stampUrl && (
                                                    <img src={settings.stampUrl} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 opacity-[0.03] pointer-events-none grayscale" alt="Stamp" />
                                                )}

                                                <div className="space-y-6 relative z-10">
                                                    {srv.servicesPerformed.map((cat, i) => (
                                                        <div key={i} className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                                                                <span className="font-bold text-[10px] text-amber-500 uppercase tracking-widest">{cat.categoryTitle}</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-2 ml-3">
                                                                {cat.items.map((item, j) => (
                                                                    <div key={j} className="text-sm text-gray-300 flex justify-between items-center group/item hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/5">
                                                                        <span className="flex items-center gap-2">
                                                                            <span className="text-gray-600">•</span>
                                                                            {item.name}
                                                                        </span>
                                                                        <span className="font-black text-[9px] bg-black/50 border border-white/10 px-2 py-0.5 rounded uppercase text-gray-400 tracking-tighter">
                                                                            {item.action}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {srv.generalNotes && (
                                                    <div className="mt-6 p-4 bg-amber-900/10 border border-amber-900/20 rounded-xl text-xs text-amber-200/70 leading-relaxed italic">
                                                        <span className="font-bold text-amber-500 not-italic block mb-1">Σημειώσεις Μηχανικού:</span>
                                                        {srv.generalNotes}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER CONTACT */}
                <div className="bg-[#0d0d14] p-8 border-t border-amber-900/20 flex flex-wrap justify-around items-center gap-6 print:hidden mt-auto">
                    {settings?.phones?.map(phone => (
                        <a key={phone} href={`tel:${phone}`} className="flex flex-col items-center text-gray-400 gap-2 active:scale-95 transition-all no-underline hover:text-white group">
                            <div className="bg-emerald-600/20 p-4 rounded-2xl group-hover:bg-emerald-600 group-hover:text-black transition-all border border-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-900/20">
                                <Phone size={24} />
                            </div>
                            <span className="text-xs font-bold font-mono tracking-tighter">{phone}</span>
                        </a>
                    ))}
                    {settings?.website && (
                        <a href={settings.website} target="_blank" rel="noreferrer" className="flex flex-col items-center text-gray-400 gap-2 active:scale-95 transition-all no-underline hover:text-white group">
                            <div className="bg-amber-600/20 p-4 rounded-2xl group-hover:bg-amber-600 group-hover:text-black transition-all border border-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-900/20">
                                <Globe size={24} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Website</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceBook;