import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Phone, LogOut, Users, Globe, DollarSign, FileText,
  Plus, Edit, Trash2, Loader2, Check, X, Shield,
  MessageSquare, BarChart3, Clock
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [usageRecords, setUsageRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({ country: "", country_code: "", rate_per_minute: "", rate_per_sms: "", service_type: "both" });
  const [routeSaving, setRouteSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, usersRes, routesRes, invoicesRes, usageRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
        axios.get(`${API}/routes/all`, { withCredentials: true }),
        axios.get(`${API}/admin/invoices`, { withCredentials: true }),
        axios.get(`${API}/admin/usage`, { withCredentials: true }),
      ]);
      setStats(dashRes.data.stats);
      setUsers(usersRes.data);
      setRoutes(routesRes.data);
      setInvoices(invoicesRes.data);
      setUsageRecords(usageRes.data);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handleSaveRoute = async () => {
    if (!routeForm.country || !routeForm.country_code || !routeForm.rate_per_minute) {
      toast.error("Please fill all required fields"); return;
    }
    setRouteSaving(true);
    try {
      const payload = {
        country: routeForm.country, country_code: routeForm.country_code,
        rate_per_minute: parseFloat(routeForm.rate_per_minute),
        rate_per_sms: parseFloat(routeForm.rate_per_sms || "0.50"),
        service_type: routeForm.service_type,
      };
      if (editingRoute) {
        await axios.put(`${API}/routes/${editingRoute.id}`, payload, { withCredentials: true });
        toast.success("Route updated");
      } else {
        await axios.post(`${API}/routes`, payload, { withCredentials: true });
        toast.success("Route created");
      }
      setRouteDialogOpen(false); setEditingRoute(null);
      setRouteForm({ country: "", country_code: "", rate_per_minute: "", rate_per_sms: "", service_type: "both" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save route");
    } finally { setRouteSaving(false); }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Delete this route?")) return;
    try { await axios.delete(`${API}/routes/${routeId}`, { withCredentials: true }); toast.success("Route deleted"); fetchData(); }
    catch (err) { toast.error("Failed to delete route"); }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try { await axios.put(`${API}/admin/users/${userId}`, { is_activated: !currentStatus }, { withCredentials: true }); toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`); fetchData(); }
    catch (err) { toast.error("Failed to update user"); }
  };

  const openEditRoute = (route) => {
    setEditingRoute(route);
    setRouteForm({ country: route.country, country_code: route.country_code, rate_per_minute: route.rate_per_minute.toString(), rate_per_sms: (route.rate_per_sms || 0.05).toString(), service_type: route.service_type || "both" });
    setRouteDialogOpen(true);
  };

  const openNewRoute = () => {
    setEditingRoute(null);
    setRouteForm({ country: "", country_code: "", rate_per_minute: "0.35", rate_per_sms: "0.05", service_type: "both" });
    setRouteDialogOpen(true);
  };

  if (loading) {
    return (<div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" /></div>);
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#39FF14]/10 flex items-center justify-center neon-border"><Phone className="w-5 h-5 text-[#39FF14]" /></div>
            <span className="font-heading font-bold text-xl text-white">Crickeitz<span className="text-[#39FF14]"> OTP</span></span>
            <span className="ml-2 px-2 py-1 bg-[#39FF14]/10 text-[#39FF14] text-xs font-mono rounded">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-[#39FF14] text-sm font-mono flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</p>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-[#A1A1AA] hover:text-[#39FF14] hover:bg-[#39FF14]/10" data-testid="admin-logout-btn"><LogOut className="w-5 h-5" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: <DollarSign className="w-4 h-4" /> },
            { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
            { id: "routes", label: "Routes", icon: <Globe className="w-4 h-4" /> },
            { id: "invoices", label: "Invoices", icon: <FileText className="w-4 h-4" /> },
            { id: "usage", label: "Usage", icon: <BarChart3 className="w-4 h-4" /> },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-sm flex items-center gap-2 font-medium transition-all ${activeTab === tab.id ? 'bg-[#39FF14] text-black' : 'bg-[#111111] text-[#A1A1AA] hover:text-white'}`}
              data-testid={`tab-${tab.id}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6" data-testid="overview-section">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-terminal p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Total Users</span><Users className="w-5 h-5 text-[#39FF14]" /></div>
                <p className="text-3xl font-heading font-bold text-white">{stats?.total_users || 0}</p>
              </div>
              <div className="card-terminal p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Activated</span><Check className="w-5 h-5 text-[#39FF14]" /></div>
                <p className="text-3xl font-heading font-bold text-[#39FF14]">{stats?.activated_users || 0}</p>
              </div>
              <div className="card-terminal p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Revenue</span><DollarSign className="w-5 h-5 text-[#39FF14]" /></div>
                <p className="text-3xl font-heading font-bold text-[#39FF14]">${stats?.total_revenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="card-terminal p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Routes</span><Globe className="w-5 h-5 text-[#39FF14]" /></div>
                <p className="text-3xl font-heading font-bold text-white">{stats?.total_routes || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-terminal p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">VOIP Minutes</span><Phone className="w-5 h-5 text-[#39FF14]" /></div>
                <p className="text-2xl font-heading font-bold text-white">{stats?.total_minutes_used?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="card-terminal p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">SMS Sent</span><MessageSquare className="w-5 h-5 text-[#39FF14]" /></div>
                <p className="text-2xl font-heading font-bold text-white">{stats?.total_messages_sent || 0}</p>
              </div>
              <div className="card-terminal p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4"><span className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Usage Revenue</span><BarChart3 className="w-5 h-5 text-[#39FF14]" /></div>
                <p className="text-2xl font-heading font-bold text-[#39FF14]">${stats?.total_usage_revenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="card-terminal rounded-sm overflow-hidden" data-testid="users-section">
            <div className="p-6 border-b border-white/10"><h2 className="font-heading text-xl font-semibold text-white">All Users</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111111]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">User</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#111111]/50" data-testid={`user-row-${u._id}`}>
                      <td className="px-6 py-4"><p className="text-white font-medium">{u.name}</p><p className="text-[#A1A1AA] text-sm font-mono">@{u.username || 'N/A'}</p></td>
                      <td className="px-6 py-4 text-[#A1A1AA] font-mono text-sm">{u.email}</td>
                      <td className="px-6 py-4 text-[#39FF14] font-bold">${(u.credits || 0).toFixed(2)}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-mono ${u.role === 'admin' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-white/5 text-[#A1A1AA]'}`}>{u.role}</span></td>
                      <td className="px-6 py-4"><span className={`flex items-center gap-1 text-sm ${u.is_activated ? 'text-[#39FF14]' : 'text-[#FF6B6B]'}`}>{u.is_activated ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}{u.is_activated ? 'Active' : 'Pending'}</span></td>
                      <td className="px-6 py-4">
                        {u.role !== 'admin' && (
                          <Button size="sm" variant="ghost" onClick={() => handleToggleUserStatus(u._id, u.is_activated)}
                            className={u.is_activated ? 'text-[#FF6B6B] hover:bg-[#FF6B6B]/10' : 'text-[#39FF14] hover:bg-[#39FF14]/10'}
                            data-testid={`toggle-user-${u._id}`}>
                            {u.is_activated ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Routes */}
        {activeTab === "routes" && (
          <div className="card-terminal rounded-sm overflow-hidden" data-testid="routes-section">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-white">Manage Routes</h2>
              <Dialog open={routeDialogOpen} onOpenChange={setRouteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewRoute} className="btn-primary px-4 py-2 rounded-sm flex items-center gap-2" data-testid="add-route-btn"><Plus className="w-4 h-4" />Add Route</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0A0A0A] border-[#39FF14]/20">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-white">{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
                    <DialogDescription className="text-[#A1A1AA]">{editingRoute ? 'Update route details' : 'Configure the new route'}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Country</Label>
                      <Input value={routeForm.country} onChange={(e) => setRouteForm({ ...routeForm, country: e.target.value })} placeholder="United States" className="input-terminal" data-testid="route-country-input" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Country Code</Label>
                      <Input value={routeForm.country_code} onChange={(e) => setRouteForm({ ...routeForm, country_code: e.target.value.toUpperCase() })} placeholder="US" maxLength={3} className="input-terminal" data-testid="route-code-input" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Service Type</Label>
                      <Select value={routeForm.service_type} onValueChange={(val) => setRouteForm({ ...routeForm, service_type: val })}>
                        <SelectTrigger className="input-terminal" data-testid="route-service-select"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-[#39FF14]/20">
                          <SelectItem value="both">VOIP & SMS</SelectItem>
                          <SelectItem value="voip">VOIP Only</SelectItem>
                          <SelectItem value="sms">SMS Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">VOIP Rate ($/min)</Label>
                        <Input type="number" step="0.01" value={routeForm.rate_per_minute} onChange={(e) => setRouteForm({ ...routeForm, rate_per_minute: e.target.value })} placeholder="0.35" className="input-terminal" data-testid="route-rate-input" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">SMS Rate ($/msg)</Label>
                        <Input type="number" step="0.01" value={routeForm.rate_per_sms} onChange={(e) => setRouteForm({ ...routeForm, rate_per_sms: e.target.value })} placeholder="0.05" className="input-terminal" data-testid="route-sms-rate-input" />
                      </div>
                    </div>
                    <Button onClick={handleSaveRoute} disabled={routeSaving} className="btn-primary w-full py-3 rounded-sm" data-testid="save-route-btn">
                      {routeSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Route'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111111]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">VOIP Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">SMS Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-[#111111]/50" data-testid={`route-row-${route.id}`}>
                      <td className="px-6 py-4 text-white font-medium">{route.country}</td>
                      <td className="px-6 py-4 text-[#A1A1AA] font-mono">{route.country_code}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs font-mono bg-[#39FF14]/10 text-[#39FF14] uppercase">{route.service_type || 'both'}</span></td>
                      <td className="px-6 py-4 text-[#39FF14] font-bold">${route.rate_per_minute?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-[#39FF14] font-bold">${(route.rate_per_sms || 0.05).toFixed(2)}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-mono ${route.is_active ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'}`}>{route.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditRoute(route)} className="text-[#A1A1AA] hover:text-[#39FF14] hover:bg-[#39FF14]/10" data-testid={`edit-route-${route.id}`}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteRoute(route.id)} className="text-[#A1A1AA] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10" data-testid={`delete-route-${route.id}`}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices */}
        {activeTab === "invoices" && (
          <div className="card-terminal rounded-sm overflow-hidden" data-testid="invoices-section">
            <div className="p-6 border-b border-white/10"><h2 className="font-heading text-xl font-semibold text-white">All Invoices</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111111]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">User</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.length > 0 ? invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#111111]/50">
                      <td className="px-6 py-4 text-[#A1A1AA] font-mono text-sm">{inv.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-white">{inv.user_email}</td>
                      <td className="px-6 py-4 text-[#A1A1AA] capitalize">{inv.payment_type}</td>
                      <td className="px-6 py-4 text-[#39FF14] font-bold">${inv.amount.toFixed(2)}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-mono ${inv.status === 'paid' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-yellow-500/10 text-yellow-500'}`}>{inv.status}</span></td>
                      <td className="px-6 py-4 text-[#A1A1AA] text-sm">{new Date(inv.created_at).toLocaleDateString()}</td>
                    </tr>
                  )) : (<tr><td colSpan={6} className="px-6 py-12 text-center text-[#A1A1AA]">No invoices yet</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Usage */}
        {activeTab === "usage" && (
          <div className="card-terminal rounded-sm overflow-hidden" data-testid="usage-section">
            <div className="p-6 border-b border-white/10"><h2 className="font-heading text-xl font-semibold text-white">All Usage Records</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111111]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">User</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usageRecords.length > 0 ? usageRecords.map((u) => (
                    <tr key={u.id} className="hover:bg-[#111111]/50">
                      <td className="px-6 py-4 text-[#A1A1AA] text-sm font-mono">{new Date(u.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-white">{u.user_email}</td>
                      <td className="px-6 py-4 text-[#A1A1AA]">{u.country} ({u.country_code})</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-mono ${u.service_type === 'voip' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{u.service_type === 'voip' ? 'VOIP' : 'SMS'}</span></td>
                      <td className="px-6 py-4 text-white font-mono">{u.quantity_label || (u.service_type === 'voip' ? `${u.minutes?.toFixed(2)} min` : `${u.messages} msgs`)}</td>
                      <td className="px-6 py-4 text-[#39FF14] font-bold">${u.cost?.toFixed(2)}</td>
                    </tr>
                  )) : (<tr><td colSpan={6} className="px-6 py-12 text-center text-[#A1A1AA]">No usage records yet</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="https://instagram.com/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] transition-colors text-sm">Instagram @Crickeitz</a>
            <a href="https://t.me/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] transition-colors text-sm">Telegram @Crickeitz</a>
          </div>
          <p className="text-[#A1A1AA] text-sm">Made By: <span className="text-[#39FF14] font-semibold">Crickeitz</span></p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
