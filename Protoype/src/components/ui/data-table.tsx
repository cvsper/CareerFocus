import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  mobileCard?: (item: T) => React.ReactNode
  emptyState?: React.ReactNode
  className?: string
}

function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  mobileCard,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0)
  const totalPages = Math.ceil(data.length / pageSize)
  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize)

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile card view */}
      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {paginatedData.map((item, i) => (
            <React.Fragment key={i}>{mobileCard(item)}</React.Fragment>
          ))}
        </div>
      )}

      {/* Desktop table view */}
      <div className={cn("rounded-lg border overflow-hidden", mobileCard ? "hidden md:block" : "")}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.className,
                    col.hideOnMobile && "hidden md:table-cell"
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.className,
                      col.hideOnMobile && "hidden md:table-cell"
                    )}
                  >
                    {col.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1}-
            {Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable, type Column }
