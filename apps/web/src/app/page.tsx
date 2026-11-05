import { HomeHero } from "@/components/home/HomeHero";
import { HomeLineup } from "@/components/home/HomeLineup";
import { HomeCostCalculator } from "@/components/home/HomeCostCalculator";
import { HomeChargingNetwork } from "@/components/home/HomeChargingNetwork";
import { HomePillars } from "@/components/home/HomePillars";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* 1. Hero Showcase with VF 7 & VF 3 */}
      <HomeHero />

      {/* 2. Complete EV Lineup with Category Tabs & Battery Toggle */}
      <HomeLineup />

      {/* 3. Interactive Battery & Operating Cost Savings Calculator */}
      <HomeCostCalculator />

      {/* 4. V-GREEN Nationwide Charging Network & Map */}
      <HomeChargingNetwork />

      {/* 5. "Mãnh liệt Tinh thần Việt Nam" Strategic Policies & Test Drive CTA */}
      <HomePillars />
    </main>
  );
}
