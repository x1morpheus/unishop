import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, ShoppingBag, Package, Users, Clock, Zap,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/services/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const fetchOverview    = () => api.get("/admin/analytics/overview").then(r => r.data.data);
const fetchRevChart    = () => api.get("/admin/analytics/revenue?period=30").then(r => r.data.data);
const fetchTopProducts = () => api.get("/admin/analytics/top-products?limit=5").then(r => r.data.data);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: ov,   isLoading: loadOv }   = useQuery({ queryKey: ["admin","overview"],       queryFn: fetchOverview });
  const { data: flashSaleCount } = useQuery({
    queryKey: ["flash-sales-count"],
    queryFn: () => import("@/services/product.service").then(m => m.productService.getFlashSales({ limit: 100 })).then(r => r.data?.length ?? 0),
    refetchInterval: 60_000,
  });
  const { data: rev,  isLoading: loadRev }   = useQuery({ queryKey: ["admin","rev-chart"],      queryFn: fetchRevChart });
  const { data: top,  isLoading: loadTop }   = useQuery({ queryKey: ["admin","top-products"],   queryFn: fetchTopProducts });

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard
          loading={loadOv}
          title="Total Revenue"
          value={ov ? formatCurrency(ov.totalRevenue) : "—"}
          icon={<DollarSign size={18} className="text-[var(--color-primary)]" />}
          trendLabel="all time"
        />
        <StatCard
          loading={loadOv}
          title="Total Orders"
          value={ov?.totalOrders ?? "—"}
          icon={<ShoppingBag size={18} className="text-emerald-600" />}
          color="bg-emerald-50"
          trendLabel="all time"
        />
        <StatCard
          loading={loadOv}
          title="Products"
          value={ov?.totalProducts ?? "—"}
          icon={<Package size={18} className="text-violet-600" />}
          color="bg-violet-50"
          trendLabel="active"
        />
        <StatCard
          loading={loadOv}
          title="Customers"
          value={ov?.totalCustomers ?? "—"}
          icon={<Users size={18} className="text-amber-600" />}
          color="bg-amber-50"
          trendLabel="registered"
        />
        <StatCard
          title="Flash Sales"
          value={flashSaleCount ?? "—"}
          icon={<Zap size={18} className="text-rose-600" fill="currentColor" />}
          color="bg-rose-50"
          trendLabel="live now"
          onClick={() => navigate("/admin/flash-sales")}
        />
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--color-text)]">Revenue — last 30 days</h2>
          {loadRev && <Spinner size="sm" />}
        </div>
        {rev?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rev} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickFormatter={d => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickFormatter={v => `$${v}`} />
              <Tooltip
                formatter={v => [formatCurrency(v), "Revenue"]}
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : !loadRev ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-10">No revenue data yet</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Top Products by Revenue</h2>
          {loadTop ? (
            <Spinner size="sm" />
          ) : (
            <ul className="space-y-3">
              {top?.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] w-5 shrink-0">{i + 1}</span>
                  <img
                    src={p.image || "/placeholder.png"}
                    alt={p.name}
                    className="h-9 w-9 rounded-lg object-cover bg-[var(--color-background)] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{p.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{p.unitsSold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text)] shrink-0">
                    {formatCurrency(p.revenue)}
                  </span>
                </li>
              ))}
              {(!top || top.length === 0) && (
                <p className="text-sm text-[var(--color-text-muted)]">No data yet</p>
              )}
            </ul>
          )}
        </div>

        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--color-text)]">Recent Orders</h2>
            {ov?.pendingOrders > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Clock size={12} />
                {ov.pendingOrders} pending
              </span>
            )}
          </div>
          {loadOv ? (
            <Spinner size="sm" />
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {ov?.recentOrders?.map(order => (
                <li key={order._id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text)]">{order.orderNumber}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{order.user?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[order.orderStatus] || "muted"}>
                      {order.orderStatus}
                    </Badge>
                    <span className="text-xs font-semibold text-[var(--color-text)]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </li>
              ))}
              {(!ov?.recentOrders || ov.recentOrders.length === 0) && (
                <p className="text-sm text-[var(--color-text-muted)] py-4">No orders yet</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
