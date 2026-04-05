# Shadcn-Admin Data Table

This is the official shadcn-admin table implementation using `@tanstack/react-table` v8.

## Components

### DataTable
The main table component with built-in sorting, filtering, pagination, and row selection.

**Props:**
- `columns` - Array of column definitions
- `data` - Array of data to display
- `searchKey` - Column key to enable search filtering (optional)
- `pageSize` - Number of rows per page (default: 10)

### DataTableToolbar
Optional toolbar component for search and filters.

**Props:**
- `table` - Table instance from useReactTable
- `searchKey` - Column key for search input
- `searchPlaceholder` - Placeholder text for search input

### Column Helpers

#### `createSelectColumn()`
Creates a checkbox column for row selection.

```jsx
const columns = [
  createSelectColumn(),
  // ... other columns
]
```

#### `createSortableHeader(column, title)`
Creates a sortable column header with arrow icon.

```jsx
{
  accessorKey: 'name',
  header: ({ column }) => createSortableHeader(column, 'Name'),
  cell: ({ row }) => row.getValue('name'),
}
```

#### `createActionsColumn(onEdit, onDelete)`
Creates an actions column with dropdown menu.

```jsx
const columns = [
  // ... other columns
  createActionsColumn(
    (item) => router.visit(`/items/${item.id}/edit`),
    (item) => router.delete(`/items/${item.id}`)
  ),
]
```

## Usage Example

### Basic Table

```jsx
import { DataTable } from '@/Components/data-table/data-table'
import { createSelectColumn, createSortableHeader } from '@/Components/data-table/columns'

export default function MyPage({ items }) {
  const columns = [
    createSelectColumn(),
    {
      accessorKey: 'name',
      header: ({ column }) => createSortableHeader(column, 'Name'),
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => createSortableHeader(column, 'Email'),
      cell: ({ row }) => row.getValue('email'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status')
        return <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
      },
    },
  ]

  return (
    <AdminLayout title="Items">
      <DataTable columns={columns} data={items} searchKey="name" />
    </AdminLayout>
  )
}
```

### Advanced Table with Custom Actions

```jsx
import { DataTable } from '@/Components/data-table/data-table'
import { createSelectColumn, createSortableHeader } from '@/Components/data-table/columns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu'
import { Button } from '@/Components/ui/button'
import { MoreHorizontal } from 'lucide-react'

export default function MyPage({ items }) {
  const handleDelete = (item) => {
    if (confirm('Are you sure?')) {
      router.delete(route('items.destroy', item))
    }
  }

  const columns = [
    createSelectColumn(),
    {
      accessorKey: 'name',
      header: ({ column }) => createSortableHeader(column, 'Name'),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={route('items.edit', item)}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <AdminLayout title="Items">
      <DataTable columns={columns} data={items} searchKey="name" />
    </AdminLayout>
  )
}
```

## Column Definition Reference

### Basic Column

```jsx
{
  accessorKey: 'fieldName',
  header: 'Column Title',
  cell: ({ row }) => row.getValue('fieldName'),
}
```

### Sortable Column

```jsx
{
  accessorKey: 'fieldName',
  header: ({ column }) => createSortableHeader(column, 'Column Title'),
  cell: ({ row }) => row.getValue('fieldName'),
}
```

### Custom Cell Rendering

```jsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const status = row.getValue('status')
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    )
  },
}
```

### Column with Filtering

```jsx
{
  accessorKey: 'status',
  header: ({ column }) => createSortableHeader(column, 'Status'),
  cell: ({ row }) => row.getValue('status'),
  filterFn: (row, id, value) => {
    return value.includes(row.getValue(id))
  },
}
```

## Features

✅ **Row Selection** - Select individual or all rows with checkboxes
✅ **Sorting** - Click column headers to sort ascending/descending
✅ **Filtering** - Built-in search by column key
✅ **Pagination** - Navigate through pages with Previous/Next buttons
✅ **Responsive** - Mobile-friendly with horizontal scroll
✅ **Theme Support** - Full dark mode compatibility
✅ **Accessibility** - ARIA labels and keyboard navigation

## Accessing Selected Rows

The table manages row selection internally. To access selected rows:

```jsx
// Inside your component
const [table, setTable] = React.useState(null)

// In DataTable component, expose the table instance
<DataTable 
  columns={columns} 
  data={items}
  onTableReady={setTable}
/>

// Access selected rows
const selectedRows = table?.getFilteredSelectedRowModel().rows
```

## Customization

### Change Page Size

```jsx
<DataTable columns={columns} data={items} pageSize={20} />
```

### Disable Row Selection

Simply don't include `createSelectColumn()` in your columns array.

### Custom Empty State

Modify the empty state in `data-table.jsx`:

```jsx
<TableCell colSpan={columns.length} className="h-24 text-center">
  <div className="flex flex-col items-center justify-center">
    <p className="text-muted-foreground">No results found.</p>
    <Button variant="link">Create your first item</Button>
  </div>
</TableCell>
```

## Migration from Old DataTable

**Before:**
```jsx
import { DataTable, DataTableCard } from '@/Components/data-table'

<DataTableCard>
  <DataTable
    columns={columns}
    items={data}
    selectable={true}
    selected={selected}
    onSelect={handleSelect}
  />
</DataTableCard>
```

**After:**
```jsx
import { DataTable } from '@/Components/data-table/data-table'
import { createSelectColumn } from '@/Components/data-table/columns'

const columns = [
  createSelectColumn(),
  // ... your columns
]

<DataTable columns={columns} data={data} searchKey="title" />
```

## Best Practices

1. **Use `createSelectColumn()` first** in your columns array for consistent checkbox placement
2. **Add `searchKey` prop** to enable search functionality
3. **Use `createSortableHeader()`** for columns that should be sortable
4. **Keep cell rendering simple** - extract complex logic to separate functions
5. **Use `row.original`** to access the full data object in cells
6. **Provide meaningful `id`** for action columns
7. **Use `enableHiding: false`** for columns that should always be visible

## Troubleshooting

### Columns not sorting
Ensure you're using `createSortableHeader()` in the header definition.

### Search not working
Make sure you've passed the `searchKey` prop matching a column's `accessorKey`.

### Selection not showing
Include `createSelectColumn()` as the first item in your columns array.

### TypeScript errors
The table uses generic types. Ensure your data array type matches the column definitions.
