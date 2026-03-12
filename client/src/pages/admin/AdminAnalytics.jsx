import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingBag, Package2, Users2 } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/services/api";
import { formatCurrency } from "@/utils/formatCurrency";

const PIE_COLORS = ["#6C63FF","#43E97B","#FF6584","#f59e0b","#3b82f6","#ec4899","#14b8a6"];

const periodOpts = [
  { value: "7",   label: "Last 7 days" },
  { value: "30",  label: "Last 30 days" },
  { value: "90",  label: "Last 90 days" },
  { value: "365", label: "Last year" },
];

const fetchOverview   = () => api.get("/admin/analytics/overview").then(r => r.data.data);
const fetchRevenue    = (p) => api.get(`/admin/analytics/revenue?period=${p}`).then(r => r.data.data);
const fetchByStatus   = ()  => api.get("/admin/analytics/orders-by-status").then(r => r.data.data);
const fetchTopProd    = ()  => api.get("/admin/analytics/top-products?limit=8").then(r => r.data.data);
const fetchByCat      = ()  => api.get("/admin/analytics/revenue-by-category").then(r => r.data.data);

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("30");

  const { data: ov } = useQuery({ queryKey: ["analytics","overview"], queryFn: fetchOverview });
  const { data: rev, isLoading: loadRev } = useQuery({ queryKey: ["analytics","revenue", period], queryFn: () => fetchRevenue(period) });
  const { data: byStatus } = useQuery({ queryKey: ["analytics","byStatus"], queryFn: fetchByStatus });
  const { data: topProd }  = useQuery({ queryKey: ["analytics","topProd"], queryFn: fetchTopProd });
  const { data: byCat }    = useQuery({ queryKey: ["analytics","byCat"], queryFn: fetchByCat });

  const chartTooltipStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={ov ? formatCurrency(ov.totalRevenue) : "—"}
          icon={<TrendingUp size={18} className="text-[var(--color-primary)]" />} />
        <StatCard title="Total Orders" value={ov?.totalOrders ?? "—"}
          icon={<ShoppingBag size={18} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard title="Active Products" value={ov?.totalProducts ?? "—"}
          icon={<Package2 size={18} className="text-violet-600" />} color="bg-violet-50" />
        <StatCard title="Customers" value={ov?.totalCustomers ?? "—"}
          icon={<Users2 size={18} className="text-amber-600" />} color="bg-amber-50" />
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--color-text)]">Revenue Over Time</h2>
          <Select options={periodOpts} value={period} onChange={e => setPeriod(e.target.value)} containerClassName="w-40" />
        </div>
        {loadRev ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : rev?.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={rev} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [formatCurrency(v), "Revenue"]} contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#aGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-center text-[var(--color-text-muted)] py-16">No revenue data yet</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status — pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Orders by Status</h2>
          {byStatus?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={85} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center text-[var(--color-text-muted)] py-16">No order data yet</p>
          )}
        </div>

        {/* Top products — horizontal bar */}
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Top Products by Revenue</h2>
          {topProd?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProd} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickFormatter={n => n.length > 14 ? n.slice(0, 14) + "…" : n} />
                <Tooltip formatter={v => [formatCurrency(v), "Revenue"]} contentStyle={chartTooltipStyle} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center text-[var(--color-text-muted)] py-16">No product data yet</p>
          )}
        </div>
      </div>

      {/* Revenue by category */}
      <div className="card p-5">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Revenue by Category</h2>
        {byCat?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCat}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [formatCurrency(v), "Revenue"]} contentStyle={chartTooltipStyle} />
              <Bar dataKey="revenue" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-center text-[var(--color-text-muted)] py-10">No category data yet</p>
        )}
      </div>
    </div>
  );
}
