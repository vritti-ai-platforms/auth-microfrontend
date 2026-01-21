# vritti-auth - Development Best Practices

This document outlines the conventions and best practices for the vritti-auth frontend application.

## Project Overview

vritti-auth is a React authentication micro-frontend built with:
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **@vritti/quantum-ui** component library
- **Module Federation** for micro-frontend architecture
- **React Router** for navigation
- **TanStack Query** for server state management

## Critical Best Practices

### 1. Color Usage Guidelines

**CRITICAL: Never hardcode colors.** Always use design system tokens from quantum-ui.

Available semantic colors:
- `primary` / `primary-foreground` - Brand primary color
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Subtle backgrounds/text
- `accent` / `accent-foreground` - Accent highlights
- `destructive` / `destructive-foreground` - Error/danger states
- `warning` / `warning-foreground` - Warning states
- `success` / `success-foreground` - Success states
- `background` / `foreground` - Base colors
- `card` / `card-foreground` - Card surfaces
- `border`, `input`, `ring` - UI element colors

```typescript
// WRONG - Hardcoded colors
<div style={{ color: '#16a34a' }} />
<div style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)' }} />
<div className="text-green-600" />  // Tailwind palette colors may not match theme

// CORRECT - Design system tokens
<div className="text-success" />
<div className="bg-success/15 text-success" />
<CheckCircle className="text-success" />
```

For opacity variants, use Tailwind's opacity modifier:
```typescript
<div className="bg-success/15" />  // 15% opacity
<div className="bg-destructive/20" />  // 20% opacity
```

For SVG icons that need dynamic fill colors, use CSS variables:
```typescript
// For custom SVG icons
<path style={{ fill: 'var(--color-foreground)' }} />
```

### 2. Component Imports

Always import quantum-ui components from their specific paths:
```typescript
// CORRECT
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';

// WRONG - Don't use barrel imports
import { Button, Typography } from '@vritti/quantum-ui';
```

### 3. Styling Guidelines

- Use Tailwind CSS v4 utility classes
- Import `cn` utility from quantum-ui for class merging
- Follow the design token system
- Support dark mode automatically via design tokens
- Use quantum-ui components whenever possible

### 4. Form Handling

- Use `react-hook-form` with `zod` schemas for validation
- Use quantum-ui Form components (`Form`, `Field`, `FieldGroup`, etc.)
- Mutations should use TanStack Query hooks

### 5. Authentication Flow

- Auth tokens are managed via `@vritti/quantum-ui/axios`
- Use `setToken`, `scheduleTokenRefresh` for token management
- Navigate based on onboarding status after login/signup

## Directory Structure

```
src/
├── components/       # Reusable components
│   ├── auth/        # Auth-specific components
│   ├── icons/       # Custom SVG icons
│   └── layout/      # Layout components
├── hooks/           # Custom React hooks
├── pages/           # Page components
│   ├── auth/        # Auth pages (login, signup, etc.)
│   └── onboarding/  # Onboarding flow pages
├── schemas/         # Zod validation schemas
├── services/        # API service functions
└── index.css        # Global styles
```

## Common Patterns

### Icon Colors in Light/Dark Mode

For custom SVG icons that need to adapt to theme:
```typescript
export const MyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path style={{ fill: 'var(--color-foreground)' }} d="..." />
  </svg>
);
```

### Success/Error States

```typescript
// Success state
<div className="bg-success/15 text-success rounded-lg p-4">
  <CheckCircle className="h-5 w-5 text-success" />
  <span>Operation successful</span>
</div>

// Error state
<div className="bg-destructive/15 text-destructive rounded-lg p-4">
  <AlertCircle className="h-5 w-5 text-destructive" />
  <span>An error occurred</span>
</div>
```
