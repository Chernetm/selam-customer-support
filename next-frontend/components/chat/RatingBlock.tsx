// next-frontend/components/chat/RatingBlock.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChatRating } from '@/types/chat';

interface RatingBlockProps {
  rating: ChatRating | null;
  onSubmit: (score: number, comment: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const RatingBlock: React.FC<RatingBlockProps> = ({ 
  rating, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredScore, setHoveredScore] = useState(0);

  if (rating) {
    return (
      <div className="bg-emerald-50/50 backdrop-blur-xl p-8 rounded-[2rem] border border-emerald-100/50 flex flex-col items-center text-center shadow-lg shadow-emerald-100/20">
        <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-100">
           <CheckCircle2 size={32} />
        </div>
        <h4 className="text-xl font-black text-gray-900 tracking-tight">Appreciated Feedback</h4>
        <p className="text-xs font-bold text-gray-500 mt-2 max-w-xs opacity-70">
           Your evaluation helps us maintain the highest standards of service precision.
        </p>
        
        <div className="flex gap-2 mt-8">
           {[1, 2, 3, 4, 5].map(n => (
             <Star 
               key={n} 
               size={24} 
               className={n <= rating.score ? "text-amber-500 fill-current" : "text-gray-200"} 
             />
           ))}
        </div>
        
        {rating.comment && (
          <div className="mt-8 p-4 bg-white/50 rounded-2xl border border-white italic text-xs font-bold text-gray-600 max-w-sm">
             “{rating.comment}”
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-premium p-10 rounded-[2.5rem] border-white shadow-2xl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-amber-200/50 animate-float">
           <Star size={40} className="fill-current" />
        </div>
        
        <h4 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Evaluate Experience</h4>
        <p className="text-sm font-bold text-gray-400 mt-2 max-w-sm tracking-tight opacity-70">
           Transmission concluded. Help us calibrate our service by evaluating the response quality.
        </p>

        <div className="flex gap-3 mt-10">
           {[1, 2, 3, 4, 5].map(n => (
             <button 
               key={n} 
               onMouseEnter={() => setHoveredScore(n)}
               onMouseLeave={() => setHoveredScore(0)}
               onClick={() => setScore(n)}
               className="transition-transform hover:scale-125 focus:outline-none"
             >
               <Star 
                 size={36} 
                 className={`transition-all duration-300 ${
                   n <= (hoveredScore || score) 
                    ? "text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                    : "text-gray-200"
                 }`} 
               />
             </button>
           ))}
        </div>

        <AnimatePresence>
          {score > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              className="w-full max-w-md mt-10 space-y-6 pt-6 border-t border-gray-100"
            >
               <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2">
                     <MessageSquare size={14} /> Optional Terminal Review
                  </span>
                  <textarea 
                    placeholder="Describe your experience in more detail..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full p-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white outline-none transition-all font-bold text-[13px] placeholder:text-gray-300 resize-none"
                  />
               </div>

               <Button 
                 onClick={() => onSubmit(score, comment)}
                 disabled={isSubmitting}
                 className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95"
               >
                 {isSubmitting ? (
                   <Loader2 size={18} className="animate-spin" />
                 ) : (
                   "Finalize Evaluation"
                 )}
               </Button>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};
