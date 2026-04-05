# Layout Components

This directory contains the core layout components for the shadcn-admin design system.

## Components

### AppShell
**File:** `app-shell.jsx`

The main application shell that wraps all authenticated pages.

**Features:**
- Responsive sidebar navigation
- Header with search and user menu
- Mobile-friendly with overlay
- Automatic layout management

**Usage:**
```jsx
import { AppShell } from '@/Components/layout/app-shell'

<AppShell>
  {children}
</AppShell>
```

### Sidebar
**File:** `sidebar.jsx`

Collapsible navigation sidebar with route highlighting.

**Features:**
- Lucide React icons
- Active route detection
- Nested menu support (Portfolio section)
- Mobile responsive with backdrop
- Smooth transitions

**Props:**
- `isOpen` (boolean) - Controls sidebar visibility on mobile
- `onClose` (function) - Callback when backdrop is clicked

**Navigation Structure:**
```jsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  // ...
]
```

### Header
**File:** `header.jsx`

Top navigation bar with search, theme toggle, and user menu.

**Features:**
- Global search input
- Dark/light theme toggle
- Notification bell
- User dropdown menu with avatar
- Mobile menu button

**Props:**
- `onMenuClick` (function) - Callback for mobile menu button

**User Menu Items:**
- Profile
- Settings
- Logout

### PageHeader
**File:** `page-header.jsx`

Consistent page title and action button placement.

**Props:**
- `title` (string) - Page title
- `description` (string, optional) - Page description
- `action` (ReactNode, optional) - Action button or component
- `className` (string, optional) - Additional CSS classes

**Usage:**
```jsx
<PageHeader
  title="Projects"
  description="Manage your projects"
  action={
    <Button asChild>
      <Link href="/projects/create">Create Project</Link>
    </Button>
  }
/>
```

## AdminLayout Wrapper

**File:** `../Layouts/AdminLayout.jsx`

Convenience wrapper that combines AppShell and PageHeader.

**Usage:**
```jsx
import AdminLayout from '@/Layouts/AdminLayout'

export default function MyPage() {
  return (
    <AdminLayout
      title="Page Title"
      description="Optional description"
      action={<Button>Action</Button>}
    >
      {/* Your page content */}
    </AdminLayout>
  )
}
```

## Customization

### Adding Navigation Items

Edit `sidebar.jsx`:

```jsx
const navigation = [
  // Add your item
  { name: 'New Section', href: '/new-section', icon: YourIcon },
]
```

### Changing Theme Colors

Edit `resources/css/app.css` to modify CSS variables:

```css
:root {
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}
```

### Modifying Sidebar Width

Edit `sidebar.jsx`:

```jsx
// Change w-64 to your desired width
className="... w-64 ..."
```

## Icons

All icons use Lucide React. Import from `lucide-react`:

```jsx
import { Home, Settings, User } from 'lucide-react'
```

Common icons used:
- `LayoutDashboard` - Dashboard
- `FolderKanban` - Projects
- `FileText` - Files
- `Users` - Team
- `Settings` - Settings
- `LogOut` - Logout

## Theme Support

All components support light and dark modes through the ThemeProvider.

Toggle theme programmatically:
```jsx
import { useTheme } from '@/Components/theme-provider'

const { theme, setTheme } = useTheme()
setTheme('dark') // or 'light'
```

## Responsive Behavior

- **Desktop (lg+):** Sidebar always visible
- **Mobile (<lg):** Sidebar hidden, accessible via menu button
- **Tablet:** Sidebar collapses, overlay on open

## Accessibility

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Best Practices

1. Always use AdminLayout for new pages
2. Keep navigation items organized by category
3. Use semantic icons that match the section
4. Test in both light and dark modes
5. Verify mobile responsiveness
6. Ensure active route highlighting works
