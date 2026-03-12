import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Package, MapPin, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { ColorModeToggle } from "@/components/ui/ColorModeToggle";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user.service";
import { orderService } from "@/services/order.service";
import { authService } from "@/services/auth.service";
import { profileSchema, addressSchema, changePasswordSchema } from "@/utils/validators";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { cn } from "@/utils/cn";

const TABS = [
  { id: "profile",   label: "Profile",   icon: User },
  { id: "orders",    label: "Orders",    icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "security",  label: "Security",  icon: Lock },
];

export default function ProfilePage() {
  const [sp, setSp]         = useSearchParams();
  const activeTab           = sp.get("tab") || "profile";
  const { user, updateUser } = useAuth();
  const qc                  = useQueryClient();
  const [orderPage, setOrderPage]   = useState(1);
  const [addrModal, setAddrModal]   = useState(false);
  const [editAddr, setEditAddr]     = useState(null);
  const [deleteAddr, setDeleteAddr] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Profile form
  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || "", phone: user?.phone || "" } });

  // Address form
  const addrForm = useForm({ resolver: zodResolver(addressSchema) });

  // Password form
  const pwForm = useForm({ resolver: zodResolver(changePasswordSchema) });

  // Queries
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders", orderPage],
    queryFn:  () => userService.getMyOrders({ page: orderPage, limit: 8 }),
    enabled:  activeTab === "orders",
    select:   d => d,
  });

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn:  userService.getProfile,
    select:   d => d.data,
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (res) => { toast.success("Profile updated"); updateUser(res.data); },
    onError: e => toast.error(e.response?.data?.message || "Update failed"),
  });

  const addAddrMutation = useMutation({
    mutationFn: (body) => editAddr ? userService.updateAddress(editAddr._id, body) : userService.addAddress(body),
    onSuccess: () => {
      toast.success(editAddr ? "Address updated" : "Address added");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      setAddrModal(false); setEditAddr(null); addrForm.reset();
    },
    onError: e => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteAddrMutation = useMutation({
    mutationFn: (id) => userService.deleteAddress(id),
    onSuccess: () => { toast.success("Address removed"); qc.invalidateQueries({ queryKey: ["my-profile"] }); setDeleteAddr(null); },
  });

  const changePwMutation = useMutation({
    mutationFn: (body) => authService.changePassword(body),
    onSuccess: () => { toast.success("Password changed"); pwForm.reset(); },
    onError: e => toast.error(e.response?.data?.message || "Failed"),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id) => orderService.cancel(id),
    onSuccess: () => {
      toast.success("Order cancelled");
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      setCancelTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not cancel order"),
  });

  const openAddAddr = () => { addrForm.reset(); setEditAddr(null); setAddrModal(true); };
  const openEditAddr = (a) => { addrForm.reset(a); setEditAddr(a); setAddrModal(true); };

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar nav */}
        <aside className="md:w-56 shrink-0">
          <div className="card p-4 space-y-1">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <Avatar src={user?.avatar} name={user?.name} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-text)] truncate">{user?.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
              </div>
            </div>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSp({ tab: id })}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                  activeTab === id
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                )}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="space-y-4">
            {/* Appearance */
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-[var(--color-text)]">Appearance</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Choose how the store looks for you.</p>
              <ColorModeToggle variant="full" />
            </div>
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--color-text)] mb-5">Profile Information</h2>
              <form onSubmit={profileForm.handleSubmit(d => updateProfileMutation.mutate(d))} className="space-y-4 max-w-md">
                <Input label="Full Name" required error={profileForm.formState.errors.name?.message} {...profileForm.register("name")} />
                <Input label="Phone" {...profileForm.register("phone")} />
                <Input label="Email" value={user?.email || ""} disabled helper="Email cannot be changed — contact support to change" />
                <Button type="submit" loading={updateProfileMutation.isPending}>Save Changes</Button>
              </form>
            </div>
            </div>
          )}

          {/* Orders tab */
          {activeTab === "orders" && (
            <div className="space-y-3">
              {ordersLoading ? (
                <div className="flex justify-center py-16"><Spinner /></div>
              ) : !ordersData?.data?.length ? (
                <EmptyState title="No orders yet" description="Your orders will appear here." className="py-16" />
              ) : (
                <>
                  {ordersData.data.map(order => (
                    <div key={order._id} className="card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-semibold text-[var(--color-text)]">{order.orderNumber}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate(order.createdAt, "medium")} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={statusVariant[order.orderStatus] || "muted"}>{order.orderStatus}</Badge>
                          <span className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(order.total)}</span>
                          {["pending","confirmed"].includes(order.orderStatus) && (
                            <button onClick={() => setCancelTarget(order)}
                              className="text-xs text-[var(--color-error)] hover:underline font-medium shrink-0">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {ordersData?.pagination?.pages > 1 && (
                    <div className="flex justify-center pt-2">
                      <Pagination page={orderPage} pages={ordersData.pagination.pages} onPageChange={setOrderPage} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Addresses tab */}
          {activeTab === "addresses" && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" onClick={openAddAddr}>+ Add Address</Button>
              </div>
              {!profileData?.addresses?.length ? (
                <EmptyState title="No saved addresses" description="Add your first shipping address." action={{ label: "Add Address", onClick: openAddAddr }} className="py-16" />
              ) : (
                profileData.addresses.map(addr => (
                  <div key={addr._id} className="card p-4 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{addr.name}</p>
                        {addr.isDefault && <Badge variant="primary">Default</Badge>}
                      </div>
                      <address className="not-italic text-sm text-[var(--color-text-muted)] space-y-0.5">
                        <p>{addr.address}</p>
                        <p>{addr.city}, {addr.zip} · {addr.country}</p>
                        {addr.phone && <p>{addr.phone}</p>}
                      </address>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openEditAddr(addr)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteAddr(addr)}>Delete</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Security tab */}
          {activeTab === "security" && (
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--color-text)] mb-5">Change Password</h2>
              <form onSubmit={pwForm.handleSubmit(d => changePwMutation.mutate(d))} className="space-y-4 max-w-md">
                <Input label="Current Password" type="password" required error={pwForm.formState.errors.currentPassword?.message} {...pwForm.register("currentPassword")} />
                <Input label="New Password" type="password" required error={pwForm.formState.errors.newPassword?.message} {...pwForm.register("newPassword")} />
                <Input label="Confirm New Password" type="password" required error={pwForm.formState.errors.confirmPassword?.message} {...pwForm.register("confirmPassword")} />
                <Button type="submit" loading={changePwMutation.isPending}>Update Password</Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Address modal */}
      <Modal
        isOpen={addrModal}
        onClose={() => { setAddrModal(false); setEditAddr(null); }}
        title={editAddr ? "Edit Address" : "Add Address"}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddrModal(false)}>Cancel</Button>
            <Button loading={addAddrMutation.isPending} onClick={addrForm.handleSubmit(d => addAddrMutation.mutate(d))}>
              {editAddr ? "Save" : "Add"}
            </Button>
          </>
        }
      >
        <form className="space-y-3">
          <Input label="Full Name" required error={addrForm.formState.errors.name?.message} {...addrForm.register("name")} />
          <Input label="Address" required error={addrForm.formState.errors.address?.message} {...addrForm.register("address")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" required error={addrForm.formState.errors.city?.message} {...addrForm.register("city")} />
            <Input label="ZIP" required error={addrForm.formState.errors.zip?.message} {...addrForm.register("zip")} />
          </div>
          <Input label="Country" required error={addrForm.formState.errors.country?.message} {...addrForm.register("country")} />
          <Input label="Phone" {...addrForm.register("phone")} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded" {...addrForm.register("isDefault")} />
            Set as default address
          </label>
        </form>
      </Modal>

      {/* Cancel order confirm */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Order" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep Order</Button>
            <Button variant="danger" loading={cancelOrderMutation.isPending}
              onClick={() => cancelOrderMutation.mutate(cancelTarget._id)}>Yes, Cancel</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          Cancel order <strong className="text-[var(--color-text)] font-mono">{cancelTarget?.orderNumber}</strong>?
          Stock will be restored automatically.
        </p>
      </Modal>

      {/* Delete address confirm */}
      <Modal isOpen={!!deleteAddr} onClose={() => setDeleteAddr(null)} title="Remove Address" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteAddr(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteAddrMutation.isPending} onClick={() => deleteAddrMutation.mutate(deleteAddr._id)}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">Remove <strong className="text-[var(--color-text)]">{deleteAddr?.address}, {deleteAddr?.city}</strong>?</p>
      </Modal>
    </div>
  );
}
