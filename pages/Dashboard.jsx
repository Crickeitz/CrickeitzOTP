import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Phone, LogOut, CreditCard, FileText, BarChart3,
  Globe, Zap, Clock, Loader2, Bitcoin, AlertCircle,
  Plus, MessageSquare, Send, Wallet, Download, PieChart,
  Key, CalendarClock, BookText, Trash2, Play, Pause, Copy, Check
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const CHART_COLORS = ["#39FF14", "#00BFFF", "#FF6B6B", "#FFD700"];

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [smsHistory, setSmsHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Dialog states
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("25");
  const [topupLoading, setTopupLoading] = useState(false);

  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [usageForm, setUsageForm] = useState({ route_id: "", service_type: "voip", minutes: "", messages: "" });
  const [usageLoading, setUsageLoading] = useState(false);

  const [bulkForm, setBulkForm] = useState({ route_id: "", recipients: "", message_text: "" });
  const [bulkLoading, setBulkLoading] = useState(false);

  const [templateForm, setTemplateForm] = useState({ name: "", message_text: "" });
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);

  const [campaignForm, setCampaignForm] = useState({ route_id: "", recipients: "", message_text: "", scheduled_at: "", recurrence: "none" });
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaignSaving, setCampaignSaving] = useState(false);

  const [copiedKey, setCopiedKey] = useState(null);
  const [newKey, setNewKey] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, routesRes] = await Promise.all([
        axios.get(`${API}/user/dashboard`, { withCredentials: true }),
        axios.get(`${API}/routes`, { withCredentials: true })
      ]);
      setDashboardData(dashRes.data);
      setRoutes(routesRes.data);
      try {
        const [analyticsRes, smsRes, tmplRes, campRes, keysRes] = await Promise.all([
          axios.get(`${API}/analytics/usage`, { withCredentials: true }),
          axios.get(`${API}/sms/history`, { withCredentials: true }),
          axios.get(`${API}/templates`, { withCredentials: true }),
          axios.get(`${API}/campaigns`, { withCredentials: true }),
          axios.get(`${API}/apikeys`, { withCredentials: true }),
        ]);
        setAnalytics(analyticsRes.data);
        setSmsHistory(smsRes.data);
        setTemplates(tmplRes.data);
        setCampaigns(campRes.data);
        setApiKeys(keysRes.data);
      } catch {}
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleLogout = async () => { await logout(); navigate("/"); };

  // Payment
  const handleTopup = async () => {
    setTopupLoading(true);
    try {
      const { data } = await axios.post(`${API}/payments/checkout`, { payment_type: "topup", origin_url: window.location.origin, topup_package: selectedPackage }, { withCredentials: true });
      if (data.url) window.location.href = data.url;
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
    finally { setTopupLoading(false); }
  };

  // Usage
  const handleRecordUsage = async () => {
    if (!usageForm.route_id) { toast.error("Select a route"); return; }
    const payload = { route_id: usageForm.route_id, service_type: usageForm.service_type };
    if (usageForm.service_type === "voip") {
      if (!usageForm.minutes || parseFloat(usageForm.minutes) <= 0) { toast.error("Enter valid minutes"); return; }
      payload.minutes = parseFloat(usageForm.minutes);
    } else {
      if (!usageForm.messages || parseInt(usageForm.messages) <= 0) { toast.error("Enter valid count"); return; }
      payload.messages = parseInt(usageForm.messages);
    }
    setUsageLoading(true);
    try {
      const { data } = await axios.post(`${API}/usage/record`, payload, { withCredentials: true });
      toast.success(`Recorded! Cost: $${data.cost.toFixed(2)}`);
      setUsageDialogOpen(false); fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
    finally { setUsageLoading(false); }
  };

  // Bulk SMS
  const handleBulkSms = async () => {
    if (!bulkForm.route_id || !bulkForm.recipients.trim() || !bulkForm.message_text.trim()) { toast.error("Fill all fields"); return; }
    const recipients = bulkForm.recipients.split("\n").map(r => r.trim()).filter(r => r);
    setBulkLoading(true);
    try {
      const { data } = await axios.post(`${API}/sms/bulk`, { route_id: bulkForm.route_id, recipients, message_text: bulkForm.message_text }, { withCredentials: true });
      toast.success(`Sent ${data.total_messages} SMS! Cost: $${data.total_cost.toFixed(2)}`);
      setBulkForm({ route_id: "", recipients: "", message_text: "" }); fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
    finally { setBulkLoading(false); }
  };

  // Templates
  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.message_text.trim()) { toast.error("Fill all fields"); return; }
    setTemplateSaving(true);
    try {
      await axios.post(`${API}/templates`, templateForm, { withCredentials: true });
      toast.success("Template saved"); setTemplateDialogOpen(false); setTemplateForm({ name: "", message_text: "" }); fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
    finally { setTemplateSaving(false); }
  };

  const handleDeleteTemplate = async (id) => {
    try { await axios.delete(`${API}/templates/${id}`, { withCredentials: true }); toast.success("Deleted"); fetchDashboard(); }
    catch { toast.error("Failed"); }
  };

  const loadTemplate = (tmpl) => {
    setBulkForm(prev => ({ ...prev, message_text: tmpl.message_text }));
    setActiveTab("bulk-sms");
    toast.success(`Template "${tmpl.name}" loaded`);
  };

  // Campaigns
  const handleCreateCampaign = async () => {
    if (!campaignForm.route_id || !campaignForm.recipients.trim() || !campaignForm.message_text.trim() || !campaignForm.scheduled_at) {
      toast.error("Fill all fields"); return;
    }
    const recipients = campaignForm.recipients.split("\n").map(r => r.trim()).filter(r => r);
    setCampaignSaving(true);
    try {
      await axios.post(`${API}/campaigns`, { ...campaignForm, recipients, scheduled_at: new Date(campaignForm.scheduled_at).toISOString() }, { withCredentials: true });
      toast.success("Campaign scheduled"); setCampaignDialogOpen(false); setCampaignForm({ route_id: "", recipients: "", message_text: "", scheduled_at: "", recurrence: "none" }); fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
    finally { setCampaignSaving(false); }
  };

  const handleToggleCampaign = async (id, currentActive) => {
    try { await axios.put(`${API}/campaigns/${id}`, { is_active: !currentActive }, { withCredentials: true }); toast.success(currentActive ? "Paused" : "Resumed"); fetchDashboard(); }
    catch { toast.error("Failed"); }
  };

  const handleRunCampaign = async (id) => {
    try {
      const { data } = await axios.post(`${API}/campaigns/${id}/run`, {}, { withCredentials: true });
      toast.success(`Sent ${data.messages_sent} SMS! Cost: $${data.cost.toFixed(2)}`); fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDeleteCampaign = async (id) => {
    try { await axios.delete(`${API}/campaigns/${id}`, { withCredentials: true }); toast.success("Deleted"); fetchDashboard(); }
    catch { toast.error("Failed"); }
  };

  // API Keys
  const handleGenerateKey = async () => {
    try {
      const { data } = await axios.post(`${API}/apikeys/generate`, {}, { withCredentials: true });
      setNewKey(data.key); toast.success("API key generated"); fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleRevokeKey = async (id) => {
    try { await axios.delete(`${API}/apikeys/${id}`, { withCredentials: true }); toast.success("Revoked"); setNewKey(null); fetchDashboard(); }
    catch { toast.error("Failed"); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text); setCopiedKey(id); setTimeout(() => setCopiedKey(null), 2000);
  };

  // Invoice PDF
  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await axios.get(`${API}/invoices/${invoiceId}/pdf`, { withCredentials: true, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a"); link.href = url;
      link.setAttribute("download", `crickeitz_invoice_${invoiceId.slice(0, 8)}.pdf`);
      document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
    } catch { toast.error("Failed to download"); }
  };

  if (loading) return (<div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" /></div>);

  const isActivated = dashboardData?.user?.is_activated;
  const credits = dashboardData?.user?.credits || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="bg-[#111111] border border-[#39FF14]/30 p-3 rounded-sm text-sm">
        <p className="text-[#A1A1AA] font-mono">{label}</p>
        {payload.map((p, i) => (<p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {typeof p.value === 'number' ? (p.name.includes('$') || p.name === 'Cost' ? `$${p.value.toFixed(2)}` : p.value.toFixed(2)) : p.value}</p>))}
      </div>
    );
    return null;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <PieChart className="w-4 h-4" /> },
    { id: "bulk-sms", label: "Bulk SMS", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "templates", label: "Templates", icon: <BookText className="w-4 h-4" /> },
    { id: "campaigns", label: "Campaigns", icon: <CalendarClock className="w-4 h-4" /> },
    { id: "usage", label: "Usage", icon: <Clock className="w-4 h-4" /> },
    { id: "invoices", label: "Invoices", icon: <FileText className="w-4 h-4" /> },
    { id: "api-keys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#39FF14]/10 flex items-center justify-center neon-border"><Phone className="w-5 h-5 text-[#39FF14]" /></div>
            <span className="font-heading font-bold text-xl text-white">Crickeitz<span className="text-[#39FF14]"> OTP</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block"><p className="text-white font-medium">{user?.name}</p><p className="text-[#A1A1AA] text-sm font-mono">@{user?.username}</p></div>
            <Button onClick={handleLogout} variant="ghost" className="text-[#A1A1AA] hover:text-[#39FF14] hover:bg-[#39FF14]/10" data-testid="logout-btn"><LogOut className="w-5 h-5" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isActivated && (
          <div className="card-terminal p-6 rounded-sm mb-8 border-[#39FF14]/50" data-testid="activation-banner">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded bg-[#39FF14]/10 flex items-center justify-center shrink-0"><AlertCircle className="w-6 h-6 text-[#39FF14]" /></div>
                <div><h3 className="font-heading text-lg font-semibold text-white mb-1">Account Not Activated</h3><p className="text-[#A1A1AA]">Contact us to pay the <span className="text-[#39FF14] font-bold">$100</span> activation fee.</p></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a href="https://instagram.com/Crickeitz" target="_blank" rel="noopener noreferrer"><Button className="btn-primary px-6 py-4 rounded-sm w-full" data-testid="activate-instagram-btn">Instagram @Crickeitz</Button></a>
                <a href="https://t.me/Crickeitz" target="_blank" rel="noopener noreferrer"><Button className="btn-secondary px-6 py-4 rounded-sm w-full" data-testid="activate-telegram-btn">Telegram @Crickeitz</Button></a>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-sm flex items-center gap-2 font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#39FF14] text-black' : 'bg-[#111111] text-[#A1A1AA] hover:text-white'}`}
              data-testid={`tab-${tab.id}`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (<>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Status", icon: <Zap className="w-5 h-5 text-[#39FF14]" />, value: isActivated ? 'Active' : 'Pending', color: isActivated ? 'text-[#39FF14]' : 'text-[#FF6B6B]' },
              { label: "Credits", icon: <Wallet className="w-5 h-5 text-[#39FF14]" />, value: `$${credits.toFixed(2)}`, color: 'text-[#39FF14]' },
              { label: "Minutes", icon: <Phone className="w-5 h-5 text-[#39FF14]" />, value: dashboardData?.stats?.total_minutes?.toFixed(2) || '0.00', color: 'text-white' },
              { label: "Messages", icon: <MessageSquare className="w-5 h-5 text-[#39FF14]" />, value: dashboardData?.stats?.total_messages || 0, color: 'text-white' },
            ].map((s,i) => (
              <div key={i} className="card-terminal p-6 rounded-sm" data-testid={`stat-${s.label.toLowerCase()}`}>
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">{s.label}</span>{s.icon}</div>
                <p className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {isActivated && (
            <div className="flex flex-wrap gap-4 mb-8">
              <Dialog open={topupDialogOpen} onOpenChange={setTopupDialogOpen}>
                <DialogTrigger asChild><Button className="btn-primary px-6 py-4 rounded-sm flex items-center gap-2" data-testid="topup-btn"><Plus className="w-5 h-5" /> Top Up</Button></DialogTrigger>
                <DialogContent className="bg-[#0A0A0A] border-[#39FF14]/20">
                  <DialogHeader><DialogTitle className="font-heading text-white">Top Up Credits</DialogTitle><DialogDescription className="text-[#A1A1AA]">Choose a package</DialogDescription></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {["10","25","50","100"].map((p) => (
                        <button key={p} onClick={() => setSelectedPackage(p)} data-testid={`topup-pkg-${p}`}
                          className={`p-4 rounded-sm border text-center transition-all ${selectedPackage === p ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]' : 'border-white/10 bg-[#111111] text-[#A1A1AA]'}`}>
                          <p className="text-2xl font-heading font-bold">${p}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-[#111111] rounded-sm"><CreditCard className="w-5 h-5 text-[#39FF14]" /><span className="text-[#A1A1AA] text-sm">Card + </span><Bitcoin className="w-5 h-5 text-[#39FF14]" /><span className="text-[#A1A1AA] text-sm">Crypto</span></div>
                    <Button onClick={handleTopup} disabled={topupLoading} className="btn-primary w-full py-4 rounded-sm" data-testid="topup-confirm-btn">{topupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${selectedPackage}.00`}</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
                <DialogTrigger asChild><Button className="btn-secondary px-6 py-4 rounded-sm flex items-center gap-2" data-testid="record-usage-btn"><Send className="w-5 h-5" /> Record Usage</Button></DialogTrigger>
                <DialogContent className="bg-[#0A0A0A] border-[#39FF14]/20">
                  <DialogHeader><DialogTitle className="font-heading text-white">Record Usage</DialogTitle><DialogDescription className="text-[#A1A1AA]">Log usage</DialogDescription></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Select value={usageForm.service_type} onValueChange={(v) => setUsageForm({...usageForm, service_type: v})}><SelectTrigger className="input-terminal" data-testid="usage-service-select"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0A0A0A] border-[#39FF14]/20"><SelectItem value="voip">VOIP</SelectItem><SelectItem value="sms">SMS</SelectItem></SelectContent></Select>
                    <Select value={usageForm.route_id} onValueChange={(v) => setUsageForm({...usageForm, route_id: v})}><SelectTrigger className="input-terminal" data-testid="usage-route-select"><SelectValue placeholder="Route" /></SelectTrigger><SelectContent className="bg-[#0A0A0A] border-[#39FF14]/20">{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.country}</SelectItem>)}</SelectContent></Select>
                    {usageForm.service_type === "voip" ? <Input type="number" step="0.01" value={usageForm.minutes} onChange={(e) => setUsageForm({...usageForm, minutes: e.target.value})} placeholder="Minutes" className="input-terminal" data-testid="usage-minutes-input" />
                    : <Input type="number" value={usageForm.messages} onChange={(e) => setUsageForm({...usageForm, messages: e.target.value})} placeholder="Messages" className="input-terminal" data-testid="usage-messages-input" />}
                    <p className="text-[#A1A1AA] text-xs font-mono">Credits: <span className="text-[#39FF14]">${credits.toFixed(2)}</span></p>
                    <Button onClick={handleRecordUsage} disabled={usageLoading} className="btn-primary w-full py-4 rounded-sm" data-testid="usage-submit-btn">{usageLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Record"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="card-terminal p-6 rounded-sm" data-testid="routes-section">
            <div className="flex items-center justify-between mb-6"><h2 className="font-heading text-xl font-semibold text-white">Routes</h2><Globe className="w-5 h-5 text-[#39FF14]" /></div>
            <div className="space-y-4">
              {routes.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-[#111111] rounded-sm border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-[#39FF14]/10 flex items-center justify-center text-lg">{r.country_code==='US'?'\u{1F1FA}\u{1F1F8}':r.country_code==='UK'?'\u{1F1EC}\u{1F1E7}':'\u{1F1E8}\u{1F1E6}'}</div>
                    <div><p className="text-white font-medium">{r.country}</p><p className="text-[#A1A1AA] text-sm font-mono">{r.country_code}</p></div>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div><p className="text-[#39FF14] font-bold">${r.rate_per_minute?.toFixed(2)}</p><p className="text-[#A1A1AA] text-xs">/min</p></div>
                    <div><p className="text-[#39FF14] font-bold">${r.rate_per_sms?.toFixed(2)}</p><p className="text-[#A1A1AA] text-xs">/msg</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8" data-testid="analytics-section">
            <div className="card-terminal p-6 rounded-sm">
              <h2 className="font-heading text-xl font-semibold text-white mb-6">Daily Usage (30 Days)</h2>
              {analytics?.daily?.length > 0 ? (<ResponsiveContainer width="100%" height={300}><AreaChart data={analytics.daily}><CartesianGrid strokeDasharray="3 3" stroke="#222" /><XAxis dataKey="date" stroke="#A1A1AA" tick={{fontSize:11}} tickFormatter={v=>v.slice(5)} /><YAxis stroke="#A1A1AA" tick={{fontSize:11}} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="voip_minutes" name="VOIP Min" stroke="#39FF14" fill="#39FF14" fillOpacity={0.1} /><Area type="monotone" dataKey="sms_messages" name="SMS Msgs" stroke="#00BFFF" fill="#00BFFF" fillOpacity={0.1} /></AreaChart></ResponsiveContainer>) : <p className="text-[#A1A1AA] text-center py-12">No data yet</p>}
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card-terminal p-6 rounded-sm">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">By Country</h2>
                {analytics?.by_country?.length > 0 ? (<ResponsiveContainer width="100%" height={250}><RechartsPie><Pie data={analytics.by_country} dataKey="cost" nameKey="country" cx="50%" cy="50%" outerRadius={90} label={({name,value})=>`${name}: $${value.toFixed(2)}`}>{analytics.by_country.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}</Pie><Tooltip /><Legend /></RechartsPie></ResponsiveContainer>) : <p className="text-[#A1A1AA] text-center py-12">No data</p>}
              </div>
              <div className="card-terminal p-6 rounded-sm">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">Daily Cost</h2>
                {analytics?.daily?.length > 0 ? (<ResponsiveContainer width="100%" height={250}><BarChart data={analytics.daily}><CartesianGrid strokeDasharray="3 3" stroke="#222" /><XAxis dataKey="date" stroke="#A1A1AA" tick={{fontSize:11}} tickFormatter={v=>v.slice(5)} /><YAxis stroke="#A1A1AA" tickFormatter={v=>`$${v}`} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="cost" name="Cost" fill="#39FF14" radius={[2,2,0,0]} /></BarChart></ResponsiveContainer>) : <p className="text-[#A1A1AA] text-center py-12">No data</p>}
              </div>
            </div>
          </div>
        )}

        {/* BULK SMS */}
        {activeTab === "bulk-sms" && (
          <div className="space-y-8" data-testid="bulk-sms-section">
            <div className="card-terminal p-6 rounded-sm">
              <h2 className="font-heading text-xl font-semibold text-white mb-6">Send Bulk SMS</h2>
              {!isActivated ? <p className="text-[#A1A1AA] text-center py-8">Activate to use bulk SMS</p> : (
                <div className="space-y-5">
                  <Select value={bulkForm.route_id} onValueChange={v => setBulkForm({...bulkForm, route_id: v})}><SelectTrigger className="input-terminal" data-testid="bulk-route-select"><SelectValue placeholder="Select route" /></SelectTrigger><SelectContent className="bg-[#0A0A0A] border-[#39FF14]/20">{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.country} - ${r.rate_per_sms?.toFixed(2)}/msg</SelectItem>)}</SelectContent></Select>
                  <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Recipients (one per line)</Label><Textarea value={bulkForm.recipients} onChange={e => setBulkForm({...bulkForm, recipients: e.target.value})} placeholder={"+1234567890\n+1987654321"} className="input-terminal min-h-[100px] font-mono text-sm" data-testid="bulk-recipients-input" /><p className="text-[#A1A1AA] text-xs font-mono">{bulkForm.recipients.split("\n").filter(r=>r.trim()).length} recipients</p></div>
                  <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Message</Label><Textarea value={bulkForm.message_text} onChange={e => setBulkForm({...bulkForm, message_text: e.target.value})} placeholder="Enter message..." className="input-terminal min-h-[80px]" data-testid="bulk-message-input" /></div>
                  <div className="p-4 bg-[#111111] rounded-sm flex justify-between"><div><p className="text-[#A1A1AA] text-sm">Est. cost:</p><p className="text-[#39FF14] text-xl font-heading font-bold">${(bulkForm.recipients.split("\n").filter(r=>r.trim()).length*(routes.find(r=>r.id===bulkForm.route_id)?.rate_per_sms||0.05)).toFixed(2)}</p></div><p className="text-[#A1A1AA] text-sm">Credits: <span className="text-[#39FF14] font-bold">${credits.toFixed(2)}</span></p></div>
                  <Button onClick={handleBulkSms} disabled={bulkLoading} className="btn-primary w-full py-4 rounded-sm text-lg" data-testid="bulk-send-btn">{bulkLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" />Send</>}</Button>
                </div>
              )}
            </div>
            <div className="card-terminal rounded-sm overflow-hidden">
              <div className="p-6 border-b border-white/10"><h2 className="font-heading text-xl font-semibold text-white">Bulk SMS History</h2></div>
              <div className="overflow-x-auto"><table className="w-full"><thead className="bg-[#111111]"><tr><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Date</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Route</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Msgs</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Cost</th></tr></thead><tbody className="divide-y divide-white/5">
                {smsHistory.length > 0 ? smsHistory.map(j => (<tr key={j.id} className="hover:bg-[#111111]/50"><td className="px-6 py-4 text-[#A1A1AA] text-sm font-mono">{new Date(j.created_at).toLocaleString()}</td><td className="px-6 py-4 text-white">{j.country}</td><td className="px-6 py-4 text-white font-mono">{j.total_messages}</td><td className="px-6 py-4 text-[#39FF14] font-bold">${j.total_cost?.toFixed(2)}</td></tr>))
                : <tr><td colSpan={4} className="px-6 py-12 text-center text-[#A1A1AA]">No jobs yet</td></tr>}
              </tbody></table></div>
            </div>
          </div>
        )}

        {/* TEMPLATES */}
        {activeTab === "templates" && (
          <div className="space-y-8" data-testid="templates-section">
            <div className="card-terminal p-6 rounded-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-white">Message Templates</h2>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild><Button className="btn-primary px-4 py-2 rounded-sm flex items-center gap-2" data-testid="add-template-btn"><Plus className="w-4 h-4" />New Template</Button></DialogTrigger>
                  <DialogContent className="bg-[#0A0A0A] border-[#39FF14]/20">
                    <DialogHeader><DialogTitle className="font-heading text-white">Create Template</DialogTitle><DialogDescription className="text-[#A1A1AA]">Save a reusable message template</DialogDescription></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Template Name</Label><Input value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} placeholder="e.g. Welcome Message" className="input-terminal" data-testid="template-name-input" /></div>
                      <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Message Text</Label><Textarea value={templateForm.message_text} onChange={e => setTemplateForm({...templateForm, message_text: e.target.value})} placeholder="Enter template message..." className="input-terminal min-h-[120px]" data-testid="template-message-input" /><p className="text-[#A1A1AA] text-xs font-mono">{templateForm.message_text.length} chars</p></div>
                      <Button onClick={handleSaveTemplate} disabled={templateSaving} className="btn-primary w-full py-3 rounded-sm" data-testid="save-template-btn">{templateSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Template"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                {templates.length > 0 ? templates.map(t => (
                  <div key={t.id} className="p-4 bg-[#111111] rounded-sm border border-white/5" data-testid={`template-${t.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold">{t.name}</h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => loadTemplate(t)} className="text-[#39FF14] hover:bg-[#39FF14]/10" data-testid={`use-template-${t.id}`}><Send className="w-4 h-4 mr-1" />Use</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(t.id)} className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10" data-testid={`delete-template-${t.id}`}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <p className="text-[#A1A1AA] text-sm whitespace-pre-wrap">{t.message_text}</p>
                    <p className="text-[#555] text-xs font-mono mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                )) : <p className="text-[#A1A1AA] text-center py-12">No templates yet. Create one to speed up your SMS sends.</p>}
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <div className="space-y-8" data-testid="campaigns-section">
            <div className="card-terminal p-6 rounded-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-white">SMS Campaigns</h2>
                <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
                  <DialogTrigger asChild><Button className="btn-primary px-4 py-2 rounded-sm flex items-center gap-2" data-testid="add-campaign-btn"><Plus className="w-4 h-4" />New Campaign</Button></DialogTrigger>
                  <DialogContent className="bg-[#0A0A0A] border-[#39FF14]/20 max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-heading text-white">Schedule Campaign</DialogTitle><DialogDescription className="text-[#A1A1AA]">Create a scheduled or recurring SMS campaign</DialogDescription></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Select value={campaignForm.route_id} onValueChange={v => setCampaignForm({...campaignForm, route_id: v})}><SelectTrigger className="input-terminal" data-testid="campaign-route-select"><SelectValue placeholder="Route" /></SelectTrigger><SelectContent className="bg-[#0A0A0A] border-[#39FF14]/20">{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.country} - ${r.rate_per_sms?.toFixed(2)}/msg</SelectItem>)}</SelectContent></Select>
                      <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Schedule Date & Time</Label><Input type="datetime-local" value={campaignForm.scheduled_at} onChange={e => setCampaignForm({...campaignForm, scheduled_at: e.target.value})} className="input-terminal" data-testid="campaign-schedule-input" /></div>
                      <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Recurrence</Label>
                        <Select value={campaignForm.recurrence} onValueChange={v => setCampaignForm({...campaignForm, recurrence: v})}><SelectTrigger className="input-terminal" data-testid="campaign-recurrence-select"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0A0A0A] border-[#39FF14]/20"><SelectItem value="none">One-time</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select>
                      </div>
                      <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Recipients (one per line)</Label><Textarea value={campaignForm.recipients} onChange={e => setCampaignForm({...campaignForm, recipients: e.target.value})} placeholder={"+1234567890\n+1987654321"} className="input-terminal min-h-[80px] font-mono text-sm" data-testid="campaign-recipients-input" /></div>
                      <div className="space-y-2"><Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Message</Label><Textarea value={campaignForm.message_text} onChange={e => setCampaignForm({...campaignForm, message_text: e.target.value})} placeholder="Message..." className="input-terminal min-h-[80px]" data-testid="campaign-message-input" /></div>
                      <Button onClick={handleCreateCampaign} disabled={campaignSaving} className="btn-primary w-full py-3 rounded-sm" data-testid="save-campaign-btn">{campaignSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Schedule Campaign"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto"><table className="w-full"><thead className="bg-[#111111]"><tr>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Route</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Recurrence</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Recipients</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Est. Cost</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Runs</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Actions</th>
              </tr></thead><tbody className="divide-y divide-white/5">
                {campaigns.length > 0 ? campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-[#111111]/50" data-testid={`campaign-row-${c.id}`}>
                    <td className="px-4 py-4 text-white">{c.country}</td>
                    <td className="px-4 py-4 text-[#A1A1AA] text-sm font-mono">{new Date(c.scheduled_at).toLocaleString()}</td>
                    <td className="px-4 py-4"><span className="px-2 py-1 rounded text-xs font-mono bg-[#39FF14]/10 text-[#39FF14] capitalize">{c.recurrence}</span></td>
                    <td className="px-4 py-4 text-white font-mono">{c.recipients_count}</td>
                    <td className="px-4 py-4 text-[#39FF14] font-bold">${c.estimated_cost?.toFixed(2)}</td>
                    <td className="px-4 py-4"><span className={`px-2 py-1 rounded text-xs font-mono ${c.status==='scheduled'?'bg-blue-500/10 text-blue-400':c.status==='paused'?'bg-yellow-500/10 text-yellow-400':'bg-[#39FF14]/10 text-[#39FF14]'}`}>{c.status}</span></td>
                    <td className="px-4 py-4 text-white font-mono">{c.runs_completed}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleRunCampaign(c.id)} className="text-[#39FF14] hover:bg-[#39FF14]/10" title="Run now" data-testid={`run-campaign-${c.id}`}><Play className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleCampaign(c.id, c.is_active)} className="text-[#A1A1AA] hover:bg-white/10" title={c.is_active?"Pause":"Resume"} data-testid={`toggle-campaign-${c.id}`}>{c.is_active?<Pause className="w-4 h-4" />:<Play className="w-4 h-4" />}</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCampaign(c.id)} className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10" data-testid={`delete-campaign-${c.id}`}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={8} className="px-6 py-12 text-center text-[#A1A1AA]">No campaigns yet</td></tr>}
              </tbody></table></div>
            </div>
          </div>
        )}

        {/* USAGE */}
        {activeTab === "usage" && (
          <div className="card-terminal rounded-sm overflow-hidden" data-testid="usage-history-section">
            <div className="p-6 border-b border-white/10"><h2 className="font-heading text-xl font-semibold text-white">Usage History</h2></div>
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-[#111111]"><tr><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Date</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Route</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Type</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Qty</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Cost</th></tr></thead><tbody className="divide-y divide-white/5">
              {dashboardData?.usage?.length > 0 ? dashboardData.usage.map(u => (
                <tr key={u.id} className="hover:bg-[#111111]/50"><td className="px-6 py-4 text-[#A1A1AA] text-sm font-mono">{new Date(u.created_at).toLocaleString()}</td><td className="px-6 py-4 text-white">{u.country}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-mono ${u.service_type==='voip'?'bg-blue-500/10 text-blue-400':'bg-purple-500/10 text-purple-400'}`}>{u.service_type==='voip'?'VOIP':'SMS'}</span></td><td className="px-6 py-4 text-white font-mono">{u.quantity_label}</td><td className="px-6 py-4 text-[#39FF14] font-bold">${u.cost?.toFixed(2)}</td></tr>
              )) : <tr><td colSpan={5} className="px-6 py-12 text-center text-[#A1A1AA]">No records</td></tr>}
            </tbody></table></div>
          </div>
        )}

        {/* INVOICES */}
        {activeTab === "invoices" && (
          <div className="card-terminal rounded-sm overflow-hidden" data-testid="invoices-section">
            <div className="p-6 border-b border-white/10"><h2 className="font-heading text-xl font-semibold text-white">Invoices</h2></div>
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-[#111111]"><tr><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Date</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Type</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Amount</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Status</th><th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">PDF</th></tr></thead><tbody className="divide-y divide-white/5">
              {dashboardData?.invoices?.length > 0 ? dashboardData.invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-[#111111]/50"><td className="px-6 py-4 text-[#A1A1AA] text-sm font-mono">{new Date(inv.created_at).toLocaleDateString()}</td><td className="px-6 py-4 text-white capitalize">{inv.payment_type}</td><td className="px-6 py-4 text-[#39FF14] font-bold">${inv.amount.toFixed(2)}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-mono ${inv.status==='paid'?'bg-[#39FF14]/10 text-[#39FF14]':'bg-yellow-500/10 text-yellow-500'}`}>{inv.status}</span></td><td className="px-6 py-4"><Button size="sm" variant="ghost" onClick={()=>handleDownloadInvoice(inv.id)} className="text-[#39FF14] hover:bg-[#39FF14]/10" data-testid={`download-invoice-${inv.id}`}><Download className="w-4 h-4 mr-1" />PDF</Button></td></tr>
              )) : <tr><td colSpan={5} className="px-6 py-12 text-center text-[#A1A1AA]">No invoices</td></tr>}
            </tbody></table></div>
          </div>
        )}

        {/* API KEYS */}
        {activeTab === "api-keys" && (
          <div className="space-y-8" data-testid="api-keys-section">
            <div className="card-terminal p-6 rounded-sm">
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="font-heading text-xl font-semibold text-white">API Keys</h2><p className="text-[#A1A1AA] text-sm mt-1">Use API keys for programmatic VOIP/SMS access</p></div>
                <Button onClick={handleGenerateKey} className="btn-primary px-4 py-2 rounded-sm flex items-center gap-2" data-testid="generate-key-btn" disabled={!isActivated}><Key className="w-4 h-4" />Generate Key</Button>
              </div>

              {newKey && (
                <div className="p-4 bg-[#111111] rounded-sm border border-[#39FF14]/30 mb-6" data-testid="new-key-banner">
                  <p className="text-[#39FF14] font-semibold mb-2">New API Key Generated - Copy it now! It won't be shown again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black p-3 rounded font-mono text-sm text-[#39FF14] break-all">{newKey}</code>
                    <Button size="sm" onClick={() => copyToClipboard(newKey, 'new')} className="btn-secondary px-3 py-2" data-testid="copy-new-key-btn">
                      {copiedKey === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {apiKeys.length > 0 ? apiKeys.map(k => (
                  <div key={k.id} className="flex items-center justify-between p-4 bg-[#111111] rounded-sm border border-white/5" data-testid={`api-key-${k.id}`}>
                    <div>
                      <p className="text-white font-medium font-mono">{k.key_prefix}...****</p>
                      <p className="text-[#A1A1AA] text-xs">Created {new Date(k.created_at).toLocaleDateString()} {k.last_used ? `| Last used ${new Date(k.last_used).toLocaleDateString()}` : '| Never used'}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRevokeKey(k.id)} className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10" data-testid={`revoke-key-${k.id}`}><Trash2 className="w-4 h-4 mr-1" />Revoke</Button>
                  </div>
                )) : <p className="text-[#A1A1AA] text-center py-8">No API keys. Generate one to start programmatic access.</p>}
              </div>
            </div>

            {/* API Docs */}
            <div className="card-terminal p-6 rounded-sm">
              <h2 className="font-heading text-xl font-semibold text-white mb-6">API Documentation</h2>
              <div className="space-y-4">
                {[
                  { method: "GET", path: "/api/v1/routes", desc: "List available routes" },
                  { method: "GET", path: "/api/v1/balance", desc: "Check credit balance" },
                  { method: "POST", path: "/api/v1/sms/send", desc: "Send SMS (body: {route_id, recipients[], message_text})" },
                ].map((ep, i) => (
                  <div key={i} className="p-4 bg-[#111111] rounded-sm border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${ep.method==='GET'?'bg-blue-500/10 text-blue-400':'bg-[#39FF14]/10 text-[#39FF14]'}`}>{ep.method}</span>
                      <code className="text-white font-mono text-sm">{ep.path}</code>
                    </div>
                    <p className="text-[#A1A1AA] text-sm">{ep.desc}</p>
                  </div>
                ))}
                <div className="p-4 bg-[#111111] rounded-sm border border-white/5">
                  <p className="text-[#A1A1AA] text-sm mb-2">Authentication: Pass your API key in the <code className="text-[#39FF14]">X-API-Key</code> header</p>
                  <code className="text-[#39FF14] font-mono text-sm block bg-black p-3 rounded">curl -H "X-API-Key: YOUR_KEY" {BACKEND_URL}/api/v1/balance</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="https://instagram.com/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] text-sm">Instagram @Crickeitz</a>
            <a href="https://t.me/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] text-sm">Telegram @Crickeitz</a>
          </div>
          <p className="text-[#A1A1AA] text-sm">Made By: <span className="text-[#39FF14] font-semibold">Crickeitz</span></p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
