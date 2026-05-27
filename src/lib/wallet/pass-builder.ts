import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PKPass } from 'passkit-generator';

const PASS_TYPE_IDENTIFIER = 'pass.co.esimpanda.app';
const TEAM_IDENTIFIER = 'WBU6X584D3';
const ORGANIZATION_NAME = 'eSIM Panda';

interface BuildPassInput {
  orderId: string;
  destinationName: string;
  destinationIso: string;
  dataGb: number;
  durationDays: number;
  iccid: string;
  smdpAddress: string;
  activationCode: string;
  purchasedAt: string;
}

interface CertificateBundle {
  signerCert: string;
  signerKey: string;
  signerKeyPassphrase?: string;
  wwdr: string;
}

function decodeB64Pem(envValue: string | undefined, varName: string): string {
  if (!envValue) {
    throw new Error(`${varName} is not set`);
  }
  // Allow either raw PEM (multiline) or base64-encoded PEM.
  if (envValue.includes('-----BEGIN')) {
    return envValue;
  }
  return Buffer.from(envValue, 'base64').toString('utf8');
}

export function loadWalletCertificates(): CertificateBundle {
  return {
    signerCert: decodeB64Pem(process.env.APPLE_WALLET_SIGNER_CERT_BASE64, 'APPLE_WALLET_SIGNER_CERT_BASE64'),
    signerKey: decodeB64Pem(process.env.APPLE_WALLET_SIGNER_KEY_BASE64, 'APPLE_WALLET_SIGNER_KEY_BASE64'),
    signerKeyPassphrase: process.env.APPLE_WALLET_SIGNER_KEY_PASSPHRASE || undefined,
    wwdr: decodeB64Pem(process.env.APPLE_WALLET_WWDR_BASE64, 'APPLE_WALLET_WWDR_BASE64'),
  };
}

export function walletCertificatesConfigured(): boolean {
  return Boolean(
    process.env.APPLE_WALLET_SIGNER_CERT_BASE64 &&
      process.env.APPLE_WALLET_SIGNER_KEY_BASE64 &&
      process.env.APPLE_WALLET_WWDR_BASE64,
  );
}

async function loadTemplateBuffers(): Promise<Record<string, Buffer>> {
  const dir = path.join(process.cwd(), 'src', 'lib', 'wallet', 'pass-template');
  const files = ['icon.png', 'icon@2x.png', 'icon@3x.png', 'logo.png', 'logo@2x.png', 'logo@3x.png'];
  const entries = await Promise.all(
    files.map(async (f) => [f, await readFile(path.join(dir, f))] as const),
  );
  return Object.fromEntries(entries);
}

export async function buildEsimPass(input: BuildPassInput): Promise<Buffer> {
  const certs = loadWalletCertificates();
  const buffers = await loadTemplateBuffers();

  const lpaUri = `LPA:1$${input.smdpAddress}$${input.activationCode}`;
  const iccidShort = input.iccid ? input.iccid.slice(-8) : '';

  const pass = new PKPass(buffers, certs, {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_IDENTIFIER,
    teamIdentifier: TEAM_IDENTIFIER,
    organizationName: ORGANIZATION_NAME,
    serialNumber: input.orderId,
    description: `eSIM for ${input.destinationName}`,
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(20, 20, 22)',
    labelColor: 'rgb(180, 180, 180)',
  });

  pass.type = 'storeCard';

  pass.headerFields.push({
    key: 'destination',
    label: 'Destination',
    value: input.destinationName,
  });

  pass.primaryFields.push({
    key: 'data',
    label: 'Data',
    value: `${input.dataGb} GB`,
  });

  pass.secondaryFields.push(
    {
      key: 'duration',
      label: 'Duration',
      value: `${input.durationDays} days`,
    },
    {
      key: 'iccid',
      label: 'ICCID',
      value: iccidShort ? `…${iccidShort}` : '—',
    },
  );

  pass.auxiliaryFields.push({
    key: 'purchased',
    label: 'Purchased',
    value: input.purchasedAt,
    dateStyle: 'PKDateStyleMedium',
    timeStyle: 'PKDateStyleNone',
  });

  pass.backFields.push(
    {
      key: 'smdp',
      label: 'SM-DP+ Address',
      value: input.smdpAddress,
    },
    {
      key: 'activation',
      label: 'Activation Code',
      value: input.activationCode,
    },
    {
      key: 'order',
      label: 'Order',
      value: input.orderId,
    },
    {
      key: 'support',
      label: 'Support',
      value: 'support@esimpanda.co',
    },
  );

  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: lpaUri,
    messageEncoding: 'iso-8859-1',
    altText: `${input.destinationName} • ${input.dataGb} GB`,
  });

  return pass.getAsBuffer();
}
