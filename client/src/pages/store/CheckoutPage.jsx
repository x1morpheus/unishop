import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Wallet, Banknote, ChevronLeft, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { StripePaymentModal } from "@/components/store/StripePaymentModal";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { checkoutSchema } from "@/utils/validators";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/utils/cn";

const COUNTRIES = ["United States","United Kingdom","Canada","Australia","Germany","France","Japan","India","Brazil","Other"]
  .map(c => ({ value: c, label: c }));

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user }     = useAuth();
  const { payments } = useTheme();
  const navigate     = useNavigate();

  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax      = +(subtotal * 0.1).toFixed(2);
  const total    = +(subtotal + shipping + tax).toFixed(2);

  const [payMethod, setPayMethod]       = useState(payments.stripe ? "stripe" : payments.paypal ? "paypal" : "cod");
  const [placing, setPlacing]           = useState(false);
  const [stripeModal, setStripeModal]   = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);  // { _id, clientSecret }

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "", email: user?.email || "",
      address: "", city: "", zip: "", country: "United States", phone: user?.phone || "",
    },
  });

  if (!items.length) return (
    <div className="container-app py-20 text-center space-y-4">
      <p className="text-lg font-semibold text-[var(--color-text)]">Your cart is empty</p>
      <Link to="/products"><Button>Continue Shopping</Button></Link>
    </div>
  );

  const onSubmit = async (addr) => {
    setPlacing(true);
    try {
      const orderRes = await orderService.create({
        items: items.map(i => ({ product: i._id, qty: i.qty, variant: i.variant || "" })),
        shippingAddress: addr,
        payment: { method: payMethod },
      });
      const order = orderRes.data;

      if (payMethod === "stripe") {
        const { clientSecret } = await paymentService.createStripeIntent({ amount: total, orderId: order._id });
        setPendingOrder({ _id: order._id, clientSecret });
        setStripeModal(true);
        setPlacing(false);
        return; // modal takes over
      }

      if (payMethod === "paypal") {
        const { paypalOrderId } = await paymentService.createPayPalOrder({ amount: total, orderId: order._id });
        clearCart();
        navigate(`/order-success?orderId=${order._id}&method=paypal&paypalOrderId=${paypalOrderId}`);
        return;
      }

      // COD
      await paymentService.confirmCOD({ orderId: order._id });
      clearCart();
      navigate(`/order-success?orderId=${order._id}&method=cod`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const handleStripeSuccess = (paymentIntent) => {
    clearCart();
    navigate(`/order-success?orderId=${pendingOrder._id}&method=stripe`);
  };

  const payMethods = [
    payments.stripe && { id: "stripe", icon: CreditCard, label: "Credit / Debit Card",  sub: "Visa, Mastercard, Amex & more" },
    payments.paypal && { id: "paypal", icon: Wallet,     label: "PayPal",               sub: "Redirects to PayPal checkout" },
    payments.cod    && { id: "cod",    icon: Banknote,   label: "Cash on Delivery",     sub: "Pay when your order arrives" },
  ].filter(Boolean);

  return (
    <div className="container-app py-8">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors">
        <ChevronLeft size={15} /> Continue Shopping
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping address */}
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-[var(--color-text)]">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" required error={errors.name?.message} {...register("name")} containerClassName="col-span-2" />
                <Input label="Email" required type="email" error={errors.email?.message} {...register("email")} />
                <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
                <Input label="Address" required error={errors.address?.message} {...register("address")} containerClassName="col-span-2" />
                <Input label="City" required error={errors.city?.message} {...register("city")} />
                <Input label="ZIP / Postal Code" required error={errors.zip?.message} {...register("zip")} />
                <Select label="Country" required options={COUNTRIES} error={errors.country?.message} {...register("country")} containerClassName="col-span-2" />
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-[var(--color-text)]">Payment Method</h2>
              <div className="space-y-2.5">
                {payMethods.map(({ id, icon: Icon, label, sub }) => (
                  <label key={id} className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    payMethod === id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                  )}>
                    <input type="radio" name="payMethod" value={id} checked={payMethod === id}
                      onChange={() => setPayMethod(id)} className="sr-only" />
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                      payMethod === id ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-background)] text-[var(--color-text-muted)]")}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{sub}</p>
                    </div>
                    {payMethod === id && <Badge variant="primary" className="ml-auto shrink-0">Selected</Badge>}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-5 space-y-4 sticky top-24">
              <h2 className="font-semibold text-[var(--color-text)]">Order Summary</h2>
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                {items.map(item => (
                  <li key={`${item._id}-${item.variant}`} className="flex gap-3 items-center">
                    <div className="relative shrink-0">
                      <img src={item.image || "/placeholder.png"} alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover bg-[var(--color-background)]" />
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-[var(--color-primary)] text-white text-xs rounded-full flex items-center justify-center font-bold">{item.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
                      {item.variant && <p className="text-xs text-[var(--color-text-muted)]">{item.variant}</p>}
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-text)] shrink-0">{formatCurrency(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="divider" />
              <div className="space-y-2 text-sm">
                {[["Subtotal", formatCurrency(subtotal)], ["Shipping", shipping === 0 ? "Free" : formatCurrency(shipping)], ["Tax (10%)", formatCurrency(tax)]].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-[var(--color-text-muted)]"><span>{l}</span><span>{v}</span></div>
                ))}
                <div className="flex justify-between font-bold text-base text-[var(--color-text)] pt-2 border-t border-[var(--color-border)]">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
              <Button type="submit" fullWidth size="lg" loading={placing} leftIcon={<Lock size={15} />}>
                {payMethod === "stripe" ? "Enter Card Details" : `Place Order · ${formatCurrency(total)}`}
              </Button>
              <p className="text-xs text-center text-[var(--color-text-muted)]">Your order is secured with end-to-end encryption.</p>
            </div>
          </div>
        </div>
      </form>

      {/* Stripe Elements modal */}
      <StripePaymentModal
        isOpen={stripeModal}
        onClose={() => { setStripeModal(false); setPendingOrder(null); }}
        clientSecret={pendingOrder?.clientSecret}
        amount={formatCurrency(total)}
        onSuccess={handleStripeSuccess}
      />
    </div>
  );
}
