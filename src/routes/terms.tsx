import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Container, Section } from "@/components/site/Section";
import { publicSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    publicSeoHead("Terms of Use — Lefa Connect", "Terms governing use of Lefa Connect.", "/terms"),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteShell>
      <main className="bg-background pt-20">
        <Section>
          <Container className="max-w-3xl">
            <p className="eyebrow text-heritage">Legal</p>
            <h1 className="mt-4 font-display text-4xl text-navy md:text-5xl">Terms of Use</h1>
            <p className="mt-5 text-sm text-muted-foreground">Last updated: 6 September 2026</p>
            <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="font-display text-2xl text-navy">Using the platform</h2>
                <p className="mt-3">
                  Use Lefa Connect lawfully and provide information that is accurate, complete and
                  kept up to date.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">Accounts and applications</h2>
                <p className="mt-3">
                  You are responsible for protecting your account credentials. Applications,
                  memberships and participation remain subject to review and the organisation&apos;s
                  governing requirements.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">Platform availability</h2>
                <p className="mt-3">
                  We work to keep the platform available and secure, but services may occasionally
                  be interrupted for maintenance, updates or circumstances outside our control.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">Contact</h2>
                <p className="mt-3">
                  Questions about these terms can be directed to Lefa Connect through the contact
                  details published on the website.
                </p>
              </section>
            </div>
          </Container>
        </Section>
      </main>
    </SiteShell>
  );
}
