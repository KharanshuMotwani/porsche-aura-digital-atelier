import { motion } from "framer-motion";
import { useState } from "react";
import { User, Zap, MapPin, ArrowRight } from "lucide-react";

const steps = [
  {
    id: "profile",
    icon: User,
    title: "Your Driving DNA",
    question: "What defines your drive?",
    options: ["Track Day Warrior", "Grand Touring", "Urban Elegance", "Weekend Explorer"],
  },
  {
    id: "power",
    icon: Zap,
    title: "Power Philosophy",
    question: "How do you want to feel?",
    options: ["Raw & Unfiltered", "Refined & Controlled", "Silent & Swift", "Balanced Harmony"],
  },
  {
    id: "world",
    icon: MapPin,
    title: "Your World",
    question: "Where does the Aura live?",
    options: ["Mountain Passes", "Coastal Highways", "City Circuits", "Open Autobahn"],
  },
];

const PersonalizedJourney = ({ onRevSound }: { onRevSound: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const handleSelect = (option: string) => {
    const step = steps[currentStep];
    const newSelections = { ...selections, [step.id]: option };
    setSelections(newSelections);
    onRevSound();

    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCompleted(true);
      }
    }, 400);
  };

  return (
    <section className="relative px-6 md:px-16 py-32 max-w-7xl mx-auto">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3"
      >
        Personalized
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-5xl font-light tracking-tight mb-16"
      >
        Your Luxury Journey
      </motion.h2>

      {!completed ? (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                  i <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 mb-2">
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon className="w-5 h-5 text-primary" />;
            })()}
            <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <h3 className="text-2xl font-light tracking-tight mb-2">{steps[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground tracking-wider mb-8">{steps[currentStep].question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steps[currentStep].options.map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option)}
                className={`glass-panel rounded-xl px-6 py-4 text-left transition-all duration-300 hover:gold-border group ${
                  selections[steps[currentStep].id] === option
                    ? "gold-border bg-primary/5"
                    : ""
                }`}
              >
                <span className="text-sm tracking-wide">{option}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors inline ml-2 opacity-0 group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="glass-panel gold-glow rounded-2xl p-8 md:p-12">
            <p className="text-xs tracking-[0.5em] uppercase text-primary mb-4">Your Aura Profile</p>
            <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-6 gold-text">
              Configuration Complete
            </h3>
            <div className="space-y-3 mb-8">
              {Object.entries(selections).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                    {steps.find((s) => s.id === key)?.title}
                  </span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setCurrentStep(0); setSelections({}); setCompleted(false); }}
              className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Over ↻
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default PersonalizedJourney;
