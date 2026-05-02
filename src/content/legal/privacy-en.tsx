export const PRIVACY_EFFECTIVE_DATE_EN = 'May 2, 2026';

export function PrivacyEN() {
  return (
    <article className="space-y-6 leading-relaxed">
      <header className="border-b border-border dark:border-border-dark pb-6 mb-2">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {PRIVACY_EFFECTIVE_DATE_EN}
        </p>
      </header>

      <p>
        This Privacy Policy explains how Kauffen Studio (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and protects
        your personal data when you use eSIM Panda — the website at{' '}
        <span className="underline">esimpanda.co</span> and any related services (the &quot;Service&quot;). We are
        committed to protecting your privacy and complying with the EU General Data Protection Regulation
        (GDPR), the Portuguese Data Protection Law, and applicable consumer protection laws.
      </p>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Who we are</h2>
        <p>
          The data controller responsible for your personal data is:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Kauffen Studio (sole proprietorship)</li>
          <li>Established in Portugal</li>
          <li>Contact: <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">geral@kauffen.com</a></li>
        </ul>
        <p className="mt-3">
          You can contact us at any time using the email above for any privacy-related question or request.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Information we collect</h2>
        <p>We collect the following categories of personal data:</p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Account data:</strong> email address, password (hashed; we never see your plain
            password), and, if you sign in with Google, your Google account email and basic profile
            information.
          </li>
          <li>
            <strong>Order data:</strong> the eSIM plans you purchase, destination countries, dates, prices,
            and order reference numbers.
          </li>
          <li>
            <strong>Payment data:</strong> processed entirely by Stripe. We never store your full card
            number. We receive only a token, the last four digits, and the card brand to display in your
            order history.
          </li>
          <li>
            <strong>eSIM technical data:</strong> ICCID, activation code, and usage statistics returned by
            our network provider Celitech, used to deliver the data plan you purchased.
          </li>
          <li>
            <strong>Communications:</strong> emails you send to us and our replies (for support and
            dispute resolution).
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, device type, language preference,
            and basic interaction events needed to operate, secure, and improve the Service.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. How we use your data and legal bases</h2>
        <p>We use your personal data only for the purposes described below:</p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>To provide the Service</strong> (deliver your eSIM, process payment, manage your
            account). Legal basis: performance of a contract (GDPR Art. 6(1)(b)).
          </li>
          <li>
            <strong>To comply with legal obligations</strong> (issue invoices, retain accounting records,
            respond to lawful requests). Legal basis: legal obligation (GDPR Art. 6(1)(c)).
          </li>
          <li>
            <strong>To secure and improve the Service</strong> (prevent fraud, detect bugs, analyse
            performance). Legal basis: legitimate interest (GDPR Art. 6(1)(f)).
          </li>
          <li>
            <strong>To send service emails</strong> (order confirmation, eSIM delivery, support replies,
            password resets). Legal basis: performance of a contract.
          </li>
          <li>
            <strong>To send marketing messages</strong>, if and only if you explicitly opt in. Legal basis:
            consent (GDPR Art. 6(1)(a)). You may withdraw consent at any time.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Sub-processors we share data with</h2>
        <p>
          We rely on a small number of trusted service providers (sub-processors) to operate the Service.
          They process your data only on our instructions and under written agreements that meet GDPR
          requirements:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Supabase</strong> — authentication and database hosting (EU and US regions).
          </li>
          <li>
            <strong>Stripe</strong> — payment processing (US/EU).
          </li>
          <li>
            <strong>Celitech</strong> — eSIM provisioning and connectivity (US/EU).
          </li>
          <li>
            <strong>Resend</strong> — transactional email delivery (US/EU).
          </li>
          <li>
            <strong>Vercel</strong> — website and application hosting (global edge).
          </li>
          <li>
            <strong>Google</strong> — when you choose to sign in with your Google account, Google receives
            a sign-in request limited to your email and basic profile.
          </li>
        </ul>
        <p className="mt-3">
          We do not sell your personal data to anyone, and we do not share it with third parties for
          their own marketing purposes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">5. International data transfers</h2>
        <p>
          Some of our sub-processors are located outside the European Economic Area (EEA), notably in the
          United States. When personal data is transferred outside the EEA, we rely on the European
          Commission&apos;s Standard Contractual Clauses (SCCs) or, where applicable, on adequacy decisions.
          Copies of the relevant safeguards are available on request.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies and similar technologies</h2>
        <p>
          We use only cookies and local storage that are strictly necessary to operate the Service —
          for example, to keep you signed in, remember your language preference, and maintain your
          shopping cart. We do not use advertising cookies. If we ever introduce optional analytics
          cookies, we will ask for your consent first via a clear cookie banner.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">7. How long we keep your data</h2>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Account data:</strong> kept while your account is active. If you delete your account,
            we delete or anonymise it within 30 days, except where retention is required by law.
          </li>
          <li>
            <strong>Order and invoice data:</strong> kept for 10 years after the year of the transaction,
            as required by Portuguese tax law.
          </li>
          <li>
            <strong>Support communications:</strong> kept for up to 3 years after the last interaction.
          </li>
          <li>
            <strong>Technical logs:</strong> kept for up to 12 months for security and debugging.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">8. Your rights</h2>
        <p>Under the GDPR, you have the right to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Have inaccurate data corrected</li>
          <li>Have your data deleted (right to erasure)</li>
          <li>Restrict or object to certain processing</li>
          <li>Receive your data in a portable format</li>
          <li>Withdraw consent at any time, where processing is based on consent</li>
          <li>
            Lodge a complaint with the Portuguese supervisory authority (Comissão Nacional de Proteção
            de Dados — CNPD, <a href="https://www.cnpd.pt" className="underline">www.cnpd.pt</a>) or the
            authority in your country of residence.
          </li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, email us at{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>
          . We will respond within 30 days.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">9. Children&apos;s privacy</h2>
        <p>
          The Service is not directed at people under 16 years of age. We do not knowingly collect
          personal data from children. If you believe a child has provided us personal data, contact us
          and we will delete it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">10. Security</h2>
        <p>
          We take reasonable technical and organisational measures to protect your data — including
          encrypted connections (HTTPS), hashed passwords, restricted access, and the use of reputable
          sub-processors. No system is perfectly secure; if we become aware of a personal data breach
          that affects you, we will notify you and the relevant authorities as required by law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top of
          this page reflects the most recent change. For material changes, we will notify you by email
          or through a notice in the app before the changes take effect.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact</h2>
        <p>
          For any privacy-related question or to exercise your rights, contact us at:{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
