"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function StorePage() {
  const router = useRouter();
  const { id } = useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"products" | "orders" | "settings">("products");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }
    fetchAll(token);
  }, [id]);

  useEffect(() => {
    if (store?.config) {
      setUpiId(store.config.upiId || "");
      setUpiName(store.config.upiName || "");
    }
  }, [store]);

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedConfig = { ...store.config, upiId, upiName };
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/${id}`, { config: updatedConfig }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Settings saved successfully!");
      fetchAll(token!);
    } catch (err) {
      alert("Failed to save settings.");
    }
  };

  const fetchAll = async (token: string) => {
    try {
      const [storeRes, productRes, orderRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/store/${id}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/store/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStore(storeRes.data);
      setProducts(productRes.data);
      setOrders(orderRes.data);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (productId: string) => {
    const token = localStorage.getItem("token");
    await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll(token!);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll(token!);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <div className="text-slate-500 font-medium animate-pulse">Syncing store data...</div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] bg-[#0a0a0f]/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium pr-6 border-r border-white/[0.06] group">
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/20">
              {store?.name?.[0]?.toUpperCase()}
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight">{store?.name}</h1>
          </div>
        </div>
          {store && (() => {
            const envDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
            let finalDomain = "mali-ai.shop";
            if (envDomain && envDomain !== "undefined" && envDomain !== "") {
              finalDomain = envDomain;
            } else if (typeof window !== "undefined") {
              const host = window.location.host;
              if (host.includes("localhost")) {
                finalDomain = host;
              } else {
                finalDomain = host.replace("www.", "");
              }
            }
            finalDomain = finalDomain.replace("www.", "");
            return (
              <a
                href={`http://${store.subdomain}.${finalDomain}`}
                target="_blank"
                className="mds-button mds-button-primary text-xs !py-2 !px-4"
              >
                View Store <span className="ml-1 opacity-70">↗</span>
              </a>
            );
          })()}
      </nav>


      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: "Products", value: products.length, icon: "🛍️", color: "blue" },
            { label: "Orders", value: orders.length, icon: "📦", color: "purple" },
            { label: "Total Revenue", value: `₹${orders.filter(o => o.status === "PAID").reduce((s: number, o: any) => s + Number(o.total), 0).toFixed(0)}`, icon: "💰", color: "emerald" },
          ].map((stat) => (
            <div key={stat.label} className="mds-card p-6 border-white/[0.04] bg-white/[0.01]">
              <div className="text-2xl mb-4 bg-white/[0.05] w-12 h-12 rounded-2xl flex items-center justify-center border border-white/[0.08] shadow-inner">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-2 leading-none">{stat.value}</div>
              <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-8 bg-white/[0.02] p-1.5 rounded-2xl border border-white/[0.05] w-fit">
          {["products", "orders", "settings"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${tab === t ? "bg-indigo-600 text-white shadow-lg mds-button-primary" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
            >
              {t}
            </button>
          ))}
          {tab === "products" && (
            <Link
              href={`/dashboard/stores/${id}/products/add`}
              className="mds-button mds-button-primary !py-2 !px-4 ml-4"
            >
              + Add Product
            </Link>
          )}
        </div>


        {/* Products Tab */}
        {tab === "products" && (
          <div className="grid grid-cols-1 gap-4">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.01] border-2 border-dashed border-white/[0.05] rounded-3xl">
                <div className="text-5xl mb-6 grayscale opacity-50">🛍️</div>
                <h3 className="mb-2 text-white font-bold">No products found</h3>
                <p className="text-slate-500 font-medium">Start building your catalog to launch your store.</p>
              </div>
            ) : products.map((p) => (
              <div key={p.id} className="mds-card p-5 border-white/[0.06] bg-white/[0.02] flex items-center gap-6 group hover:border-white/[0.12]">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/[0.08]" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.05] flex items-center justify-center text-3xl shadow-inner border border-white/[0.08]">🎁</div>
                )}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1 leading-tight">{p.title}</h3>
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                    <span className="text-indigo-400">₹{Number(p.price).toFixed(2)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>Stock: {p.stock}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${p.isActive ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" : "bg-slate-500/5 text-slate-400 border-slate-500/20"}`}>
                    {p.isActive ? "Active" : "Archived"}
                  </span>
                  <div className="h-8 w-[1px] bg-white/[0.06] mx-2" />
                  <button onClick={() => toggleProduct(p.id)} className="mds-button mds-button-secondary !py-2 !px-4 text-xs">
                    {p.isActive ? "Hide" : "Publish"}
                  </button>
                  <Link href={`/dashboard/stores/${id}/products/${p.id}/edit`} className="mds-button mds-button-secondary !py-2 !px-4 text-xs">
                    Edit
                  </Link>
                  <button onClick={() => deleteProduct(p.id)} className="mds-button !py-2 !px-4 text-xs text-red-500 hover:bg-red-500/10 hover:border-red-500/20">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">📬</div>
                <p>No orders yet.</p>
              </div>
            ) : orders.map((o) => {
              const confirmPayment = async (orderId: string) => {
                if (!confirm("Is payment confirmed via UPI?")) return;
                const token = localStorage.getItem("token");
                await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, { status: "PAID" }, { headers: { Authorization: `Bearer ${token}` } });
                fetchAll(token!);
              };

              return (
                <div key={o.id} className="mds-card p-6 border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xl shadow-inner">👤</div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-bold text-base leading-none">{o.customerName}</h3>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                            o.status === "PAID" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            o.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-slate-500/10 text-slate-400 border-white/10"
                          }`}>{o.status}</span>
                        </div>
                        <p className="text-slate-500 text-xs font-semibold">{o.customerEmail} • {o.customerPhone || "No Phone"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white mb-1">₹{Number(o.total).toFixed(2)}</div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">{new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/[0.04] mt-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Shipping Address</p>
                      <p className="text-white text-xs truncate font-medium" title={typeof o.customerAddress === 'object' ? o.customerAddress?.address : o.customerAddress}>
                       📍 {typeof o.customerAddress === 'object' ? o.customerAddress?.address || o.customerAddress?.street : o.customerAddress}
                      </p>
                    </div>
                    {o.status === "PENDING" && (
                        <button 
                          onClick={() => confirmPayment(o.id)}
                          className="mds-button mds-button-primary !py-2 !px-4 text-[10px] uppercase font-bold tracking-widest whitespace-nowrap"
                        >
                          Confirm Payment ✓
                        </button>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="max-w-2xl">
            <div className="mds-card p-10 border-white/[0.08] bg-white/[0.01]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-3xl border border-indigo-500/20 shadow-inner">⚡</div>
                <div>
                  <h3 className="text-white font-bold text-2xl mb-1">Payment Settings</h3>
                  <p className="text-slate-500 font-medium">Configure how you receive payments from customers.</p>
                </div>
              </div>
              
              <div className="space-y-8 mb-10">
                <div>
                  <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">UPI ID (VPA)</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    placeholder="e.g. masud@okaxis"
                    className="mds-input !py-4"
                  />
                  <div className="flex items-start gap-2 mt-3">
                    <span className="text-indigo-400 mt-0.5 text-sm">ⓘ</span>
                    <p className="text-slate-500 text-sm font-medium">Shoppers will pay directly to this ID using a dynamically generated QR code at checkout.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Recipient Name</label>
                  <input 
                    type="text" 
                    value={upiName} 
                    onChange={(e) => setUpiName(e.target.value)} 
                    placeholder="e.g. Shaikh Masud"
                    className="mds-input !py-4"
                  />
                  <p className="text-slate-500 text-xs mt-3 font-medium">The name that will appear on the customer's UPI app.</p>
                </div>
              </div>

              <button 
                onClick={saveSettings}
                className="mds-button mds-button-primary w-full py-5 text-base"
              >
                Save Payment Settings
              </button>
            </div>

            <div className="mt-8 p-6 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10 flex items-center gap-6">
              <div className="text-3xl">🔒</div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Direct Settlements</h4>
                <p className="text-slate-500 text-xs font-medium">Mali AI never touches your money. All payments go 100% directly from the customer to your UPI account instantly.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}