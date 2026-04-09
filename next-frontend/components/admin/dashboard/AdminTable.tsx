'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Briefcase, 
  Check, 
  X, 
  Edit2, 
  Mail, 
  User,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminUser, Department } from '@/types/admin';

interface AdminTableProps {
  admins: AdminUser[];
  departments: Department[];
  loading: boolean;
  onUpdate: (uid: string, data: Partial<AdminUser>) => Promise<void>;
}

export function AdminTable({ admins, departments, loading, onUpdate }: AdminTableProps) {
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AdminUser>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEdit = (admin: AdminUser) => {
    setEditingAdmin(admin.uid);
    setEditFormData({
      role: admin.role,
      department: admin.department,
      status: admin.status,
    });
  };

  const cancelEdit = () => {
    setEditingAdmin(null);
    setEditFormData({});
  };

  const handleSave = async (uid: string) => {
    setIsSubmitting(true);
    try {
      await onUpdate(uid, editFormData);
      setEditingAdmin(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 font-medium">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        Processing secure data...
      </div>
    );
  }

  if (admins.length === 0) {
    return <div className="py-20 text-center text-gray-500 border-2 border-dashed border-gray-100 rounded-3xl m-6 font-medium">No administrators found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Access Role</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">System Status</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Control</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {admins.map((admin) => (
            <tr key={admin.uid} className="hover:bg-gray-50/80 transition-colors group">
              <td className="py-5 px-8">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ring-4 ring-white ${
                    admin.role === 'super-admin' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-blue-500 shadow-blue-200'
                  }`}>
                    {admin.firstName?.[0]}{admin.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 flex items-center gap-1.5 uppercase tracking-tight text-sm">
                      {admin.firstName} {admin.lastName}
                    </div>
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                      <Mail size={12} className="text-gray-400" />
                      {admin.email}
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-5 px-8">
                {editingAdmin === admin.uid ? (
                  <select
                    className="w-full py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-black"
                    value={editFormData.role || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                  >
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border ${
                    admin.role === 'super-admin'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      : admin.role === 'agent'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {admin.role === 'super-admin' && <Shield className="w-3 h-3 mr-1.5" />}
                    {admin.role || "N/A"}
                  </span>
                )}
              </td>

              <td className="py-5 px-8">
                {editingAdmin === admin.uid ? (
                  <select
                    className="w-full py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-black"
                    value={editFormData.department || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  >
                    <option value="">Global/None</option>
                    {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center text-sm font-bold text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2.5 text-indigo-400" />
                    {admin.department || "Unassigned"}
                  </div>
                )}
              </td>

              <td className="py-5 px-8">
                {editingAdmin === admin.uid ? (
                  <select
                    className="w-full py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-black"
                    value={editFormData.status || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                ) : (
                  <div className="flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mr-3 border-2 border-white ring-2 ${
                      admin.status === 'Active' || !admin.status ? 'bg-emerald-500 ring-emerald-100' : 'bg-red-500 ring-red-100'
                    }`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${
                      admin.status === 'Active' || !admin.status ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {admin.status || "Active"}
                    </span>
                  </div>
                )}
              </td>

              <td className="py-5 px-8 text-right">
                {editingAdmin === admin.uid ? (
                  <div className="flex items-center justify-end gap-2.5">
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(admin.uid)}
                      isLoading={isSubmitting}
                      className="h-10 w-10 p-0 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none"
                    >
                      <Check className="w-5 h-5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={cancelEdit}
                      className="h-10 w-10 p-0 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border-none"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(admin)}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-indigo-50 text-indigo-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 text-gray-400"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
