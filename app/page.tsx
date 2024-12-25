import Card from "./ui/cards/Card";
import TimeSpentCard from "./ui/cards/TimeSpentCard";
import PowerCard from "./ui/cards/PowerCard";
import RoundButton from "./ui/buttons/RoundButton";
import LightningBoltSVG from "./ui/buttons/assets/LightningBoltSVG";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-stretch justify-start space-y-2">
      <Card title="Topics" />
      <div className="flex flex-row flex-1 space-x-4">
        <TimeSpentCard perc={2}></TimeSpentCard>
        <PowerCard perc={45} />
      </div>
      <div className="flex-1"></div>
      <div className="flex justify-center">
        <RoundButton icon={<LightningBoltSVG />} />
      </div>
    </div>
  );
}
