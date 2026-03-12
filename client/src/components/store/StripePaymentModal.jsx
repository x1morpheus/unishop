import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

// Lazy-init Stripe — only loads when modal opens
let stripePromise = null;
const getStripe = (key) => {
  if (!stripePromise && key) stripePromise = loadStripe(key);
  return stripePromise;
};

/* ── Inner form (must be inside <Elements>) ─────────────────────────────────── */
function CardForm({ clientSecret, onSuccess, onError, amount }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setCardError("");

    const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      setCardError(error.message || "Payment failed");
      onError(error.message || "Payment failed");
    } else if (paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className={cn(
        "p-4 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-background)] transition-colors",
        "focus-within:border-[var(--color-primary)]"
      )}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "15px",
                color: "var(--color-text, #1a1a1a)",
                fontFamily: "inherit",
                "::placeholder": { color: "#a0aec0" },
              },
              invalid: { color: "#e53e3e" },
            },
          }}
        />
      </div>
      {cardError && <p className="text-sm text-[var(--color-error)]">{cardError}</p>}

      <Button fullWidth size="lg" loading={loading} onClick={handlePay} leftIcon={<Lock size={15} />}>
        Pay {amount}
      </Button>

      <p className="text-xs text-center text-[var(--color-text-muted)]">
        🔒 Your payment info is encrypted and never stored on our servers.
      </p>
    </div>
  );
}

/* ── Public component ───────────────────────────────────────────────────────── */
export function StripePaymentModal({ isOpen, onClose, clientSecret, amount, onSuccess }) {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const stripe = publishableKey ? getStripe(publishableKey) : null;

  const handleSuccess = (paymentIntent) => {
    onSuccess(paymentIntent);
    onClose();
  };

  const handleError = (msg) => {
    // error is shown inline in CardForm, just keep modal open
    console.warn("Stripe error:", msg);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment" size="sm">
      {!publishableKey ? (
        <div className="py-4 text-center">
          <p className="text-sm text-[var(--color-error)] font-medium">Stripe is not configured.</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Add <code className="text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code> to your client .env file.
          </p>
        </div>
      ) : stripe && clientSecret ? (
        <Elements stripe={stripe} options={{ clientSecret }}>
          <CardForm
            clientSecret={clientSecret}
            onSuccess={handleSuccess}
            onError={handleError}
            amount={amount}
          />
        </Elements>
      ) : (
        <div className="py-6 text-center text-[var(--color-text-muted)] text-sm">
          Preparing payment…
        </div>
      )}
    </Modal>
  );
}
