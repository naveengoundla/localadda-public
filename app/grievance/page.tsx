import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Grievance Redressal — LocalAdda" };

export default function GrievancePage() {
  return (
    <LegalLayout title="Grievance Redressal" updated="June 2026">
      <p>In line with the Information Technology Act, 2000 (and rules) and the Consumer Protection (E-Commerce) Rules, 2020, the following officer handles complaints about content, listings, privacy, or platform use.</p>

      <h2>Grievance Officer</h2>
      <ul>
        <li><strong>Name:</strong> [GRIEVANCE_OFFICER_NAME]</li>
        <li><strong>Email:</strong> [GRIEVANCE_EMAIL]</li>
        <li><strong>Phone:</strong> [GRIEVANCE_PHONE] (optional)</li>
        <li><strong>Address:</strong> [REGISTERED_ADDRESS]</li>
      </ul>

      <h2>How to raise a complaint</h2>
      <p>Email the Grievance Officer with: your name and contact, the store/listing or content concerned (a link or screenshot helps), and a description of the issue.</p>

      <h2>What we do</h2>
      <ul>
        <li>We acknowledge complaints within <strong>[X] hours</strong> and aim to resolve them within <strong>[Y] days</strong> (set per applicable rules).</li>
        <li>We may remove or disable content that is unlawful or violates our terms.</li>
        <li>Disputes about a product or transaction are between the customer and the store; we will facilitate contact where we reasonably can.</li>
      </ul>

      <h2>Operator</h2>
      <p>[COMPANY_LEGAL_NAME], [REGISTERED_ADDRESS]. General contact: <strong>[CONTACT_EMAIL]</strong>.</p>
    </LegalLayout>
  );
}
