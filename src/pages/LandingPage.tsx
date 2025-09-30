import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import backgroundImage from "@/assets/road-trip-background.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  const boxes = [
    {
      title: "Inspo",
      description: "Find inspiration for your next adventure",
      route: "/inspo",
    },
    {
      title: "Plan",
      description: "Plan your trip itinerary",
      route: "/plan",
    },
    {
      title: "Journal",
      description: "Document your journey",
      route: "/journal",
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: "brightness(0.85) saturate(1.1)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 px-6 max-w-6xl w-full">
        <h1 className="text-7xl font-bold text-white tracking-tight">MEMOmiles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {boxes.map((box) => (
            <Card
              key={box.title}
              onClick={() => navigate(box.route)}
              className="cursor-pointer bg-white/90 dark:bg-white/10 backdrop-blur-md border border-white/40 hover:scale-105 hover:bg-white/95 dark:hover:bg-white/15 transition-all duration-200 p-8 flex flex-col items-center justify-center text-center min-h-[200px] shadow-lg"
            >
              <h2 className="text-3xl font-bold text-foreground mb-3">{box.title}</h2>
              <p className="text-foreground/70 text-base">{box.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
