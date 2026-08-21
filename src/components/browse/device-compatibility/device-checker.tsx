'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  useDeviceCompatStore,
  getBrands,
  getModelsForBrand,
  NOT_LISTED_MODEL,
} from '@/hooks/use-device-compat';
import { Button } from '@/components/ui/button';

interface DeviceCheckerProps {
  /**
   * Called when the user accepts a negative result via "Browse anyway".
   * The picker always clears its own state — this lets the host (e.g. the
   * checkout form) collapse the inline picker after the user dismisses.
   */
  onDismiss?: () => void;
}

export function DeviceChecker({ onDismiss }: DeviceCheckerProps = {}) {
  const t = useTranslations('browse');
  const { brand, model, isCompatible, setBrand, setModel, checkCompatibility, reset } =
    useDeviceCompatStore();

  const brands = getBrands();
  const models = brand ? getModelsForBrand(brand) : [];

  // The sentinel renders as a final dropdown option ("I don't see my device").
  // Without it the dropdown is a compatible-only list and the check can never
  // produce a negative result.
  const handleBrowseAnyway = () => {
    reset();
    onDismiss?.();
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto p-6">
      <h2 className="text-xl font-semibold text-primary">{t('deviceCheck')}</h2>

      {/* Brand dropdown */}
      <select
        value={brand ?? ''}
        onChange={(e) => setBrand(e.target.value)}
        className="w-full rounded-[var(--radius-input)] border border-border bg-white dark:bg-surface-dark p-3 text-primary"
      >
        <option value="" disabled>
          {t('selectBrand')}
        </option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      {/* Model dropdown - only visible when brand is selected */}
      {brand && (
        <select
          value={model ?? ''}
          onChange={(e) => setModel(e.target.value)}
          className="w-full rounded-[var(--radius-input)] border border-border bg-white dark:bg-surface-dark p-3 text-primary"
        >
          <option value="" disabled>
            {t('selectModel')}
          </option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
          <option value={NOT_LISTED_MODEL}>{t('noDeviceListed')}</option>
        </select>
      )}

      {/* Check button */}
      <Button
        variant="primary"
        disabled={!brand || !model}
        onClick={() => checkCompatibility()}
        className="w-full"
      >
        {t('checkButton')}
      </Button>

      {/* Result display */}
      {isCompatible !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          {isCompatible ? (
            <>
              <p className="text-success font-medium">
                {t('deviceCompatible', { brand: brand!, model: model! })}
              </p>
            </>
          ) : (
            <>
              <p className="text-destructive font-medium">
                {model === NOT_LISTED_MODEL
                  ? t('noDeviceResult')
                  : t('deviceIncompatible', { brand: brand!, model: model! })}
              </p>
              <Button variant="ghost" onClick={handleBrowseAnyway}>
                {t('browseAnyway')}
              </Button>
            </>
          )}

          {/* Reset link */}
          <button
            onClick={() => reset()}
            className="text-sm text-secondary underline hover:text-primary transition-colors"
          >
            {t('resetDevice')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
