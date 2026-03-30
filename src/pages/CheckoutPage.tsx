import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FLOWER_BOUQUETS, CHOCOLATE_OPTIONS } from "@/lib/addOnsData";

type StoredOrder = {
  pdfPath: string | null;
  flowerId: string | null;
  chocolateId: string | null;
  templateId: string | null;
};

export default function CheckoutPage() {
  const order = useMemo<StoredOrder | null>(() => {
    try {
      const raw = localStorage.getItem("gg_checkout_order");
      return raw ? (JSON.parse(raw) as StoredOrder) : null;
    } catch {
      return null;
    }
  }, []);

  const flower = useMemo(
    () => (order?.flowerId ? FLOWER_BOUQUETS.find((f) => f.id === order.flowerId) : null),
    [order]
  );
  const choc = useMemo(
    () => (order?.chocolateId ? CHOCOLATE_OPTIONS.find((c) => c.id === order.chocolateId) : null),
    [order]
  );

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const cardPrice = 3;
  const flowersPrice = flower?.price ?? 0;
  const chocolatesPrice = choc?.price ?? 0;
  const total = cardPrice + flowersPrice + chocolatesPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-14 max-w-3xl">
        <h1 className="font-display text-2xl md:text-3xl text-foreground mb-2">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Enter your card details to complete your order.
        </p>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Card number
              </label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Expiry
                </label>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">CVC</label>
                <Input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-2">Order summary</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-foreground/90">Card</span>
                <span className="tabular-nums text-foreground">£{cardPrice.toFixed(2)}</span>
              </div>

              {flower ? (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/90">Flowers ({flower.name})</span>
                  <span className="tabular-nums text-foreground">
                    £{flower.price.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {choc ? (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/90">Chocolates ({choc.name})</span>
                  <span className="tabular-nums text-foreground">£{choc.price.toFixed(2)}</span>
                </div>
              ) : null}

              <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                <span className="text-foreground font-medium">Total</span>
                <span className="tabular-nums text-foreground font-medium">
                  £{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => history.back()}
            >
              Back
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => alert("Order placed (demo).")}
              disabled={!cardNumber || !expiry || !cvc}
            >
              Pay now
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

