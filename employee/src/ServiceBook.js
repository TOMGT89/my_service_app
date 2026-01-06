import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Globe, Download, ChevronDown, ChevronUp, AlertTriangle, History, Wrench, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { API_URL } from './config';

const ServiceBook = () => {
    const { plate } = useParams();
    const [data, setData] = useState(null);
    const [expandedVisit, setExpandedVisit] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
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
                    windowWidth: 800 // Force stable desktop layout for capture
                },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                setIsPrinting(false);
            });
        }, 1200);
    };

    if (!data) return <div className="p-10 text-center text-white">Φόρτωση...</div>;
    if (data.error) return <div className="p-10 text-center text-red-500">Το όχημα δεν βρέθηκε.</div>;

    const nextService = calculateNextService();
    const { settings, services, vehicle } = data;

    return (
        <div className="min-h-screen bg-slate-100 p-0 md:p-4 font-sans text-slate-800">
            <div className="max-w-2xl mx-auto bg-white shadow-2xl md:rounded-2xl overflow-hidden min-h-screen md:min-h-0 flex flex-col" ref={contentRef}>

                {/* HEADER */}
                <div className={`bg-[#1e293b] text-white relative overflow-hidden transition-all ${isPrinting ? 'p-2 flex items-center justify-between gap-4' : 'p-8 text-center'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
                    {/* Background Decoration */}
                    {!isPrinting && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>}

                    <div className={`flex items-center ${isPrinting ? 'gap-3' : 'flex-col gap-4'}`}>
                        {settings?.logoUrl && (
                            <img
                                src={settings.logoUrl}
                                className={`object-contain filter drop-shadow-md transition-all ${isPrinting ? 'h-10' : 'h-16 mb-0'}`}
                                alt="Logo"
                            />
                        )}
                        {(!isPrinting || !settings?.logoUrl) && (
                            <h1 className={`font-bold uppercase tracking-widest ${isPrinting ? 'text-sm' : 'text-2xl'}`}>
                                {settings?.shopName || 'Συνεργείο'}
                            </h1>
                        )}
                    </div>

                    <div className={isPrinting ? 'flex items-center gap-2' : 'mt-2'}>
                        <span className={`text-blue-400 font-mono border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm shadow-inner transition-all ${isPrinting ? 'text-xs px-3 py-0.5' : 'text-lg px-6 py-1 inline-block'}`}>
                            {plate}
                        </span>
                    </div>

                    {!isPrinting && (
                        <button onClick={handleDownloadPDF} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white" title="Λήψη PDF">
                            <Download size={20} />
                        </button>
                    )}
                </div>

                {/* NEXT SERVICE CARD */}
                {nextService && (
                    <div className={`bg-blue-50 border-b border-blue-100 relative overflow-hidden transition-all ${isPrinting ? 'p-1.5 flex items-center justify-center gap-4' : 'p-8 text-center'}`}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <p className={`text-blue-900/40 font-bold uppercase tracking-[0.2em] ${isPrinting ? 'text-[8px]' : 'text-[10px] mb-2'}`}>ΚΑΤΑΣΤΑΣΗ ΣΥΝΤΗΡΗΣΗΣ</p>
                        <h2 className={`font-black tracking-tight ${nextService.color} ${isPrinting ? 'text-xs' : 'text-3xl'}`}>{nextService.msg}</h2>
                        {!isPrinting && <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">Ψηφιακό Βιβλίο Service Geoter v2.0</p>}
                    </div>
                )}

                {/* HISTORY LIST */}
                <div className="p-0 md:p-6 flex-1 bg-white">
                    <div className="p-4 md:p-0">
                        <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest flex items-center gap-2">
                            <History size={16} className="text-blue-600" /> Ιστορικό Εργασιών
                        </h3>
                    </div>

                    <div className={isPrinting ? 'space-y-3' : 'space-y-4'}>
                        {services.length === 0 && <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 m-4 md:m-0"><p className="text-slate-400">Δεν υπάρχουν καταχωρημένες εργασίες.</p></div>}

                        {services.map((srv, idx) => {
                            const visitShop = srv.shop || settings;
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
                                                <History size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-lg">{new Date(srv.completedAt).toLocaleDateString('el-GR')}</p>
                                                <p className="text-xs text-slate-500 font-mono italic">
                                                    {srv.generalNotes?.match(/ΧΛΜ: (\d+)/)?.[0] || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{visitShop.name}</p>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* DETAILS */}
                                    <div className={`${(isExpanded || isPrinting) ? 'block' : 'hidden'} border-t border-slate-100 relative`}>
                                        <div className={`relative ${isPrinting ? 'p-2' : 'p-6'}`}>
                                            <div className={`relative z-10 ${isPrinting ? 'space-y-2' : 'space-y-6'}`}>
                                                {/* Header for individual visit in PDF */}
                                                {isPrinting && (
                                                    <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1.5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-xs text-slate-800 tracking-tight">{new Date(srv.completedAt).toLocaleDateString()}</span>
                                                            <span className="text-[9px] font-bold text-blue-600 uppercase italic">{visitShop.name}</span>
                                                        </div>
                                                        {srv.generalNotes && (
                                                            <div className="text-[9px] text-slate-500 italic max-w-[200px] truncate">
                                                                {srv.generalNotes}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* STAMP POSITIONED TOP-RIGHT IN PRINT */}
                                                {isPrinting && visitShop.stampUrl && (
                                                    <img
                                                        src={visitShop.stampUrl}
                                                        className="absolute -top-1 right-0 w-16 h-12 object-contain opacity-90 mix-blend-multiply rotate-[-3deg] z-20"
                                                        alt="Stamp"
                                                    />
                                                )}

                                                {/* BACKGROUND STAMP - HIDDEN IN PRINT */}
                                                {!isPrinting && visitShop.stampUrl && (
                                                    <img
                                                        src={visitShop.stampUrl}
                                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 opacity-[0.08] pointer-events-none grayscale mix-blend-multiply"
                                                        alt="Stamp"
                                                    />
                                                )}

                                                <div className={isPrinting ? 'grid grid-cols-2 gap-x-4 gap-y-1 w-3/4' : 'space-y-6'}>
                                                    {srv.servicesPerformed.map((cat, i) => (
                                                        <div key={i} className={`space-y-1 ${isPrinting ? 'col-span-1 border-l-2 border-slate-100 pl-2' : ''}`}>
                                                            {!isPrinting && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="rounded-full bg-blue-500 w-1.5 h-6"></span>
                                                                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">{cat.categoryTitle}</span>
                                                                </div>
                                                            )}
                                                            {isPrinting && (
                                                                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">{cat.categoryTitle}</p>
                                                            )}
                                                            <div className={`grid gap-1 ${isPrinting ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 shadow-sm'}`}>
                                                                {cat.items.map((item, j) => (
                                                                    <div key={j} className={`text-slate-700 flex justify-between items-start bg-slate-50 border border-slate-100 transition-all ${isPrinting ? 'text-[10px] px-2 pt-[1px] pb-[7px] rounded-sm shadow-none leading-none' : 'text-sm p-3 rounded-lg'}`}>
                                                                        <span className={`font-medium truncate pr-2 ${isPrinting ? 'mt-[1px]' : ''}`}>{item.name}</span>
                                                                        <span className={`font-bold rounded uppercase tracking-tighter shrink-0 flex items-center justify-center ${isPrinting ? 'text-[8px] px-2 py-0.5 mt-0' : 'text-[9px] px-2 py-0.5'} ${item.action === 'ΑΛΛΑΓΗ' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                            {item.action}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {!isPrinting && srv.generalNotes && (
                                                <div className="mt-6 p-4 bg-slate-50 border-l-4 border-slate-300 rounded-r-xl text-sm text-slate-600 leading-relaxed italic">
                                                    <span className="font-bold text-slate-800 not-italic block mb-1 uppercase tracking-widest text-[10px]">Σημειώσεις:</span>
                                                    {srv.generalNotes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER - ONLY VISIBLE ON SCREEN */}
                {!isPrinting && (
                    <div className="bg-[#1e293b] border-t border-slate-200 flex flex-wrap justify-center p-8 gap-6 mt-auto">
                        {settings?.phones?.map(phone => (
                            <a key={phone} href={`tel:${phone}`} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-white/10 text-white no-underline">
                                <div className="bg-green-500/20 p-2 rounded-full text-green-400"><Phone size={20} /></div>
                                <span className="font-bold tracking-wider">{phone}</span>
                            </a>
                        ))}
                        {settings?.website && (
                            <a href={settings.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-white/10 text-white no-underline">
                                <div className="bg-blue-500/20 p-2 rounded-full text-blue-400"><Globe size={20} /></div>
                                <span className="font-bold uppercase tracking-widest">Website</span>
                            </a>
                        )}
                    </div>
                )}

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
