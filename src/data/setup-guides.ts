export interface SetupStep {
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface SetupGuideData {
  heading_key: string; // i18n key for heading
  steps: SetupStep[];
}

export const SETUP_GUIDES: Record<string, SetupGuideData> = {
  ios: {
    heading_key: 'delivery.setup.ios.heading',
    steps: [
      { title: 'Open Settings', description: 'Go to Settings on your iPhone', icon: 'Settings' },
      { title: 'Cellular / Mobile Data', description: 'Tap "Cellular" or "Mobile Data"', icon: 'Signal' },
      { title: 'Add eSIM', description: 'Tap "Add eSIM" or "Add Cellular Plan"', icon: 'Plus' },
      { title: 'Use QR Code', description: 'Choose "Use QR Code" and scan, or tap the install link', icon: 'QrCode' },
      { title: 'Activate', description: 'Follow prompts to activate. Label it "Travel" for easy identification', icon: 'Check' },
      { title: 'Enable Data Roaming', description: 'Go back to Cellular, tap your new plan, and enable "Data Roaming"', icon: 'Globe' },
    ],
  },
  samsung: {
    heading_key: 'delivery.setup.samsung.heading',
    steps: [
      { title: 'Open Settings', description: 'Go to Settings on your Samsung device', icon: 'Settings' },
      { title: 'Connections', description: 'Tap "Connections" then "SIM manager"', icon: 'Signal' },
      { title: 'Add eSIM', description: 'Tap "Add eSIM"', icon: 'Plus' },
      { title: 'Scan QR Code', description: 'Choose "Scan QR code from service provider"', icon: 'QrCode' },
      { title: 'Activate', description: 'Scan the QR code and follow the prompts to activate', icon: 'Check' },
      { title: 'Enable Data Roaming', description: 'Go to Connections > Mobile networks > Data roaming and enable it', icon: 'Globe' },
    ],
  },
  pixel: {
    heading_key: 'delivery.setup.pixel.heading',
    steps: [
      { title: 'Open Settings', description: 'Go to Settings on your Pixel', icon: 'Settings' },
      { title: 'Network & internet', description: 'Tap "Network & internet" then "SIMs"', icon: 'Signal' },
      { title: 'Add SIM', description: 'Tap "Add SIM" at the bottom', icon: 'Plus' },
      { title: 'Download SIM', description: 'Choose "Download a SIM instead?" then scan the QR code', icon: 'QrCode' },
      { title: 'Activate', description: 'Follow the prompts to activate your new eSIM', icon: 'Check' },
      { title: 'Enable Data Roaming', description: 'Go back to SIMs, select the new SIM, enable "Roaming"', icon: 'Globe' },
    ],
  },
  'android-other': {
    heading_key: 'delivery.setup.android.heading',
    steps: [
      { title: 'Open Settings', description: 'Go to Settings on your device', icon: 'Settings' },
      { title: 'Network Settings', description: 'Look for "Network & internet", "Connections", or "SIM cards"', icon: 'Signal' },
      { title: 'Add eSIM', description: 'Find and tap "Add eSIM" or "Add mobile plan"', icon: 'Plus' },
      { title: 'Scan QR Code', description: 'Choose to scan a QR code and point your camera at the code', icon: 'QrCode' },
      { title: 'Activate', description: 'Follow your device prompts to complete activation', icon: 'Check' },
      { title: 'Enable Data Roaming', description: 'Find the roaming toggle in your mobile network settings and enable it', icon: 'Globe' },
    ],
  },
};
