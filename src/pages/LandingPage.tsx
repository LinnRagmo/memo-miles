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
          filter: "brightness(0.6)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-6xl w-full">
        {boxes.map((box) => (
          <Card
            key={box.title}
            onClick={() => navigate(box.route)}
            className="cursor-pointer bg-white/95 dark:bg-black/95 backdrop-blur-sm border-2 border-foreground hover:scale-105 transition-transform duration-200 p-12 flex flex-col items-center justify-center text-center min-h-[280px]"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">{box.title}</h2>
            <p className="text-foreground/70 text-lg">{box.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
