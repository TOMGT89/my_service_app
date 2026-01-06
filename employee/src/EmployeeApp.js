import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench, LogOut, Loader2, ChevronDown, ChevronUp, Save, Clock, CheckCircle, Car, FileText, RefreshCw, History
} from 'lucide-react';


// --- ΡΥΘΜΙΣΗ ΣΥΝΔΕΣΗΣ ---
import { API_URL } from './config';

// --- ΔΟΜΗ ΔΕΔΟΜΕΝΩΝ ---
const SECTIONS = [
    {
        id: 'fluids', title: 'ΛΑΔΙΑ - ΝΕΡΑ - ΒΑΛΒΟΛΙΝΗ', icon: '💧',
        type: 'choice',
        options: ['ΑΛΛΑΓΗ', 'ΕΛΕΓΧΟΣ', 'ΣΥΜΠ/ΜΑ'],
        items: ['ΛΑΔΙ ΜΗΧΑΝΗΣ', 'ΒΑΛΒΟΛΙΝΗ ΣΑΣΜΑΝ/ΔΙΑΦΟΡΙΚΟΥ', 'ΥΓΡΑ ΦΡΕΝΩΝ', 'ΥΓΡΑ ΨΥΓΕΙΟΥ', 'ΥΓΡΑ ΤΙΜΟΝΙΟΥ', 'ΦΡΕΟΝ']
    },
    {
        id: 'filters', title: 'ΦΙΛΤΡΑ', icon: '🌪️',
        type: 'choice',
        options: ['ΑΛΛΑΓΗ', 'ΕΛΕΓΧΟΣ'],
        items: ['ΦΙΛΤΡΟ ΛΑΔΙΟΥ', 'ΦΙΛΤΡΟ ΑΕΡΟΣ', 'ΦΙΛΤΡΟ ΚΑΜΠΙΝΑΣ', 'ΦΙΛΤΡΟ ΒΕΝΖΙΝΗΣ/ΠΕΤΡΕΛΑΙΟΥ']
    },
    {
        id: 'engine', title: 'ΜΕΡΗ ΚΙΝΗΤΗΡΑ', icon: '⚙️',
        type: 'choice',
        options: ['ΑΛΛΑΓΗ', 'ΕΛΕΓΧΟΣ', 'ΕΠΙΔ/ΣΗ'],
        items: [
            'ΙΜΑΝΤΑΣ ΧΡΟΝΙΣΜΟΥ', 'ΚΑΔΕΝΑ', 'ΙΜΑΝΤΑΣ ΔΥΝΑΜΟ', 'ΙΜΑΝΤΑΣ A/C', 'ΑΝΤΛΙΑ ΒΕΝΖ/ΠΕΤΡ',
            'ΜΠΕΚ ΒΕΝΖ/ΠΕΤΡ', 'ΜΠΟΥΖΙ-ΠΡΟΘ/ΡΕΣ', 'ΒΑΛΒΙΔΕΣ', 'ΕΚΕΝΤΡΑ', 'ΦΛΑΝΤΖΑ ΨΕΦΤΟΚΑΠΑΚΟΥ',
            'ΦΛΑΝΤΖΑ ΚΕΦΑΛΗΣ', 'ΦΛΑΝΤΖΑ ΚΑΡΤΕΡ', 'ΓΕΝΙΚΕΣ ΣΥΣΦΙΞΕΙΣ-ΔΙΑΡΡΟΕΣ',
            'ΡΥΘΜΙΣΗ ΚΑΡΜΠΙΡΑΤΕΡ- INJECTION', 'ΕΞΑΤΜΙΣΗ'
        ],
        extras: ['ΕΙΣΑΓ-ΑΦΑΙΡ. ΚΙΝΗΤΗΡΑ']
    },
    {
        id: 'brakes', title: 'ΦΡΕΝΑ', icon: '🛑',
        type: 'choice',
        options: ['ΑΛΛΑΓΗ', 'ΕΛΕΓΧΟΣ', 'ΕΠΙΔ/ΣΗ'],
        items: ['ΤΑΚΑΚΙΑ', 'ΔΙΣΚΟΠΛΑΚΕΣ', 'ΣΙΑΓΟΝΕΣ', 'ΚΥΛΙΝΔΡΑΚΙΑ', 'ΔΑΓΚΑΝΕΣ', 'ΤΑΜΠΟΥΡΑ', 'ΜΑΡΚΟΥΤΣΙΑ', 'ΧΕΙΡΟΦΡΕΝΟ']
    },
    {
        id: 'transmission', title: 'ΣΥΣΤΗΜΑ ΜΕΤΑΔΟΣΗΣ', icon: '🔧',
        type: 'choice',
        options: ['ΑΛΛΑΓΗ', 'ΕΛΕΓΧΟΣ', 'ΕΠΙΔ/ΣΗ'],
        items: [
            'ΣΥΜΠΛΕΚΤΗΣ', 'ΣΕΤ ΔΙΣΚΟ-ΠΛΑΤΟ', 'ΡΟΥΛΕΜΑΝ ΣΥΜΠΛΕΚΤΗ', 'ΚΡΕΜΑΡΙΕΡΑ', 'ΑΜΟΡΤΙΣΕΡ',
            'ΗΜΙΑΞΟΝΙΟ', 'ΦΟΥΣΚΑ ΗΜΙΑΞ', 'ΜΠΙΛΙΟΦΟΡΟΣ ΕΣ', 'ΜΠΙΛΙΟΦΟΡΟΣ ΕΞ', 'ΑΚΡΟΜΠΑΡΑ',
            'ΜΠΑΛΑΚΙΑ', 'ΡΟΥΛΕΜΑΝ ΤΡΟΧΟΥ'
        ],
        extras: ['ΕΙΣΑΓ-ΑΦΑΙΡ. ΣΑΣΜΑΝ', 'ΕΙΣΑΓ-ΑΦΑΙΡ. ΨΑΛΙΔΙΑ', 'ΕΙΣΑΓ-ΑΦΑΙΡ. ΓΕΦΥΡΑΣ', 'ΕΙΣΑΓ-ΑΦΑΙΡ. ΑΞΟΝΑ']
    },
    {
        id: 'others', title: 'ΛΟΙΠΕΣ ΕΡΓΑΣΙΕΣ', icon: '📋',
        type: 'check', // Μόνο checkbox
        items: ['ΔΙΑΓΝΩΣΗ', 'ΠΡΟΕΤΟΙΜΑΣΙΑ ΚΤΕΟ', 'ΕΛΕΓΧΟΣ ΦΩΤΑ']
    }
];

function EmployeeApp() {
    const [user, setUser] = useState(null);
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const [view, setView] = useState('entry');
    const [pendingServices, setPendingServices] = useState([]);
    const [currentServiceId, setCurrentServiceId] = useState(null);

    const [entryData, setEntryData] = useState({ plate: '', km: '', vin: '' });

    const [selections, setSelections] = useState({});
    const [comments, setComments] = useState({});
    const [extras, setExtras] = useState({});

    const [expandedSection, setExpandedSection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success'|'error', text: '' }
    const showStatus = (text, type = 'success') => { setStatus({ text, type }); setTimeout(() => setStatus(null), 4000); };

    // SCANNER QR (REMOVED)
    // const fileInputRef = useRef(null);
    // const [scanning, setScanning] = useState(false);

    // --- LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
            const data = await res.json();
            if (data.success && (data.user.role === 'employee' || data.user.role === 'admin' || data.user.role === 'superadmin')) {
                setUser(data.user);
                localStorage.setItem('token', data.token); // SAVE TOKEN
                showStatus('✅ Σύνδεση επιτυχής!');
            } else { showStatus('❌ Λάθος στοιχεία ή Δεν έχετε δικαίωμα πρόσβασης.', 'error'); }
        } catch (e) { showStatus('❌ Δεν υπάρχει σύνδεση με τον Server.', 'error'); }
    };

    // --- ΦΟΡΤΩΣΗ ΕΚΚΡΕΜΩΝ ---
    useEffect(() => {
        if (user) fetchPendingServices();
    }, [user, view]);

    const fetchPendingServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/services/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPendingServices(data);
        } catch (err) { console.error('Error fetching pending:', err); }
    };

    // --- QR SCANNER LOGIC (REMOVED) ---
    const triggerCamera = () => {
        // Disabled
    };

    const handleImageUpload = (e) => {
        // Disabled
    };

    const handleContinueService = (service) => {
        setCurrentServiceId(service._id);
        const kmMatch = service.generalNotes?.match(/ΧΛΜ: (\d+)/);
        const vinMatch = service.generalNotes?.match(/VIN: ([A-Z0-9]+)/);

        setEntryData({
            plate: service.vehiclePlate,
            km: kmMatch ? kmMatch[1] : '',
            vin: vinMatch ? vinMatch[1] : ''
        });

        const newSelections = {};
        const newExtras = {};

        service.servicesPerformed.forEach(cat => {
            cat.items.forEach(item => {
                if (item.action === 'ΕΓΙΝΕ') {
                    newExtras[item.name] = true;
                } else {
                    newSelections[item.name] = item.action;
                }
            });
        });

        setSelections(newSelections);
        setExtras(newExtras);
        setComments({});
        setView('service');
    };

    const toggleSelection = (item, option) => {
        setSelections(prev => {
            const newState = { ...prev };
            if (newState[item] === option) delete newState[item];
            else newState[item] = option;
            return newState;
        });
    };

    const toggleExtra = (item) => {
        setExtras(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const handleSave = async (statusArg = 'Completed') => {
        if (Object.keys(selections).length === 0 && Object.keys(extras).length === 0 && statusArg === 'Completed') {
            return showStatus('❌ Δεν έχεις επιλέξει καμία εργασία!', 'error');
        }
        setLoading(true);

        let servicesPerformed = [];
        SECTIONS.forEach(sec => {
            let items = [];
            sec.items.forEach(item => {
                if (selections[item]) items.push({ name: item, action: selections[item] });
                else if (sec.type === 'check' && extras[item]) items.push({ name: item, action: 'ΕΓΙΝΕ' });
            });
            if (sec.extras) sec.extras.forEach(ex => { if (extras[ex]) items.push({ name: ex, action: 'ΕΓΙΝΕ' }); });
            if (items.length > 0) servicesPerformed.push({ categoryTitle: sec.title, items });
        });

        let notes = `ΧΛΜ: ${entryData.km} | VIN: ${entryData.vin}\n`;
        Object.keys(comments).forEach(secId => {
            if (comments[secId]) notes += `[${SECTIONS.find(s => s.id === secId).title}]: ${comments[secId]}\n`;
        });

        const payload = {
            _id: currentServiceId,
            vehiclePlate: entryData.plate.toUpperCase(),
            mechanic: user.username,
            servicesPerformed,
            generalNotes: notes,
            generalNotes: notes,
            status: statusArg === 'Temp' ? 'Pending' : 'Completed'
        };

        try {
            await fetch(`${API_URL}/api/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
            showStatus(statusArg === 'Temp' ? '✅ Αποθηκεύτηκε προσωρινά!' : '✅ Ολοκληρώθηκε!');
            setEntryData({ plate: '', km: '', vin: '' }); setSelections({}); setExtras({}); setComments({});
            setCurrentServiceId(null);
            setView('entry');
        } catch (e) { showStatus('❌ Σφάλμα σύνδεσης.', 'error'); }
        finally { setLoading(false); }
    };

    if (!user) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative">
            <AnimatePresence>
                {status && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-xl shadow-2xl border ${status.type === 'success' ? 'bg-gradient-to-r from-emerald-600 to-green-500 border-emerald-400' : 'bg-gradient-to-r from-red-600 to-rose-500 border-red-400'} text-white font-bold flex items-center gap-2 pointer-events-none`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <Wrench size={20} className="rotate-90" />}
                        {status.text}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="w-full max-w-sm bg-[#12121a]/80 backdrop-blur-xl p-8 rounded-2xl border border-amber-900/30 text-center shadow-2xl shadow-black/50">
                <div className="bg-gradient-to-r from-amber-600 to-yellow-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/30">
                    <Wrench className="text-black w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-6">Service App</h1>
                <input className="w-full p-3 bg-[#0a0a0f] border border-[#1a1a25] text-white rounded-lg mb-3 focus:border-amber-500/50 focus:outline-none transition-colors" placeholder="Username" value={credentials.username} onChange={e => setCredentials({ ...credentials, username: e.target.value })} />
                <input type="password" className="w-full p-3 bg-[#0a0a0f] border border-[#1a1a25] text-white rounded-lg mb-5 focus:border-amber-500/50 focus:outline-none transition-colors" placeholder="Password" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} />
                <button onClick={handleLogin} className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black py-3 rounded-lg font-bold shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98]">ΕΙΣΟΔΟΣ</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative">
            <AnimatePresence>
                {status && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-xl shadow-2xl border ${status.type === 'success' ? 'bg-gradient-to-r from-emerald-600 to-green-500 border-emerald-400' : 'bg-gradient-to-r from-red-600 to-rose-500 border-red-400'} text-white font-bold flex items-center gap-2 pointer-events-none`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <Wrench size={20} className="rotate-90" />}
                        {status.text}
                    </motion.div>
                )}
            </AnimatePresence>



            {/* HEADER */}
            <div className="bg-[#0d0d14]/90 backdrop-blur-xl p-4 border-b border-amber-900/20 flex justify-between items-center sticky top-0 z-20 shadow-lg shadow-black/30">
                <div className="flex items-center gap-2"><div className="bg-gradient-to-r from-amber-600 to-yellow-500 p-2 rounded-lg shadow-lg shadow-amber-900/30"><Wrench size={20} className="text-black" /></div><span className="font-bold text-amber-100">{user.username}</span></div>
                <button onClick={() => setUser(null)} className="p-2 rounded-lg hover:bg-red-900/30 transition-colors"><LogOut className="text-red-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {view === 'entry' && (
                    <div className="max-w-md mx-auto space-y-8 mt-4">
                        <div className="bg-[#12121a]/80 backdrop-blur-lg p-6 rounded-2xl border border-amber-900/20 space-y-4 shadow-2xl shadow-black/30">
                            <h2 className="text-xl font-bold text-center mb-2 flex items-center justify-center gap-2 text-amber-100"><Wrench size={20} className="text-amber-400" /> Νέα Εργασία</h2>

                            {/* ΠΙΝΑΚΙΔΑ */}
                            <div>
                                <label className="text-xs text-slate-500 font-bold ml-1 flex items-center gap-1"><Car size={14} /> ΠΙΝΑΚΙΔΑ</label>
                                <div className="flex gap-2">
                                    <input
                                        value={entryData.plate}
                                        onChange={e => {
                                            let val = e.target.value.toUpperCase();
                                            if (val.length === 3 && entryData.plate.length === 2) val += '-';
                                            setEntryData({ ...entryData, plate: val })
                                        }}
                                        className="w-full bg-[#0a0a0f] border border-amber-900/30 py-3 px-2 rounded-xl font-bold text-center text-xl tracking-widest uppercase outline-none focus:border-amber-500/50 transition-colors text-amber-100"
                                        placeholder="ABC-1234"
                                    />
                                </div>
                            </div>

                            <div><label className="text-xs text-gray-500 font-bold ml-1 flex items-center gap-1"><Clock size={14} className="text-amber-400" /> ΧΙΛΙΟΜΕΤΡΑ</label><input type="number" value={entryData.km} onChange={e => setEntryData({ ...entryData, km: e.target.value })} className="w-full bg-[#0a0a0f] border border-[#1a1a25] p-3 rounded-xl outline-none focus:border-amber-500/50 transition-colors" placeholder="0" /></div>
                            <div><label className="text-xs text-gray-500 font-bold ml-1 flex items-center gap-1"><FileText size={14} className="text-amber-400" /> VIN (ΠΡΟΑΙΡΕΤΙΚΟ)</label><input value={entryData.vin} onChange={e => setEntryData({ ...entryData, vin: e.target.value.toUpperCase() })} className="w-full bg-[#0a0a0f] border border-[#1a1a25] p-3 rounded-xl text-sm uppercase outline-none focus:border-amber-500/50 transition-colors" placeholder="Αρ. Πλαισίου" /></div>

                            <button onClick={() => { if (!entryData.plate) return showStatus('❌ Βάλε πινακίδα!', 'error'); setCurrentServiceId(null); setSelections({}); setExtras({}); setView('service'); }} className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black py-4 rounded-xl font-bold text-lg mt-4 shadow-lg shadow-amber-900/30 active:scale-[0.98] transition-all">ΕΝΑΡΞΗ ΝΕΑΣ</button>
                        </div>

                        {pendingServices.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-gray-400 font-bold text-sm ml-2 flex items-center gap-2"><History size={16} className="text-amber-400" /> ΣΕ ΑΝΑΜΟΝΗ ({pendingServices.length})</h3>
                                {pendingServices.map(service => (
                                    <div key={service._id} onClick={() => handleContinueService(service)} className="bg-[#12121a]/60 backdrop-blur-lg border border-amber-900/20 p-4 rounded-xl flex justify-between items-center active:bg-[#1a1a25] cursor-pointer transition-colors">
                                        <div><h4 className="font-bold text-lg text-amber-100">{service.vehiclePlate}</h4><p className="text-xs text-gray-400">{service.mechanic}</p></div>
                                        <div className="text-amber-400 bg-amber-900/20 p-2 rounded-lg"><RefreshCw size={20} /></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'service' && (
                    <div className="max-w-md mx-auto space-y-3">
                        <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl flex justify-between items-center mb-4 backdrop-blur-sm">
                            <div><h2 className="text-xl font-bold tracking-wider">{entryData.plate}</h2><p className="text-xs text-blue-300">{entryData.km} χλμ {currentServiceId ? '(ΕΝΗΜΕΡΩΣΗ)' : '(ΝΕΑ)'}</p></div>
                            <button onClick={() => { setView('entry'); fetchPendingServices(); }} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700 text-slate-300">ΠΙΣΩ</button>
                        </div>
                        {SECTIONS.map(sec => (
                            <div key={sec.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                <button onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)} className={`w-full p-4 flex justify-between items-center font-bold transition-colors ${expandedSection === sec.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50'}`}>
                                    <span className="flex items-center gap-2">{sec.icon} {sec.title}</span>
                                    {expandedSection === sec.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                <AnimatePresence>
                                    {expandedSection === sec.id && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-slate-800 bg-slate-950">
                                            <div className="p-4 space-y-6">
                                                {sec.items.map(item => (
                                                    <div key={item} className="space-y-2 border-b border-slate-900 pb-3 last:border-0">
                                                        <div className="font-medium text-sm text-slate-300">{item}</div>
                                                        {sec.type === 'choice' && (<div className="flex flex-wrap gap-2">{sec.options.map(opt => { const active = selections[item] === opt; let style = 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'; if (active) { if (opt.includes('ΑΛΛΑΓΗ')) style = 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20'; else if (opt.includes('ΕΛΕΓΧΟΣ')) style = 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-900/20'; else style = 'bg-yellow-600 border-yellow-600 text-white shadow-lg shadow-yellow-900/20'; } return (<button key={opt} onClick={() => toggleSelection(item, opt)} className={`flex-1 py-3 text-[10px] sm:text-xs font-bold border rounded-lg transition-all active:scale-95 ${style}`}>{opt}</button>) })}</div>)}
                                                        {sec.type === 'check' && (<button onClick={() => toggleExtra(item)} className={`w-full py-3 flex items-center justify-center gap-2 border rounded-lg font-bold transition-all active:scale-95 ${extras[item] ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-700 text-slate-500 hover:bg-slate-900'}`}>{extras[item] && <CheckCircle size={16} />} {extras[item] ? 'ΕΓΙΝΕ' : 'ΕΠΙΛΟΓΗ'}</button>)}
                                                    </div>
                                                ))}
                                                {sec.extras && (<div className="pt-2 border-t border-slate-800">{sec.extras.map(ex => (<button key={ex} onClick={() => toggleExtra(ex)} className={`w-full py-3 flex items-center justify-between px-4 rounded-lg border mb-2 transition-all active:scale-95 ${extras[ex] ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}><span className="text-xs font-bold">{ex}</span>{extras[ex] ? <CheckCircle size={18} /> : <div className="w-4 h-4 border border-slate-600 rounded" />}</button>))}</div>)}
                                                <div><label className="text-[10px] font-bold text-slate-500 mb-1 block">ΣΧΟΛΙΑ</label><textarea className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm outline-none focus:border-blue-500 placeholder-slate-700" rows="2" placeholder="Γράψε σημειώσεις..." value={comments[sec.id] || ''} onChange={e => setComments({ ...comments, [sec.id]: e.target.value })} /></div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {view === 'service' && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex gap-3 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => handleSave('Temp')} disabled={loading} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 flex justify-center items-center gap-2 active:scale-95 transition-transform"><Clock size={18} /> ΠΡΟΣΩΡΙΝΗ</button>
                    <button onClick={() => handleSave('Completed')} disabled={loading} className="flex-[2] bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-transform">{loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> ΟΛΟΚΛΗΡΩΣΗ</>}</button>
                </div>
            )}
        </div>
    );
}

export default EmployeeApp;
