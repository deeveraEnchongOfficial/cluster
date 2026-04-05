# Shadcn-Admin UI Migration Guide

This document outlines the migration of the Cluster application UI to a shadcn-admin-based design system.

## Overview

The migration introduces a modern, accessible, and themeable UI based on shadcn/ui components with dark mode support, improved navigation, and consistent design patterns.

## What Changed

### 1. **Theme System**
- Added CSS variables for theming in `resources/css/app.css`
- Configured dark mode support in `tailwind.config.js`
- Created `ThemeProvider` component for theme management
- Added theme toggle in header

### 2. **New Layout System**

#### Components Created:
- **`AppShell`** (`resources/js/Components/layout/app-shell.jsx`)
  - Main layout wrapper with sidebar and header
  - Handles responsive behavior
  
- **`Sidebar`** (`resources/js/Components/layout/sidebar.jsx`)
  - Collapsible navigation with Lucide icons
  - Active route highlighting
  - Nested menu support (Portfolio section)
  - Mobile-responsive with overlay
  
- **`Header`** (`resources/js/Components/layout/header.jsx`)
  - Global search bar
  - Theme toggle (light/dark)
  - Notifications bell
  - User dropdown menu
  
- **`PageHeader`** (`resources/js/Components/layout/page-header.jsx`)
  - Consistent page title and description
  - Action button placement
  
- **`AdminLayout`** (`resources/js/Layouts/AdminLayout.jsx`)
  - Wrapper combining AppShell and PageHeader
  - Replaces DashboardLayout for new pages

### 3. **New UI Components**

Added shadcn/ui components:
- `dropdown-menu` - User menu, context menus
- `separator` - Visual dividers
- `avatar` - User avatars with fallbacks
- `badge` - Status indicators, tags
- `tooltip` - Hover information
- `scroll-area` - Scrollable containers

### 4. **Updated Components**

Enhanced existing components with theme support:
- `Button` - Now uses CSS variables
- `Card` - Theme-aware styling
- `Input` - Consistent with design system
- `DataTable` - Updated for dark mode

## Migration Steps for Remaining Pages

### Step 1: Update Imports

**Before:**
```jsx
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
```

**After:**
```jsx
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
// Import Lucide icons as needed
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
```

### Step 2: Replace Layout Component

**Before:**
```jsx
<DashboardLayout header="Page Title">
  <Head title="Page Title" />
  {/* content */}
</DashboardLayout>
```

**After:**
```jsx
<AdminLayout
  title="Page Title"
  description="Optional description"
  action={
    <Button asChild>
      <Link href={route('some.route')}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Action Button
      </Link>
    </Button>
  }
>
  {/* content */}
</AdminLayout>
```

### Step 3: Update Color Classes

Replace hardcoded colors with theme variables:

**Before:**
```jsx
className="bg-blue-600 text-white"
className="text-gray-500"
className="border-gray-200"
```

**After:**
```jsx
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border"
```

### Step 4: Replace Custom Components with shadcn

#### Badges/Tags:
**Before:**
```jsx
<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
  Published
</span>
```

**After:**
```jsx
<Badge variant="default">Published</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Tag</Badge>
```

#### Buttons:
**Before:**
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded">
  Click Me
</button>
```

**After:**
```jsx
<Button>Click Me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
```

#### Cards:
**Before:**
```jsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

**After:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

## Theme Variables Reference

### Light Mode
```css
--background: 0 0% 100%
--foreground: 240 10% 3.9%
--primary: 240 5.9% 10%
--muted: 240 4.8% 95.9%
--border: 240 5.9% 90%
```

### Dark Mode
```css
--background: 240 10% 3.9%
--foreground: 0 0% 98%
--primary: 0 0% 98%
--muted: 240 3.7% 15.9%
--border: 240 3.7% 15.9%
```

## Icon Migration

Replace emoji icons with Lucide React icons:

```jsx
// Before
<span className="mr-3 text-base">🏠</span>

// After
import { Home } from 'lucide-react'
<Home className="mr-3 h-4 w-4" />
```

### Common Icon Mappings:
- 🏠 → `LayoutDashboard`
- 📁 → `FolderKanban`
- 📎 → `FileText`
- ✅ → `CheckSquare`
- 👥 → `Users`
- 📅 → `Calendar`
- 📈 → `BarChart3`
- 💼 → `Briefcase`
- 🎨 → `Palette`
- 💡 → `Lightbulb`
- 🛠️ → `Wrench`
- 🏆 → `Trophy`
- 📝 → `BookOpen`

## Pages Already Migrated

✅ **Dashboard** (`resources/js/Pages/Dashboard.jsx`)
- Stats cards with icons
- Chart integration
- Recent sales list

✅ **Blog Browse** (`resources/js/Pages/Portfolio/Blog/Browse.jsx`)
- DataTable with badges
- Search filters
- Bulk actions
- Pagination

✅ **Projects Index** (`resources/js/Pages/Projects/Index.jsx`)
- Project cards with badges
- Empty state
- Action buttons

## Pages to Migrate

The following pages still use `DashboardLayout` and should be migrated:

- [ ] `resources/js/Pages/Files/Browse.jsx`
- [ ] `resources/js/Pages/Files/Upsert.jsx`
- [ ] `resources/js/Pages/Portfolio/Blog/Upsert.jsx`
- [ ] `resources/js/Pages/Projects/Create.jsx`
- [ ] `resources/js/Pages/Projects/Edit.jsx`
- [ ] `resources/js/Pages/Projects/Show.jsx`
- [ ] `resources/js/Pages/Profile/Edit.jsx`

## Testing Checklist

After migrating a page, verify:

- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly (toggle in header)
- [ ] Mobile responsive (sidebar collapses)
- [ ] Navigation highlights active route
- [ ] All buttons and links work
- [ ] Forms submit correctly
- [ ] Data tables load and interact properly
- [ ] Icons render correctly
- [ ] No console errors

## Backward Compatibility

The old `DashboardLayout` is still available and functional. Pages can be migrated incrementally without breaking existing functionality.

## Dependencies Added

```json
{
  "tailwindcss-animate": "^1.0.7",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-tooltip": "^1.0.7",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "class-variance-authority": "^0.7.0"
}
```

## Configuration Files Modified

1. **`tailwind.config.js`**
   - Added dark mode support
   - Added theme color variables
   - Added animations

2. **`resources/css/app.css`**
   - Added CSS variables for light/dark themes
   - Added base styles

3. **`resources/js/app.jsx`**
   - Wrapped app with `ThemeProvider`
   - Added `TooltipProvider`

## Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Use Lucide icons** for consistency
3. **Leverage shadcn components** instead of custom styling
4. **Test in both light and dark modes**
5. **Ensure mobile responsiveness**
6. **Keep business logic unchanged** - only update UI layer
7. **Use semantic HTML** with proper ARIA labels

## Troubleshooting

### Dark mode not working
- Ensure `ThemeProvider` wraps your app in `app.jsx`
- Check that Tailwind config has `darkMode: ['class']`

### Icons not showing
- Verify Lucide React is installed: `lucide-react`
- Check import statements

### Styles not applying
- Run `npm run build` or `npm run dev`
- Clear browser cache
- Check CSS variable definitions in `app.css`

### Sidebar not responsive
- Verify `AppShell` component is being used
- Check mobile breakpoints in Tailwind config

## Support

For questions or issues during migration:
1. Review this guide
2. Check shadcn/ui documentation: https://ui.shadcn.com
3. Reference migrated pages as examples
4. Check the shadcn-admin reference: https://github.com/satnaing/shadcn-admin
