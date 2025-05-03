import AdvantagesComponent from "@/components/principal/Advantages";
import HeroSection from "@/components/principal/HeroSection";
import SolutionSelection from "@/components/principal/SolutionsSection";
import StepsComponent from "@/components/principal/Steps";

export default function Home() {
  return (
    <>
      <HeroSection />
      <SolutionSelection />
      <StepsComponent />
      <AdvantagesComponent />
    </>
  );
}
