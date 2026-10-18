import { Icon } from "@iconify/react";
import { Button } from "../components/button";

export function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 p-4 text-center">
      <div className="bg-destructive/10 rounded-full p-6">
        <Icon
          icon="solar:shield-warning-bold-duotone"
          className="text-destructive size-16"
        />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
        <p className="text-muted-foreground max-w-[400px]">
          You do not have the required permissions to access this area. Please
          contact your administrator if you believe this is an error.
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="outline">
          <a href="/">Go back home</a>
        </Button>
        <Button>
          <a href="/signin">Sign in with another account</a>
        </Button>
      </div>
    </div>
  );
}
