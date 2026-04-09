"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function PublicStorePage() {
  const { subdomain } = useParams();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", upiId: "" });
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  useEffect(() => {
    if (subdomain) {
      fetchStore();
    }
  }, [subdomain]);

  const fetchStore = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/subdomain/${subdomain}`);
      setStore(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
    alert("Added to cart!");
  };

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      return alert("Please fill in all shipping details.");
    }
    setSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/manual-create`, {
        storeId: store.id,
        customerName: customer.name,
        customerEmail: customer.email || "no-email@mali.ai",
        customerPhone: customer.phone,
        customerAddress: { address: customer.address, upiId: customer.upiId },
        items: cart.map(i => ({ productId: i.id, title: i.title, price: i.price, quantity: 1 }))
      });
      setOrderSuccess(true);
      setCart([]);
    } catch (err) {
      alert("Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error || !store) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
      <p className="text-slate-600">Store not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
            <p className="text-slate-500 text-sm">{store.tagline}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => cart.length > 0 && setShowCheckout(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition relative"
            >
              Cart ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Banner/Hero */}
        <div className="bg-indigo-600 rounded-3xl p-12 mb-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold mb-4">{store.config?.heroTitle || `Welcome to ${store.name}`}</h2>
            <p className="text-indigo-100 text-lg mb-8">{store.config?.heroDescription || store.tagline}</p>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-slate-100 transition">
              Shop Now
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 flex items-center justify-center">
             <div className="text-[200px]">🛍️</div>
          </div>
        </div>

        {/* Products Grid */}
        <h3 className="text-2xl font-bold text-slate-900 mb-8">Featured Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {store.products?.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500">
              No products found in this store.
            </div>
          ) : store.products?.map((p: any) => {
            // Niche-aware placeholder icons
            const getNicheIcon = (niche: string = "") => {
              const n = niche.toLowerCase();
              if (n.includes("tool") || n.includes("hardware") || n.includes("auto")) return "🛠️";
              if (n.includes("baby") || n.includes("parenting") || n.includes("toy")) return "🍼";
              if (n.includes("beauty") || n.includes("skin") || n.includes("cosmetic")) return "✨";
              if (n.includes("fashion") || n.includes("cloth") || n.includes("wear")) return "👕";
              if (n.includes("pet") || n.includes("dog") || n.includes("cat")) return "🐾";
              if (n.includes("home") || n.includes("decor") || n.includes("kitchen")) return "🏠";
              if (n.includes("tech") || n.includes("gadget") || n.includes("electronic")) return "🔌";
              return "🎁"; // Default
            };

            const hasImage = p.images?.[0];

            return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow group relative">
                {/* Sourcing Badge (Overlay when image is missing) */}
                {!hasImage && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-amber-200 animate-pulse">
                      Sourcing Images...
                    </span>
                  </div>
                )}

                <div className={`aspect-square relative overflow-hidden ${!hasImage ? 'skeleton' : 'bg-slate-100'}`}>
                  {hasImage ? (
                    <img src={p.images[0].replace("http://", "https://")} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                      {getNicheIcon(store.config?.niche || store.niche)}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">{p.title}</h4>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900">₹{p.price}</span>
                    <button 
                      onClick={() => addToCart(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        !hasImage 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                      disabled={!hasImage}
                    >
                      {hasImage ? 'Add to Cart' : 'Coming Soon'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {store.name}. Powered by Mali AI.</p>
        </div>
      </footer>

      {/* UPI Checkout Modal */}
      {showCheckout && !orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Checkout</h3>
                <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-4 mb-6">
                <input type="text" placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition" />
                <input type="text" placeholder="WhatsApp Number" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition" />
                <textarea placeholder="Shipping Address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition h-20 resize-none" />
                <div className="pt-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Your UPI ID (For Verification)</label>
                  <input type="text" placeholder="e.g. 9876543210@ybl" value={customer.upiId} onChange={e => setCustomer({...customer, upiId: e.target.value})} className="w-full bg-indigo-50/50 text-indigo-900 border border-indigo-200 placeholder:text-indigo-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition" />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total Amount</span>
                  <span>₹{cartTotal}</span>
                </div>
                <button 
                  onClick={handleCheckout} 
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "I have Paid ✓"}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-8 flex flex-col items-center justify-center border-l border-slate-200 w-full md:w-72">
              <p className="text-slate-900 font-bold mb-4">Scan & Pay</p>
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-slate-200">
                {/* UPI QR Generator using qrserver API */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${store.config?.upiId || ""}&pn=${store.config?.upiName || store.name}&am=${cartTotal}&cu=INR`)}`} 
                  alt="UPI QR Code"
                  className="w-40 h-40"
                />
              </div>
              <p className="text-slate-500 text-[10px] text-center mb-1 uppercase font-bold tracking-widest">Pay to UPI ID</p>
              <p className="text-indigo-600 font-bold text-sm break-all text-center">{store.config?.upiId || "UPI Not Set"}</p>
              <p className="text-slate-400 text-[10px] mt-4 text-center">Scan with PhonePe, Google Pay, or Paytm</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-sm text-center shadow-2xl">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Received!</h3>
            <p className="text-slate-500 mb-8">We've notified the store owner. They will verify your payment and contact you shortly.</p>
            <button onClick={() => { setOrderSuccess(false); setShowCheckout(false); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
