import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-t from-lime-100 to-emerald-900">
      <div className="space-y-4 text-center text-white">
        <h1 className="text-5xl font-extrabold">Metreum</h1>
        <p>Selamat datang di cafe Metreum</p>
        <Button asChild className="w-full text-md" variant="secondary">
          <Link href="/menu">Daftar Menu</Link>
        </Button>
        <Button className="w-full text-md" variant="secondary">Cek Pesanan</Button>
      </div>
    </div>
  );
}
