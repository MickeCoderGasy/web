// Page de test pour la fonctionnalité de checkout
// Accessible via /test-checkout pour tester les paiements

import { CheckoutTest } from '@/components/CheckoutTest';
import { PaymentDebug } from '@/components/PaymentDebug';
import { PaymentTest } from '@/components/PaymentTest';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestCheckout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="test">Test Checkout</TabsTrigger>
            <TabsTrigger value="manual">Test Manuel</TabsTrigger>
            <TabsTrigger value="debug">Debug API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="mt-6">
            <CheckoutTest />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-6">
            <PaymentTest />
          </TabsContent>
          
          <TabsContent value="debug" className="mt-6">
            <PaymentDebug />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
