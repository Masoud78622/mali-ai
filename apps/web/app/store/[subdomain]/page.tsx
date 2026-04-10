import StoreClient from "./StoreClient";
import axios from "axios";
import { notFound } from "next/navigation";

// Set the cache to revalidate every 1 hour (3600 seconds)
// This ensures that 1,000,000 visitors won't crash the database!
export const revalidate = 3600;

async function getStoreData(subdomain: string) {
  // Use environment variable or fallback to production Railway URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://mali-ai-production.up.railway.app";
  
  try {
    console.log(`📡 Fetching store data for: ${subdomain} via ${apiUrl}`);
    const { data } = await axios.get(`${apiUrl}/api/stores/subdomain/${subdomain}`);
    return data;
  } catch (err: any) {
    console.error(`❌ API Fetch Error for ${subdomain}:`, err.response?.status || err.message);
    return null;
  }
}

export default async function PublicStorePage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;
  const store = await getStoreData(subdomain);

  if (!store) {
    notFound();
  }

  return <StoreClient store={store} />;
}
