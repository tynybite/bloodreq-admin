import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BloodReq",
  description:
    "Read how BloodReq collects, uses, secures, and shares information while delivering blood request and donor-matching services.",
};

const sections = [
  {
    title: "1. Scope and Overview",
    content: [
      "This Privacy Policy explains how BloodReq collects, uses, stores, and protects personal information when you use our website, admin panel, and related services (collectively, the \"Service\").",
      "By accessing or using the Service, you acknowledge the practices described in this policy.",
    ],
  },
  {
    title: "2. Information We Collect",
    content: [
      "Account details: name, email address, phone number, password hash, profile details, and role-based account data.",
      "Verification and operational data: identity verification records, hospital or organization details, blood group, availability status, and request metadata required to operate the platform.",
      "Technical data: device/browser type, IP address, operating system, application logs, and basic analytics events for stability and abuse prevention.",
      "Support and communications: messages and attachments you share with support or moderation teams.",
    ],
  },
  {
    title: "3. Sensitive Information",
    content: [
      "Because the Service relates to healthcare coordination, some data may be sensitive (for example, health-adjacent eligibility or emergency request details).",
      "We process sensitive information only as needed to provide the Service, protect users, and comply with legal obligations.",
    ],
  },
  {
    title: "4. How We Use Information",
    content: [
      "Create and manage user accounts, authenticate sign-ins, and deliver core features.",
      "Match donors, patients, and verified organizations, and support emergency blood requests.",
      "Maintain security, detect fraud or misuse, and enforce platform rules.",
      "Respond to support requests, notify users about critical updates, and improve Service performance and reliability.",
      "Comply with legal obligations, audits, and law-enforcement requests where required.",
    ],
  },
  {
    title: "5. Cookies and Similar Technologies",
    content: [
      "We may use cookies and similar technologies for session management, security, preferences, and analytics.",
      "You can control cookies through browser settings, but disabling them may affect some features.",
    ],
  },
  {
    title: "6. How We Share Information",
    content: [
      "With authorized entities and users: hospitals, blood banks, moderators, and verified participants involved in request fulfillment.",
      "With service providers: infrastructure, security, analytics, and communication vendors under confidentiality and processing obligations.",
      "For legal reasons: when required by law, court order, regulation, or to protect rights, safety, and platform integrity.",
      "In business transitions: if BloodReq is involved in a merger, acquisition, financing, or asset transfer, subject to appropriate safeguards.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "We retain information only for as long as needed for operational, legal, safety, and dispute-resolution purposes.",
      "Retention periods depend on account type, activity history, legal obligations, and security requirements.",
    ],
  },
  {
    title: "8. Data Security",
    content: [
      "We use administrative, technical, and organizational safeguards designed to protect personal information from unauthorized access, loss, misuse, or alteration.",
      "No method of transmission or storage is completely secure; users should also protect credentials and devices.",
    ],
  },
  {
    title: "9. Your Rights and Choices",
    content: [
      "Depending on your location, you may have rights to access, correct, update, delete, or restrict processing of your personal data.",
      "You may also have rights to data portability, objection, and withdrawal of consent where consent is the legal basis.",
      "To exercise rights, contact us using the details in the Contact section.",
    ],
  },
  {
    title: "10. International Data Transfers",
    content: [
      "Your data may be processed in locations where BloodReq or its service providers operate.",
      "When transferring data across borders, we apply reasonable contractual and operational safeguards consistent with applicable law.",
    ],
  },
  {
    title: "11. Children's Privacy",
    content: [
      "The Service is not intended for children below the minimum digital-consent age in their jurisdiction without legally valid authorization.",
      "If you believe a child has provided personal information without proper authorization, contact us so we can take appropriate action.",
    ],
  },
  {
    title: "12. Third-Party Services",
    content: [
      "The Service may include links or integrations with third-party websites and tools. Their privacy practices are governed by their own policies.",
      "We are not responsible for third-party practices outside BloodReq-controlled systems.",
    ],
  },
  {
    title: "13. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect legal, technical, or business changes.",
      "Material updates may be highlighted in-app or by other reasonable notice methods.",
    ],
  },
  {
    title: "14. Contact Us",
    content: [
      "For privacy questions or requests, contact us at support@bloodreq.com.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-red-400">
            Legal
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">Privacy Policy</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            Last updated: February 11, 2026
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            This policy describes how BloodReq handles personal information for
            users, organizations, and administrators using the platform.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <h2 className="text-xl font-semibold text-zinc-100">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.content.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-6 text-zinc-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
