"use client";

import * as React from "react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/ui/_shared/button";
import { Input } from "@/ui/_shared/input";
import { Label } from "@/ui/_shared/label";
import { Badge } from "@/ui/_shared/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/_shared/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/_shared/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/_shared/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/_shared/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/_shared/select";

// --- Small helpers (keeps this file self-contained) ---
function Toolbar({
  query,
  onQuery,
  children,
  placeholder = "Cari...",
}: {
  query: string;
  onQuery: (v: string) => void;
  children?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:max-w-xs"
      />
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function ConfirmDialog({
  trigger,
  title = "Konfirmasi",
  description,
  onConfirm,
  confirmLabel = "Ya, lanjut",
  cancelLabel = "Batal",
}: {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={() => start(async () => { await onConfirm(); setOpen(false); })}
            disabled={pending}
          >
            {pending ? "Memproses…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageUploader({
  value,
  onChange,
  label = "Gambar",
  disabled,
}: {
  value?: string | null;
  onChange: (url: string | undefined) => void;
  label?: string;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [uploading, setUploading] = useState(false);
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    try {
      setUploading(true);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET as string;
      if (!cloudName || !preset) throw new Error("Cloudinary env belum di-set");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Upload gagal");
      onChange(data.secure_url as string);
      setPreview(data.secure_url as string);
      toast.success("Gambar terunggah");
    } catch (err: any) {
      toast.error(err.message);
      setPreview(null);
      onChange(undefined);
    } finally { setUploading(false); }
  }
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="file" accept="image/*" onChange={handleFileChange} disabled={disabled || uploading} />
      {uploading && <p className="text-xs text-muted-foreground">Mengunggah…</p>}
      {preview && (<img src={preview} alt="preview" className="h-24 w-24 rounded object-cover border" />)}
    </div>
  );
}

function InlineCreateCategory({ onCreate }: { onCreate: (name: string) => Promise<{ id: number; name: string } | null> }) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Input placeholder="Nama kategori" value={name} onChange={(e) => setName(e.target.value)} />
      <Button
        disabled={!name.trim() || pending}
        onClick={() => start(async () => { const res = await onCreate(name.trim()); if (res) setName(""); })}
      >Tambah</Button>
    </div>
  );
}

// ===============================
// TYPES
// ===============================
export type MenuRow = {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl?: string | null;
  categoryId: number;
  Category: { id: number; name: string } | null;
};

export type CategoryRow = { id: number; name: string };

export type MenuActions = {
  createMenu: (input: { name: string; description: string; price: number; available: boolean; imageUrl?: string; categoryId: number; }) => Promise<{ ok: boolean; error?: string | null; menu?: any }>;
  updateMenu: (id: number, input: { name: string; description: string; price: number; available: boolean; imageUrl?: string; categoryId: number; }) => Promise<{ ok: boolean; error?: string | null; menu?: any }>;
  deleteMenu: (id: number) => Promise<{ ok: true } | { ok: false; error: string }>;
  createCategory: (input: { name: string }) => Promise<{ ok: boolean; category?: { id: number; name: string }; error?: string }>;
};

// ===============================
// DEFAULT EXPORT — MenusPageClient
// ===============================
export default function MenusPageClient({
  initialMenus,
  initialCategories,
  actions,
  role,
}: {
  initialMenus: MenuRow[];
  initialCategories: CategoryRow[];
  actions: MenuActions;
  role: "ADMIN" | "SUPERADMIN";
}) {
  const [rows, setRows] = useState<MenuRow[]>(initialMenus);
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<false | { mode: "create" } | { mode: "edit"; data: MenuRow }>(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState<{ name: string; description: string; price: number; available: boolean; categoryId: number; imageUrl?: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.Category?.name.toLowerCase().includes(q));
  }, [rows, query]);

  function openCreate() {
    setForm({ name: "", description: "", price: 0, available: true, categoryId: categories[0]?.id ?? 0, imageUrl: undefined });
    setOpen({ mode: "create" });
  }

  async function save() {
    if (!form) return;
    start(async () => {
      if (open && "mode" in open && open.mode === "create") {
        const res = await actions.createMenu(form);
        if (res.ok && res.menu) {
          setRows((prev) => [res.menu as MenuRow, ...prev]);
          setOpen(false); setForm(null); toast.success("Menu dibuat");
        } else {
          toast.error(res.error ?? "Gagal membuat");
        }
      } else if (open && "mode" in open && open.mode === "edit") {
        const id = (open as any).data.id as number;
        const res = await actions.updateMenu(id, form);
        if (res.ok && res.menu) {
          setRows((prev) => prev.map((x) => (x.id === id ? (res.menu as MenuRow) : x)));
          setOpen(false); setForm(null); toast.success("Menu diperbarui");
        } else {
          toast.error(res.error ?? "Gagal memperbarui");
        }
      }
    });
  }

  return (
    <div className="space-y-4 bg-white py-4 px-4 h-screen">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kelola Menu</h1>
          <p className="text-sm text-muted-foreground">Tambah, ubah, hapus menu</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Aksi</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openCreate()} disabled={categories.length === 0}>Tambah menu</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => openCreate()} disabled={categories.length === 0}>+ Tambah Menu</Button>
        </div>
      </div>

      <Toolbar query={query} onQuery={setQuery} placeholder="Cari nama/kategori…">
        {categories.length === 0 && (
          <InlineCreateCategory
            onCreate={async (name) => {
              const r = await actions.createCategory({ name });
              if (r.ok && r.category) {
                setCategories((prev) => [...prev, r.category!]);
                return r.category!;
              }
              return null;
            }}
          />
        )}
      </Toolbar>

      <Card>
        <CardContent className="p-">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Nama</TableHead>
                <TableHead className="text-center">Kategori</TableHead>
                <TableHead className="text-center">Harga</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {categories.length === 0 ? "Buat kategori terlebih dahulu" : "Belum ada data"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="text-center">
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.Category?.name ?? "—"}</TableCell>
                    <TableCell>{`Rp ${Intl.NumberFormat('id-ID').format(r.price)}`}</TableCell>
                    <TableCell>
                      {r.available ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600">Tersedia</Badge>
                      ) : (
                        <Badge variant="secondary">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setForm({
                              name: r.name,
                              description: r.description,
                              price: r.price,
                              available: r.available,
                              categoryId: r.Category?.id ?? r.categoryId,
                              imageUrl: r.imageUrl ?? undefined,
                            });
                            setOpen({ mode: "edit", data: r });
                          }}
                        >
                          Edit
                        </Button>
                        <ConfirmDialog
                          trigger={<Button variant="destructive" size="sm">Hapus</Button>}
                          description={`Hapus menu "${r.name}"?`}
                          onConfirm={async () => {
                            const res = await actions.deleteMenu(r.id);
                            if ((res as any).ok) {
                              setRows((prev) => prev.filter((x) => x.id !== r.id));
                              toast.success("Menu dihapus");
                            } else {
                              toast.error((res as any).error ?? "Gagal menghapus");
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {form && (
        <Dialog open={!!open} onOpenChange={(v) => { if (!v) { setOpen(false); setForm(null); } }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{open && "mode" in open && open.mode === "edit" ? "Ubah Menu" : "Tambah Menu"}</DialogTitle>
              <DialogDescription>Lengkapi detail menu</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Nama</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Cappuccino"
                />
              </div>
              <div className="grid gap-2">
                <Label>Deskripsi</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi singkat"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label>Harga (Rp)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={String(form.available)}
                    onValueChange={(v) => setForm({ ...form, available: v === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Tersedia</SelectItem>
                      <SelectItem value="false">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select
                    value={String(form.categoryId)}
                    onValueChange={(v) => setForm({ ...form, categoryId: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); setForm(null); }}>
                Batal
              </Button>
              <Button onClick={save} disabled={pending}>
                {pending ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
