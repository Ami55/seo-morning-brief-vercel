import React, { useEffect, useState } from 'react';
import { Mail, Send, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Briefing } from '../types';

interface SendTestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestBriefing: Briefing | null;
  defaultRecipient: string;
  defaultFrom: string;
}

export const SendTestEmailModal: React.FC<SendTestEmailModalProps> = ({
  isOpen,
  onClose,
  latestBriefing,
  defaultRecipient,
  defaultFrom
}) => {
  const [recipient, setRecipient] = useState(defaultRecipient || 'ameneh.saeednia@gmail.com');
  const [fromAddress, setFromAddress] = useState(defaultFrom || 'SEO Morning Brief <briefing@updates.yourdomain.com>');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setRecipient(defaultRecipient || 'ameneh.saeednia@gmail.com');
    setFromAddress(defaultFrom || 'SEO Morning Brief <onboarding@resend.dev>');
    setResult(null);
  }, [isOpen, defaultRecipient, defaultFrom]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient,
          fromEmail: fromAddress
        })
      });
      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: `✓ Test briefing dispatched successfully (Delivery ID: ${data.deliveryId || 'Simulated OK'})`
        });
      } else {
        setResult({
          success: false,
          message: `⚠️ Delivery notice: ${data.error || 'Check Resend domain verification.'}`
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: 'Delivery error: ' + err.message
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold shadow-md shadow-slate-900/10 border border-slate-800">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Send Test Briefing Email</h3>
            <p className="text-xs text-slate-500">
              Send the latest compiled morning brief to verify inbox layout
            </p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Recipient Email Address(es)
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="first@example.com, second@example.com"
              className="w-full p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Separate addresses with commas or semicolons. A verified sender domain is required for a company inbox.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              From Sender Header
            </label>
            <input
              type="text"
              required
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-slate-600">
            <strong className="text-slate-800">Subject to Send:</strong>{' '}
            <span className="text-slate-900 font-semibold block mt-0.5">
              {latestBriefing?.subject || 'SEO Morning Brief'}
            </span>
          </div>

          {result && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {result.message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : 'Send Test Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
