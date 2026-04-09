import { ReceiptData } from "@/types/receipt";
import client from "./api/client";

export async function fetchReceiptByTIN(tin: string): Promise<ReceiptData | null> {
  try {
    const { data } = await client.get(`/summaries/${tin}`);
    return data as ReceiptData;
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return null;
  }
}
