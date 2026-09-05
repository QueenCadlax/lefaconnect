import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { CtaBand } from "@/components/site/CtaBand";
import { publicSeoHead } from "@/lib/seo";
import {
  AboutPreview,
  FutureVision,
  FounderPreview,
  Hero,
  LivestockSplit,
  MembershipActivation,
  MembershipFinance,
  OrganisationalOperations,
} from "@/components/home/sections";

const title = "Lefa Connect | Livestock, Membership & Agricultural Community Platform";
const description =
  "Lefa Connect is a modern agricultural membership and livestock platform connecting members, managing contributions, operations, livestock and community participation in one secure digital platform.";

export const Route = createFileRoute("/")({
  head: () => publicSeoHead(title, description, "/"),
  component: Index,
});

function Index() {
  return (
    <SiteShell overlayHeader>
      <Hero />
      <AboutPreview />
      <MembershipFinance />
      <MembershipActivation />
      <LivestockSplit />
      <FounderPreview />
      <OrganisationalOperations />
      <FutureVision />
      <CtaBand />
    </SiteShell>
  );
}
