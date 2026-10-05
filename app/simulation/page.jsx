import "./simulation.css";
import SimulationApp from "@/components/simulation/SimulationApp";

export const metadata = {
  title: "Market Simulation · Verisavo",
  description: "Explore how a pricing decision could play out under different assumptions, with the evidence behind every result."
};

export default function SimulationPage() {
  return (
    <>
      <a className="sm-skip" href="#main">Skip to content</a>
      <SimulationApp />
    </>
  );
}
