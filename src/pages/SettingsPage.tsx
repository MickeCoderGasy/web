import { Settings } from "@/components/Settings";
import { Navigation } from "@/components/Navigation";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-6xl mx-auto px-4 pb-24 md:pb-6">
        <Settings />
      </main>
    </div>
  );
};

export default SettingsPage;
