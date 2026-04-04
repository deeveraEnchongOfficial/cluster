import { Button } from '@/Components/ui/button'
import { Card, CardContent } from '@/Components/ui/card'
import Checkbox from '@/Components/Checkbox'
import Pagination from '@/Components/Pagination'
import { cn } from '@/lib/utils'
import { router } from '@inertiajs/react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { ChevronDownIcon } from 'lucide-react'
import { useMemo } from 'react'

export function DataTableCard({ children }) {
    return (
        <Card className="py-2">
            <CardContent className="px-0">{children}</CardContent>
        </Card>
    )
}

export function DataTable({
    columns,
    items,
    placeholder = 'No results.',
    selectable = false,
    selected = [],
    onSelect,
    getRowId = (row) => row.id,
}) {
    const columnDefinitions = useMemo(
        () =>
            selectable
                ? [
                      {
                          id: 'select',
                          header: ({ table }) => (
                              <Checkbox
                                  checked={
                                      table.getIsAllPageRowsSelected() ||
                                      (table.getIsSomePageRowsSelected() &&
                                          'indeterminate')
                                  }
                                  onCheckedChange={(value) =>
                                      table.toggleAllPageRowsSelected(!!value)
                                  }
                                  aria-label="Select/Deselect All"
                                  className="mb-1 rounded-full size-4"
                              />
                          ),
                          cell: ({ row }) => (
                              <Checkbox
                                  checked={row.getIsSelected()}
                                  onCheckedChange={(value) =>
                                      row.toggleSelected(!!value)
                                  }
                                  aria-label="Select/Deselect Row"
                                  className="mb-1 rounded-full size-4"
                              />
                          ),
                          enableSorting: false,
                          enableHiding: false,
                      },
                      ...columns,
                  ]
                : columns,
        [columns, selectable]
    )
    const currentSelection =
        selected?.reduce((acc, id) => ({ ...acc, [id]: true }), {}) ?? {}
    const table = useReactTable({
        data: items,
        columns: columnDefinitions,
        getCoreRowModel: getCoreRowModel(),
        state: {
            rowSelection: currentSelection,
        },
        onRowSelectionChange: (rowSelection) => {
            const newState =
                typeof rowSelection === 'function'
                    ? rowSelection(currentSelection)
                    : rowSelection

            onSelect?.(
                Object.entries(newState)
                    .filter(([, value]) => value === true)
                    .map(([key]) => key)
            )
        },
        getRowId: (row, index) => getRowId?.(row) || index,
    })

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase first:pl-3 last:pr-3"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className="hover:bg-gray-50"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="px-6 py-4 whitespace-nowrap first:pl-3 last:pr-3"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + (selectable ? 1 : 0)}
                                className="px-6 py-12 text-center"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="mb-4 text-5xl text-gray-400">📝</div>
                                    <div className="text-sm text-gray-500">
                                        {placeholder}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
