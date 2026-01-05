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
            } else { alert('Λάθος στοιχεία ή Δεν έχετε δικαίωμα πρόσβασης.'); }
        } catch (e) { alert('Δεν υπάρχει σύνδεση με τον Server.'); }
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

    const handleSave = async (status = 'Completed') => {
        if (Object.keys(selections).length === 0 && Object.keys(extras).length === 0 && status === 'Completed') {
            return alert('Δεν έχεις επιλέξει καμία εργασία!');
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
            status: status === 'Temp' ? 'Pending' : 'Completed'
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
            alert(status === 'Temp' ? 'Αποθηκεύτηκε προσωρινά!' : 'Ολοκληρώθηκε!');
            setEntryData({ plate: '', km: '', vin: '' }); setSelections({}); setExtras({}); setComments({});
            setCurrentServiceId(null);
            setView('entry');
        } catch (e) { alert('Σφάλμα σύνδεσης.'); }
        finally { setLoading(false); }
    };

    if (!user) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center">
                <Wrench className="text-blue-500 w-12 h-12 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-6">Service App</h1>
                <input className="w-full p-3 bg-slate-800 text-white rounded mb-2" placeholder="Username" value={credentials.username} onChange={e => setCredentials({ ...credentials, username: e.target.value })} />
                <input type="password" className="w-full p-3 bg-slate-800 text-white rounded mb-4" placeholder="Password" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} />
                <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded font-bold">ΕΙΣΟΔΟΣ</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative">



            {/* HEADER */}
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 z-20 shadow-lg">
                <div className="flex items-center gap-2"><div className="bg-blue-600/20 p-2 rounded"><Wrench size={20} className="text-blue-400" /></div><span className="font-bold">{user.username}</span></div>
                <button onClick={() => setUser(null)}><LogOut className="text-red-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {view === 'entry' && (
                    <div className="max-w-md mx-auto space-y-8 mt-4">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                            <h2 className="text-xl font-bold text-center mb-2 flex items-center justify-center gap-2"><Wrench size={20} /> Νέα Εργασία</h2>

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
                                        className="w-full bg-slate-950 border border-slate-700 py-3 px-2 rounded-xl font-bold text-center text-xl tracking-widest uppercase outline-none focus:border-blue-500 transition-colors"
                                        placeholder="ABC-1234"
                                    />
                                </div>
                            </div>

                            <div><label className="text-xs text-slate-500 font-bold ml-1 flex items-center gap-1"><Clock size={14} /> ΧΙΛΙΟΜΕΤΡΑ</label><input type="number" value={entryData.km} onChange={e => setEntryData({ ...entryData, km: e.target.value })} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500" placeholder="0" /></div>
                            <div><label className="text-xs text-slate-500 font-bold ml-1 flex items-center gap-1"><FileText size={14} /> VIN (ΠΡΟΑΙΡΕΤΙΚΟ)</label><input value={entryData.vin} onChange={e => setEntryData({ ...entryData, vin: e.target.value.toUpperCase() })} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm uppercase outline-none focus:border-blue-500" placeholder="Αρ. Πλαισίου" /></div>

                            <button onClick={() => { if (!entryData.plate) return alert('Βάλε πινακίδα!'); setCurrentServiceId(null); setSelections({}); setExtras({}); setView('service'); }} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg mt-4 shadow-lg active:scale-95 transition-transform">ΕΝΑΡΞΗ ΝΕΑΣ</button>
                        </div>

                        {pendingServices.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-slate-400 font-bold text-sm ml-2 flex items-center gap-2"><History size={16} /> ΣΕ ΑΝΑΜΟΝΗ ({pendingServices.length})</h3>
                                {pendingServices.map(service => (
                                    <div key={service._id} onClick={() => handleContinueService(service)} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center active:bg-slate-800 cursor-pointer">
                                        <div><h4 className="font-bold text-lg text-white">{service.vehiclePlate}</h4><p className="text-xs text-slate-400">{service.mechanic}</p></div>
                                        <div className="text-blue-400 bg-blue-900/20 p-2 rounded-full"><RefreshCw size={20} /></div>
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
