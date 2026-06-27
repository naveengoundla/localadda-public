import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Privacy Policy — LocalAdda" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>This policy explains how <strong>[COMPANY_LEGAL_NAME]</strong> (&ldquo;LocalAdda&rdquo;) collects and uses personal data, in line with the Digital Personal Data Protection Act, 2023 (DPDP).</p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><strong>Phone number</strong> — for OTP sign-in (owners/customers).</li>
        <li><strong>Email</strong> — for owner OTP delivery (current bridge).</li>
        <li><strong>Name</strong> — provided at sign-in / order.</li>
        <li><strong>Location</strong> — only if you tap &ldquo;use my location&rdquo; (to sort nearby stores), and approximate location from your IP address (to suggest your city). We store only the resulting city/coordinates, not continuous tracking.</li>
        <li><strong>Store/owner details</strong> — for store owners managing listings.</li>
        <li><strong>Device/usage &amp; cookies</strong> — a cookie remembers your selected city; basic analytics may be used.</li>
      </ul>

      <h2>2. Why we use it (purpose)</h2>
      <ul>
        <li>To authenticate you and keep you signed in.</li>
        <li>To show relevant local stores and &ldquo;near me&rdquo; results.</li>
        <li>To connect customers with stores (e.g. sharing your phone with a store when you place a preorder).</li>
        <li>To operate, secure, and improve the platform.</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>When you place a preorder, your name and phone are shared with that store so it can fulfil your order. We use service providers (hosting, email/OTP delivery) who process data on our behalf. We do not sell your personal data.</p>

      <h2>4. Your rights (DPDP)</h2>
      <p>You may request access to, correction of, or deletion of your personal data, and may withdraw consent, by contacting us. We will respond as required by law.</p>

      <h2>5. Consent</h2>
      <p>By signing in, enabling location, or submitting your contact details (including the waitlist), you consent to the processing described here. Location access is requested only on your action and can be declined.</p>

      <h2>6. Retention &amp; security</h2>
      <p>We keep data only as long as needed for the purposes above or as required by law, and apply reasonable safeguards. No method is perfectly secure.</p>

      <h2>7. Children</h2>
      <p>The platform is not directed at children; we do not knowingly collect their data.</p>

      <h2>8. Grievances / Data contact</h2>
      <p>For privacy requests or complaints, contact our Grievance Officer (see <a href="/grievance">Grievance Redressal</a>) or email <strong>[CONTACT_EMAIL]</strong>.</p>
    </LegalLayout>
  );
}
