import { useState } from "react";
import { ChevronUp, ChevronDown, Search, ChevronsUpDown } from "lucide-react";
import PropTypes from "prop-types";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";

/**
 * Column definition:
 * @typedef {{ key: string, label: string, sortable?: boolean, render?: (row) => React.ReactNode, className?: string }} Column
 */

/**
 * @param {{
 *   columns: Column[],
 *   data: object[],
 *   total?: number,
 *   page?: number,
 *   pages?: number,
 *   onPageChange?: (page: number) => void,
 *   onSort?: (key: string, dir: "asc"|"desc") => void,
 *   onSearch?: (query: string) => void,
 *   loading?: boolean,
 *   searchPlaceholder?: string,
 *   emptyTitle?: string,
 *   emptyDescription?: string,
 *   actions?: React.ReactNode,
 *   rowKey?: (row: object) => string,
 * }} props
 */
export function DataTable({
  columns,
  data,
  total = 0,
  page = 1,
  pages = 1,
  onPageChange,
  onSort,
  onSearch,
  loading,
  searchPlaceholder = "Search…",
  emptyTitle = "No results found",
  emptyDescription,
  actions,
  rowKey = (row) => row._id,
}) {
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [searchVal, setSearchVal] = useState("");

  const handleSort = (key) => {
    if (!onSort) return;
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort(key, newDir);
  };

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={13} className="opacity-40" />;
    return sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  };
  SortIcon.propTypes = { colKey: PropTypes.string };

  return (
    <div className="card overflow-hidden flex flex-col gap-0">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onSearch && (
            <Input
              value={searchVal}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              leftAddon={<Search size={14} />}
              containerClassName="w-full sm:w-64"
            />
          )}
          {total > 0 && (
            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap shrink-0">
              {total} result{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] whitespace-nowrap",
                    col.sortable && onSort && "cursor-pointer select-none hover:text-[var(--color-text)] transition-colors",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && onSort && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} className="py-16" />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="hover:bg-[var(--color-background)] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-[var(--color-text)]", col.className)}>
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-end p-4 border-t border-[var(--color-border)]">
          <Pagination page={page} pages={pages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

DataTable.propTypes = {
  columns:          PropTypes.arrayOf(PropTypes.object).isRequired,
  data:             PropTypes.array.isRequired,
  total:            PropTypes.number,
  page:             PropTypes.number,
  pages:            PropTypes.number,
  onPageChange:     PropTypes.func,
  onSort:           PropTypes.func,
  onSearch:         PropTypes.func,
  loading:          PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  emptyTitle:       PropTypes.string,
  emptyDescription: PropTypes.string,
  actions:          PropTypes.node,
  rowKey:           PropTypes.func,
};
