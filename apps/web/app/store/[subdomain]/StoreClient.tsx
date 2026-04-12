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
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Social Proof Logic
  useEffect(() => {
    // Increment views on mount
    const incrementViews = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://mali-ai-production.up.railway.app";
      try {
        await axios.post(`${apiUrl}/api/stores/subdomain/${store.subdomain}/increment-views`);
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    };
    incrementViews();

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
    showNotification("Added to cart!");
  };

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      return showNotification("Please fill in shipping details.", "error");
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none mb-1">{store.name}</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{store.tagline}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => cart.length > 0 && setShowCheckout(true)}
              className="mds-button mds-button-primary bg-slate-900 hover:bg-slate-800 text-white !rounded-2xl relative shadow-mds-lift"
            >
              Cart ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-black shadow-lg animate-bounce-subtle">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Premium Banner/Hero */}
        <div className="relative rounded-[3rem] overflow-hidden mb-20 shadow-premium group">
          <div className="absolute inset-0 bg-slate-900"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover:scale-105 transition-transform duration-[10s]"></div>
          <div className="relative z-10 p-12 md:p-24 text-white flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                {viewers} Exclusive Shoppers Online
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1] tracking-tight text-white">
                {store.config?.heroTitle || `The New Standard in ${store.name}`}
              </h1>
              <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed font-medium max-w-lg">
                {store.config?.heroDescription || store.tagline}
              </p>
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <button className="mds-button mds-button-primary bg-white text-slate-900 px-12 py-5 text-base font-black shadow-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95">
                  Explore Catalog
                </button>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] shadow-lg ring-1 ring-white/10">👤</div>
                    ))}
                  </div>
                  <span className="text-slate-500 tracking-wide">Join 4,000+ happy shoppers</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex w-80 h-80 bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-2xl rounded-[4rem] items-center justify-center text-[180px] border border-white/[0.08] rotate-6 shadow-2xl relative transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
               <div className="animate-float">🛍️</div>
               <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-600 rounded-full blur-[80px] opacity-30"></div>
            </div>
          </div>
        </div>


        {/* Products Grid */}
        <h2 className="mb-10 text-slate-900">Curated Essentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {store.products?.length === 0 ? (
            <div className="col-span-full py-32 rounded-[3.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-200/50 flex items-center justify-center text-5xl mb-8 grayscale animate-pulse">🏪</div>
              <h3 className="mb-3 text-slate-900">Coming Soon</h3>
              <p className="text-slate-400 font-medium">{store.name} is currently hand-picking the finest products for you.</p>
            </div>
          ) : store.products?.map((p: any) => {
            const hasImage = p.images?.[0];

            return (
              <div key={p.id} className="group relative flex flex-col transition-all duration-500">
                <div className={`aspect-[4/5] relative rounded-[2.5rem] overflow-hidden mb-6 shadow-mds-lift group-hover:shadow-premium transition-all duration-500 ${!hasImage ? 'skeleton' : 'bg-slate-100'}`}>
                  {hasImage ? (
                    <img src={p.images[0].replace("http://", "https://")} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-20 group-hover:scale-110 transition-transform duration-700">🎁</div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-start pointer-events-none">
                    {!hasImage && (
                       <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] border border-white/20 shadow-xl">
                         Refining Quality...
                       </span>
                    )}
                    <span className="bg-slate-950 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 uppercase tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                      Limited Batch
                    </span>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/10 transition-all duration-500 flex items-end p-6">
                    <button onClick={() => addToCart(p)} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs shadow-2xl translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-slate-50 active:scale-95 uppercase tracking-widest border border-slate-200">
                      Reserve Now +
                    </button>
                  </div>
                </div>
                
                <div className="px-2">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate">{p.title}</h3>
                    <div className="text-xl font-black text-slate-900">₹{p.price}</div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed font-medium opacity-80">{p.description}</p>
                  
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"></span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {p.soldCount || 12}+ successful deliveries
                     </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-premium flex flex-col md:flex-row animate-scale-in border border-white/20">
              <div className="p-10 md:p-14 flex-1">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-slate-900 mb-0">Secure Checkout</h2>
                  <button onClick={() => setShowCheckout(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-950 flex items-center justify-center transition-colors">✕</button>
                </div>

                <div className="p-1.5 bg-slate-100 rounded-[1.5rem] mb-10 flex gap-1.5">
                  <button onClick={() => setPaymentMethod("UPI")} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-inner ${paymentMethod === 'UPI' ? 'bg-white text-slate-950 shadow-mds-low' : 'text-slate-400 hover:text-slate-600'}`}>
                    ⚡ Digital UPI
                  </button>
                  <button onClick={() => setPaymentMethod("COD")} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-inner ${paymentMethod === 'COD' ? 'bg-white text-slate-950 shadow-mds-low' : 'text-slate-400 hover:text-slate-600'}`}>
                    📦 Pay at Home
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="space-y-4">
                    <input type="text" placeholder="Recipient Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="mds-input !bg-slate-50 !border-slate-100 placeholder:text-slate-300" />
                    <input type="text" placeholder="WhatsApp Connection" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="mds-input !bg-slate-50 !border-slate-100 placeholder:text-slate-300" />
                  </div>
                  <textarea placeholder="Complete Delivery Address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="mds-input !bg-slate-50 !border-slate-100 placeholder:text-slate-300 h-full min-h-[110px] resize-none" />
                </div>

                <div className="border-t border-slate-100 pt-8 mt-4">
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Grand Total</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{cartTotal}</span>
                  </div>
                  <button 
                    onClick={handleCheckout} 
                    disabled={submitting}
                    className="mds-button mds-button-primary w-full !py-6 !rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] bg-slate-950 hover:bg-slate-800 disabled:opacity-30 group"
                  >
                    {submitting ? "Verifying Transaction..." : (
                      <span className="flex items-center justify-center gap-4">
                        {paymentMethod === "UPI" ? "Finalize Payment" : "Confirm Order"}
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <span className="text-emerald-500">🔒</span>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Secure, Encrypted Payment Layer</p>
                  </div>
                </div>
              </div>

              {paymentMethod === "UPI" ? (
                <div className="bg-slate-50 p-12 md:p-16 flex flex-col items-center justify-center border-l border-slate-100 w-full md:w-[340px]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-8 text-center">Scan to Authenticate</p>
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-premium mb-8 border border-white scale-110">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${store.config?.upiId || ""}&pn=${store.config?.upiName || store.name}&am=${cartTotal}&cu=INR`)}`} 
                      alt="UPI QR Code"
                      className="w-40 h-40 grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-950 font-black text-sm mb-2">{store.config?.upiId || "Merchant ID Pending"}</p>
                    <p className="text-slate-400 text-[10px] font-bold tracking-wide leading-relaxed">Accepted via PhonePe, GPay, Paytm and all major banking apps.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-12 md:p-16 flex flex-col items-center justify-center border-l border-slate-100 w-full md:w-[340px]">
                   <div className="text-6xl mb-8 grayscale opacity-20">📦</div>
                   <h3 className="text-slate-950 font-black mb-2">Direct Delivery</h3>
                   <p className="text-slate-400 text-[10px] font-bold text-center leading-relaxed tracking-wide">Pay cash to our courier partner upon successful delivery at your doorstep.</p>
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
             <span>Buy Now ({cart.length})</span>
             <span>₹{cartTotal} →</span>
           </button>
        </div>
      )}

      {/* Premium Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-bounce-in">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${notification.type === 'success' ? 'bg-indigo-600/90 text-white border-white/20' : 'bg-red-600/90 text-white border-white/20'}`}>
            <span className="text-xl">{notification.type === 'success' ? '✨' : '⚠️'}</span>
            <span className="font-bold text-sm">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
