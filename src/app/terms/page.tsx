import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | BloodReq",
  description:
    "Read BloodReq's Terms and Conditions governing platform access, user responsibilities, acceptable use, and service limitations.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "These Terms & Conditions govern access to and use of BloodReq services, including the website, applications, and administration tools (collectively, the \"Service\").",
      "By creating an account or using the Service, you agree to these terms.",
    ],
  },
  {
    title: "2. Eligibility and Account Responsibility",
    content: [
      "You must provide accurate information and keep your account credentials secure.",
      "You are responsible for activity under your account and for promptly reporting unauthorized access.",
      "Organizations using shared or delegated access must ensure authorized use by their personnel.",
    ],
  },
  {
    title: "3. Service Purpose",
    content: [
      "BloodReq is a coordination platform intended to help connect blood requests, donors, and verified institutions.",
      "BloodReq does not replace emergency care, medical diagnosis, clinical judgment, or government health services.",
    ],
  },
  {
    title: "4. Verification and Moderation",
    content: [
      "BloodReq may review, verify, suspend, or remove users, requests, and content to protect safety, prevent abuse, and maintain platform integrity.",
      "Verification status may change based on additional evidence, policy requirements, or legal obligations.",
    ],
  },
  {
    title: "5. Acceptable Use",
    content: [
      "You agree to use the Service lawfully, ethically, and in good faith.",
      "You must not submit false emergencies, impersonate others, scrape data without permission, attempt unauthorized access, distribute malware, or interfere with system operations.",
      "Any misuse may result in immediate account restriction or termination.",
    ],
  },
  {
    title: "6. User Content and Data",
    content: [
      "You retain ownership of content you submit, but grant BloodReq a limited, non-exclusive license to process and display it as necessary to provide and improve the Service.",
      "You are responsible for ensuring that content you submit is accurate, lawful, and does not violate third-party rights.",
    ],
  },
  {
    title: "7. Third-Party Services",
    content: [
      "The Service may rely on third-party providers for hosting, communication, analytics, or identity verification.",
      "BloodReq is not responsible for third-party service availability, performance, or policies outside our control.",
    ],
  },
  {
    title: "8. Intellectual Property",
    content: [
      "All platform design, branding, software, and related materials (excluding user-submitted content) are owned by BloodReq or its licensors.",
      "You may not copy, reverse engineer, distribute, or commercially exploit platform assets without written permission.",
    ],
  },
  {
    title: "9. Disclaimers",
    content: [
      "The Service is provided on an \"as is\" and \"as available\" basis to the extent permitted by law.",
      "While we work to keep information accurate and systems reliable, we do not guarantee uninterrupted service, perfect accuracy, or guaranteed donor/request outcomes.",
    ],
  },
  {
    title: "10. Limitation of Liability",
    content: [
      "To the extent permitted by applicable law, BloodReq and its affiliates are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.",
      "Where liability cannot be excluded, it will be limited to the minimum extent permitted by law.",
    ],
  },
  {
    title: "11. Indemnification",
    content: [
      "You agree to indemnify and hold harmless BloodReq from claims, damages, losses, and costs arising from your misuse of the Service, violation of these terms, or infringement of rights.",
    ],
  },
  {
    title: "12. Suspension and Termination",
    content: [
      "BloodReq may suspend or terminate access at any time for policy violations, legal risk, security concerns, or misuse.",
      "You may stop using the Service at any time, subject to legal or operational retention requirements.",
    ],
  },
  {
    title: "13. Changes to Terms",
    content: [
      "We may revise these terms as the Service evolves. Updated versions become effective when published unless otherwise stated.",
      "Your continued use of the Service after updates means you accept the revised terms.",
    ],
  },
  {
    title: "14. Governing Law and Disputes",
    content: [
      "These terms are governed by applicable laws in the jurisdiction where BloodReq operates, unless otherwise required by local law.",
      "Any dispute should first be raised with us in good faith so both parties can attempt resolution before formal proceedings.",
    ],
  },
  {
    title: "15. Contact",
    content: [
      "For terms-related questions, contact support@bloodreq.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-red-400">
            Legal
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            Last updated: February 11, 2026
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            These terms define acceptable use of BloodReq and describe rights,
            responsibilities, and service limitations.
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
