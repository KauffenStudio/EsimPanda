export interface FaqItem {
  question: string;
  answer: string;
}

export function getFaqsForDestination(countryName: string): FaqItem[] {
  return [
    {
      question: `How do I activate my eSIM in ${countryName}?`,
      answer: `After purchasing, you'll receive a QR code. Open your phone's Settings, go to Mobile Data or Cellular, tap Add eSIM or Add Data Plan, and scan the QR code. Your eSIM will be ready to use in ${countryName} within seconds.`,
    },
    {
      question: `Do I need to unlock my phone to use an eSIM in ${countryName}?`,
      answer: `No, you don't need to unlock your phone. eSIMs work on any eSIM-compatible device regardless of carrier lock status. Check our device compatibility tool to confirm your phone supports eSIM.`,
    },
    {
      question: `Can I keep my home number while using an eSIM in ${countryName}?`,
      answer: `Yes! Your phone supports dual SIM -- your home SIM stays active for calls and texts while the eSIM provides data in ${countryName}. You'll have both numbers available simultaneously.`,
    },
    {
      question: `How long does it take to get my eSIM for ${countryName}?`,
      answer: `Instant delivery. After completing your purchase, your eSIM QR code appears on screen immediately. We also send a backup copy to your email. No waiting, no shipping.`,
    },
    {
      question: `What happens if I run out of data in ${countryName}?`,
      answer: `You can top up your data directly from your dashboard. Log in, go to My eSIMs, and tap Top Up on your active plan. Additional data is added instantly.`,
    },
  ];
}
