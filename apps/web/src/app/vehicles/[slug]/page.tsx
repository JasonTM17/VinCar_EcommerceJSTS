import { apiFetch, type Vehicle } from "@/lib/api";
export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await apiFetch<Vehicle>(`/vehicles/${slug}`);
  return (<main className="mx-auto max-w-7xl px-4 py-10"><p className="text-neutral-500">{v.brand.name} / {v.category}</p><h1 className="text-4xl font-bold">{v.name}</h1><div className="mt-8 grid gap-8 md:grid-cols-2"><div className="rounded-2xl bg-neutral-100 p-10 text-center text-6xl">🚗</div><div><h2 className="text-xl font-semibold">Phiên bản</h2>{v.trims.map((t) => (<div key={t.id} className="mt-4 rounded-xl border p-4"><p className="font-medium">{t.name} — {t.basePriceVnd} ₫</p><p className="text-sm text-neutral-500">Quãng đường: {t.rangeKm} km</p><a href={`/configurator?trimId=${t.id}`} className="mt-2 inline-block rounded-full bg-[#0a1633] px-4 py-2 text-white">Cấu hình ngay</a></div>))}</div></div></main>);
}
