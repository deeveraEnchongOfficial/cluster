---
description: UI Design Component Standards - Based on shadcn-admin-main Reference
---

# UI Design Component Standards Agent

This workflow ensures all UI components follow the **shadcn-admin-main** reference codebase patterns located in `/Users/Emmanuel/Documents/MyProjects/cluster/shadcn-admin-main/`.

---

## 🎯 Core Principles

All UI components MUST adhere to these standards from the reference codebase:

### 1. **Component Structure**
- Use shadcn/ui components from `@/Components/ui/`
- Follow composition patterns (Card + CardHeader + CardContent)
- Implement proper TypeScript types
- Use Lucide React icons (never emoji or SVG inline)

### 2. **Layout Patterns**
Reference: `shadcn-admin-main/src/components/layout/`

**Required Structure:**
```jsx
<Header>
  <TopNav links={topNav} />
  <Search />
  <ThemeSwitch />
  <ProfileDropdown />
</Header>

<Main>
  {/* Page content */}
</Main>
```

**For Laravel/Inertia (Current Project):**
```jsx
<AdminLayout
  title="Page Title"
  description="Description"
  breadcrumbs={[...]}
  action={<Button>...</Button>}
>
  {/* Page content */}
</AdminLayout>
```

### 3. **Component Imports**
Reference: `shadcn-admin-main/src/features/dashboard/index.tsx`

**Always import from:**
- `@/Components/ui/button`
- `@/Components/ui/card`
- `@/Components/ui/badge`
- `@/Components/ui/input`
- `@/Components/ui/select`
- `@/Components/ui/dialog`
- `@/Components/ui/dropdown-menu`
- `@/Components/ui/table`
- `@/Components/data-table/data-table`
- `lucide-react` (for icons)

### 4. **Card Components**
Reference: `shadcn-admin-main/src/features/dashboard/index.tsx:60-84`

**Standard Pattern:**
```jsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Title</CardTitle>
    <IconComponent className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
  </CardContent>
</Card>
```

**Stats Card Grid:**
```jsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* Cards here */}
</div>
```

### 5. **Data Tables**
Reference: `shadcn-admin-main/src/components/data-table/`

**Required Features:**
- Sortable columns with `createSortableHeader()`
- Row selection with `createSelectColumn()`
- Search functionality with `searchKey` prop
- Actions dropdown with `createActionsColumn()`
- Pagination built-in

**Standard Pattern:**
```jsx
import { DataTable } from '@/Components/data-table/data-table'
import { createSelectColumn, createSortableHeader, createActionsColumn } from '@/Components/data-table/columns'

const columns = [
  createSelectColumn(),
  {
    accessorKey: 'name',
    header: ({ column }) => createSortableHeader(column, 'Name'),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  createActionsColumn({
    onEdit: (row) => router.visit(`/items/${row.id}/edit`),
    onDelete: (row) => handleDelete(row.id),
  }),
]

<DataTable columns={columns} data={items} searchKey="name" />
```

### 6. **Form Components**
Reference: `shadcn-admin-main/src/features/`

**Input Fields:**
```jsx
<div className="space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input
    id="name"
    type="text"
    value={data.name}
    onChange={(e) => setData('name', e.target.value)}
    placeholder="Enter name"
  />
  {errors.name && (
    <Alert variant="destructive" className="mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{errors.name}</AlertDescription>
    </Alert>
  )}
</div>
```

**Select Dropdowns:**
```jsx
<Select value={data.status} onValueChange={(value) => setData('status', value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
  </SelectContent>
</Select>
```

**Textarea:**
```jsx
<Textarea
  value={data.description}
  onChange={(e) => setData('description', e.target.value)}
  rows={4}
  placeholder="Enter description"
/>
```

### 7. **Buttons**
Reference: `shadcn-admin-main/src/components/ui/button.tsx`

**Variants:**
- `default` - Primary actions
- `outline` - Secondary actions
- `ghost` - Tertiary actions
- `destructive` - Delete/danger actions
- `secondary` - Alternative styling
- `link` - Link-styled buttons

**With Icons:**
```jsx
<Button>
  <PlusCircle className="mr-2 h-4 w-4" />
  Create New
</Button>
```

**As Link (Inertia):**
```jsx
<Button asChild>
  <Link href="/projects/create">
    <PlusCircle className="mr-2 h-4 w-4" />
    Create Project
  </Link>
</Button>
```

### 8. **Badges**
Reference: `shadcn-admin-main/src/components/ui/badge.tsx`

**Variants:**
- `default` - Primary/active states
- `secondary` - Secondary states
- `outline` - Outlined style
- `destructive` - Error/danger states

**Usage:**
```jsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Pending</Badge>
<Badge variant="destructive">Error</Badge>
```

### 9. **Icons**
Reference: All files use `lucide-react`

**Standard Icons:**
- `LayoutDashboard` - Dashboard
- `FolderKanban` - Projects
- `FileText` - Files/Documents
- `Users` - Users
- `Settings` - Settings
- `PlusCircle` - Create/Add
- `Pencil` - Edit
- `Trash2` - Delete
- `Download` - Download
- `Upload` - Upload
- `Search` - Search
- `Filter` - Filter
- `MoreHorizontal` - More actions
- `ChevronDown` - Dropdown indicator

**Never Use:**
- ❌ Emoji icons (🏠, 📁, etc.)
- ❌ Inline SVG (except for custom graphics)
- ❌ Font Awesome or other icon libraries

### 10. **Theme Support**
Reference: `shadcn-admin-main/src/components/theme-switch.tsx`

**CSS Variables (Always Use):**
- `bg-background` - Page background
- `bg-card` - Card background
- `bg-muted` - Muted background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border` - Border color
- `ring` - Focus ring

**Never Hardcode:**
- ❌ `bg-white`, `bg-gray-100`
- ❌ `text-black`, `text-gray-600`
- ❌ `border-gray-200`

**Always Use Theme Variables:**
- ✅ `bg-background`, `bg-card`
- ✅ `text-foreground`, `text-muted-foreground`
- ✅ `border`

### 11. **Spacing & Layout**
Reference: `shadcn-admin-main/src/features/dashboard/index.tsx`

**Page Header:**
```jsx
<div className="mb-2 flex items-center justify-between space-y-2">
  <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
  <div className="flex items-center space-x-2">
    <Button>Action</Button>
  </div>
</div>
```

**Grid Layouts:**
```jsx
// 2 columns on mobile, 4 on desktop
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

// 1 column on mobile, 7-column grid on desktop
<div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
  <Card className="col-span-1 lg:col-span-4">...</Card>
  <Card className="col-span-1 lg:col-span-3">...</Card>
</div>
```

**Spacing:**
- `space-y-4` - Vertical spacing between sections
- `gap-4` - Grid gap
- `space-x-2` - Horizontal spacing for buttons
- `mb-2` - Bottom margin for headers

### 12. **Tabs**
Reference: `shadcn-admin-main/src/features/dashboard/index.tsx:41-57`

```jsx
<Tabs defaultValue="overview" className="space-y-4">
  <div className="w-full overflow-x-auto pb-2">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
    </TabsList>
  </div>
  <TabsContent value="overview" className="space-y-4">
    {/* Content */}
  </TabsContent>
  <TabsContent value="analytics" className="space-y-4">
    {/* Content */}
  </TabsContent>
</Tabs>
```

### 13. **Breadcrumbs**
Reference: Current project implementation

**Always Include:**
```jsx
breadcrumbs={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Section', href: '/section' },
  { label: 'Current Page', href: '/section/current' },
]}
```

### 14. **Empty States**
Reference: Current project `Files/Browse.jsx`

```jsx
{items.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold">No items found</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Get started by creating your first item.
    </p>
    <Button asChild>
      <Link href="/items/create">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Item
      </Link>
    </Button>
  </div>
)}
```

### 15. **Dropdown Menus**
Reference: `shadcn-admin-main/src/components/ui/dropdown-menu.tsx`

```jsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleEdit(item)}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleDelete(item)}>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🔍 Validation Checklist

Before creating or modifying any UI component, verify:

- [ ] Uses shadcn/ui components from `@/Components/ui/`
- [ ] Uses Lucide React icons (no emoji)
- [ ] Uses theme CSS variables (no hardcoded colors)
- [ ] Follows card composition pattern (Card + CardHeader + CardContent)
- [ ] Includes proper breadcrumbs
- [ ] Has responsive grid layouts (sm:, lg: breakpoints)
- [ ] Uses AdminLayout wrapper
- [ ] Has proper spacing (space-y-4, gap-4)
- [ ] Includes empty states for lists
- [ ] Has loading/disabled states for buttons
- [ ] Uses proper button variants
- [ ] Has validation error alerts
- [ ] Follows TypeScript typing
- [ ] Has proper accessibility (aria-labels, keyboard nav)

---

## 📚 Reference Files

**Primary References:**
- Layout: `shadcn-admin-main/src/components/layout/authenticated-layout.tsx`
- Dashboard: `shadcn-admin-main/src/features/dashboard/index.tsx`
- UI Components: `shadcn-admin-main/src/components/ui/`
- Data Tables: `shadcn-admin-main/src/components/data-table/`

**Current Project Examples:**
- Dashboard: `resources/js/Pages/Dashboard.jsx`
- Projects: `resources/js/Pages/Projects/`
- Files: `resources/js/Pages/Files/Browse.jsx`
- Blogs: `resources/js/Pages/Portfolio/Blog/Browse.jsx`

---

## 🚀 Implementation Steps

When creating a new UI component:

1. **Check Reference** - Look at `shadcn-admin-main/src/` for similar patterns
2. **Use AdminLayout** - Wrap page with AdminLayout + breadcrumbs
3. **Import Components** - Use shadcn/ui components only
4. **Add Icons** - Import from lucide-react
5. **Theme Variables** - Use CSS variables for colors
6. **Responsive Grid** - Use sm:, lg: breakpoints
7. **Empty States** - Add helpful empty state messages
8. **Validation** - Use Alert components for errors
9. **Test Both Themes** - Verify in light and dark mode
10. **Mobile Test** - Ensure responsive on mobile

---

## ⚠️ Common Mistakes to Avoid

1. **DON'T** use emoji icons (🏠, 📁) - Use Lucide React
2. **DON'T** hardcode colors (bg-white, text-black) - Use theme variables
3. **DON'T** skip breadcrumbs - Always include navigation context
4. **DON'T** use inline styles - Use Tailwind classes
5. **DON'T** forget empty states - Always handle empty data
6. **DON'T** skip responsive design - Use mobile-first approach
7. **DON'T** use old DashboardLayout - Use AdminLayout
8. **DON'T** forget TypeScript types - Type all props
9. **DON'T** skip accessibility - Add aria-labels
10. **DON'T** forget dark mode - Test in both themes

---

## 🎨 Quick Reference

**Component Hierarchy:**
```
AdminLayout
  └── Header (title, description, breadcrumbs, action)
      └── Main Content
          ├── Page Header (h1, buttons)
          ├── Tabs (optional)
          ├── Stats Grid (Cards)
          ├── Data Table / Content Grid
          └── Pagination
```

**Import Template:**
```jsx
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { DataTable } from '@/Components/data-table/data-table'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { Link } from '@inertiajs/react'
```

---

## 📖 Documentation

For detailed component documentation, refer to:
- `SHADCN_ADMIN_COMPLETE.md` - Complete migration guide
- `resources/js/Components/data-table/README.md` - Table documentation
- `resources/js/Components/layout/README.md` - Layout documentation
- `shadcn-admin-main/` - Reference implementation

---

**Last Updated:** April 25, 2026
**Reference Codebase:** `/Users/Emmanuel/Documents/MyProjects/cluster/shadcn-admin-main/`
