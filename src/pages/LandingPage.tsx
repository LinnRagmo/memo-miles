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
        <div className="text-center">
          <h1 className="text-7xl font-bold text-white tracking-tight mb-3 drop-shadow-lg">MEMOmiles</h1>
          <p className="text-xl text-white font-medium tracking-wide drop-shadow-md">Where roadtrip plans become stories.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {boxes.map((box, index) => {
            const gradients = [
              "from-blue-500/20 to-purple-500/20",
              "from-purple-500/20 to-pink-500/20", 
              "from-amber-500/20 to-orange-500/20"
            ];
            return (
              <Card
                key={box.title}
                onClick={() => navigate(box.route)}
                className={`cursor-pointer bg-gradient-to-br ${gradients[index]} backdrop-blur-md border-2 border-white/50 hover:scale-105 hover:border-white/70 hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center justify-center text-center min-h-[140px]`}
              >
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{box.title}</h2>
                <p className="text-white/90 text-sm drop-shadow">{box.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
