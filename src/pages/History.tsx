import { History as HistoryComponent } from "@/components/History";
import { Navigation } from "@/components/Navigation";

const History = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-4xl mx-auto px-4 pb-24 md:pb-6">
        <HistoryComponent />
      </main>
    </div>
  );
};

export default History;
