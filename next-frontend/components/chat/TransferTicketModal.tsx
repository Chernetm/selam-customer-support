import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, ShieldAlert, Send, Search, Users, ShieldCheck, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { chatApi } from '@/lib/api/chat';
import { ChatTicket } from '@/types/chat';
import { toast } from 'react-hot-toast';

interface TransferTarget {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
}

interface TransferTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ChatTicket | null;
  onTransferSuccess: (type: 'reassign' | 'escalate', target: TransferTarget) => void;
}

export const TransferTicketModal: React.FC<TransferTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  ticket, 
  onTransferSuccess 
}) => {
    const [targets, setTargets] = useState<TransferTarget[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<TransferTarget | null>(null);
    const [transferType, setTransferType] = useState<'reassign' | 'escalate'>('reassign');
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTargets();
        } else {
            setSelectedUser(null);
            setReason("");
            setError(null);
        }
    }, [isOpen]);

    const fetchTargets = async () => {
        try {
            setLoading(true);
            const data = await chatApi.getTransferTargets();
            setTargets(data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch transfer targets:", err);
            setError("Could not load available agents/managers.");
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedUser || !ticket) return;
        if (transferType === 'escalate' && !reason.trim()) {
            setError("Please provide a reason for escalation.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            if (transferType === 'reassign') {
                await chatApi.reassignTicket(ticket.id, selectedUser.id, reason);
            } else {
                await chatApi.escalateTicket(ticket.id, selectedUser.id, reason);
            }

            toast.success(`Ticket ${transferType === 'reassign' ? 'reassigned' : 'escalated'} successfully`);
            onTransferSuccess(transferType, selectedUser);
            onClose();
        } catch (err: any) {
            console.error("Transfer failed:", err);
            setError(err.message || "Transfer failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTargets = targets.filter(u => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (transferType === 'escalate') {
            return matchesSearch && (u.role === 'manager' || u.role === 'super-admin' || u.role === 'agent' || u.role === 'admin' || u.role === 'superadmin');
        } else {
            return matchesSearch && (u.role === 'agent' || u.role === 'admin');
        }
    });

    return (
        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          title="Transfer System Asset"
          maxWidth="md"
        >
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/80 rounded-2xl">
                <button
                    onClick={() => { setTransferType('reassign'); setSelectedUser(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${transferType === 'reassign' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Users size={14} />
                    Reassign
                </button>
                <button
                    onClick={() => { setTransferType('escalate'); setSelectedUser(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${transferType === 'escalate' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ShieldAlert size={14} />
                    Escalate
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <Input
                    placeholder={`Identify target ${transferType === 'reassign' ? 'agent' : 'manager'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-gray-50 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-100/50 transition-all text-xs font-bold"
                />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {loading ? (
                    <div className="py-10 text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Scanning network...</p>
                    </div>
                ) : filteredTargets.length > 0 ? (
                    filteredTargets.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedUser?.id === user.id ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100/20' : 'border-transparent bg-gray-50/50 hover:bg-gray-100'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 font-black shadow-sm text-sm">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-black text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">{user.role} • {user.department || 'General Support'}</p>
                            </div>
                            {selectedUser?.id === user.id && (
                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                    <ShieldCheck size={14} strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    ))
                ) : (
                    <div className="py-10 text-center space-y-2">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <Users size={32} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No Identities Found</p>
                    </div>
                )}
            </div>

            {/* Reason field */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-3"
                    >
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                            Operational Justification
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={transferType === 'reassign' ? "Briefly explain the intent of this transfer..." : "Provide detailed justification for procedural escalation..."}
                            className={`w-full p-4 border-2 rounded-2xl outline-none transition-all text-sm font-bold min-h-[120px] resize-none ${transferType === 'reassign' ? 'bg-indigo-50/20 border-indigo-100/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400' : 'bg-rose-50/20 border-rose-100/50 focus:ring-4 focus:ring-rose-100 focus:border-rose-400'}`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                    <ShieldAlert size={18} />
                    <span className="uppercase tracking-wide">{error}</span>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-14 rounded-2xl"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleTransfer}
                    disabled={!selectedUser || isSubmitting}
                    isLoading={isSubmitting}
                    className={`flex-[1.5] h-14 rounded-2xl shadow-xl transition-all ${transferType === 'reassign' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}
                >
                    <div className="flex items-center gap-2">
                        <Send size={18} fill="currentColor" />
                        <span className="font-black uppercase tracking-widest text-[11px]">
                            {transferType === 'reassign' ? 'Commence Transfer' : 'Execute Escalation'}
                        </span>
                    </div>
                </Button>
            </div>
          </div>
        </Modal>
    );
};
