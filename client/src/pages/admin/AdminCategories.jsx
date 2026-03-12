import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import api from "@/services/api";
import { formatDate } from "@/utils/formatDate";

const categorySchema = z.object({
  name:        z.string().min(2, "Name is required").max(80),
  description: z.string().max(500).optional(),
  image:       z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sortOrder:   z.coerce.number().int().nonnegative().optional(),
  isActive:    z.boolean().optional().default(true),
});

const EMPTY = { name: "", description: "", image: "", sortOrder: 0, isActive: true };

const fetchCategories = () => api.get("/admin/categories").then((r) => r.data.data);

export default function AdminCategories() {
  const qc = useQueryClient();
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");

  const { data: cats = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn:  fetchCategories,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: EMPTY,
  });

  const openAdd  = () => { reset(EMPTY); setEditTarget(null); setModalOpen(true); };
  const openEdit = (row) => {
    reset({ name: row.name, description: row.description || "", image: row.image || "", sortOrder: row.sortOrder ?? 0, isActive: row.isActive });
    setEditTarget(row); setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (body) => editTarget
      ? api.put(`/admin/categories/${editTarget._id}`, body)
      : api.post("/admin/categories", body),
    onSuccess: () => {
      toast.success(editTarget ? "Category updated" : "Category created");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setModalOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const filtered = cats.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "image", label: "Icon", render: (row) =>
        row.image
          ? <img src={row.image} alt={row.name} className="h-9 w-9 rounded-lg object-cover bg-[var(--color-background)]" />
          : <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center"><Tag size={14} className="text-[var(--color-primary)]" /></div>,
    },
    { key: "name",      label: "Name",      sortable: true, render: (row) => <span className="font-medium text-[var(--color-text)]">{row.name}</span> },
    { key: "slug",      label: "Slug",      render: (row) => <code className="text-xs text-[var(--color-text-muted)] bg-[var(--color-background)] px-1.5 py-0.5 rounded">{row.slug}</code> },
    { key: "sortOrder", label: "Sort", render: (row) => row.sortOrder ?? 0 },
    { key: "isActive",  label: "Status", render: (row) => <Badge variant={row.isActive ? "success" : "muted"}>{row.isActive ? "Active" : "Hidden"}</Badge> },
    { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt, "short") },
    {
      key: "actions", label: "", render: (row) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => openEdit(row)} aria-label="Edit"><Pencil size={14} /></Button>
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
        data={filtered}
        total={cats.length}
        loading={isLoading}
        onSearch={setSearch}
        searchPlaceholder="Search categories…"
        emptyTitle="No categories yet"
        emptyDescription="Add your first category to organise products."
        actions={<Button onClick={openAdd} leftIcon={<Plus size={15} />}>Add Category</Button>}
      />

      {/* Add / Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Category" : "Add Category"}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={isSubmitting || saveMutation.isPending} onClick={handleSubmit((d) => saveMutation.mutate(d))}>
              {editTarget ? "Save Changes" : "Create Category"}
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
          <Input label="Name" required error={errors.name?.message} {...register("name")} />
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[70px] resize-none" {...register("description")} />
          </div>
          <Input label="Image URL" placeholder="https://…" error={errors.image?.message} {...register("image")} />
          <Input label="Sort Order" type="number" {...register("sortOrder")} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded" {...register("isActive")} />
            <span className="text-[var(--color-text)]">Active (visible to shoppers)</span>
          </label>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget._id)}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          Delete <strong className="text-[var(--color-text)]">{deleteTarget?.name}</strong>?
          This will fail if any products are still assigned to it.
        </p>
      </Modal>
    </>
  );
}
