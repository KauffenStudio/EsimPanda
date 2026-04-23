'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyableFieldProps {
  label: string;
  value: string;
}

export function CopyableField({ label, value }: CopyableFieldProps) {
  const t = useTranslations('delivery');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t('copy_success'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success(t('copy_success'));
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value, t]);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-normal text-gray-600">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-[#F5F5F5] p-3">
        <span className="flex-1 font-mono text-base select-all break-all">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 rounded-md bg-transparent p-2 text-gray-600 transition-colors duration-150 hover:bg-white hover:text-accent"
          aria-label={t('copy')}
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center">
            <Copy
              size={16}
              className={`absolute transition-opacity duration-150 ${copied ? 'opacity-0' : 'opacity-100'}`}
            />
            <Check
              size={16}
              className={`absolute text-green-600 transition-opacity duration-150 ${copied ? 'opacity-100' : 'opacity-0'}`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
