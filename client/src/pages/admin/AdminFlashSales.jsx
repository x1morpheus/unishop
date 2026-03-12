import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, ZapOff, Clock, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import api from "@/services/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useDebounce } from "@/hooks/useDebounce";

const BADGE_OPTS = [
  { value: "",           label: "None" },
  { value: "new",        label: "🆕 New" },
  { value: "best-seller",label: "⭐ Best Seller" },
  { value: "limited",    label: "⏳ Limited" },
  { value: "hot",        label: "🔥 Hot" },
];

const fetchProducts = (params) =>
  api.get("/admin/products", { params }).then((r) => r.data);

const updateFlashSale = (id, body) =>
  api.put(`/products/${id}`, body).then((r) => r.data);

export default function AdminFlashSales() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]         = useState({});

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["flash-products", page, debouncedSearch],
    queryFn:  () => fetchProducts({ page, limit: 15, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, body }) => updateFlashSale(id, body),
    onSuccess: () => {
      toast.success("Flash sale updated");
      qc.invalidateQueries({ queryKey: ["flash-products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Update failed"),
  });

  const openEdit = (row) => {
    setEditTarget(row);
    const fs = row.flashSale || {};
    setForm({
      flashSaleActive: fs.isActive || false,
      flashSalePrice:  fs.salePrice ?? "",
      flashSaleEndsAt: fs.endsAt ? fs.endsAt.slice(0, 16) : "",
      flashSaleLabel:  fs.label || "Flash Sale",
      badge:           row.badge || "",
      isFeatured:      row.isFeatured || false,
    });
  };

  const handleSave = () => {
    const body = {
      flashSale: {
        isActive:  form.flashSaleActive,
        salePrice: form.flashSalePrice !== "" ? Number(form.flashSalePrice) : null,
        endsAt:    form.flashSaleEndsAt || null,
        label:     form.flashSaleLabel || "Flash Sale",
      },
      badge:      form.badge,
      isFeatured: form.isFeatured,
    };
    saveMutation.mutate({ id: editTarget._id, body });
  };

  const toggleFlashSale = (row) => {
    const isActive = !row.flashSale?.isActive;
    saveMutation.mutate({
      id: row._id,
      body: { flashSale: { ...row.flashSale, isActive } },
    });
  };

  const now = new Date();
  const isLive = (row) =>
    row.flashSale?.isActive &&
    row.flashSale?.salePrice != null &&
    (!row.flashSale?.endsAt || new Date(row.flashSale.endsAt) > now);

  const columns = [
    {
      key: "image", label: "", render: (row) => (
        <img src={row.images?.[0] || "/placeholder.png"} alt={row.name}
          className="h-9 w-9 rounded-lg object-cover bg-[var(--color-background)]" />
      ),
    },
    {
      key: "name", label: "Product", render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-text)] line-clamp-1">{row.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.category?.name}</p>
        </div>
      ),
    },
    { key: "price", label: "Regular", render: (row) => formatCurrency(row.price) },
    {
      key: "salePrice", label: "Sale Price", render: (row) =>
        row.flashSale?.salePrice != null
          ? <span className="text-[var(--color-error)] font-semibold">{formatCurrency(row.flashSale.salePrice)}</span>
          : <span className="text-[var(--color-text-muted)]">—</span>,
    },
    {
      key: "endsAt", label: "Ends At", render: (row) =>
        row.flashSale?.endsAt
          ? <span className="flex items-center gap-1 text-xs"><Clock size={11} />{formatDate(row.flashSale.endsAt, "short")}</span>
          : <span className="text-[var(--color-text-muted)] text-xs">No expiry</span>,
    },
    {
      key: "badge", label: "Badge", render: (row) =>
        row.badge ? <Badge variant="primary">{row.badge}</Badge> : <span className="text-[var(--color-text-muted)]">—</span>,
    },
    {
      key: "status", label: "Flash Status", render: (row) => (
        <Badge variant={isLive(row) ? "success" : row.flashSale?.isActive ? "warning" : "muted"}>
          {isLive(row) ? "🔥 Live" : row.flashSale?.isActive ? "⏰ Scheduled" : "Off"}
        </Badge>
      ),
    },
    {
      key: "actions", label: "", render: (row) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => openEdit(row)} aria-label="Edit"><Pencil size={14} /></Button>
          <Button size="icon" variant="ghost" onClick={() => toggleFlashSale(row)} aria-label="Toggle flash sale">
            {isLive(row) || row.flashSale?.isActive
              ? <ZapOff size={14} className="text-[var(--color-error)]" />
              : <Zap size={14} className="text-[var(--color-warning)]" />}
          </Button>
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
        searchPlaceholder="Search products…"
        emptyTitle="No products found"
      />

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Flash Sale — ${editTarget?.name}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button loading={saveMutation.isPending} onClick={handleSave}>Save</Button>
          </>
        }
      >
        {editTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Flash Sale Active</p>
                <p className="text-xs text-[var(--color-text-muted)]">Shoppers see the sale badge + discounted price</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.flashSaleActive}
                  onChange={(e) => setForm((f) => ({ ...f, flashSaleActive: e.target.checked }))} />
                <div className="w-10 h-5 bg-[var(--color-border)] rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div>
              <label className="label">Sale Price</label>
              <input type="number" step="0.01" placeholder={`Regular: ${formatCurrency(editTarget.price)}`}
                className="input w-full"
                value={form.flashSalePrice}
                onChange={(e) => setForm((f) => ({ ...f, flashSalePrice: e.target.value }))} />
              {form.flashSalePrice && form.flashSalePrice < editTarget.price && (
                <p className="text-xs text-emerald-600 mt-1">
                  💰 {Math.round((1 - form.flashSalePrice / editTarget.price) * 100)}% off!
                </p>
              )}
            </div>

            <div>
              <label className="label">Sale Label</label>
              <input type="text" placeholder="Flash Sale"
                className="input w-full"
                value={form.flashSaleLabel}
                onChange={(e) => setForm((f) => ({ ...f, flashSaleLabel: e.target.value }))} />
            </div>

            <div>
              <label className="label">Ends At (optional)</label>
              <input type="datetime-local" className="input w-full"
                value={form.flashSaleEndsAt}
                onChange={(e) => setForm((f) => ({ ...f, flashSaleEndsAt: e.target.value }))} />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Leave blank for no expiry</p>
            </div>

            <Select
              label="Product Badge"
              options={BADGE_OPTS}
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
            />

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
              <span className="text-[var(--color-text)]">Featured on homepage</span>
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
