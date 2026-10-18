# Using UI components

`@veap/ui` exports components both from the root barrel (`@veap/ui`) and from individual component subpaths (`@veap/ui/components/*`).

## Cards, badges, and buttons

Import layout and action primitives from `@veap/ui`:

```tsx
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@veap/ui";

export function StatusCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Database Connection</CardTitle>
        <Badge variant="default">Connected</Badge>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm">
          Run diagnostics
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Subpath imports for dialogs, forms, and notifications

For granular imports, reference `@veap/ui/components/<name>` directly:

- `@veap/ui/components/button`, `@veap/ui/components/input`, `@veap/ui/components/label`, `@veap/ui/components/textarea`
- `@veap/ui/components/dialog`, `@veap/ui/components/sheet`, `@veap/ui/components/dropdown-menu`
- `@veap/ui/components/table`, `@veap/ui/components/tabs`, `@veap/ui/components/badge`
- `@veap/ui/components/sonner` (`Toaster` component for toast notifications)
- `@veap/ui/components/spinner`, `@veap/ui/components/separator`, `@veap/ui/components/alert`
