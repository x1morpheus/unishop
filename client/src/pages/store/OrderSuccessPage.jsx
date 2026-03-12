import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { orderService } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

export default function OrderSuccessPage() {
  const [params]  = useSearchParams();
  const orderId   = params.get("orderId");
  const method    = params.get("method");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn:  () => orderService.getById(orderId).then(r => r.data),
    enabled:  !!orderId,
    staleTime: Infinity,
  });

  if (!orderId) return (
    <div className="container-app py-20 text-center">
      <p className="text-[var(--color-text-muted)]">No order found.</p>
      <Link to="/products" className="mt-4 inline-block"><Button>Shop Now</Button></Link>
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="xl" /></div>;

  return (
    <div className="container-app py-16 max-w-2xl">
      <motion.div
        className="text-center space-y-4 mb-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 size={40} className="text-emerald-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-[var(--color-text)]">Order Placed!</h1>
        <p className="text-[var(--color-text-muted)]">
          {method === "cod"
            ? "We've received your order. Pay on delivery."
            : "Your payment was processed. We'll send a confirmation email shortly."}
        </p>

        {order && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-mono font-semibold text-sm">
            <Package size={15} />
            {order.orderNumber}
          </div>
        )}
      </motion.div>

      {order && (
        <motion.div
          className="card p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Order Status</span>
            <Badge variant={statusVariant[order.orderStatus] || "muted"}>{order.orderStatus}</Badge>
          </div>

          {/* Items */}
          <ul className="space-y-3">
            {order.items?.map((item, i) => (
              <li key={i} className="flex gap-3 items-center">
                <img src={item.image || "/placeholder.png"} alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover bg-[var(--color-background)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
                  {item.variant && <p className="text-xs text-[var(--color-text-muted)]">{item.variant}</p>}
                  <p className="text-xs text-[var(--color-text-muted)]">Qty {item.qty}</p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-text)] shrink-0">{formatCurrency(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="divider" />
          <div className="space-y-1.5 text-sm">
            {[["Subtotal", formatCurrency(order.subtotal)], ["Shipping", order.shipping === 0 ? "Free" : formatCurrency(order.shipping)], ["Tax", formatCurrency(order.tax)]].map(([l,v]) => (
              <div key={l} className="flex justify-between text-[var(--color-text-muted)]"><span>{l}</span><span>{v}</span></div>
            ))}
            <div className="flex justify-between font-bold text-[var(--color-text)] pt-1.5 border-t border-[var(--color-border)]">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <>
              <div className="divider" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Shipping To</p>
                <address className="not-italic text-sm text-[var(--color-text)] space-y-0.5">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </div>
            </>
          )}

          <p className="text-xs text-[var(--color-text-muted)]">
            Placed on {formatDate(order.createdAt, "medium")}
          </p>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link to="/profile?tab=orders" className="flex-1">
          <Button variant="secondary" fullWidth>View All Orders</Button>
        </Link>
        <Link to="/products" className="flex-1">
          <Button fullWidth rightIcon={<ArrowRight size={16} />}>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
