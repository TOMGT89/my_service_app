import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // ΝΕΟ: ΓΙΑ ΤΗ ΔΡΟΜΟΛΟΓΗΣΗ
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench, User, LogOut, LayoutDashboard, Users, Wallet, Settings,
    Plus, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, X, Calendar, FileText, CheckCircle, Search, Phone, Pencil, Check, RefreshCw, BarChart2, PieChart, Clock, QrCode,
    Home, BookOpen, Shield, Smartphone
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// IMPORT ΤΟΥ SERVICE BOOK ΠΟΥ ΦΤΙΑΞΑΜΕ
import ServiceBook from './pages/ServiceBook';

// SET public URL for QR codes (Change this to your ngrok or domain)
const PUBLIC_URL = 'https://peppy-crostata-98bbc1.netlify.app';

// components
import { API_URL } from './config';

// ERROR BOUNDARY COMPONENT
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-10">
                    <div className="bg-red-900/20 border border-red-500 p-8 rounded-xl max-w-2xl text-white">
                        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3"><span className="text-red-500">⚠️</span> Something went wrong.</h1>
                        <p className="mb-4 text-slate-300">The application encountered an unexpected error.</p>
                        <pre className="bg-black/50 p-4 rounded text-red-300 text-xs overflow-auto mb-6 font-mono">{this.state.error?.toString()}</pre>
                        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold">Clear Data & Restart</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const THEMES = {
    default: { id: 'default', name: 'Slate Blue', bg: 'bg-[#0f172a]', sidebar: 'bg-slate-900', card: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', input: 'bg-slate-900', button: 'bg-blue-600 hover:bg-blue-500', activeTab: 'bg-blue-600 text-white', accent: 'text-blue-400' },
    midnight: { id: 'midnight', name: 'Zinc Purple', bg: 'bg-zinc-950', sidebar: 'bg-zinc-900', card: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700', input: 'bg-zinc-900', button: 'bg-purple-600 hover:bg-purple-500', activeTab: 'bg-purple-600 text-white', accent: 'text-purple-400' },
    forest: { id: 'forest', name: 'Stone Green', bg: 'bg-stone-950', sidebar: 'bg-stone-900', card: 'bg-stone-800', text: 'text-stone-400', border: 'border-stone-700', input: 'bg-stone-900', button: 'bg-green-700 hover:bg-green-600', activeTab: 'bg-green-700 text-white', accent: 'text-green-500' },
    ocean: { id: 'ocean', name: 'Neutral Cyan', bg: 'bg-neutral-950', sidebar: 'bg-neutral-900', card: 'bg-neutral-800', text: 'text-neutral-400', border: 'border-neutral-700', input: 'bg-neutral-900', button: 'bg-cyan-700 hover:bg-cyan-600', activeTab: 'bg-cyan-700 text-white', accent: 'text-cyan-400' },
    sunset: { id: 'sunset', name: 'Gray Orange', bg: 'bg-gray-950', sidebar: 'bg-gray-900', card: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700', input: 'bg-gray-900', button: 'bg-orange-700 hover:bg-orange-600', activeTab: 'bg-orange-700 text-white', accent: 'text-orange-400' }
};

// 1. MODAL ΙΣΤΟΡΙΚΟΥ
const ServiceHistoryModal = ({ vehicle, onClose, user }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => { try { const res = await fetch(`${API_URL}/api/services/history/${vehicle.plateNumber}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); setHistory(await res.json()); } catch (err) { console.error(err); } finally { setLoading(false); } };
    const handleDeleteRecord = async (recordId) => { if (!confirm('Διαγραφή;')) return; await fetch(`${API_URL}/api/services/${recordId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); fetchHistory(); };
    useEffect(() => { fetchHistory(); }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="bg-blue-600/20 text-blue-400 p-2 rounded-lg"><Wrench size={24} /></span> {vehicle.plateNumber}</h2>
                        <p className="text-slate-400 ml-12">{vehicle.brand} {vehicle.model} • {vehicle.ownerName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X className="text-slate-400 hover:text-white" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-[#0f172a]">
                    {loading ? <p className="text-center text-slate-500">Φόρτωση...</p> : history.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center gap-3"><div className="bg-slate-800 p-4 rounded-full"><FileText size={32} className="text-slate-600" /></div><p className="text-slate-500">Δεν βρέθηκε ιστορικό εργασιών.</p></div>
                    ) : (
                        history.map((record) => (
                            <div key={record._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex justify-between mb-4 border-b border-slate-700/50 pb-3">
                                    <div className="flex items-center gap-3 text-slate-300"><Calendar size={16} className="text-blue-400" /><span className="font-mono font-bold text-white">{new Date(record.date).toLocaleDateString('el-GR')}</span><span className="text-slate-600">|</span><User size={16} className="text-purple-400" /><span className="text-sm">{record.mechanic}</span></div>
                                    <button onClick={() => handleDeleteRecord(record._id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                                </div>
                                <div className="space-y-3 mb-4">{(Array.isArray(record.servicesPerformed) ? record.servicesPerformed : []).map((cat, i) => (<div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30"><h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">{cat.categoryTitle}</h4><div className="space-y-1">{(Array.isArray(cat.items) ? cat.items : []).map((item, j) => (<div key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-green-500 shrink-0" /><span className="font-medium text-white">{item.name}</span><span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-800 rounded border border-slate-700 ml-auto">{item.action}</span></div>))}</div></div>))}</div>
                                {record.generalNotes && (<div className="bg-yellow-900/10 border-l-2 border-yellow-600/50 p-3 mb-4 rounded-r"><p className="text-sm text-yellow-500/80 italic whitespace-pre-wrap">{record.generalNotes}</p></div>)}
                                <div className="flex justify-end items-center pt-2 border-t border-slate-700/50 gap-4">
                                    <div className="text-right"><span className="block text-[10px] text-slate-500 uppercase font-bold">Χρεωση</span><span className="text-green-400 font-mono font-bold text-lg">+{record.price || 0}€</span></div>
                                    <div className="text-right"><span className="block text-[10px] text-slate-500 uppercase font-bold">Κοστος</span><span className="text-red-400 font-mono font-bold text-lg">-{record.partsCost || 0}€</span></div>
                                </div>
                            </div>
                        )))}
                </div>
            </motion.div>
        </div>
    );
};

// 2. MODAL ΕΠΕΞΕΡΓΑΣΙΑΣ ΟΧΗΜΑΤΟΣ
const EditVehicleModal = ({ vehicle, onClose, onUpdate, user }) => {
    const [formData, setFormData] = useState({ ...vehicle });
    const handleSubmit = async (e) => { e.preventDefault(); await fetch(`${API_URL}/api/vehicles/${vehicle._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(formData) }); onUpdate(); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 p-6 shadow-2xl">
                <div className="flex justify-between mb-6"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Pencil className="text-blue-400" /> Επεξεργασία</h2><button onClick={onClose}><X className="text-slate-400 hover:text-white" /></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Πινακιδα</label><input value={formData.plateNumber} onChange={e => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg font-bold tracking-wider focus:border-blue-500 outline-none" /></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Μαρκα</label><input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:border-blue-500 outline-none" /></div><div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Μοντελο</label><input value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:border-blue-500 outline-none" /></div></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Ιδιοκτητης</label><input value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:border-blue-500 outline-none" /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Τηλεφωνο</label><input value={formData.ownerPhone} onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:border-blue-500 outline-none" /></div>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold mt-2 transition-colors">Αποθήκευση Αλλαγών</button>
                </form>
            </motion.div>
        </div>
    );
};

// 3. MINI ERP TAB
const MiniERPTab = ({ theme, user }) => {
    const t = theme || THEMES.default;
    const [services, setServices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [recurring, setRecurring] = useState([]);
    const [newRec, setNewRec] = useState({ title: '', amount: '' });
    const [editRecId, setEditRecId] = useState(null);
    const [editExpId, setEditExpId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const months = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
    const fullMonths = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
    const [users, setUsers] = useState([]); // NEO: Users for salary
    const listOrEmpty = (d) => Array.isArray(d) ? d : [];
    const fetchData = async () => {
        if (!user) return;
        try {
            const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
            const sRes = await fetch(`${API_URL}/api/services/completed`, { headers }); setServices(sRes.ok ? listOrEmpty(await sRes.json()) : []);
            const eRes = await fetch(`${API_URL}/api/expenses`, { headers }); setExpenses(eRes.ok ? listOrEmpty(await eRes.json()) : []);
            const rRes = await fetch(`${API_URL}/api/recurring-expenses`, { headers }); setRecurring(rRes.ok ? listOrEmpty(await rRes.json()) : []);
            const uRes = await fetch(`${API_URL}/api/users`, { headers }); setUsers(uRes.ok ? listOrEmpty(await uRes.json()) : []);
        } catch (e) { console.error('Error fetching ERP data', e); }
    };
    useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]);
    const [newMonthly, setNewMonthly] = useState({ title: '', amount: '' }); // For Monthly
    const [deleteConfirmId, setDeleteConfirmId] = useState(null); // For UI Confirmation

    const handleAddRecurring = async (e) => { e.preventDefault(); await fetch(`${API_URL}/api/recurring-expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(newRec) }); setNewRec({ title: '', amount: '' }); fetchData(); };
    const handleDeleteRecurring = async (id) => {
        if (deleteConfirmId === id) {
            try { await fetch(`${API_URL}/api/recurring-expenses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); setDeleteConfirmId(null); fetchData(); } catch (e) { alert('Error deleting'); }
        } else {
            setDeleteConfirmId(id);
            setTimeout(() => setDeleteConfirmId(null), 3000); // Auto-cancel after 3s
        }
    };
    const handleUpdateRecurring = async (id) => { await fetch(`${API_URL}/api/recurring-expenses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ amount: Number(editAmount) }) }); setEditRecId(null); fetchData(); };

    const handleAddExpense = async (e) => {
        e.preventDefault(); await fetch(`${API_URL}/api/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ ...newMonthly, date: new Date(selectedYear, selectedMonth, 1) }) }); setNewMonthly({ title: '', amount: '' }); fetchData();
    };
    const handleDeleteExpense = async (id) => {
        if (deleteConfirmId === id) {
            try { await fetch(`${API_URL}/api/expenses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); setDeleteConfirmId(null); fetchData(); } catch (e) { alert('Error deleting'); }
        } else {
            setDeleteConfirmId(id);
            setTimeout(() => setDeleteConfirmId(null), 3000); // Auto-cancel after 3s
        }
    };
    const handleUpdateExpense = async (id) => { await fetch(`${API_URL}/api/expenses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ amount: Number(editAmount) }) }); setEditExpId(null); fetchData(); };

    // CALCULATIONS
    const isSameMonth = (d1, m, y) => { const d = new Date(d1); return d.getMonth() === m && d.getFullYear() === y; };
    const filteredServices = services.filter(s => isSameMonth(s.completedAt, Number(selectedMonth), Number(selectedYear)));
    const filteredExpenses = expenses.filter(e => isSameMonth(e.date, Number(selectedMonth), Number(selectedYear)));

    // 1. Revenue & Parts
    const totalRevenue = filteredServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalPartsCost = filteredServices.reduce((sum, s) => sum + (s.partsCost || 0), 0);

    // 2. Extra Expenses (Monthly)
    const totalMonthlyExpenses = filteredExpenses.reduce((sum, ex) => sum + (ex.amount || 0), 0);

    // 3. Recurring Expenses (Fixed every month)
    const totalRecurringCost = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);

    // 4. Salaries (Fixed every month)
    const totalSalaries = users.reduce((sum, u) => sum + (Number(u.salary) || 0) + (Number(u.insurance) || 0), 0);

    // TOTAL EXPENSES
    const totalTotalExpenses = totalPartsCost + totalMonthlyExpenses + totalRecurringCost + totalSalaries;
    const netProfit = totalRevenue - totalTotalExpenses;

    const yearlyStats = months.map((m, i) => {
        const ms = services.filter(s => isSameMonth(s.completedAt, i, selectedYear));
        const ex = expenses.filter(e => isSameMonth(e.date, i, selectedYear));

        const rev = ms.reduce((sum, s) => sum + (s.price || 0), 0);
        const parts = ms.reduce((sum, s) => sum + (s.partsCost || 0), 0);
        const monthEx = ex.reduce((sum, e) => sum + (e.amount || 0), 0);

        // FUTURE CHECK LOGIC
        const isFuture = parseInt(selectedYear) > today.getFullYear() || (parseInt(selectedYear) === today.getFullYear() && i > today.getMonth());
        if (isFuture) return { revenue: 0, totalOut: 0, net: 0 };

        const totalOut = parts + monthEx + totalRecurringCost + totalSalaries;

        return { revenue: rev, totalOut, net: rev - totalOut };
    });

    const maxVal = Math.max(...yearlyStats.map(d => Math.abs(d.net)), ...yearlyStats.map(d => d.revenue), 1000);
    const getTotalForYear = (y) => services.filter(s => new Date(s.completedAt).getFullYear() === y).reduce((sum, s) => sum + (s.price || 0), 0);

    return (
        <div className="space-y-8">
            <div className={`flex flex-col md:flex-row justify-between items-center ${t.card} p-4 rounded-xl border ${t.border}`}>
                <h2 className="text-xl font-bold text-white flex gap-2"><Wallet className="text-blue-400" /> Οικονομικά</h2>
                <div className="flex gap-2">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={`${t.input} text-white border ${t.border} rounded px-2 py-1 text-sm`}>{fullMonths.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={`${t.input} text-white border ${t.border} rounded px-2 py-1 text-sm`}><option value={2025}>2025</option><option value={2026}>2026</option></select>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className={`${t.card} p-4 rounded-xl border ${t.border} text-center shadow-lg`}><p className="text-[10px] text-slate-400 font-bold uppercase">Τζιρος</p><p className="text-xl font-bold text-green-400">+{totalRevenue} €</p></div>
                <div className={`${t.card} p-4 rounded-xl border ${t.border} text-center shadow-lg`}><p className="text-[10px] text-slate-400 font-bold uppercase">Ανταλ/κα</p><p className="text-xl font-bold text-orange-400">-{totalPartsCost} €</p></div>
                <div className={`${t.card} p-4 rounded-xl border ${t.border} text-center shadow-lg`}><p className="text-[10px] text-slate-400 font-bold uppercase">Μισθοδοσια</p><p className="text-xl font-bold text-red-400">-{totalSalaries} €</p></div>
                <div className={`${t.card} p-4 rounded-xl border ${t.border} text-center shadow-lg`}>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Έξοδα Μήνα</p>
                    <p className="text-lg font-bold text-red-400 mb-1">-{totalMonthlyExpenses} €</p>
                    <div className="border-t border-slate-600 pt-1">
                        <p className="text-[9px] text-slate-500 uppercase">Πάγια (Auto)</p>
                        <p className="text-sm font-bold text-slate-400">-{totalRecurringCost} €</p>
                    </div>
                </div>
                <div className={`col-span-2 lg:col-span-1 ${t.input} p-4 rounded-xl border ${t.border} text-center shadow-lg bg-opacity-50`}><p className={`text-[10px] ${t.accent} font-bold uppercase`}>Καθαρο Κερδος</p><p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-white' : 'text-red-500'}`}>{netProfit} €</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 ${t.card} p-6 rounded-xl border ${t.border} overflow-visible relative shadow-lg`}>
                    <h3 className="text-sm font-bold text-slate-400 mb-8 flex items-center gap-2 z-10 relative"><BarChart2 size={16} /> Ετήσια Πορεία ({selectedYear})</h3>
                    <div className="absolute inset-0 top-16 left-6 right-6 bottom-8 flex flex-col justify-between opacity-10 pointer-events-none"><div className="border-t border-white w-full"></div><div className="border-t border-white w-full"></div><div className="border-t border-white w-full"></div><div className="border-t border-white w-full"></div></div>
                    <div className="h-64 flex items-end justify-between gap-2 relative z-0">
                        {yearlyStats.map((stat, i) => {
                            const heightPercent = maxVal > 0 ? (Math.abs(stat.net) / maxVal) * 100 : 0;
                            let tooltipPos = "left-1/2 -translate-x-1/2"; if (i < 2) tooltipPos = "left-0"; if (i > 9) tooltipPos = "right-0";
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                                    <div className={`absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-y-2 group-hover:translate-y-0 ${tooltipPos}`}>
                                        <div className="bg-slate-900/95 border border-slate-600 p-3 rounded-lg shadow-2xl text-xs whitespace-nowrap">
                                            <div className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1 text-center">{fullMonths[i]}</div>
                                            <div className="flex justify-between gap-4"><span className="text-green-400">Έσοδα:</span> <span>+{stat.revenue}€</span></div>
                                            <div className="flex justify-between gap-4"><span className="text-red-400">Έξοδα:</span> <span>-{stat.totalOut}€</span></div>
                                            <div className={`flex justify-between gap-4 font-bold border-t border-slate-700 pt-1 mt-1 ${stat.net >= 0 ? 'text-blue-400' : 'text-orange-500'}`}><span>Κέρδος:</span> <span>{stat.net}€</span></div>
                                        </div>
                                    </div>
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: `${heightPercent}%`, opacity: 1 }} transition={{ duration: 0.5, delay: i * 0.05 }} className={`w-full max-w-[40px] rounded-t-lg relative overflow-hidden transition-all duration-300 group-hover:brightness-110 ${stat.net >= 0 ? 'bg-gradient-to-t from-blue-900 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gradient-to-t from-red-900 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div></motion.div>
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-white transition-colors">{months[i]}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={`${t.card} p-6 rounded-xl border ${t.border} shadow-lg`}><h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2"><PieChart size={16} /> Τζίρος ανά Έτος</h3><div className="space-y-4">{[2025, 2026].map(y => (<div key={y} className="flex justify-between items-center border-b border-slate-700 pb-2"><span className="font-bold text-white">{y}</span><span className="font-mono text-green-400 font-bold">{getTotalForYear(y)} €</span></div>))}</div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className={`${t.card} rounded-xl border ${t.border} p-4 shadow-lg`}>
                    <h3 className="text-sm font-bold text-slate-400 mb-4 flex gap-2"><RefreshCw size={16} /> Πρότυπα Πάγια</h3>
                    <form onSubmit={handleAddRecurring} className="flex gap-2 mb-4"><input placeholder="π.χ. Ενοίκιο" className={`${t.input} border ${t.border} text-white px-2 rounded flex-1 text-sm`} value={newRec.title} onChange={e => setNewRec({ ...newRec, title: e.target.value })} /><input type="number" placeholder="€" className={`${t.input} border ${t.border} text-white px-2 rounded w-20 text-sm`} value={newRec.amount} onChange={e => setNewRec({ ...newRec, amount: e.target.value })} /><button className={`${t.button} text-white px-3 rounded font-bold hover:bg-blue-500 text-sm`}>OK</button></form>
                    <div className="space-y-2">{recurring.map(r => (<div key={r._id} className={`flex justify-between items-center text-sm ${t.input} p-2 rounded`}><span className="text-slate-300 break-all">{r.title}</span><div className="flex gap-2 items-center">{editRecId === r._id ? (<div className="flex items-center gap-1"><input className={`w-16 ${t.card} text-white border ${t.border} rounded px-1`} value={editAmount} onChange={e => setEditAmount(e.target.value)} autoFocus /><button onClick={() => handleUpdateRecurring(r._id)} className="text-green-400"><CheckCircle size={14} /></button><button onClick={() => setEditRecId(null)} className="text-slate-400"><X size={14} /></button></div>) : (<div className="flex items-center gap-2"><span className="font-bold text-white">{r.amount} €</span><button onClick={() => { setEditRecId(r._id); setEditAmount(r.amount); }} className="text-yellow-500 hover:text-yellow-400"><Pencil size={14} /></button><button onClick={() => handleDeleteRecurring(r._id)} className={`${deleteConfirmId === r._id ? 'text-red-500 font-bold bg-white/10 px-2 rounded' : 'text-red-400 hover:text-red-300'}`}>{deleteConfirmId === r._id ? 'Σίγουρα;' : <X size={14} />}</button></div>)}</div></div>))}</div>
                </div>
                <div className={`${t.card} rounded-xl border ${t.border} overflow-hidden shadow-lg`}>
                    <div className={`p-3 ${t.sidebar} border-b ${t.border} font-bold text-slate-400 text-sm flex justify-between items-center`}><span>Έξοδα Μήνα ({fullMonths[selectedMonth]})</span><div className="flex gap-1"><input placeholder="Νέο έξοδο.." className={`w-24 ${t.input} border ${t.border} text-white px-1 text-xs rounded`} value={newMonthly.title} onChange={e => setNewMonthly({ ...newMonthly, title: e.target.value })} /><input type="number" placeholder="€" className={`w-12 ${t.input} border ${t.border} text-white px-1 text-xs rounded`} value={newMonthly.amount} onChange={e => setNewMonthly({ ...newMonthly, amount: e.target.value })} /><button onClick={handleAddExpense} className="text-green-400 hover:text-green-300"><Plus size={16} /></button></div></div>
                    <div className="max-h-60 overflow-y-auto">{filteredExpenses.map(ex => (<div key={ex._id} className={`p-3 border-b ${t.border} flex justify-between items-center hover:bg-white/5 text-sm`}><div><p className="font-bold text-white break-words max-w-[200px]">{ex.title}</p></div><div className="flex items-center gap-2">{editExpId === ex._id ? (<div className="flex items-center gap-1"><input className={`w-16 ${t.input} text-white border ${t.border} rounded px-1`} value={editAmount} onChange={e => setEditAmount(e.target.value)} autoFocus /><button onClick={() => handleUpdateExpense(ex._id)} className="text-green-400"><CheckCircle size={14} /></button><button onClick={() => setEditExpId(null)} className="text-slate-400"><X size={14} /></button></div>) : (<div className="flex items-center gap-2"><span className="text-red-400 font-bold">-{ex.amount} €</span><button onClick={() => { setEditExpId(ex._id); setEditAmount(ex.amount); }} className="text-yellow-500 hover:text-yellow-400"><Pencil size={14} /></button><button onClick={() => handleDeleteExpense(ex._id)} className={`${deleteConfirmId === ex._id ? 'text-red-500 font-bold bg-white/10 px-2 rounded' : 'text-red-400 hover:text-red-300'}`}>{deleteConfirmId === ex._id ? 'Σίγουρα;' : <X size={14} />}</button></div>)}</div></div>))}
                        {filteredExpenses.length === 0 && <p className="text-slate-500 text-center p-4">Δεν έχουν καταχωρηθεί έξοδα.</p>}</div>
                </div>
            </div>
        </div>
    );
};

// 4. GARAGE TAB (ME QR BUTTON & MODAL)
const GarageTab = ({ vehicles, refreshVehicles, theme, user }) => {
    const t = theme || THEMES.default;
    // ... rest of component using 't' instead of 'theme'
    const [showForm, setShowForm] = useState(false);
    // ... (abbreviated for search, will use replace mainly for the t var)

    const [selectedCar, setSelectedCar] = useState(null);
    const [editingCar, setEditingCar] = useState(null);
    const [newCar, setNewCar] = useState({ plateNumber: '', brand: '', model: '', ownerName: '', ownerPhone: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPriceServiceId, setEditingPriceServiceId] = useState(null);
    const [quickPrice, setQuickPrice] = useState('');
    const [quickCost, setQuickCost] = useState('');

    // NEW: QR STATE
    const [qrVehicle, setQrVehicle] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const normalizeText = (text) => { if (!text) return ''; const greekToLatin = { 'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X' }; return text.toUpperCase().split('').map(char => greekToLatin[char] || char).join(''); };
    const filteredVehicles = vehicles.filter(car => { const term = normalizeText(searchTerm); return normalizeText(car.plateNumber).includes(term) || normalizeText(car.ownerPhone || '').includes(term) || normalizeText(car.ownerName || '').includes(term); });

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCar.plateNumber) return alert("Βάλε πινακίδα!");

        // 1. Create Vehicle
        await fetch(`${API_URL}/api/vehicles`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(newCar) });

        // 2. Create Pending Service (Auto-Entrance)
        await fetch(`${API_URL}/api/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({
                vehiclePlate: newCar.plateNumber,
                mechanic: 'Reception',
                status: 'Pending',
                generalNotes: 'Εισαγωγή από Reception',
                servicesPerformed: []
            })
        });

        setShowForm(false);
        setNewCar({ plateNumber: '', brand: '', model: '', ownerName: '', ownerPhone: '' });
        refreshVehicles();
    };
    const handleDeleteCar = async (e, id) => {
        e.stopPropagation();
        if (deleteConfirmId === id) {
            try { const res = await fetch(`${API_URL}/api/vehicles/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); if (!res.ok) throw new Error(res.statusText); setDeleteConfirmId(null); refreshVehicles(); } catch (err) { console.error(err); alert('Error: ' + err.message); }
        } else {
            setDeleteConfirmId(id);
            setTimeout(() => setDeleteConfirmId(null), 3000);
        }
    };

    const handleUpdateLatestPrice = async (serviceId, plate) => {
        if (!serviceId) return;
        try {
            await fetch(`${API_URL}/api/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ _id: serviceId, vehiclePlate: plate, price: Number(quickPrice), partsCost: Number(quickCost), status: 'Completed' })
            });
            setEditingPriceServiceId(null);
            refreshVehicles();
        } catch (e) { alert('Update failed'); }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence> {selectedCar && <ServiceHistoryModal vehicle={selectedCar} user={user} onClose={() => setSelectedCar(null)} />} {editingCar && <EditVehicleModal vehicle={editingCar} user={user} onClose={() => setEditingCar(null)} onUpdate={refreshVehicles} />} </AnimatePresence>

            {/* QR PRINT MODAL */}
            {qrVehicle && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-xl text-center shadow-2xl relative w-[400px]">
                        <h3 className="font-bold text-slate-800 text-xl mb-6">Εκτύπωση QR Service</h3>

                        {/* ΠΕΡΙΟΧΗ ΕΚΤΥΠΩΣΗΣ (5cm x 5cm) */}
                        <div id="qr-print-area" className="w-[5cm] h-[5cm] border-2 border-dashed border-gray-300 mx-auto flex flex-col items-center justify-center p-2 bg-white box-border mb-6">
                            <QRCodeCanvas
                                /* ΠΡΟΣΟΧΗ: Αυτό το Link πρέπει να είναι το δημόσιο URL του ngrok για να το βλέπουν οι πελάτες από το κινητό τους */
                                value={`${PUBLIC_URL}/book/${qrVehicle.plateNumber}`}
                                size={140}
                                level={"H"}
                            />
                            <p className="font-black text-2xl mt-2 tracking-widest text-black">{qrVehicle.plateNumber}</p>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setQrVehicle(null)} className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold">Κλείσιμο</button>
                            <button onClick={() => {
                                const printContent = document.getElementById('qr-print-area').outerHTML;
                                const win = window.open('', '', 'height=600, width=600');
                                win.document.write(`<html><head><title>Print QR - ${qrVehicle.plateNumber}</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">`);
                                win.document.write(printContent);
                                win.document.write('</body></html>');
                                win.document.close();
                                setTimeout(() => win.print(), 500);
                            }} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg">Εκτύπωση</button>
                        </div >
                    </div >
                </div >
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4"><h2 className="text-2xl font-bold text-white">🚖 Διαχείριση Στόλου</h2><div className="flex gap-3 w-full md:w-auto"><div className="relative flex-1 md:w-64"><Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.text}`} size={18} /><input type="text" placeholder="Αναζήτηση..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full ${t.input} border ${t.border} text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase`} /></div><button onClick={() => setShowForm(!showForm)} className={`${t.button} text-white px-4 py-2 rounded-lg flex gap-2 items-center`}><Plus size={18} /> <span className="hidden md:inline">Νέα Εισαγωγή</span></button></div></div>
            <AnimatePresence>{showForm && (<motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAdd} className={`${t.card} p-4 rounded-xl border ${t.border} grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden`}><input placeholder="Πινακίδα (ΑΒΓ-1234)" value={newCar.plateNumber} onChange={e => setNewCar({ ...newCar, plateNumber: e.target.value.toUpperCase() })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg w-full font-bold uppercase tracking-wider`} /><div className="grid grid-cols-2 gap-2"><input placeholder="Μάρκα" value={newCar.brand} onChange={e => setNewCar({ ...newCar, brand: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`} /><input placeholder="Μοντέλο" value={newCar.model} onChange={e => setNewCar({ ...newCar, model: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`} /></div><input placeholder="Ονοματεπώνυμο Πελάτη" value={newCar.ownerName} onChange={e => setNewCar({ ...newCar, ownerName: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`} /><input placeholder="Τηλέφωνο Επικοινωνίας" value={newCar.ownerPhone} onChange={e => setNewCar({ ...newCar, ownerPhone: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`} /><button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-500 shadow-lg mt-2">Αποθήκευση Οχήματος</button></motion.form>)}</AnimatePresence>

            {/* LIST VIEW */}
            <div className="flex flex-col gap-4">
                {filteredVehicles.length === 0 ? (<p className="text-slate-500 text-center py-10">Δεν βρέθηκαν οχήματα.</p>) : (
                    filteredVehicles.map((car) => {
                        const lastService = car.latestService;
                        const jobDescription = Array.isArray(lastService?.servicesPerformed)
                            ? lastService.servicesPerformed.map(cat => (Array.isArray(cat.items) ? cat.items.map(i => i.name).join(', ') : '')).join(' + ')
                            : 'Καμία καταγραφή';

                        return (
                            <motion.div key={car._id} layout className={`${t.card} border ${t.border} p-0 rounded-xl flex flex-col md:flex-row overflow-hidden hover:border-slate-500 transition-colors`}>
                                {/* 1. CAR INFO (LEFT) */}
                                <div className={`p-4 ${t.sidebar} md:w-64 flex flex-col justify-center border-b md:border-b-0 md:border-r ${t.border}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-blue-600/20 text-blue-400 p-2 rounded-lg"><Wrench size={20} /></div>
                                        <h3 className="text-xl font-bold text-white tracking-wider">{car.plateNumber}</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">{car.brand} {car.model}</p>
                                    <div className={`mt-3 pt-3 border-t ${t.border} flex flex-col gap-1 text-xs text-slate-500`}>
                                        <span className="flex items-center gap-2"><User size={12} /> {car.ownerName || '-'}</span>
                                        <span className="flex items-center gap-2"><Phone size={12} /> {car.ownerPhone || '-'}</span>
                                    </div>
                                </div>

                                {/* 2. LATEST JOB DETAILS (CENTER) */}
                                <div className="p-4 flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ΤΕΛΕΥΤΑΙΑ ΕΡΓΑΣΙΑ</span>
                                        <div className="flex gap-2 items-center">
                                            {lastService?.status === 'Pending' && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 animate-pulse">⏳ ΥΠΟ ΕΠΕΞΕΡΓΑΣΙΑ</span>}
                                            {lastService?.status === 'Completed' && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">✅ ΟΛΟΚΛΗΡΩΘΗΚΕ</span>}
                                            {lastService && <span className={`text-xs text-slate-400 ${t.input} px-2 py-1 rounded border ${t.border}`}>{new Date(lastService.date).toLocaleDateString('el-GR')}</span>}
                                        </div>
                                    </div>
                                    <p className="text-white text-lg font-medium leading-tight mb-2 line-clamp-2">{jobDescription}</p>
                                    {lastService && <div className="flex items-center gap-2 text-xs text-slate-500"><User size={12} className="text-purple-400" /> <span>Μηχανικός: <span className="text-slate-300">{lastService.mechanic}</span></span></div>}
                                </div>

                                {/* 3. ACTIONS & PRICING (RIGHT) */}
                                <div className={`p-4 ${t.sidebar} md:w-80 flex flex-col justify-between gap-3 border-t md:border-t-0 md:border-l ${t.border}`}>
                                    {/* Price Inputs */}
                                    {lastService ? (
                                        editingPriceServiceId === lastService._id ? (
                                            <div className={`flex items-center gap-2 ${t.input} p-2 rounded border ${t.border} animate-in fade-in`}>
                                                <div><label className="text-[10px] text-green-500 block">Έσοδο</label><input type="number" className={`w-16 ${t.card} text-white text-right px-1 rounded text-sm outline-none border ${t.border}`} value={quickPrice} onChange={e => setQuickPrice(e.target.value)} /></div>
                                                <div><label className="text-[10px] text-red-500 block">Κόστος</label><input type="number" className={`w-16 ${t.card} text-white text-right px-1 rounded text-sm outline-none border ${t.border}`} value={quickCost} onChange={e => setQuickCost(e.target.value)} /></div>
                                                <button onClick={() => handleUpdateLatestPrice(lastService._id, car.plateNumber)} className="bg-green-600 text-white p-1.5 rounded hover:bg-green-500"><CheckCircle size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className={`flex justify-between items-center ${t.input} px-3 py-2 rounded-lg border ${t.border}`}>
                                                <div><span className="block text-[10px] text-slate-500 uppercase">Χρεωση</span><span className="text-green-400 font-bold text-lg">+{lastService.price || 0}€</span></div>
                                                <div className="text-right"><span className="block text-[10px] text-slate-500 uppercase">Κοστος</span><span className="text-red-400 font-bold text-lg">-{lastService.partsCost || 0}€</span></div>
                                                <button onClick={() => { setEditingPriceServiceId(lastService._id); setQuickPrice(lastService.price || ''); setQuickCost(lastService.partsCost || ''); }} className="text-slate-500 hover:text-white ml-2"><Pencil size={14} /></button>
                                            </div>
                                        )
                                    ) : (
                                        <div className={`text-center text-xs text-slate-600 py-3 ${t.input} rounded-lg border ${t.border}`}>Χωρίς καταγραφή τιμής</div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex gap-3 justify-end mt-auto">
                                        <button onClick={() => setSelectedCar(car)} className={`flex-1 ${t.button} text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors`} title="Προβολή Ιστορικού"><Clock size={16} /> Ιστορικό</button>

                                        {/* QR BUTTON */}
                                        <button onClick={() => setQrVehicle(car)} className={`p-3 ${t.input} hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors`} title="Εκτύπωση QR"><QrCode size={18} /></button>

                                        <button onClick={() => setEditingCar(car)} className={`p-3 ${t.input} hover:bg-slate-700 text-slate-400 hover:text-yellow-400 rounded transition-colors`} title="Επεξεργασία"><Pencil size={18} /></button>
                                        <button onClick={(e) => handleDeleteCar(e, car._id)} className={`p-3 rounded transition-colors border ${deleteConfirmId === car._id ? 'bg-red-600 text-white border-red-600 font-bold' : 'bg-red-900/20 hover:bg-red-900/40 text-red-500 hover:text-red-400 border-red-900/30'}`} title="Διαγραφή Οχήματος">{deleteConfirmId === car._id ? 'ΣΙΓΟΥΡΑ;' : <Trash2 size={18} />}</button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div >
    );
};

// 5. USERS TAB
const UsersTab = ({ theme, user }) => {
    const t = theme || THEMES.default;
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ username: '', password: '', salary: '', insurance: '' });
    const [editingId, setEditingId] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});

    // Prevent re-fetching loop
    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/users`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching users:', e); }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        try {
            let res;
            if (editingId) {
                res = await fetch(`${API_URL}/api/users/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(formData) });
            } else {
                res = await fetch(`${API_URL}/api/users`, { method: 'POST', headers, body: JSON.stringify(formData) });
            }

            if (res.ok) {
                setFormData({ username: '', password: '', salary: '', insurance: '' });
                setEditingId(null);
                fetchUsers();
                alert('✅ Επιτυχία!');
            } else {
                const err = await res.json();
                alert('❌ Σφάλμα: ' + (err.error || 'Άγνωστο Σφάλμα'));
            }
        } catch (e) { alert('❌ Network Error'); }
    };

    const handleEdit = (u) => {
        setEditingId(u._id);
        // Force string conversion
        setFormData({
            username: u.username || '',
            password: u.plainPassword || '',
            salary: String(u.salary || ''),
            insurance: String(u.insurance || '')
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ username: '', password: '', salary: '', insurance: '' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Διαγραφή;')) return;
        await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        fetchUsers();
    };

    const togglePass = (id) => { setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] })); };

    // Helper for clean input
    const handleInput = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">👥 Διαχείριση Προσωπικού</h2>
            <form onSubmit={handleSubmit} className={`${t.card} p-4 rounded-xl border ${t.border}`}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input
                        placeholder="Username"
                        autoComplete="off"
                        value={formData.username}
                        onChange={e => handleInput('username', e.target.value)}
                        className={`${t.input} border ${t.border} text-white p-2 rounded`}
                    />
                    <input
                        placeholder="Password (New)"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={e => handleInput('password', e.target.value)}
                        className={`${t.input} border ${t.border} text-white p-2 rounded`}
                    />
                    <input
                        type="number"
                        placeholder="Καθαρός Μισθός (€)"
                        value={formData.salary}
                        onChange={e => handleInput('salary', e.target.value)}
                        className={`${t.input} border ${t.border} text-white p-2 rounded`}
                    />
                    <input
                        type="number"
                        placeholder="Κόστος Ασφάλισης (€)"
                        value={formData.insurance}
                        onChange={e => handleInput('insurance', e.target.value)}
                        className={`${t.input} border ${t.border} text-white p-2 rounded`}
                    />
                    <div className="flex gap-2">
                        <button type="submit" className={`flex-1 text-white px-4 py-2 rounded font-bold ${editingId ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-purple-600 hover:bg-purple-500'}`}>
                            {editingId ? 'Αλλαγή' : 'Προσθήκη'}
                        </button>
                        {editingId && <button type="button" onClick={handleCancel} className="bg-slate-600 text-white px-3 rounded hover:bg-slate-500"><X /></button>}
                    </div>
                </div>
            </form>
            <div className={`${t.card} rounded-xl overflow-hidden border ${t.border}`}>
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400"><tr><th className="p-4">Όνομα</th><th className="p-4">Στοιχεία</th><th className="p-4">Μηνιαίο Κόστος</th><th className="p-4 text-right">Ενέργειες</th></tr></thead>
                    <tbody>
                        {Array.isArray(users) && users.map(u => (
                            <tr key={u._id} className="border-t border-slate-700">
                                <td className="p-4 font-bold text-white">{u.username}</td>
                                <td className="p-4">
                                    <div className="flex gap-2 items-center">
                                        <span className="font-mono bg-slate-900 px-2 py-1 rounded text-yellow-400">
                                            {visiblePasswords[u._id] ? (u.plainPassword || 'Κρυπτογραφημένο') : '••••••'}
                                        </span>
                                        <button onClick={() => togglePass(u._id)} className="text-slate-400 hover:text-white"><Eye size={16} /></button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs text-slate-400">Μισθός: {u.salary || 0}€<br />Ασφάλεια: {u.insurance || 0}€</div>
                                    <div className="font-bold text-white mt-1">Σύνολο: {(Number(u.salary) || 0) + (Number(u.insurance) || 0)}€</div>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleEdit(u)} className="text-yellow-400 hover:text-yellow-300 mr-2 p-2 rounded hover:bg-yellow-400/10"><Pencil size={16} /></button>
                                    <button onClick={() => handleDelete(u._id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 6. SETTINGS TAB
const SettingsTab = ({ user, setUser, theme }) => {
    const t = theme || THEMES.default;
    const [name, setName] = useState(user.shopName || '');
    const [logoFile, setLogoFile] = useState(null);
    const [stampFile, setStampFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user.logoUrl || '');
    const [stampPreview, setStampPreview] = useState(user.stampUrl || '');
    const [phones, setPhones] = useState(user.phones || []);
    const [website, setWebsite] = useState(user.website || '');
    const [newPhone, setNewPhone] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(user.theme || 'default');

    // Safe handlers to prevent re-renders
    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'logo') { setLogoFile(file); setPreviewUrl(URL.createObjectURL(file)); }
            else { setStampFile(file); setStampPreview(URL.createObjectURL(file)); }
        }
    };

    // IMAGE RESIZER UTILITY
    const resizeImage = (file, maxWidth = 300) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ratio = maxWidth / img.width;
                    if (ratio >= 1) { resolve(file); return; } // No resizing needed

                    canvas.width = maxWidth;
                    canvas.height = img.height * ratio;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.8); // 80% Quality
                };
            };
        });
    };

    const handleAddPhone = (e) => { e.preventDefault(); if (newPhone) { setPhones([...phones, newPhone]); setNewPhone(''); } };
    const removePhone = (idx) => setPhones(phones.filter((_, i) => i !== idx));

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('shopName', name);
        formData.append('website', website);
        formData.append('phones', JSON.stringify(phones));
        formData.append('theme', selectedTheme);

        if (logoFile) {
            const resized = await resizeImage(logoFile, 400);
            formData.append('logo', resized);
        }
        if (stampFile) {
            const resized = await resizeImage(stampFile, 400);
            formData.append('stamp', resized);
        }

        const res = await fetch(`${API_URL}/api/settings/${user._id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });

        if (res.ok) { setUser(await res.json()); alert('✅ Αποθηκεύτηκαν!'); } else alert('❌ Σφάλμα');
    };

    const handleReset = async () => {
        if (!confirm('ΠΡΟΣΟΧΗ: Θα διαγραφούν ΟΛΑ τα στοιχεία του συνεργείου (Όνομα, Λογότυπο, Τηλέφωνα, Σφραγίδα). Είσαι σίγουρος;')) return;

        const formData = new FormData();
        formData.append('shopName', 'New Shop');
        formData.append('website', '');
        formData.append('phones', JSON.stringify([]));
        formData.append('clearLogo', 'true');
        formData.append('clearStamp', 'true');
        formData.append('theme', 'default');

        try {
            const res = await fetch(`${API_URL}/api/settings/${user._id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (res.ok) {
                const updated = await res.json();
                setUser(updated);
                setName('New Shop');
                setWebsite('');
                setPhones([]);
                setPreviewUrl('');
                setStampPreview('');
                setLogoFile(null);
                setStampFile(null);
                setSelectedTheme('default');
                alert('[VERSION 2.0] ✅ Έγινε επαναφορά στις εργοστασιακές ρυθμίσεις!');
            } else {
                alert('[VERSION 2.0] ❌ Σφάλμα κατά την επαναφορά');
            }
        } catch (e) {
            alert('Error resetting settings');
        }
    };

    return (
        <div className="space-y-8 max-w-2xl"><h2 className="text-2xl font-bold text-white">⚙️ Ρυθμίσεις Καταστήματος</h2>

            {/* THEME SELECTOR */}
            <div className={`${t.card} p-6 rounded-xl border ${t.border} space-y-4`}>
                <label className={`block ${t.text} mb-2 font-bold`}>Επιλογή Θέματος</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.values(THEMES).map(th => (
                        <button
                            key={th.id}
                            onClick={() => setSelectedTheme(th.id)}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedTheme === th.id ? 'border-green-500 scale-105' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: th.id === 'default' ? '#0f172a' : th.id === 'midnight' ? '#18181b' : th.id === 'forest' ? '#1c1917' : th.id === 'ocean' ? '#0b1120' : '#111827' }}
                        >
                            <div className={`w-6 h-6 rounded-full ${th.activeTab}`}></div>
                            <span className="text-xs text-white font-bold">{th.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={`${t.card} p-6 rounded-xl border ${t.border} space-y-4`}>
                <div><label className="block text-slate-400 mb-2 font-bold">Όνομα Συνεργείου</label><input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg" /></div>
                <div><label className="block text-slate-400 mb-2 font-bold">Website</label><input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg" /></div>

                {/* PHONES */}
                <div>
                    <label className="block text-slate-400 mb-2 font-bold">Τηλέφωνα</label>
                    <div className="flex flex-wrap gap-2 mb-2">{phones.map((p, i) => (<span key={i} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">{p} <button onClick={() => removePhone(i)} className="hover:text-white"><X size={12} /></button></span>))}</div>
                    <div className="flex gap-2"><input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Προσθήκη τηλεφώνου..." className="flex-1 bg-slate-900 border border-slate-700 text-white p-2 rounded-lg" /><button onClick={handleAddPhone} className="bg-green-600 text-white px-4 rounded-lg font-bold"><Plus size={20} /></button></div>
                </div>

                {/* LOGO & STAMP */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div>
                        <label className="block text-slate-400 mb-2 font-bold">Λογότυπο</label>
                        <div className="h-32 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center overflow-hidden relative group">
                            {previewUrl ? <img src={previewUrl} className="h-full w-full object-contain" /> : <ImageIcon className="text-slate-600" />}
                            <input type="file" onChange={(e) => handleFileSelect(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2 font-bold">Σφραγίδα</label>
                        <div className="h-32 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center overflow-hidden relative group">
                            {stampPreview ? <img src={stampPreview} className="h-full w-full object-contain" /> : <CheckCircle className="text-slate-600" />}
                            <input type="file" onChange={(e) => handleFileSelect(e, 'stamp')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={handleReset} className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-900 text-red-400 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"><Trash2 size={20} /> ΕΠΑΝΑΦΟΡΑ</button>
                <button onClick={handleSave} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">Αποθήκευση Όλων</button>
            </div>
        </div>
    );
};



// 7. SUPER ADMIN TAB (NEW)
const SuperAdminTab = ({ theme }) => {
    const t = theme || THEMES.default;
    const [shops, setShops] = useState([]);
    const [newShop, setNewShop] = useState({ name: '', email: '', password: '', plan: 'Basic', theme: 'default' });

    const fetchShops = async () => {
        try { const res = await fetch(`${API_URL}/api/admin/shops`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); setShops(await res.json()); } catch (e) { }
    };
    useEffect(() => { fetchShops(); }, []);

    const handleCreateShop = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/shops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    shopData: { name: newShop.name, email: newShop.email, password: newShop.password, plan: newShop.plan, theme: newShop.theme },
                    adminUser: { username: newShop.email, password: newShop.password }
                })
            });
            if (res.ok) { alert('✅ Κατάστημα Δημιουργήθηκε!'); setNewShop({ name: '', email: '', password: '', plan: 'Basic', theme: 'default' }); fetchShops(); }
            else { alert('❌ Σφάλμα'); }
        } catch (e) { alert('Error'); }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><LayoutDashboard className="text-purple-500" /> Διαχείριση Συνδρομητών (SaaS)</h2>

            {/* CREATE SHOP FORM */}
            <div className={`${t.card} p-6 rounded-xl border ${t.border} space-y-4`}>
                <h3 className="font-bold text-slate-300 border-b border-slate-700 pb-2">➕ Νέο Συνεργείο</h3>
                <form onSubmit={handleCreateShop} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Όνομα Συνεργείου" value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`} required />
                    <input placeholder="Email (Username)" value={newShop.email} onChange={e => setNewShop({ ...newShop, email: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`} required />
                    <input placeholder="Κωδικός Πρόσβασης" value={newShop.password} onChange={e => setNewShop({ ...newShop, password: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`} required />
                    <select value={newShop.plan} onChange={e => setNewShop({ ...newShop, plan: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`}>
                        <option value="Basic">Basic Plan</option>
                        <option value="Pro">Pro Plan</option>
                        <option value="Enterprise">Enterprise</option>
                    </select>
                    <select value={newShop.theme} onChange={e => setNewShop({ ...newShop, theme: e.target.value })} className={`${t.input} border ${t.border} text-white p-3 rounded-lg`}>
                        <option value="default">Default Theme</option>
                        <option value="midnight">Midnight</option>
                        <option value="forest">Forest</option>
                    </select>
                    <button className="col-span-1 md:col-span-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg shadow-lg">Δημιουργία Συνεργείου</button>
                </form>
            </div>

            {/* SHOPS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map(shop => (
                    <div key={shop._id} className={`${t.card} border ${t.border} rounded-xl p-5 relative overflow-hidden group`}>
                        <div className={`absolute top-0 right-0 p-2 text-xs font-bold uppercase rounded-bl-xl ${shop.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{shop.status}</div>
                        <h3 className="text-xl font-bold text-white mb-1">{shop.name}</h3>
                        <p className="text-slate-400 text-sm mb-4">{shop.email}</p>
                        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-700 pt-3">
                            <span>Plan: <b className="text-purple-400">{shop.plan}</b></span>
                            <div className="flex items-center gap-2">
                                <span>{new Date(shop.createdAt).toLocaleDateString('el-GR')}</span>
                                <button
                                    onClick={async () => {
                                        if (confirm('⚠️ ΠΡΟΣΟΧΗ: Διαγραφή Συνεργείου;\nΘα διαγραφούν ΟΛΟΙ οι χρήστες και τα δεδομένα του!')) {
                                            await fetch(`${API_URL}/api/admin/shops/${shop._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                                            fetchShops();
                                        }
                                    }}
                                    className="bg-red-900/40 text-red-400 p-1 rounded hover:bg-red-900 hover:text-white transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD (OLD APP LOGIC WRAPPED IN COMPONENT) ---
const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [activeTab, setActiveTab] = useState('home');
    const [vehicles, setVehicles] = useState([]);
    const [showAppQR, setShowAppQR] = useState(false);

    const theme = (user && THEMES[user.theme]) ? THEMES[user.theme] : THEMES['default']; // Robust Fallback
    console.log('DEBUG: User:', user);
    console.log('DEBUG: Theme:', theme);
    console.log('DEBUG: ActiveTab:', activeTab);

    const refreshVehicles = async () => {
        try {
            if (!user) return;
            const res = await fetch(`${API_URL}/api/vehicles`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            if (res.ok) {
                const data = await res.json();
                setVehicles(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching vehicles:', e); }
    };
    useEffect(() => { if (user && activeTab === 'home') refreshVehicles(); }, [user, activeTab]);
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            console.log('Attempting login to:', API_URL);
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
            }

            const data = await res.json();

            if (res.ok && data.success !== false) {
                // Determine user object (support both data.user and direct data)
                const userObj = data.user || data;
                setUser(userObj);
                localStorage.setItem('user', JSON.stringify(userObj));
                localStorage.setItem('token', data.token); // SAVE TOKEN
            } else {
                alert(`[LOGIN FAILED]\nStatus: ${res.status}\nMessage: ${data.message || data.error || 'Unknown Error'}`);
                console.error('Login Fail:', data);
            }
        } catch (e) {
            alert(`[NETWORK ERROR]\nDetails: ${e.message}\n\nCheck if Server is running at ${API_URL}`);
            console.error('Login Exception:', e);
        }
    };

    if (!user) {
        const logoToDisplay = user?.logoUrl;
        return (
            <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl relative z-10 mx-4">
                    <div className="text-center mb-10">{logoToDisplay ? <img src={logoToDisplay} alt="Logo" className="h-24 mx-auto mb-6 object-contain" /> : <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6"><Wrench className="w-10 h-10 text-white" /></div>}<h1 className="text-3xl font-bold text-white mb-2">Geoter Cloud v2</h1><p className="text-slate-400">Σύστημα Διαχείρισης</p></div>
                    <form onSubmit={handleLogin} className="space-y-6"><div className="space-y-2"><label className="text-sm text-slate-300">Username</label><input type="text" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500" placeholder="admin" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} /></div><div className="space-y-2"><label className="text-sm text-slate-300">Password</label><input type="password" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500" placeholder="••••••••" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} /></div><button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl flex justify-center items-center gap-2">Σύνδεση</button></form>
                </motion.div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className={`min-h-screen ${theme?.bg || 'bg-slate-900'} text-white flex transition-colors duration-300`}>

                {/* APP QR MODAL */}
                <AnimatePresence>
                    {showAppQR && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className={`${theme?.card || 'bg-slate-800'} p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border ${theme?.border || 'border-slate-700'}`}>
                                <h3 className="text-xl font-bold text-white mb-2">📱 Εφαρμογή Κινητού</h3>
                                <p className="text-slate-400 text-sm mb-6">Σκανάρετε για εγκατάσταση</p>

                                <div className="bg-white p-4 rounded-xl inline-block mb-6">
                                    <QRCodeCanvas value={API_URL} size={200} level="H" />
                                </div>
                                <p className="text-xs text-slate-500 font-mono mb-6 break-all">{API_URL}</p>

                                <button onClick={() => setShowAppQR(false)} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors">Κλείσιμο</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SIDEBAR */}
                <div className={`w-20 lg:w-64 ${theme?.sidebar || 'bg-slate-800'} flex flex-col items-center lg:items-stretch py-6 border-r ${theme?.border || 'border-slate-700'}`}>
                    <div className="mb-8 px-4 flex justify-center lg:justify-start">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden lg:block">Geoter<span className="text-xs text-slate-500 ml-1">v2.0</span></h1>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent lg:hidden">G</h1>
                    </div>

                    <nav className="flex-1 space-y-2 px-2">
                        <button onClick={() => setActiveTab('home')} className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Home size={20} /> <span className="hidden lg:inline font-bold">Στόλος</span></button>
                        <button onClick={() => setActiveTab('erp')} className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeTab === 'erp' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Wallet size={20} /> <span className="hidden lg:inline font-bold">Οικονομικά</span></button>
                        <button onClick={() => setActiveTab('book')} className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeTab === 'book' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><BookOpen size={20} /> <span className="hidden lg:inline font-bold">Service Book</span></button>
                        <button onClick={() => setActiveTab('users')} className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeTab === 'users' ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Users size={20} /> <span className="hidden lg:inline font-bold">Προσωπικό</span></button>
                        {user?.role === 'superadmin' && <button onClick={() => setActiveTab('superadmin')} className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeTab === 'superadmin' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Shield size={20} /> <span className="hidden lg:inline font-bold">Super Admin</span></button>}
                    </nav>

                    <div className="px-2 space-y-2">
                        <button onClick={() => setShowAppQR(true)} className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all text-slate-400 hover:bg-white/5 hover:text-white`}><Smartphone size={20} /> <span className="hidden lg:inline font-bold">Mobile App</span></button>
                        <button onClick={() => setActiveTab('settings')} className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeTab === 'settings' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Settings size={20} /> <span className="hidden lg:inline font-bold">Ρυθμίσεις</span></button>
                        <button onClick={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); setUser(null); }} className="w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 text-red-400 hover:bg-red-900/20 transition-all"><LogOut size={20} /> <span className="hidden lg:inline font-bold">Έξοδος</span></button>
                    </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto h-screen bg-black/20">
                    {activeTab === 'home' && <GarageTab vehicles={vehicles} refreshVehicles={refreshVehicles} theme={theme} user={user} />}
                    {activeTab === 'erp' && <MiniERPTab theme={theme} user={user} />}
                    {activeTab === 'book' && <div className="h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative"><ServiceBook /></div>}
                    {activeTab === 'users' && <UsersTab theme={theme} user={user} />}
                    {activeTab === 'settings' && <SettingsTab user={user} setUser={setUser} theme={theme} />}
                    {activeTab === 'superadmin' && user.role === 'superadmin' && <SuperAdminTab user={user} theme={theme} />}
                </div>
            </div>
        </ErrorBoundary>
    );
};

// --- APP ROUTING (NEW ROOT COMPONENT) ---
function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    {/* 1. PUBLIC ROUTE: Service Book (Χωρίς Login) */}
                    <Route path="/book/:plate" element={<ServiceBook />} />

                    {/* 2. PROTECTED ROUTE: Dashboard (Με Login) */}
                    <Route path="/*" element={<AdminDashboard />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;