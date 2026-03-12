import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserX, UserCheck, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
import { userService } from "@/services/user.service";
import { formatDate } from "@/utils/formatDate";
import { ROLES_LIST } from "@shared/constants";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [detailUser, setDetailUser] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null); // { user, action: "activate"|"deactivate" }

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", page, debouncedSearch, roleFilter],
    queryFn:  () => userService.adminGetAll({ page, limit: 15, search: debouncedSearch, role: roleFilter }),
    keepPreviousData: true,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => userService.adminUpdate(id, { isActive }),
    onSuccess: (_, vars) => {
      toast.success(vars.isActive ? "User activated" : "User deactivated");
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      setConfirmTarget(null);
    },
    onError: e => toast.error(e.response?.data?.message || "Action failed"),
  });

  const columns = [
    {
      key: "name", label: "User", sortable: true, render: row => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{row.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", label: "Role", render: row => (
        <Badge variant={row.role === "admin" ? "error" : row.role === "vendor" ? "primary" : "muted"}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: "isActive", label: "Status", render: row => (
        <Badge variant={row.isActive ? "success" : "error"}>{row.isActive ? "Active" : "Inactive"}</Badge>
      ),
    },
    { key: "createdAt", label: "Joined", render: row => formatDate(row.createdAt, "short") },
    {
      key: "actions", label: "", render: row => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setDetailUser(row)} aria-label="View">
            <Eye size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmTarget({ user: row, action: row.isActive ? "deactivate" : "activate" })}
            aria-label={row.isActive ? "Deactivate" : "Activate"}
          >
            {row.isActive
              ? <UserX size={14} className="text-[var(--color-error)]" />
              : <UserCheck size={14} className="text-[var(--color-success)]" />
            }
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
        searchPlaceholder="Search customers…"
        emptyTitle="No customers found"
        actions={
          <Select
            options={[
              { value: "", label: "All roles" },
              ...ROLES_LIST.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })),
            ]}
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            containerClassName="w-40"
          />
        }
      />

      {/* Confirm toggle modal */}
      <Modal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title={confirmTarget?.action === "activate" ? "Activate User" : "Deactivate User"}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmTarget(null)}>Cancel</Button>
            <Button
              variant={confirmTarget?.action === "deactivate" ? "danger" : "primary"}
              loading={toggleMutation.isPending}
              onClick={() => toggleMutation.mutate({ id: confirmTarget.user._id, isActive: confirmTarget.action === "activate" })}
            >
              {confirmTarget?.action === "activate" ? "Activate" : "Deactivate"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          {confirmTarget?.action === "deactivate"
            ? `Deactivating ${confirmTarget.user.name} will prevent them from signing in.`
            : `Activating ${confirmTarget?.user.name} will restore their access.`
          }
        </p>
      </Modal>

      {/* User detail drawer */}
      <Drawer isOpen={!!detailUser} onClose={() => setDetailUser(null)} title="Customer Details" size="sm">
        {detailUser && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={detailUser.avatar} name={detailUser.name} size="xl" />
              <div>
                <p className="font-semibold text-[var(--color-text)]">{detailUser.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{detailUser.email}</p>
              </div>
            </div>
            <div className="admin-surface p-4 rounded-xl space-y-3 text-sm">
              {[
                ["Role",    <Badge key="r" variant={detailUser.role === "admin" ? "error" : "muted"}>{detailUser.role}</Badge>],
                ["Status",  <Badge key="s" variant={detailUser.isActive ? "success" : "error"}>{detailUser.isActive ? "Active" : "Inactive"}</Badge>],
                ["Phone",   detailUser.phone || "—"],
                ["Joined",  formatDate(detailUser.createdAt, "medium")],
                ["Last Login", detailUser.lastLogin ? formatDate(detailUser.lastLogin, "medium") : "—"],
                ["Addresses", detailUser.addresses?.length ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-[var(--color-text-muted)]">{label}</span>
                  <span className="text-[var(--color-text)] font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
