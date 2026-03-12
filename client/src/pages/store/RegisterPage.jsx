import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { registerSchema } from "@/utils/validators";

export default function RegisterPage() {
  const { register: authRegister, isAuthenticated } = useAuth();
  const { brand } = useTheme();
  const navigate  = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate("/", { replace: true }); }, [isAuthenticated]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      toast.success("Account created!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <motion.div
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <img src={brand.logo} alt={brand.name} className="h-10 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Create an account</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Join {brand.name} today</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" required autoComplete="name" error={errors.name?.message} {...register("name")} />
            <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" required autoComplete="new-password" helper="At least 8 characters" error={errors.password?.message} {...register("password")} />
            <Input label="Confirm Password" type="password" required autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            <Button type="submit" fullWidth loading={isSubmitting} size="lg">Create Account</Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
