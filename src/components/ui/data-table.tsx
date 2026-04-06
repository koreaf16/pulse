import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  stickyHeader?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyMessage = 'No data available',
  stickyHeader = true,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-auto rounded-lg border border-[#E8ECEF]', className)}>
      <table className="min-w-full text-sm">
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr className="border-b border-[#E8ECEF] bg-[#F5F6FA]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#636E72] whitespace-nowrap',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  (!col.align || col.align === 'left') && 'text-left'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5F6FA] bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[#B2BEC3]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={String(row[keyField])} className="transition-colors hover:bg-[#FAFBFC]">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-[#1A1D23] whitespace-nowrap',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.mono && 'font-data text-xs'
                    )}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
