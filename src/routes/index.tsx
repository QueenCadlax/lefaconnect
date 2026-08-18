import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { CtaBand } from "@/components/site/CtaBand";
import {
  AboutPreview,
  EcosystemCards,
  EcosystemStrip,
  FutureVision,
  Hero,
  HowItWorks,
  LivestockSplit,
  MembershipCta,
} from "@/components/home/sections";

const title = "LEFA CONNECT — Heritage. Livelihood. Growth. Connected.";
const description =
  "Lefa Connect brings membership, contributions, livestock and organisational operations together through one connected digital platform.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell overlayHeader>
      <Hero />
      <EcosystemStrip />
      <AboutPreview />
      <HowItWorks />
      <EcosystemCards />
      <LivestockSplit />
      <MembershipCta />
      <FutureVision />
      <CtaBand />
    </SiteShell>
  );
}
