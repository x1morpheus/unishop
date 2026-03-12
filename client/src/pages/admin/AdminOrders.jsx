import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Drawer } from "@/components/ui/Drawer";
import { orderService } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { ORDER_STATUS_LIST, ORDER_STATUS_TRANSITIONS } from "@shared/constants";

export default function AdminOrders() {
  const qc = useQueryClient();
  const [page, setPage]           = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOrder, setDetailOrder]   = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus]       = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, statusFilter],
    queryFn: () => orderService.getAll({ page, limit: 15, status: statusFilter }),
    keepPreviousData: true,
    select: d => d,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      setStatusTarget(null);
      setNewStatus("");
    },
    onError: e => toast.error(e.response?.data?.message || "Update failed"),
  });

  const allowedNext = (order) =>
    (ORDER_STATUS_TRANSITIONS[order?.orderStatus] || []).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

  const columns = [
    {
      key: "orderNumber", label: "Order", sortable: true, render: row => (
        <span className="font-mono text-xs font-semibold text-[var(--color-text)]">{row.orderNumber}</span>
      ),
    },
    {
      key: "user", label: "Customer", render: row => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">{row.user?.name ?? "—"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.user?.email}</p>
        </div>
      ),
    },
    { key: "total", label: "Total", sortable: true, render: row => formatCurrency(row.total) },
    {
      key: "orderStatus", label: "Status", render: row => (
        <Badge variant={statusVariant[row.orderStatus] || "muted"}>
          {row.orderStatus}
        </Badge>
      ),
    },
    {
      key: "payment", label: "Payment", render: row => (
        <Badge variant={statusVariant[row.payment?.status] || "muted"}>
          {row.payment?.method} · {row.payment?.status}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Date", render: row => formatDate(row.createdAt, "short") },
    {
      key: "actions", label: "", render: row => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setDetailOrder(row)} aria-label="View">
            <Eye size={14} />
          </Button>
          {allowedNext(row).length > 0 && (
            <Button size="icon" variant="ghost" onClick={() => { setStatusTarget(row); setNewStatus(allowedNext(row)[0]?.value || ""); }} aria-label="Update status">
              <RefreshCw size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.pagination?.total}
        page={page}
        pages={data?.pagination?.pages}
        onPageChange={setPage}
        loading={isLoading}
        emptyTitle="No orders found"
        actions={
          <Select
            options={[
              { value: "", label: "All statuses" },
              ...ORDER_STATUS_LIST.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
            ]}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            containerClassName="w-44"
          />
        }
      />

      {/* Status update modal */}
      <Modal
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title="Update Order Status"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusTarget(null)}>Cancel</Button>
            <Button
              loading={updateMutation.isPending}
              disabled={!newStatus}
              onClick={() => updateMutation.mutate({ id: statusTarget._id, status: newStatus })}
            >
              Update
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            Order <strong className="text-[var(--color-text)]">{statusTarget?.orderNumber}</strong> is currently{" "}
            <Badge variant={statusVariant[statusTarget?.orderStatus] || "muted"}>{statusTarget?.orderStatus}</Badge>
          </p>
          <Select
            label="New Status"
            options={allowedNext(statusTarget)}
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
          />
        </div>
      </Modal>

      {/* Order detail drawer */}
      <Drawer
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title={`Order ${detailOrder?.orderNumber}`}
        size="md"
      >
        {detailOrder && (
          <div className="p-5 space-y-5">
            {/* Status + payment */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant[detailOrder.orderStatus] || "muted"}>{detailOrder.orderStatus}</Badge>
              <Badge variant={statusVariant[detailOrder.payment?.status] || "muted"}>
                {detailOrder.payment?.method} · {detailOrder.payment?.status}
              </Badge>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Items</p>
              <ul className="space-y-3">
                {detailOrder.items?.map((item, i) => (
                  <li key={i} className="flex gap-3 items-center">
                    <img src={item.image || "/placeholder.png"} alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover bg-[var(--color-background)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
                      {item.variant && <p className="text-xs text-[var(--color-text-muted)]">{item.variant}</p>}
                    </div>
                    <span className="text-sm text-[var(--color-text-muted)] shrink-0">×{item.qty}</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] shrink-0">{formatCurrency(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Totals */}
            <div className="admin-surface p-3 rounded-xl space-y-1.5 text-sm">
              {[
                ["Subtotal", formatCurrency(detailOrder.subtotal)],
                ["Shipping", formatCurrency(detailOrder.shipping)],
                ["Tax",      formatCurrency(detailOrder.tax)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-[var(--color-text-muted)]">
                  <span>{label}</span><span>{val}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-[var(--color-text)] border-t border-[var(--color-border)] pt-1.5 mt-1">
                <span>Total</span><span>{formatCurrency(detailOrder.total)}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Shipping Address</p>
              <address className="not-italic text-sm text-[var(--color-text)] space-y-0.5">
                <p>{detailOrder.shippingAddress?.name}</p>
                <p>{detailOrder.shippingAddress?.address}</p>
                <p>{detailOrder.shippingAddress?.city}, {detailOrder.shippingAddress?.zip}</p>
                <p>{detailOrder.shippingAddress?.country}</p>
              </address>
            </div>

            {/* Timestamps */}
            <p className="text-xs text-[var(--color-text-muted)]">
              Placed on {formatDate(detailOrder.createdAt, "medium")}
            </p>
          </div>
        )}
      </Drawer>
    </>
  );
}
