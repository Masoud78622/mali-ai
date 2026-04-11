"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function StoreClient({ store }: { store: any }) {
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", upiId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [viewers, setViewers] = useState<number>(store.products?.[0]?.viewCount || 24);
  const [recentSale, setRecentSale] = useState<any>(null);

  // Social Proof Logic
  useEffect(() => {
    // Randomize viewers
    const interval = window.setInterval(() => {
      setViewers(prev => Math.max(5, prev + Math.floor(Math.random() * 5) - 2));
    }, 5000);

    // Simulate recent sales
    const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Pune", "Surat"];
    const saleInterval = window.setInterval(() => {
      if (Math.random() > 0.7) {
        setRecentSale({
          name: ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali"][Math.floor(Math.random() * 6)],
          location: locations[Math.floor(Math.random() * locations.length)],
        });
        window.setTimeout(() => setRecentSale(null), 4000);
      }
    }, 15000);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(saleInterval);
    };
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
    alert("Added to cart!");
  };

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      return alert("Please fill in all shipping details.");
    }
    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://mali-ai-production.up.railway.app";
    try {
      await axios.post(`${apiUrl}/api/orders/manual-create`, {
        storeId: store.id,
        customerName: customer.name,
        customerEmail: customer.email || "no-email@mali.ai",
        customerPhone: customer.phone,
        customerAddress: { address: customer.address, upiId: customer.upiId },
        paymentMethod: paymentMethod,
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
        {/* Premium Banner/Hero */}
        <div className="relative rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl shadow-indigo-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-500/30 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {viewers} people browsing now
              </div>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight text-white drop-shadow-sm">
                {store.config?.heroTitle || `The New Standard in ${store.name}`}
              </h2>
              <p className="text-indigo-100 text-lg md:text-xl mb-10 opacity-90 leading-relaxed font-medium">
                {store.config?.heroDescription || store.tagline}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="bg-white text-indigo-700 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:scale-105 shadow-lg active:scale-95">
                  Shop Experience
                </button>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[10px]">👤</div>
                    ))}
                  </div>
                  <span className="text-indigo-200">Trusted by thousands</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex w-1/3 aspect-square bg-white/10 backdrop-blur-md rounded-[3rem] items-center justify-center text-[180px] border border-white/20 rotate-3 shadow-inner">
               <div className="animate-bounce-slow">🛍️</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <h3 className="text-2xl font-bold text-slate-900 mb-8">Featured Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {store.products?.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="text-4xl mb-4">🏪</div>
              <p className="font-bold text-slate-900">No products found</p>
              <p className="text-sm">This store is currently preparing its catalog.</p>
            </div>
          ) : store.products?.map((p: any) => {
            const getNicheIcon = (niche: string = "") => {
              const n = niche.toLowerCase();
              if (n.includes("tool") || n.includes("hardware") || n.includes("auto")) return "🛠️";
              if (n.includes("baby") || n.includes("parenting") || n.includes("toy")) return "🍼";
              if (n.includes("beauty") || n.includes("skin") || n.includes("cosmetic")) return "✨";
              if (n.includes("fashion") || n.includes("cloth") || n.includes("wear")) return "👕";
              if (n.includes("pet") || n.includes("dog") || n.includes("cat")) return "🐾";
              if (n.includes("home") || n.includes("decor") || n.includes("kitchen")) return "🏠";
              if (n.includes("tech") || n.includes("gadget") || n.includes("electronic")) return "🔌";
              return "🎁";
            };

            const hasImage = p.images?.[0];

            return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-2xl transition-all group relative flex flex-col">
                {!hasImage && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-amber-200 animate-pulse">
                      Sourcing Images...
                    </span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 z-20">
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                    Trending
                  </span>
                </div>

                <div className={`aspect-square relative overflow-hidden ${!hasImage ? 'skeleton' : 'bg-slate-100'}`}>
                  {hasImage ? (
                    <img src={p.images[0].replace("http://", "https://")} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                      {getNicheIcon(store.config?.niche || store.niche)}
                    </div>
                  )}
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-end p-4">
                    <div className="w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                       <button onClick={() => addToCart(p)} className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-xs">
                          Quick Add +
                       </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">{p.title}</h4>
                  <p className="text-slate-500 text-xs mb-3 line-clamp-2 h-8 leading-relaxed">{p.description}</p>
                  
                  <div className="mt-auto">
                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">
                      🔥 {p.soldCount || 12}+ sold this week
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900">₹{p.price}</span>
                      <button 
                        onClick={() => addToCart(p)}
                        className={`p-3 rounded-xl transition-all shadow-md ${
                          !hasImage 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-90 hover:shadow-indigo-200'
                        }`}
                        disabled={!hasImage}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
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

                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
                  <button onClick={() => setPaymentMethod("UPI")} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'UPI' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                    <span className="text-lg">⚡</span> Pay UPI
                  </button>
                  <button onClick={() => setPaymentMethod("COD")} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'COD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                    <span className="text-lg">📦</span> COD
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition" />
                  <input type="text" placeholder="WhatsApp Number" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition" />
                  <textarea placeholder="Shipping Address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition h-20 resize-none" />
                  
                  {paymentMethod === "UPI" && (
                    <div className="pt-2">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Your UPI ID (For Verification)</label>
                      <input type="text" placeholder="e.g. 9876543210@ybl" value={customer.upiId} onChange={e => setCustomer({...customer, upiId: e.target.value})} className="w-full bg-indigo-50/50 text-indigo-900 border border-indigo-200 placeholder:text-indigo-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition" />
                    </div>
                  )}
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
                    {submitting ? "Processing..." : paymentMethod === "UPI" ? "I have Paid ✓" : "Confirm COD Order"}
                  </button>
                </div>
              </div>

              {paymentMethod === "UPI" ? (
                <div className="bg-slate-50 p-8 flex flex-col items-center justify-center border-l border-slate-200 w-full md:w-72">
                  <p className="text-slate-900 font-bold mb-4">Scan & Pay</p>
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-slate-200">
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
              ) : (
                <div className="bg-indigo-50 p-8 flex flex-col items-center justify-center border-l border-indigo-100 w-full md:w-72">
                   <div className="text-5xl mb-4">📦</div>
                   <p className="text-indigo-900 font-bold text-center">Cash On Delivery</p>
                   <p className="text-indigo-600 text-[10px] text-center mt-2">Pay cash when you receive your package at home.</p>
                </div>
              )}
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
      {/* Social Proof & Floating Elements */}
      {recentSale && (
        <div className="fixed bottom-24 left-6 z-50 animate-slide-up">
           <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4 max-w-xs">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">🛍️</div>
              <div>
                <p className="text-xs font-bold text-slate-900">{recentSale.name} from {recentSale.location}</p>
                <p className="text-[10px] text-slate-500">Just placed a new order!</p>
              </div>
           </div>
        </div>
      )}

      {/* Floating WhatsApp */}
      {store.user?.whatsappNumber && (
        <a 
          href={`https://wa.me/${store.user.whatsappNumber.replace(/\D/g, '')}?text=Hi, I'm interested in products from ${store.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.557-5.332 11.892-11.891 11.892-1.999 0-3.956-.503-5.69-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.591 5.405 0 9.801-4.396 9.801-9.801 0-2.615-1.02-5.074-2.871-6.928-1.851-1.854-4.31-2.871-6.93-2.871-5.405 0-9.801 4.396-9.801 9.801 0 1.933.523 3.518 1.51 5.255l-.959 3.504 3.658-.951z" /></svg>
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat with Us</span>
        </a>
      )}

      {/* Sticky Mobile Checkout */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 md:hidden animate-slide-up">
           <button 
             onClick={() => setShowCheckout(true)}
             className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center justify-between px-8"
           >
             <span>Review Cart ({cart.length})</span>
             <span>₹{cartTotal} →</span>
           </button>
        </div>
      )}
    </div>
  );
}
