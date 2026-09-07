import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Container, Section } from "@/components/site/Section";
import { publicSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/cookies")({
  head: () =>
    publicSeoHead(
      "Cookie Policy — Lefa Connect",
      "How Lefa Connect uses cookies and similar browser storage.",
      "/cookies",
    ),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <SiteShell>
      <main className="bg-background pt-20">
        <Section>
          <Container className="max-w-3xl">
            <p className="eyebrow text-heritage">Legal</p>
            <h1 className="mt-4 font-display text-4xl text-navy md:text-5xl">Cookie Policy</h1>
            <p className="mt-5 text-sm text-muted-foreground">Last updated: 6 September 2026</p>
            <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="font-display text-2xl text-navy">Essential storage</h2>
                <p className="mt-3">
                  Lefa Connect uses essential browser storage and session cookies to keep signed-in
                  areas secure and to support navigation between protected pages.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">Preferences and measurement</h2>
                <p className="mt-3">
                  Where enabled, limited technical information may be used to understand platform
                  performance and improve the experience. We do not use cookies to sell personal
                  information.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl text-navy">Managing cookies</h2>
                <p className="mt-3">
                  You can manage cookies through your browser settings. Disabling essential cookies
                  may prevent secure account features from working correctly.
                </p>
              </section>
            </div>
          </Container>
        </Section>
      </main>
    </SiteShell>
  );
}
