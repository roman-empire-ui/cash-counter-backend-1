import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
const { Client, LocalAuth } = pkg;

let client = null;
let qrCodeDataURL = null;
let isReady = false;

// Initialize WhatsApp client
export const initWhatsApp = () => {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth(), // stores cache automatically
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  // Generate QR
  client.on("qr", async (qr) => {
    console.log("📌 New QR Generated!");

    qrCodeDataURL = await qrcode.toDataURL(qr);
  });

  client.on("ready", () => {
    isReady = true;
    console.log("🟢 WhatsApp Client is Ready!");
  });

  client.on("authenticated", () => {
    console.log("🔐 WhatsApp Authenticated");
  });

  client.on("auth_failure", () => {
    console.log("❌ WhatsApp Authentication Failed");
  });

  client.initialize();
  return client;
};

// Return QR code to frontend
export const getQRCodeDataURL = () => qrCodeDataURL;

// Send WhatsApp message
export const sendWhatsAppMessage = async (number, message) => {
  try {
    if (!client) initWhatsApp();

    // wait for ready
    while (!isReady) {
      console.log("⏳ Waiting for WhatsApp to be ready...");
      await new Promise((res) => setTimeout(res, 1000));
    }

    const formatted = `91${number.replace(/\D/g, "")}@c.us`;

    const isRegistered = await client.isRegisteredUser(formatted);
    if (!isRegistered) {
      console.log("❌ Number not on WhatsApp");
      return false;
    }

    await client.sendMessage(formatted, message);
    console.log("📨 WhatsApp message sent to:", formatted);
    return true;

  } catch (err) {
    console.log("❌ WhatsApp error:", err);
    return false;
  }
};
