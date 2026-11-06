import { Button } from "@/components/ui/Button";

/** A real form that posts to /account/logout, so signing out works without JavaScript. */
export function SignOutButton() {
  return (
    <form action="/account/logout" method="post">
      <Button type="submit" variant="secondary" size="sm">
        Sign out
      </Button>
    </form>
  );
}
