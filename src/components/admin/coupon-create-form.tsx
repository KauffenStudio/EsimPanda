'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CouponCreateFormProps {
  onCreated: () => void;
  existingCodes: string[];
}

export function CouponCreateForm({ onCreated, existingCodes }: CouponCreateFormProps) {
  const t = useTranslations('admin.coupons');
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [codeError, setCodeError] = useState('');

  const [code, setCode] = useState('');
  const [influencerName, setInfluencerName] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [notes, setNotes] = useState('');

  function resetForm() {
    setCode('');
    setInfluencerName('');
    setSocialUrl('');
    setNotes('');
    setCodeError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCodeError('');

    // Client-side validation
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length < 3 || normalizedCode.length > 20) return;
    if (!influencerName.trim()) return;
    if (socialUrl && !isValidUrl(socialUrl)) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: normalizedCode,
          influencer_name: influencerName.trim(),
          social_url: socialUrl.trim(),
          notes: notes.trim(),
        }),
      });

      if (res.status === 201) {
        toast.success('Coupon created');
        resetForm();
        setIsOpen(false);
        onCreated();
      } else if (res.status === 409) {
        setCodeError(t('codeExists'));
      } else if (res.status === 403) {
        toast.error(t('authFailed'));
      } else {
        toast.error('Something went wrong');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          {t('createButton')}
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="mt-4 rounded-lg p-4 space-y-4 border border-border"
              style={{ backgroundColor: '#F5F5F5' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="coupon-code" className="block text-sm font-bold mb-1">
                    Code
                  </label>
                  <input
                    id="coupon-code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCodeError('');
                    }}
                    placeholder="e.g., MARIA10"
                    required
                    minLength={3}
                    maxLength={20}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {codeError && (
                    <p className="text-sm mt-1" style={{ color: '#E53935' }}>
                      {codeError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="influencer-name" className="block text-sm font-bold mb-1">
                    Influencer Name
                  </label>
                  <input
                    id="influencer-name"
                    type="text"
                    value={influencerName}
                    onChange={(e) => setInfluencerName(e.target.value)}
                    placeholder="Influencer name"
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="social-url" className="block text-sm font-bold mb-1">
                    Social URL
                  </label>
                  <input
                    id="social-url"
                    type="url"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="coupon-notes" className="block text-sm font-bold mb-1">
                    Notes
                  </label>
                  <textarea
                    id="coupon-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Free-text notes"
                    maxLength={500}
                    rows={2}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? 'Creating...' : t('createButton')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
