import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Terms of Use — LocalAdda" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" updated="June 2026">
      <p>These Terms govern your use of LocalAdda, operated by <strong>[COMPANY_LEGAL_NAME]</strong> (&ldquo;LocalAdda&rdquo;, &ldquo;we&rdquo;). By using the platform you accept these Terms.</p>

      <h2>1. What LocalAdda is (and is not)</h2>
      <p>LocalAdda is a <strong>discovery and listings platform</strong> that helps customers find local stores and their products. <strong>We do not own, sell, manufacture, stock, deliver, or guarantee any product or service</strong> listed on the platform. Listings are created by independent store owners.</p>
      <p>Any purchase, order, booking, or payment is a transaction <strong>directly between the customer and the store</strong>. LocalAdda is not a party to that transaction and acts only as an intermediary connecting the two.</p>

      <h2>2. No payments through LocalAdda</h2>
      <p>LocalAdda does not collect or process payments. Payment is made directly to the store (typically cash, on pickup or delivery). We are not responsible for any payment, pricing, refund, or settlement between you and a store.</p>

      <h2>3. Accuracy of listings</h2>
      <p>Prices, offers, stock, descriptions, images, hours, and contact details are provided by store owners and may be <strong>incomplete, outdated, or inaccurate</strong>. Always confirm details with the store before purchasing. We do not verify or endorse listings.</p>

      <h2>4. Your responsibilities</h2>
      <ul>
        <li>Use the platform lawfully and not to post false, infringing, or harmful content.</li>
        <li>Verify product quality, legitimacy, hygiene, and suitability directly with the store.</li>
        <li>You are responsible for your interactions and transactions with stores.</li>
      </ul>

      <h2>5. Disclaimers &amp; limitation of liability</h2>
      <p>The platform and all listings are provided <strong>&ldquo;as is&rdquo; without warranties</strong> of any kind. To the maximum extent permitted by law, LocalAdda is not liable for any loss or damage arising from listings, products, services, transactions, or interactions with stores, including issues of quality, safety, price, availability, delivery, or non-fulfilment.</p>

      <h2>6. Intermediary status</h2>
      <p>LocalAdda is an &ldquo;intermediary&rdquo; under the Information Technology Act, 2000 and applicable rules. We follow a notice-and-takedown process; see our <a href="/grievance">Grievance Redressal</a> page to report content.</p>

      <h2>7. Privacy</h2>
      <p>Your data is handled per our <a href="/privacy">Privacy Policy</a>.</p>

      <h2>8. Changes &amp; governing law</h2>
      <p>We may update these Terms; continued use means acceptance. These Terms are governed by the laws of India, subject to the courts at <strong>[CITY/JURISDICTION]</strong>.</p>

      <h2>9. Contact</h2>
      <p>[COMPANY_LEGAL_NAME], [REGISTERED_ADDRESS]. Email: <strong>[CONTACT_EMAIL]</strong>.</p>
    </LegalLayout>
  );
}
