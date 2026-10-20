import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import {
  Loader2,
  ShieldCheck,
  ChevronLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      throw redirect({
        to: "/admin",
        replace: true,
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin Login — RA2 Travel & Tours" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in successfully");

    navigate({
      to: "/admin",
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-ocean flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <motion.div
        className="absolute top-0 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-0 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 0.5 }}
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            replace
            className="mb-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-300 group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
            <div className="h-24 bg-linear-to-r from-accent/20 to-accent/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 20, repeat: Infinity }}
              />
            </div>

            <div className="relative px-8 pt-6 pb-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center -mt-12 mb-4"
              >
                <motion.div
                  className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/15 backdrop-blur border border-accent/30 shadow-lg mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ShieldCheck className="h-8 w-8 text-accent" />
                </motion.div>

                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Admin Portal
                </h1>

                <p className="text-sm text-muted-foreground">
                  RA2 Travel & Tours Dashboard
                </p>
              </motion.div>

              <form onSubmit={onSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-foreground block mb-2.5"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder-muted-foreground outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-foreground block mb-2.5"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={submitting}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder-muted-foreground outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={submitting}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold inline-flex items-center justify-center gap-3 transition-all duration-300 hover:opacity-90 hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed mt-6"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-xs text-center text-muted-foreground"
              >
                Authorized personnel only • Activity monitored
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
