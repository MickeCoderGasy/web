import { Dashboard } from "@/components/Dashboard";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-6xl mx-auto px-4 pb-24 md:pb-6">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
