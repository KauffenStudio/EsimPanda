export const TERMS_EFFECTIVE_DATE_EN = 'May 2, 2026';

export function TermsEN() {
  return (
    <article className="space-y-6 leading-relaxed">
      <header className="border-b border-border dark:border-border-dark pb-6 mb-2">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {TERMS_EFFECTIVE_DATE_EN}
        </p>
      </header>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of eSIM Panda — the website at{' '}
        <span className="underline">esimpanda.co</span> and any related services (the &quot;Service&quot;), operated
        by Kauffen Studio (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a sole proprietorship established in Portugal. By
        creating an account or placing an order, you agree to these Terms.
      </p>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. The Service</h2>
        <p>
          eSIM Panda sells digital eSIM data plans for international travel. After you purchase a plan,
          we provision an eSIM profile through our network partner and deliver the activation details
          (QR code or manual activation codes) to you by email and within your account on the Service.
          Internet access using your eSIM is provided by the underlying mobile network operators in
          each destination country.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Eligibility</h2>
        <p>
          You must be at least 18 years old, or the age of majority in your jurisdiction, to use the
          Service and purchase eSIM plans. By using the Service, you confirm that you meet this
          requirement.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Your account</h2>
        <p>
          You may use the Service as a guest for individual purchases or create an account. You are
          responsible for keeping your login credentials confidential and for all activity under your
          account. Notify us immediately at{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>{' '}
          if you suspect unauthorised access.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Pricing and payment</h2>
        <p>
          All prices are shown on the product page in the currency listed at checkout. Prices include
          applicable taxes unless stated otherwise. Payment is processed by Stripe; we never see or
          store your full card details. Once payment is confirmed, we begin provisioning your eSIM
          immediately.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Order, delivery, and activation</h2>
        <p>
          eSIM delivery is electronic. After successful payment, you will receive your activation
          details by email and within your account, typically within minutes. The validity period of
          your plan begins when you activate the eSIM on a compatible device, unless the product page
          states otherwise. It is your responsibility to confirm that your device supports eSIM and
          that your destination is covered before purchasing.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Refund and cancellation policy</h2>
        <p>
          Because eSIM plans are digital products that begin executing as soon as we provision them,
          and pursuant to Article 17 of Decree-Law 24/2014 (transposing the EU Consumer Rights
          Directive), the 14-day right of withdrawal does not apply once the eSIM has been delivered
          and you have expressly consented to immediate execution at checkout (waiving the cooldown).
        </p>
        <p className="mt-3">
          Specifically:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Before delivery</strong> (we have not yet generated your eSIM): you can cancel for
            any reason and receive a full refund.
          </li>
          <li>
            <strong>After delivery, before activation:</strong> a refund is at our discretion and may
            be granted minus a small administrative fee, subject to our network partner&apos;s policies.
          </li>
          <li>
            <strong>After activation:</strong> the digital service has been consumed and is
            non-refundable.
          </li>
          <li>
            <strong>Faulty service:</strong> if your eSIM does not work due to a fault on our side or
            our network partner&apos;s side, contact us. We will investigate and, where appropriate, issue
            a partial or full refund or provide a replacement plan.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">7. Service availability and limitations</h2>
        <p>
          Mobile coverage, data speeds, and signal strength depend on the local mobile network operator
          and the specific location, terrain, and your device. We do not guarantee uninterrupted
          service and we are not responsible for the underlying networks&apos; performance. Some destinations
          may restrict certain types of traffic (e.g., VoIP, tethering), and we will indicate any known
          restrictions on the product page where possible.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">8. Acceptable use</h2>
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Engage in fraud, money laundering, or other unlawful activity</li>
          <li>Resell eSIM plans without our written authorisation</li>
          <li>Interfere with the integrity or security of the Service</li>
          <li>Send spam, malware, or otherwise abuse the network</li>
          <li>Violate the laws of your destination country regarding mobile communications</li>
        </ul>
        <p className="mt-3">
          We may suspend or terminate accounts and orders where we reasonably suspect a breach of these
          rules, with refund only for any unused, unactivated portion at our discretion.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">9. Intellectual property</h2>
        <p>
          The Service, including its branding, logos, design, and software, is owned by Kauffen Studio
          or its licensors. We grant you a limited, non-exclusive, non-transferable licence to use the
          Service for personal use. You may not copy, modify, or redistribute any part of the Service
          without prior written permission.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">10. Disclaimers and limitation of liability</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot;. To the maximum extent permitted by law,
          we exclude all implied warranties. Nothing in these Terms limits or excludes liability that
          cannot be limited or excluded under applicable law (including liability for death, personal
          injury caused by negligence, fraud, or any consumer rights that cannot be waived).
        </p>
        <p className="mt-3">
          Subject to the above, our total aggregate liability for any claim arising out of or in
          connection with the Service is limited to the amount you paid us in the twelve (12) months
          preceding the event giving rise to the claim.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">11. Termination</h2>
        <p>
          You may stop using the Service and close your account at any time. We may suspend or
          terminate your access if you breach these Terms. Provisions that by their nature should
          survive termination — including refund rules for already-delivered services, intellectual
          property, and limitations of liability — will remain in effect.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">12. Governing law and dispute resolution</h2>
        <p>
          These Terms are governed by Portuguese law. As a consumer, you also benefit from any
          mandatory protections in the country where you reside. For consumer disputes, you may use the
          EU Online Dispute Resolution platform at{' '}
          <a href="https://ec.europa.eu/consumers/odr" className="underline">
            ec.europa.eu/consumers/odr
          </a>
          {' '}or contact a Portuguese consumer arbitration centre such as CNIACC (
          <a href="https://www.cniacc.pt" className="underline">www.cniacc.pt</a>).
        </p>
        <p className="mt-3">
          For any other dispute, the courts of Portugal shall have non-exclusive jurisdiction, without
          prejudice to mandatory consumer protection rules that grant you additional rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">13. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. The &quot;Last updated&quot; date at the top of this
          page reflects the most recent change. For material changes that affect your rights, we will
          notify you by email or through a notice in the Service before the changes take effect. Your
          continued use of the Service after the change indicates acceptance of the updated Terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">14. Contact</h2>
        <p>
          For any question about these Terms, contact us at:{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
