import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface CloseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ticketId: number, summary: string) => Promise<void>;
  ticketId: number | null;
}

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  ticketId 
}) => {
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(ticketId, summary);
      setSummary('');
      onClose();
    } catch (err: any) {
      console.error('Failed to close ticket:', err);
      setError(err.message || 'Failed to close ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Resolution Summary"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Closing Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100/50 transition-all resize-none text-sm outline-none"
            placeholder="Document the resolution for this ticket..."
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold uppercase tracking-tight">
            Error: {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-12"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700"
          >
            Complete Resolution
          </Button>
        </div>
      </form>
    </Modal>
  );
};
