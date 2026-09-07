import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Container, Section } from "@/components/site/Section";
import { publicSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    publicSeoHead(
      "Privacy Policy — Lefa Connect",
      "How Lefa Connect handles personal information.",
      "/privacy",
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteShell>
      <main className="bg-background pt-20">
        <Section>
          <Container className="max-w-3xl">
            <p className="eyebrow text-heritage">Legal</p>
            <h1 className="mt-4 font-display text-4xl text-navy md:text-5xl">Privacy Policy</h1>
            <p className="mt-5 text-sm text-muted-foreground">Last updated: 6 September 2026</p>
            <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="font-display text-2xl text-navy">Information we collect</h2>
                <p className="mt-3">
                  Lefa Connect collects the information you provide when creating an account,
                  applying for membership, making contributions, communicating with the organisation
                  or uploading supporting records.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">How we use information</h2>
                <p className="mt-3">
                  We use information to manage accounts, applications, memberships, payments,
                  communications, records and the security of the platform.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">Storage and sharing</h2>
                <p className="mt-3">
                  Information is stored in the systems used to operate Lefa Connect. We do not sell
                  personal information. Access is limited to authorised users and operational
                  purposes.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">Your choices</h2>
                <p className="mt-3">
                  You may contact Lefa Connect to request clarification about your information or to
                  raise a privacy concern.
                </p>
              </section>
            </div>
          </Container>
        </Section>
      </main>
    </SiteShell>
  );
}
