import { useEffect, useState } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import {
  Loader2,
  LogOut,
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Tag,
  UserSquare2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin — RA2 Travel & Tours" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState<
    "checking" | "ready" | "unauth" | "unauthorized"
  >("checking");

  useEffect(() => {
    let active = true;

    const goToLogin = () => {
      navigate({
        to: "/admin/login",
        replace: true,
      });
    };

    const verify = async () => {
      if (pathname === "/admin/login") {
        if (active) setState("ready");
        return;
      }

      try {
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();

        if (!active) return;

        if (userErr || !userData.user) {
          setState("unauth");
          goToLogin();
          return;
        }

        const { data: isAdmin, error: roleErr } = await (supabase.rpc as any)(
          "has_role",
          {
            _user_id: userData.user.id,
            _role: "admin",
          },
        );

        if (!active) return;

        if (roleErr || !isAdmin) {
          toast.error("You don't have admin access.");
          await supabase.auth.signOut();

          if (!active) return;

          setState("unauthorized");
          goToLogin();
          return;
        }

        setState("ready");
      } catch (err) {
        if (active) {
          setState("unauth");
          goToLogin();
        }
      }
    };

    verify();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session && pathname !== "/admin/login") {
        setState("unauth");
        goToLogin();
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, pathname]);

  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  if (state === "checking") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex items-center justify-center bg-secondary/30"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-accent" />
        </motion.div>
      </motion.div>
    );
  }

  if (state !== "ready") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex items-center justify-center bg-secondary/30"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-accent" />
        </motion.div>
      </motion.div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();

    navigate({
      to: "/admin/login",
      replace: true,
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="admin-layout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-secondary/30"
      >
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
            <Link
              to="/admin"
              className="flex items-center gap-2 font-display font-bold text-foreground hover:text-accent transition-colors"
            >
              <Briefcase className="h-5 w-5 text-accent" />
              RA2 Admin
            </Link>

            <nav className="flex items-center gap-1 flex-wrap">
              <NavItem
                to="/admin"
                exact
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Dashboard"
              />
              <NavItem
                to="/admin/bookings"
                icon={<CalendarCheck className="h-4 w-4" />}
                label="Bookings"
              />
              <NavItem
                to="/admin/services"
                icon={<Tag className="h-4 w-4" />}
                label="Services"
              />
              <NavItem
                to="/admin/customers"
                icon={<UserSquare2 className="h-4 w-4" />}
                label="Customers"
              />

              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </nav>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-7xl px-5 lg:px-8 py-8">
          <Outlet />
        </main>
      </motion.div>
    </AnimatePresence>
  );
}

function NavItem({
  to,
  icon,
  label,
  exact,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
      activeProps={{ className: "bg-accent/10 text-accent" }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
