'use client'

import { useState, useRef, useCallback } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import DataTable from './DataTable'
import ColumnMapper from './ColumnMapper'
import type { CSVRow } from '@/lib/types'

type ColumnMapping = {
  dateColumn: string
  metrics: Array<{
    column: string
    metric_name: string
    unit: string
    color: string
  }>
}

type CSVUploaderProps = {
  existingMetrics: Array<{ id: string; name: string }>
  onSuccess: (count: number) => void
}

export default function CSVUploader({ existingMetrics, onSuccess }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<CSVRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ rows_imported: number; metrics_created: number } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setError('')

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[]
        setRows(data)
        setColumns(results.meta.fields ?? [])
        setMapping(null)
      },
      error: (err) => {
        setError(`Parse error: ${err.message}`)
      },
    })
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) handleFile(f)
    else setError('Please upload a CSV file.')
  }

  async function handleImport() {
    if (!mapping || rows.length === 0) return
    setImporting(true)
    setError('')

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, mapping }),
    })

    const data = await res.json()
    setImporting(false)

    if (!res.ok) {
      setError(data.error ?? 'Upload failed')
    } else {
      setResult(data)
      onSuccess(data.rows_imported)
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-[#22c55e]" />
        </div>
        <h3 className="text-lg font-semibold text-[#fafafa] mb-1">Import successful</h3>
        <p className="text-sm text-[#71717a] mb-1">{result.rows_imported} data points imported</p>
        {result.metrics_created > 0 && (
          <p className="text-sm text-[#71717a]">{result.metrics_created} new metrics created</p>
        )}
        <button
          onClick={() => { setFile(null); setRows([]); setColumns([]); setMapping(null); setResult(null) }}
          className="mt-4 text-sm text-[#6366f1] hover:text-[#4f46e5] transition-colors"
        >
          Upload another file
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#6366f1] bg-[#6366f1]/5'
              : 'border-[#3f3f46] hover:border-[#6366f1]/50 hover:bg-[#27272a]/50'
          }`}
        >
          <Upload className="w-8 h-8 text-[#71717a] mb-3" />
          <p className="text-sm font-medium text-[#fafafa] mb-1">Drop your CSV file here</p>
          <p className="text-xs text-[#71717a]">or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between bg-[#27272a] border border-[#3f3f46] rounded-lg px-4 py-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#6366f1]" />
            <div>
              <p className="text-sm font-medium text-[#fafafa]">{file.name}</p>
              <p className="text-xs text-[#71717a]">{rows.length} rows · {columns.length} columns</p>
            </div>
          </div>
          <button onClick={() => { setFile(null); setRows([]); setColumns([]) }} className="text-[#71717a] hover:text-[#fafafa]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {columns.length > 0 && rows.length > 0 && (
        <>
          <div>
            <p className="text-xs font-medium text-[#71717a] uppercase tracking-wide mb-2">Preview (first 5 rows)</p>
            <DataTable rows={rows} columns={columns} maxRows={5} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#71717a] uppercase tracking-wide mb-3">Column mapping</p>
            <ColumnMapper
              columns={columns}
              rows={rows}
              existingMetrics={existingMetrics}
              onMappingChange={setMapping}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!mapping || importing}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {importing ? 'Importing...' : `Import ${rows.length} rows`}
          </button>
        </>
      )}
    </div>
  )
}
