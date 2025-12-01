"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// -----------------------------
// Zod Schema (Zod v3)
// -----------------------------
const LoginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email wajib diisi")
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(1, "Password wajib diisi")
      .min(6, "Minimal 6 karakter"),
  })
  .strict();

export type LoginInput = z.infer<typeof LoginSchema>;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-zinc-200 mb-1">{children}</label>;
}

function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
) {
  const { invalid, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        "w-full rounded-2xl bg-zinc-900/60 border px-4 py-3 outline-none",
        invalid
          ? "border-red-500 focus:ring-2 focus:ring-red-500/40"
          : "border-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20",
        "placeholder:text-zinc-500 text-zinc-100",
        className ?? "",
      ].join(" ")}
    />
  );
}

function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-400">{children}</p>;
}


export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const urlError = search.get("error"); // error dari NextAuth redirect (jika ada)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const onSubmit = async (values: LoginInput) => {
    setGeneralError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: "/admin",
    });

    if (!res) {
      setGeneralError("Terjadi kesalahan. Coba lagi.");
      return;
    }

    if (res.error) {
      // tampilkan error generik (jangan bocorkan detail auth)
      setGeneralError("Email atau password salah, atau akses ditolak.");
      // contoh: flag field sebagai invalid secara halus
      setError("email", { type: "manual", message: "Periksa kembali email" });
      setError("password", { type: "manual", message: "Periksa kembali password" });
      return;
    }

    // sukses
    router.replace(res.url ?? "/admin");
  };

  return (
    <main className="min-h-[100dvh] grid place-items-center bg-gradient-to-b from-zinc-950 to-zinc-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-100">Metreum Admin</h1>
          <p className="text-sm text-zinc-400 mt-1">Masuk untuk mengelola pesanan</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 shadow-xl backdrop-blur"
        >
          {/* Error global dari query (?error=...) */}
          {urlError && (
            <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-300 text-sm">
              Otentikasi gagal. Silakan coba lagi.
            </div>
          )}

          {/* Error global dari submit */}
          {generalError && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300 text-sm">
              {generalError}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              placeholder="admin@metreum.com"
              autoComplete="email"
              invalid={!!errors.email}
              {...register("email")}
            />
            <ErrorText>{errors.email?.message}</ErrorText>
          </div>

          {/* Password */}
          <div className="mb-2">
            <FieldLabel>Password</FieldLabel>
            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto rounded-xl px-3 py-1 text-xs text-zinc-300 hover:text-white focus:outline-none"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <ErrorText>{errors.password?.message}</ErrorText>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-2xl bg-white/90 text-zinc-900 font-semibold py-3 hover:bg-white focus:outline-none disabled:opacity-60"
          >
            {isSubmitting ? "Memproses…" : "Masuk"}
          </button>

          {/* Tips keamanan */}
          <p className="mt-4 text-xs text-zinc-500">
            * Hanya untuk staf kasir & super admin. Aktivitas login dapat diaudit.
          </p>
        </form>
      </div>
    </main>
  );
}
