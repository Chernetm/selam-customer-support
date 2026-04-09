'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Briefcase, Clock, Search, AlertCircle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { systemAdminService } from '@/lib/api/admin';
import { CaseType, CaseTypeCreateInput, Department } from '@/types/admin';

const priorities = [
  { label: 'Low', sla: '3-5 days', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { label: 'Medium', sla: '1-2 days', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { label: 'High', sla: '24 hours', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { label: 'Urgent', sla: '2-6 hours', color: 'text-red-600 bg-red-50 border-red-100' },
] as const;

export function CaseTypeManager() {
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseType | null>(null);
  const [form, setForm] = useState<CaseTypeCreateInput>({
    name: '',
    description: '',
    departmentId: 0,
    priority: 'Low'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesData, deptsData] = await Promise.all([
        systemAdminService.getCaseTypes(),
        systemAdminService.getDepartments()
      ]);
      setCaseTypes(casesData);
      setDepartments(deptsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId) {
      alert('Please select a department');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCase) {
        await systemAdminService.updateCaseType(editingCase.id, form);
      } else {
        await systemAdminService.createCaseType(form);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Error saving case type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this case type?')) {
      try {
        await systemAdminService.deleteCaseType(id);
        fetchData();
      } catch (error) {
        alert('Error deleting case type');
      }
    }
  };

  const openEdit = (c: CaseType) => {
    setEditingCase(c);
    setForm({
      name: c.name,
      description: c.description,
      departmentId: c.departmentId,
      priority: c.priority
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCase(null);
    setForm({ name: '', description: '', departmentId: departments[0]?.id || 0, priority: 'Low' });
  };

  const filteredCases = caseTypes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Input 
            placeholder="Search case types..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-black" />}
            className="text-black placeholder:text-gray-400"
          />
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Case Type
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
          ))}
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => {
            const priorityInfo = priorities.find(p => p.label === c.priority);
            return (
              <div key={c.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="h-8 w-8 p-0">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border w-fit ${priorityInfo?.color}`}>
                    {c.priority} Priority
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{c.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">
                      {c.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
                    <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                      <Layers className="w-3 h-3 mr-2 text-indigo-400" />
                      {c.department?.name || "Global Department"}
                    </div>
                    <div className="flex items-center text-[11px] font-bold text-gray-500 px-2">
                      <Clock className="w-3 h-3 mr-2" />
                      SLA: {priorityInfo?.sla}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-gray-200" />
          <div className="text-center">
            <p className="font-bold text-gray-900 text-lg">No case types found</p>
            <p className="text-gray-500 text-sm">Register a new case type to start categorizing tickets.</p>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCase ? "Edit Case Type" : "Add New Case Type"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Case Name" 
            required 
            placeholder="e.g. Software Failure"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="text-black placeholder:text-gray-400"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                required
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-sm font-medium text-black"
                value={form.departmentId}
                onChange={(e) => setForm({...form, departmentId: parseInt(e.target.value)})}
              >
                <option value="" className="text-black">Select Dept</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id} className="text-black">{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-sm font-medium text-black"
                value={form.priority}
                onChange={(e) => setForm({...form, priority: e.target.value as any})}
              >
                {priorities.map(p => (
                  <option key={p.label} value={p.label} className="text-black">{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors resize-none text-sm text-black placeholder:text-gray-400"
              placeholder="Define when this case should be selected..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {editingCase ? "Update" : "Create"} Case Type
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
