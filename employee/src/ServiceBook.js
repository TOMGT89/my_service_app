import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, Globe, Download, ChevronDown, ChevronUp, History, Wrench, FileText, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { API_URL } from './config';

const ServiceBook = ({ providedPlate }) => {
    const { plate: urlPlate } = useParams();
    const plate = providedPlate || urlPlate;
    const [data, setData] = useState(null);
    const [expandedVisit, setExpandedVisit] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (plate) {
            axios.get(`${API_URL}/api/public/book/${plate}`)
                .then(res => setData(res.data))
                .catch(err => {
                    console.error(err);
                    setData({ error: true });
                });
        }
    }, [plate]);

    const calculateNextService = () => {
        if (!data || !data.services) return null;
        const lastOilChange = data.services.find(s =>
            s.servicesPerformed.some(cat =>
                cat.items.some(item => item.name === 'ΛΑΔΙ ΜΗΧΑΝΗΣ' && item.action === 'ΑΛΛΑΓΗ')
            )
        );
        if (!lastOilChange) return { msg: 'Προτείνεται Έλεγχος', color: 'text-orange-600' };
        const lastKmMatch = lastOilChange.generalNotes?.match(/ΧΛΜ: (\d+)/);
        const lastKm = lastKmMatch ? parseInt(lastKmMatch[1]) : 0;
        const nextKm = lastKm + 10000;
        const nextDate = new Date(lastOilChange.completedAt);
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        const isOverdue = new Date() > nextDate;
        return {
            km: nextKm,
            date: nextDate.toLocaleDateString('el-GR'),
            isOverdue,
            msg: isOverdue ? 'ΕΚΠΡΟΘΕΣΜΟ!' : `Επόμενο: ${nextKm} χλμ / ${nextDate.toLocaleDateString('el-GR')}`,
            color: isOverdue ? 'text-red-600' : 'text-green-600'
        };
    };

    const handleDownloadPDF = () => {
        setIsPrinting(true);
        // Extended delay for layout stabilization
        setTimeout(() => {
            const element = contentRef.current;
            const opt = {
                margin: 0,
                filename: `ServiceBook_${plate}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 800
                },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save().then(() => {
                setIsPrinting(false);
            });
        }, 1500); // Increased delay for safety
    };

    if (!plate) return <div className="p-10 text-center text-slate-500">Πληκτρολογήστε μια πινακίδα...</div>;
    if (data?.error) return <div className="p-10 text-center text-red-500">Το όχη shop {plate} δεν βρέθηκε.</div>;
    if (!data) return <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-3"><Loader2 className="animate-spin" size={32} /> Φόρτωση...</div>;

    const nextService = calculateNextService();
    const { settings, services } = data;

    return (
        <div className="min-h-screen bg-slate-100 p-0 md:p-4 font-sans text-slate-800">
            {/* Version Badge for developer verification (Hidden in Print) */}
            <div className="fixed bottom-4 right-4 bg-black/50 text-white text-[8px] px-2 py-1 rounded-full z-50 pointer-events-none" data-html2canvas-ignore>
                V4.5-FINAL-SYNC
            </div>

            <div className={`mx-auto bg-white transition-all ${isPrinting ? 'max-w-none shadow-none' : 'max-w-2xl shadow-2xl md:rounded-2xl overflow-hidden border border-slate-200'}`} ref={contentRef}>
                {/* HEADER */}
                <div className={`bg-[#1e293b] text-white relative overflow-hidden transition-all ${isPrinting ? 'p-1.5 px-4 flex items-center justify-between' : 'p-8 text-center'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
                    {!isPrinting && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>}

                    <div className={`flex flex-col ${isPrinting ? 'items-start' : 'items-center'} gap-1`}>
                        {settings?.logoUrl && (
                            <img src={settings.logoUrl} className={`object-contain transition-all ${isPrinting ? 'h-8' : 'h-16 mb-2'}`} alt="Logo" />
                        )}
                        <h1 className={`font-bold uppercase tracking-widest ${isPrinting ? 'text-[10px]' : 'text-2xl'}`}>
                            {settings?.shopName || 'Συνεργείο'}
                        </h1>
                        {isPrinting && <p className="text-[7px] text-slate-400 italic">Ψηφιακό Βιβλίο Συντήρησης</p>}
                    </div>

                    <div className={isPrinting ? 'text-right' : 'mt-4'}>
                        <span className={isPrinting ? 'text-blue-400 font-mono font-bold text-xs' : 'text-blue-400 font-mono border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm shadow-inner text-lg px-6 py-1 inline-block'}>
                            {plate}
                        </span>
                    </div>

                    {!isPrinting && (
                        <div className="absolute top-6 right-6 flex gap-2" data-html2canvas-ignore>
                            <button onClick={handleDownloadPDF} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors border border-white/10" title="Λήψη PDF">
                                <Download size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* NEXT SERVICE CARD */}
                {nextService && (
                    <div className={`bg-blue-50 border-b border-blue-100 relative overflow-hidden transition-all ${isPrinting ? 'p-1 flex items-center justify-center gap-6' : 'p-8 text-center'}`}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <p className={`text-blue-900/40 font-bold uppercase tracking-[0.2em] ${isPrinting ? 'text-[7px]' : 'text-[10px] mb-2'}`}>ΚΑΤΑΣΤΑΣΗ ΣΥΝΤΗΡΗΣΗΣ</p>
                        <h2 className={`font-black tracking-tight ${nextService.color} ${isPrinting ? 'text-xs' : 'text-3xl'}`}>{nextService.msg}</h2>
                    </div>
                )}

                {/* HISTORY LIST */}
                <div className="p-0 md:p-6 space-y-6">
                    <div className="p-4 md:p-0">
                        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                            <History size={14} className="text-blue-600" /> Ιστορικό Εργασιών
                        </h3>
                    </div>

                    <div className={isPrinting ? 'space-y-4' : 'space-y-4'}>
                        {services.map((srv, idx) => {
                            const visitShop = srv.shop || settings;
                            const isExpanded = expandedVisit === srv._id;
                            return (
                                <div key={srv._id} className="bg-white md:rounded-2xl md:border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group border-b last:border-b-0">
                                    <button onClick={() => setExpandedVisit(isExpanded ? null : srv._id)} className={`w-full p-5 flex justify-between items-center transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`} data-html2canvas-ignore>
                                        <div className="text-left flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-blue-600'}`}>
                                                <Wrench size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-lg">{new Date(srv.completedAt).toLocaleDateString('el-GR')}</p>
                                                <p className="text-xs text-slate-500 font-mono italic">{srv.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[0] || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{visitShop.shopName || visitShop.name}</p>
                                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}><ChevronDown size={20} /></div>
                                        </div>
                                    </button>

                                    <div className={`${(isExpanded || isPrinting) ? 'block' : 'hidden'} border-t border-slate-100 relative bg-white`}>
                                        <div className={`relative ${isPrinting ? 'p-2' : 'p-6'}`}>
                                            <div className={`relative z-10 ${isPrinting ? 'space-y-2' : 'space-y-6'}`}>
                                                {isPrinting && (
                                                    <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-2">
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-bold text-xs text-slate-800">{new Date(srv.completedAt).toLocaleDateString('el-GR')}</span>
                                                            <span className="text-[10px] font-bold text-blue-600 font-mono">{srv.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[0] || ''}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase italic pl-2 border-l border-slate-200">{visitShop.shopName || visitShop.name}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {!isPrinting && visitShop.stampUrl && (
                                                    <img src={visitShop.stampUrl} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 opacity-[0.05] pointer-events-none grayscale mix-blend-multiply" alt="Stamp" />
                                                )}
                                                <div className={isPrinting ? 'grid grid-cols-3 gap-x-4 gap-y-1 w-full' : 'space-y-6'}>
                                                    {srv.servicesPerformed.map((cat, i) => (
                                                        <div key={i} className={`space-y-1 ${isPrinting ? 'border-l-2 border-slate-100 pl-2' : ''}`}>
                                                            {isPrinting ? (
                                                                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">{cat.categoryTitle}</p>
                                                            ) : (
                                                                <div className="flex items-center gap-2"><span className="rounded-full bg-blue-500 w-1.5 h-4"></span><span className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">{cat.categoryTitle}</span></div>
                                                            )}
                                                            <div className={`grid gap-1 ${isPrinting ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 shadow-sm'}`}>
                                                                {cat.items.map((item, j) => (
                                                                    <div key={j} className={isPrinting ? 'text-[10px] py-0.5 text-slate-800 leading-tight border-b border-slate-50 last:border-0' : 'text-slate-700 flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm'}>
                                                                        <span className="font-medium">{item.name}</span>
                                                                        <span className={`font-bold uppercase tracking-tighter ${isPrinting ? (item.action === 'ΑΛΛΑΓΗ' ? 'text-red-700' : 'text-green-700') : (item.action === 'ΑΛΛΑΓΗ' ? 'bg-red-100 text-red-700 px-2 rounded text-[9px]' : 'bg-green-100 text-green-700 px-2 rounded text-[9px]')}`}>{item.action}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {(srv.generalNotes || (isPrinting && visitShop.stampUrl)) && (
                                            <div className={`p-4 border-t border-slate-100 ${isPrinting ? 'bg-white flex items-end justify-between py-2' : 'bg-slate-50 italic text-sm text-slate-600 border-l-4 border-slate-300 m-4 rounded-r-xl'}`}>
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-800 not-italic block mb-1 uppercase tracking-widest text-[10px]">Σημειώσεις:</span>
                                                    {srv.generalNotes?.replace(/\|\s*VIN:.*$/i, '').replace(/VIN:.*$/i, '').trim()}
                                                </div>
                                                {isPrinting && visitShop.stampUrl && (
                                                    <div className="shrink-0"><img src={visitShop.stampUrl} className="max-w-[120px] max-h-[80px] object-contain rotate-[-2deg]" alt="Stamp" /></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={`bg-[#1e293b] border-t border-slate-200 mt-auto ${isPrinting ? 'py-2 px-4 flex justify-between items-center' : 'p-8 flex flex-wrap justify-center gap-6'}`}>
                    {isPrinting ? (
                        <>
                            <p className="text-[8px] text-white/50">{settings?.shopName} | Τηλ: {settings?.phones?.join(', ')}</p>
                            <p className="text-[7px] text-white/30 uppercase tracking-widest">Powered by Geoter Service App</p>
                        </>
                    ) : (
                        <>
                            {settings?.phones?.map(phone => (
                                <a key={phone} href={`tel:${phone}`} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 text-white no-underline">
                                    <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400"><Phone size={20} /></div>
                                    <span className="font-bold">{phone}</span>
                                </a>
                            ))}
                            {settings?.website && (
                                <a href={settings.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 text-white no-underline">
                                    <div className="bg-blue-500/20 p-2 rounded-full text-blue-400"><Globe size={20} /></div>
                                    <span className="font-bold uppercase tracking-widest">Website</span>
                                </a>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceBook;
