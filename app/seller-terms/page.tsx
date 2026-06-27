import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Seller Terms — LocalAdda" };

export default function SellerTermsPage() {
  return (
    <LegalLayout title="Store Owner (Seller) Terms" updated="June 2026">
      <p>These terms apply to store owners who list on LocalAdda, operated by <strong>[COMPANY_LEGAL_NAME]</strong>. By creating or managing a listing, you agree to them.</p>

      <h2>1. Your store, your responsibility</h2>
      <p>You are <strong>solely responsible</strong> for your listings and your business, including:</p>
      <ul>
        <li>Accuracy of products, <strong>prices, MRP, offers, and stock</strong> — and honouring any offer you advertise.</li>
        <li>Product <strong>quality, safety, legality</strong>, and fulfilling orders customers place with you.</li>
        <li>Holding all required <strong>licenses and registrations</strong> (e.g. Shops &amp; Establishment, <strong>FSSAI</strong> for food, valid <strong>drug license</strong> for medicines, GST where applicable).</li>
        <li>Complying with all applicable laws, including Legal Metrology (no selling above MRP) and consumer protection.</li>
      </ul>

      <h2>2. Prohibited listings</h2>
      <p>You must not list illegal, counterfeit, recalled, unsafe, or restricted goods, or anything you are not licensed to sell. This includes prescription medicines sold without the legally required process, weapons, and any item prohibited by law. We may remove or suspend any listing or account at our discretion.</p>

      <h2>3. Content &amp; intellectual property</h2>
      <p>You warrant that you own or are licensed to use all images, text, and content you upload, and grant LocalAdda a license to display it on the platform. You must not upload content that infringes others&rsquo; rights.</p>

      <h2>4. Transactions &amp; payments</h2>
      <p>Orders and payments are <strong>directly between you and the customer</strong> (cash/offline). LocalAdda does not collect payment and is not responsible for any transaction, refund, or dispute. You are responsible for any taxes on your sales.</p>

      <h2>5. Customer data</h2>
      <p>When a customer contacts you or places a preorder, you receive their details (e.g. name, phone) <strong>only to fulfil that order</strong>. You must handle it lawfully and not misuse it.</p>

      <h2>6. Indemnity &amp; liability</h2>
      <p>You agree to <strong>indemnify and hold LocalAdda harmless</strong> from any claim, loss, or liability arising from your store, products, content, or conduct. LocalAdda provides the platform &ldquo;as is&rdquo; without warranties.</p>

      <h2>7. Suspension</h2>
      <p>We may suspend or remove your listing for policy or legal violations, inaccurate information, or customer complaints.</p>

      <h2>8. Contact</h2>
      <p>[COMPANY_LEGAL_NAME], [REGISTERED_ADDRESS]. Email: <strong>[CONTACT_EMAIL]</strong>.</p>
    </LegalLayout>
  );
}
