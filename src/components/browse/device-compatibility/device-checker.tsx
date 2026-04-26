'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useDeviceCompatStore, getBrands, getModelsForBrand } from '@/hooks/use-device-compat';
import { BambuVideo } from '@/components/bambu/bambu-video';
import { Button } from '@/components/ui/button';

export function DeviceChecker() {
  const t = useTranslations('browse');
  const { brand, model, isCompatible, setBrand, setModel, checkCompatibility, reset } =
    useDeviceCompatStore();

  const brands = getBrands();
  const models = brand ? getModelsForBrand(brand) : [];

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
              <BambuVideo variant="success" size={120} />
              <p className="text-success font-medium">
                {t('deviceCompatible', { brand: brand!, model: model! })}
              </p>
            </>
          ) : (
            <>
              <BambuVideo variant="error" size={120} />
              <p className="text-destructive font-medium">
                {t('deviceIncompatible', { brand: brand!, model: model! })}
              </p>
              <Button variant="ghost" onClick={() => {}}>
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
