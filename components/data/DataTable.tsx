type DataTableProps = {
  rows: Record<string, string>[]
  columns: string[]
  maxRows?: number
}

export default function DataTable({ rows, columns, maxRows = 5 }: DataTableProps) {
  const preview = rows.slice(0, maxRows)

  return (
    <div className="overflow-x-auto rounded-lg border border-[#3f3f46]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#3f3f46]">
            {columns.map((col) => (
              <th key={col} className="px-4 py-2.5 text-left text-xs font-medium text-[#71717a] uppercase tracking-wide whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.map((row, i) => (
            <tr key={i} className="border-b border-[#3f3f46] last:border-0 hover:bg-[#27272a] transition-colors">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2.5 text-[#fafafa] font-mono text-xs whitespace-nowrap">
                  {row[col] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div className="px-4 py-2 border-t border-[#3f3f46]">
          <p className="text-xs text-[#71717a]">
            Showing {maxRows} of {rows.length} rows
          </p>
        </div>
      )}
    </div>
  )
}
