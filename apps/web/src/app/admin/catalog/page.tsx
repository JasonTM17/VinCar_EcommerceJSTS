"use client";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Model = { id: string; brandId: string; name: string; slug: string; category: string; seats: number; status: string; brand: { name: string }; trims: { id: string; name: string; basePriceVnd: string }[] };

export default function AdminCatalog() {
  const [models, setModels] = useState<Model[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [brandId, setBrandId] = useState("");
  const [modelName, setModelName] = useState("");
  const [modelSlug, setModelSlug] = useState("");
  const [category, setCategory] = useState("SUV");
  const [seats, setSeats] = useState(5);
  const [powertrain, setPowertrain] = useState("Electric");

  const [trimModelId, setTrimModelId] = useState("");
  const [trimName, setTrimName] = useState("");
  const [trimPrice, setTrimPrice] = useState("699000000");
  const [rangeKm, setRangeKm] = useState(420);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ data: Model[] }>("/vehicles?limit=50");
      setModels(data.data);
      const firstBrand = data.data[0]?.brandId;
      if (firstBrand) setBrandId(firstBrand);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function withToken(init: RequestInit = {}): RequestInit {
    const token = localStorage.getItem("autonova_token");
    return { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
  }

  async function createModel() {
    setError("");
    setNotice("");
    try {
      const created = await apiFetch<Model>("/admin/catalog/vehicle-models", {
        method: "POST",
        ...withToken(),
        body: JSON.stringify({ brandId, name: modelName, slug: modelSlug, category, seats: Number(seats), powertrain }),
      });
      setNotice(`Đã tạo mẫu xe ${created.name}.`);
      setModelName("");
      setModelSlug("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function createTrim() {
    setError("");
    setNotice("");
    try {
      const created = await apiFetch<{ id: string }>(`/admin/catalog/vehicle-models/${trimModelId}/trims`, {
        method: "POST",
        ...withToken(),
        body: JSON.stringify({ name: trimName, basePriceVnd: trimPrice, rangeKm: Number(rangeKm) }),
      });
      setNotice(`Đã tạo phiên bản ${trimName} (${created.id}).`);
      setTrimName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function archive(id: string) {
    setError("");
    setNotice("");
    try {
      await apiFetch(`/admin/catalog/vehicle-models/${id}`, { method: "PATCH", ...withToken(), body: JSON.stringify({ status: "ARCHIVED" }) });
      setNotice("Đã lưu trữ mẫu xe.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
        <a href="/admin" className="text-sm text-cyan-700">Về bảng điều hành</a>
      </div>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Thêm mẫu xe</h2>
          <div className="mt-4 space-y-3">
            <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Tên (vd: Nova V9)" className="w-full rounded-lg border px-3 py-2" />
            <input value={modelSlug} onChange={(e) => setModelSlug(e.target.value)} placeholder="Slug (vd: nova-v9)" className="w-full rounded-lg border px-3 py-2" />
            <div className="flex gap-3">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border px-3 py-2">
                <option>SUV</option><option>Sedan</option><option>Van</option><option>Hatchback</option>
              </select>
              <input type="number" value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="w-24 rounded-lg border px-3 py-2" placeholder="Chỗ ngồi" />
              <input value={powertrain} onChange={(e) => setPowertrain(e.target.value)} className="rounded-lg border px-3 py-2" placeholder="Powertrain" />
            </div>
            <button onClick={createModel} className="rounded-full bg-[#0a1633] px-5 py-2 text-white">Tạo mẫu xe</button>
          </div>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Thêm phiên bản</h2>
          <div className="mt-4 space-y-3">
            <select value={trimModelId} onChange={(e) => setTrimModelId(e.target.value)} className="w-full rounded-lg border px-3 py-2">
              <option value="">Chọn mẫu xe</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.brand.name} {m.name}</option>)}
            </select>
            <input value={trimName} onChange={(e) => setTrimName(e.target.value)} placeholder="Tên phiên bản (vd: Plus)" className="w-full rounded-lg border px-3 py-2" />
            <div className="flex gap-3">
              <input value={trimPrice} onChange={(e) => setTrimPrice(e.target.value)} className="rounded-lg border px-3 py-2" placeholder="Giá cơ bản (VND)" />
              <input type="number" value={rangeKm} onChange={(e) => setRangeKm(Number(e.target.value))} className="w-28 rounded-lg border px-3 py-2" placeholder="km" />
            </div>
            <button onClick={createTrim} disabled={!trimModelId} className="rounded-full bg-[#0a1633] px-5 py-2 text-white disabled:opacity-50">Tạo phiên bản</button>
          </div>
        </section>
      </div>

      <section className="mt-8 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr><th className="px-4 py-3">Mẫu xe</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Phân khúc</th><th className="px-4 py-3">Chỗ ngồi</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Phiên bản</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id} className="border-t align-top">
                <td className="px-4 py-3 font-medium">{m.brand.name} {m.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{m.slug}</td>
                <td className="px-4 py-3">{m.category}</td>
                <td className="px-4 py-3">{m.seats}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">{m.status}</span></td>
                <td className="px-4 py-3 text-xs">{m.trims.map((t) => `${t.name} (${Number(t.basePriceVnd).toLocaleString("vi-VN")} ₫)`).join(", ") || "—"}</td>
                <td className="px-4 py-3"><button onClick={() => archive(m.id)} className="text-xs text-red-600">Lưu trữ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
