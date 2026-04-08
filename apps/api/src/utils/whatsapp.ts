import path from "path";
import fs from "fs";

let sock: any = null;

export async function initWhatsApp() {
  const authPath = path.join(process.cwd(), "whatsapp_auth");
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }

  // Dynamic import for ESM package in CJS environment
  const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
  } = await import("@whiskeysockets/baileys");

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update: any) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("🔗 WhatsApp QR Code received. Scan it in your terminal to link Mali AI.");
    }

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ WhatsApp connection closed. Reconnecting...", shouldReconnect);
      if (shouldReconnect) initWhatsApp();
    } else if (connection === "open") {
      console.log("✅ WhatsApp successfully connected!");
    }
  });

  return sock;
}

export async function sendOrderNotification(ownerPhone: string, orderData: { customerName: string; amount: number; orderId: string, upiId?: string }) {
  if (!sock) {
    console.log("⚠️ WhatsApp not initialized. Re-initializing...");
    await initWhatsApp();
    // Wait a bit for connection
    await new Promise(r => setTimeout(r, 3000));
  }

  if (!sock) {
    console.error("❌ Failed to initialize WhatsApp socket.");
    return;
  }

  const upiText = orderData.upiId ? `\nPaid from UPI: ${orderData.upiId}` : "";
  const message = `🛍️ *New Order!*\n\nCustomer: ${orderData.customerName}\nAmount: ₹${orderData.amount}${upiText}\n\nCheck your UPI app for payment confirmation.\nOrder ID: ${orderData.orderId}`;
  
  // Format phone: remove any non-digits, ensure country code
  const cleanPhone = ownerPhone.replace(/\D/g, "");
  if (!cleanPhone) {
    console.error("❌ Invalid owner phone number for WhatsApp.");
    return;
  }
  
  const jid = `${cleanPhone}@s.whatsapp.net`;
  
  console.log(`📤 Sending WhatsApp notification to ${jid}...`);
  try {
    await sock.sendMessage(jid, { text: message });
    console.log("✅ WhatsApp notification sent.");
  } catch (err) {
    console.error("❌ Failed to send WhatsApp notification:", err);
  }
}
