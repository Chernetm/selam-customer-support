'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Layers, MapPin, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { systemAdminService } from '@/lib/api/admin';
import { Department, DepartmentCreateInput } from '@/types/admin';

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentCreateInput>({
    name: '',
    description: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await systemAdminService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await systemAdminService.updateDepartment(editingDept.id, form);
      } else {
        await systemAdminService.createDepartment(form);
      }
      setIsModalOpen(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      alert('Error saving department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await systemAdminService.deleteDepartment(id);
        fetchDepartments();
      } catch (error) {
        alert('Error deleting department');
      }
    }
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      description: dept.description,
      location: dept.location
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingDept(null);
    setForm({ name: '', description: '', location: '' });
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-black" />}
            className="text-black placeholder:text-gray-400"
          />
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full md:w-auto h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold uppercase tracking-widest text-[10px]">
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
          ))}
        </div>
      ) : filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => openEdit(dept)} className="h-8 w-8 p-0">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)} className="h-8 w-8 p-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 w-fit rounded-xl">
                  <Layers className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{dept.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">
                    {dept.description || "No description provided."}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center text-sm font-semibold text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
                  {dept.location || "Default Location"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-gray-200" />
          <div className="text-center">
            <p className="font-bold text-gray-900 text-lg">No departments found</p>
            <p className="text-gray-500 text-sm">Create your first department to get started.</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? "Edit Department" : "Add New Department"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Department Name"
            required
            placeholder="e.g. Technical Support"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="text-black placeholder:text-gray-400"
          />
          <Input
            label="Location"
            placeholder="e.g. Block A, Office 402"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="text-black placeholder:text-gray-400"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors resize-none text-sm text-black placeholder:text-gray-400"
              placeholder="Briefly describe department's scope..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {editingDept ? "Update" : "Create"} Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
