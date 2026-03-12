import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import api from "@/services/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useTheme } from "@/hooks/useTheme";
import { useDebounce } from "@/hooks/useDebounce";

const fetchVendors = (params) => api.get("/vendors/admin/all", { params }).then(r => r.data);

export default function AdminVendors() {
  const { storeMode } = useTheme();
  const qc = useQueryClient();
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [detailVendor, setDetailVendor] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { vendor, type: "approve"|"suspend" }

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors", page, debouncedSearch, pendingOnly],
    queryFn:  () => fetchVendors({ page, limit: 15, search: debouncedSearch, isApproved: pendingOnly ? false : undefined }),
    keepPreviousData: true,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/vendors/${id}/approve`),
    onSuccess: () => { toast.success("Vendor approved"); qc.invalidateQueries({ queryKey: ["admin-vendors"] }); setConfirmAction(null); },
    onError: e => toast.error(e.response?.data?.message || "Failed"),
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => api.patch(`/vendors/${id}/suspend`),
    onSuccess: () => { toast.success("Vendor suspended"); qc.invalidateQueries({ queryKey: ["admin-vendors"] }); setConfirmAction(null); },
    onError: e => toast.error(e.response?.data?.message || "Failed"),
  });

  if (storeMode !== "multi") {
    return (
      <EmptyState
        title="Multi-vendor mode disabled"
        description="Set storeMode to 'multi' in theme.config.js to enable vendor management."
        className="py-32"
      />
    );
  }

  const columns = [
    {
      key: "storeName", label: "Store", render: row => (
        <div className="flex items-center gap-3">
          <Avatar src={row.logo} name={row.storeName} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{row.storeName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{row.storeSlug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "user", label: "Owner", render: row => (
        <div>
          <p className="text-sm text-[var(--color-text)]">{row.user?.name ?? "—"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: "isApproved", label: "Status", render: row => (
        <Badge variant={row.isApproved ? (row.isActive ? "success" : "error") : "warning"}>
          {!row.isApproved ? "Pending" : row.isActive ? "Approved" : "Suspended"}
        </Badge>
      ),
    },
    { key: "totalOrders",  label: "Orders",  render: row => row.totalOrders ?? 0 },
    { key: "totalRevenue", label: "Revenue", render: row => formatCurrency(row.totalRevenue ?? 0) },
    { key: "createdAt",    label: "Applied",  render: row => formatDate(row.createdAt, "short") },
    {
      key: "actions", label: "", render: row => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setDetailVendor(row)}><Eye size={14} /></Button>
          {!row.isApproved && (
            <Button size="icon" variant="ghost"
              onClick={() => setConfirmAction({ vendor: row, type: "approve" })}>
              <CheckCircle size={14} className="text-[var(--color-success)]" />
            </Button>
          )}
          {row.isActive && row.isApproved && (
            <Button size="icon" variant="ghost"
              onClick={() => setConfirmAction({ vendor: row, type: "suspend" })}>
              <XCircle size={14} className="text-[var(--color-error)]" />
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
        onSearch={setSearch}
        loading={isLoading}
        searchPlaceholder="Search vendors…"
        emptyTitle="No vendors found"
        actions={
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} className="rounded" />
            <span className="text-[var(--color-text-muted)]">Pending only</span>
          </label>
        }
      />

      {/* Confirm modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === "approve" ? "Approve Vendor" : "Suspend Vendor"}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.type === "suspend" ? "danger" : "primary"}
              loading={approveMutation.isPending || suspendMutation.isPending}
              onClick={() => confirmAction.type === "approve"
                ? approveMutation.mutate(confirmAction.vendor._id)
                : suspendMutation.mutate(confirmAction.vendor._id)
              }
            >
              {confirmAction?.type === "approve" ? "Approve" : "Suspend"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          {confirmAction?.type === "approve"
            ? `Approve "${confirmAction.vendor.storeName}"? They will be able to list products immediately.`
            : `Suspend "${confirmAction?.vendor.storeName}"? Their store will be hidden from customers.`}
        </p>
      </Modal>

      {/* Vendor detail drawer */}
      <Drawer isOpen={!!detailVendor} onClose={() => setDetailVendor(null)} title="Vendor Details" size="sm">
        {detailVendor && (
          <div className="p-5 space-y-4">
            {detailVendor.banner && (
              <img src={detailVendor.banner} alt="Banner" className="w-full h-24 object-cover rounded-xl" />
            )}
            <div className="flex items-center gap-3">
              <Avatar src={detailVendor.logo} name={detailVendor.storeName} size="lg" />
              <div>
                <p className="font-semibold text-[var(--color-text)]">{detailVendor.storeName}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{detailVendor.storeSlug}</p>
              </div>
            </div>
            {detailVendor.description && (
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{detailVendor.description}</p>
            )}
            <div className="admin-surface p-4 rounded-xl space-y-2 text-sm">
              {[
                ["Contact",  detailVendor.contactEmail],
                ["Phone",    detailVendor.contactPhone || "—"],
                ["Orders",   detailVendor.totalOrders ?? 0],
                ["Revenue",  formatCurrency(detailVendor.totalRevenue ?? 0)],
                ["Applied",  formatDate(detailVendor.createdAt, "medium")],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-[var(--color-text-muted)]">{k}</span>
                  <span className="text-[var(--color-text)] font-medium truncate">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
