import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { productService } from "@/services/product.service";
import { uploadService } from "@/services/upload.service";
import { productSchema } from "@/utils/validators";
import { formatCurrency } from "@/utils/formatCurrency";
import { useDebounce } from "@/hooks/useDebounce";

const EMPTY = { name:"", description:"", price:"", comparePrice:"", stock:"", category:"", tags:"", isActive:true, isFeatured:false, badge:"", images:[] };

export default function AdminProducts() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imgUploading, setImgUploading] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
    select: d => d.data.map(c => ({ value: c._id, label: c.name })),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, debouncedSearch, catFilter],
    queryFn: () => productService.getProducts({ page, limit: 15, search: debouncedSearch, category: catFilter }),
    keepPreviousData: true,
  });

  const form = useForm({ resolver: zodResolver(productSchema), defaultValues: EMPTY });
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = form;
  const images = watch("images") || [];

  const openAdd = () => { reset(EMPTY); setEditTarget(null); setModalOpen(true); };
  const openEdit = (row) => {
    reset({
      ...row,
      price:        String(row.price),
      comparePrice: String(row.comparePrice || ""),
      stock:        String(row.stock),
      category:     row.category?._id || row.category || "",
      tags:         (row.tags || []).join(", "),
      images:       row.images || [],
    });
    setEditTarget(row);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (body) => editTarget
      ? productService.update(editTarget._id, body)
      : productService.create(body),
    onSuccess: () => {
      toast.success(editTarget ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setModalOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.remove(id),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImgUploading(true);
    try {
      const uploaded = await uploadService.uploadImages(files);
      setValue("images", [...images, ...uploaded.map(u => u.url)]);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const onSubmit = (vals) => {
    saveMutation.mutate({
      ...vals,
      price:        Number(vals.price),
      comparePrice: vals.comparePrice ? Number(vals.comparePrice) : undefined,
      stock:        Number(vals.stock),
    });
  };

  const columns = [
    {
      key: "image", label: "Image", render: (row) => (
        <img src={row.images?.[0] || "/placeholder.png"} alt={row.name}
          className="h-10 w-10 rounded-lg object-cover bg-[var(--color-background)]" />
      ),
    },
    {
      key: "name", label: "Product", sortable: true, render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-text)] line-clamp-1">{row.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.category?.name}</p>
        </div>
      ),
    },
    { key: "price", label: "Price", sortable: true, render: (row) => formatCurrency(row.price) },
    { key: "stock", label: "Stock", sortable: true, render: (row) => (
        <span className={row.stock === 0 ? "text-[var(--color-error)] font-medium" : ""}>{row.stock}</span>
      )
    },
    {
      key: "isActive", label: "Status", render: (row) => (
        <Badge variant={row.isActive ? "success" : "muted"}>{row.isActive ? "Active" : "Inactive"}</Badge>
      ),
    },
    {
      key: "actions", label: "", render: (row) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => openEdit(row)} aria-label="Edit">
            <Pencil size={14} />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} aria-label="Delete">
            <Trash2 size={14} className="text-[var(--color-error)]" />
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
        emptyDescription="Add your first product to get started."
        actions={
          <div className="flex items-center gap-2">
            <Select
              options={[{ value: "", label: "All categories" }, ...(cats || [])]}
              value={catFilter}
              onChange={e => { setCatFilter(e.target.value); setPage(1); }}
              containerClassName="w-44"
            />
            <Button onClick={openAdd} leftIcon={<Plus size={15} />}>Add Product</Button>
          </div>
        }
      />

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Product" : "Add Product"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={isSubmitting || saveMutation.isPending} onClick={handleSubmit(onSubmit)}>
              {editTarget ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" required error={errors.name?.message} {...register("name")} />
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[80px] resize-none" {...register("description")} />
            {errors.description && <p className="text-xs text-[var(--color-error)] mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Price" required type="number" step="0.01" error={errors.price?.message} {...register("price")} />
            <Input label="Compare Price" type="number" step="0.01" {...register("comparePrice")} />
            <Input label="Stock" required type="number" error={errors.stock?.message} {...register("stock")} />
          </div>
          <Select
            label="Category"
            required
            options={[{ value: "", label: "Select category" }, ...(cats || [])]}
            error={errors.category?.message}
            {...register("category")}
          />
          <Input label="Tags" helper="Comma-separated, e.g. sale, new, featured" {...register("tags")} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("isActive")} />
              <span className="text-sm text-[var(--color-text)]">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("isFeatured")} />
              <span className="text-sm text-[var(--color-text)]">Featured</span>
            </label>
          </div>
          <Select
            label="Badge"
            options={[
              { value: "", label: "None" },
              { value: "new", label: "New" },
              { value: "best-seller", label: "Best Seller" },
              { value: "limited", label: "Limited" },
              { value: "hot", label: "🔥 Hot" },
            ]}
            {...register("badge")}
          />

          {/* Images */}
          <div>
            <p className="label mb-2">Images</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="h-16 w-16 object-cover rounded-lg" />
                  <button type="button"
                    onClick={() => setValue("images", images.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[var(--color-error)] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                </div>
              ))}
              <label className={`h-16 w-16 border-2 border-dashed border-[var(--color-border)] rounded-lg flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors ${imgUploading ? "opacity-50 pointer-events-none" : ""}`}>
                <ImagePlus size={18} className="text-[var(--color-text-muted)]" />
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget._id)}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          Are you sure you want to delete <strong className="text-[var(--color-text)]">{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </>
  );
}
