// next-frontend/components/chat/MessageInput.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Paperclip, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface MessageInputProps {
  onSendMessage: (message: string, file?: File) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { t } = useLanguage();
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Critical: Failed to access audio peripheral:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !selectedFile) || isSending || disabled) return;

    const currentText = text;
    const currentFile = selectedFile;
    
    // Clear immediately for optimistic experience
    setText("");
    removeFile();
    
    try {
      await onSendMessage(currentText, currentFile || undefined);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: restore text if failed, but for now we follow the user's "make it optimistic" instruction
      setText(currentText);
    } finally {
      setIsSending(false);
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-6 pb-6 pt-2">
      <div className="relative bg-white/80 backdrop-blur-2xl p-3.5 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border-2 border-white/60">
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-3 p-3 bg-white/80 backdrop-blur-md rounded-[1.5rem] border border-white flex items-center gap-4 w-fit pr-5 shadow-sm"
            >
              {selectedFile.type.startsWith('image/') && previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
              ) : selectedFile.type.startsWith('audio/') ? (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Mic size={24} />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Paperclip size={24} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-900 truncate max-w-[180px] tracking-tight">
                  {selectedFile.name}
                </span>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.startsWith('audio/') ? (t('chat.audio') || 'AUDIO') : (t('chat.ready') || 'READY')}
                </span>
              </div>
              <button 
                onClick={removeFile}
                className="p-2 hover:bg-rose-50 rounded-xl text-gray-300 hover:text-rose-500 transition-all ml-2 border border-transparent hover:border-rose-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <div className="flex items-center gap-1 pl-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,application/pdf,audio/*"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="h-11 w-11 p-0 rounded-2xl hover:bg-white text-gray-400 hover:text-indigo-600 transition-all hover:shadow-[0_8px_16px_-4px_rgba(79,70,229,0.2)] border border-transparent hover:border-gray-100 group/btn"
              >
                <Paperclip size={20} className="group-hover/btn:rotate-12 transition-transform" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={startRecording}
                disabled={disabled}
                className="h-11 w-11 p-0 rounded-2xl hover:bg-white text-gray-400 hover:text-rose-500 transition-all hover:shadow-[0_8px_16px_-4px_rgba(244,63,94,0.2)] border border-transparent hover:border-gray-100 group/btn"
              >
                <Mic size={20} className="group-hover/btn:scale-110 transition-transform" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-1 animate-pulse px-4">
              <div className="w-3 h-3 bg-rose-500 rounded-full" />
              <span className="text-xs font-black text-gray-900 tabular-nums lowercase tracking-widest">{t('chat.recording') || 'Recording Response'}: {formatTime(recordingTime)}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={stopRecording}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 h-9"
              >
                <span className="text-[10px] font-black uppercase">{t('common.stop') || 'Stop'}</span>
              </Button>
            </div>
          )}

          {!isRecording && (
            <div className="flex-1 relative mx-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder') || placeholder}
                disabled={disabled || isSending}
                className="w-full px-4 py-3 bg-white/50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-100/30 rounded-2xl resize-none text-[13px] font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest transition-all min-h-[48px] max-h-32 outline-none"
              />
            </div>
          )}

          <div className="pr-1">
            <Button 
              onClick={() => handleSubmit()}
              disabled={disabled || isSending || (!text.trim() && !selectedFile)}
              className={`h-12 w-12 p-0 rounded-2xl transition-all duration-500 flex items-center justify-center ${
                (text.trim() || selectedFile) && !isSending
                  ? 'bg-indigo-600 text-white shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] scale-100'
                  : 'bg-gray-50 text-gray-300 scale-100 border border-gray-100'
              } hover:translate-y-[-2px] active:scale-95 group/send`}
            >
              {isSending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} className={`ml-1 transition-transform group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 ${
                  (text.trim() || selectedFile) ? 'text-white' : 'text-gray-300'
                }`} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
