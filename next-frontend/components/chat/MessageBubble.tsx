import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, FileText, Play, Pause, Volume2, Clock } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
  showSenderName?: boolean;
}
 
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelf, showSenderName }) => {
  const isSystem = message.senderType === 'system';

  const getNameColor = (name?: string) => {
    if (!name) return '#6b7280';
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#10b981', 
      '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
      '#d946ef', '#f43f5e'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Audio Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
 
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-1.5 bg-gray-400/20 backdrop-blur-md rounded-full">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
            {message.message}
          </p>
        </div>
      </div>
    );
  }
 
  const renderMedia = () => {
    if (!message.mediaUrl) return null;
 
    if (message.mediaType === 'image') {
      return (
        <div className="mb-1 rounded-xl overflow-hidden border border-black/5 shadow-sm">
          <img 
            src={message.mediaUrl} 
            alt="Attachment" 
            className="max-w-full h-auto object-cover"
          />
        </div>
      );
    }
 
    if (message.mediaType === 'audio') {
      return (
        <div className={`mb-1 p-2 rounded-xl flex items-center gap-3 min-w-[200px] ${
          isSelf ? 'bg-emerald-100/30' : 'bg-gray-100/30'
        }`}>
          <audio ref={audioRef} src={message.mediaUrl} className="hidden" />
          <button 
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isSelf ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            } hover:scale-110 active:scale-95`}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-1.5 bg-gray-200/50 rounded-full overflow-hidden relative">
               <motion.div 
                 className={`h-full absolute left-0 top-0 ${isSelf ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                 style={{ width: `${progress}%` }}
               />
            </div>
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest tabular-nums">
                {audioRef.current ? (
                   isPlaying ? 
                   `${Math.floor(audioRef.current.currentTime / 60)}:${Math.floor(audioRef.current.currentTime % 60).toString().padStart(2, '0')}` : 
                   (message.audioDuration ? `${Math.floor(message.audioDuration / 60)}:${(message.audioDuration % 60).toString().padStart(2, '0')}` : '0:00')
                ) : '0:00'}
              </span>
              <Volume2 size={10} className="text-gray-400" />
            </div>
          </div>
        </div>
      );
    }
 
    return (
      <div className={`mb-1 p-2 rounded-xl flex items-center gap-3 border ${
        isSelf ? 'bg-emerald-100/30 border-emerald-200' : 'bg-gray-100/30 border-gray-200'
      }`}>
        <FileText size={20} className={isSelf ? 'text-emerald-600' : 'text-gray-400'} />
        <span className="text-xs font-bold truncate max-w-[150px]">Document</span>
      </div>
    );
  };
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-1 ${isSelf ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] md:max-w-[70%] relative px-3 py-2 shadow-sm transition-all duration-300 ${
        isSelf 
          ? 'bg-[#EFFDDE] text-gray-900 rounded-[15px] rounded-tr-[2px]' 
          : 'bg-[#FFFFFF] text-gray-900 rounded-[15px] rounded-tl-[2px]'
      }`}>
        <div className="flex flex-col relative min-w-[80px]">
          {showSenderName && !isSelf && message.senderName && (
            <span 
              className="text-[11px] font-black mb-1.5 uppercase tracking-wide truncate max-w-[150px]"
              style={{ color: getNameColor(message.senderName) }}
            >
              {message.senderName}
            </span>
          )}
          {renderMedia()}
          {message.message && (
            <div className="text-[14.5px] font-normal leading-relaxed tracking-normal whitespace-pre-wrap break-words pr-2 pb-1">
              {message.message}
            </div>
          )}
 
          <div className="flex items-center justify-end gap-1 mt-0.5 opacity-60 self-end">
            <span className="text-[10px] font-bold tabular-nums text-gray-400 uppercase tracking-tighter">
               {message.createdAt ? format(new Date(message.createdAt), 'hh:mm a') : ''}
            </span>
            {isSelf && (
              message.isRead ? (
                <CheckCheck size={14} className="text-[#4FC3F7]" strokeWidth={2.5} />
              ) : (
                <Check size={14} className="text-[#4FC3F7]" strokeWidth={2.5} />
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
