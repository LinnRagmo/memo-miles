import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import australiaRoadTripImg from "@/assets/australia-road-trip.jpg";
import { Lightbulb, Map, BookOpen } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const boxes = [
    {
      title: "Inspo",
      route: "/auth",
      icon: Lightbulb,
    },
    {
      title: "Plan",
      route: "/auth",
      icon: Map,
    },
    {
      title: "Journal",
      route: "/auth",
      icon: BookOpen,
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${australiaRoadTripImg})`,
          filter: "brightness(0.85) saturate(1.1)",
        }}
      />
      
      {/* Subtle Brightness Overlay */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 px-6 max-w-6xl w-full">
        <div className="text-center">
          <h1 className="text-7xl font-bold text-white tracking-tight mb-3 drop-shadow-lg">MEMOmiles</h1>
          <p className="text-xl text-white font-medium tracking-wide drop-shadow-md">Where roadtrip plans become stories.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {boxes.map((box) => (
            <Card
              key={box.title}
              onClick={() => navigate(box.route)}
              className="cursor-pointer bg-white/20 dark:bg-white/20 backdrop-blur-md border border-white/40 hover:scale-105 hover:bg-white/30 dark:hover:bg-white/30 transition-all duration-200 p-6 flex items-center justify-center text-center min-h-[100px] shadow-lg"
            >
              <div className="flex items-center gap-3">
                <box.icon className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">{box.title}</h2>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
