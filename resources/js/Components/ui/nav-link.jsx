import React from 'react'
import { Link } from '@inertiajs/react'
import { cn } from '@/lib/utils'

const NavLink = ({ href, className, children, active = false, ...props }) => {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

export { NavLink }
