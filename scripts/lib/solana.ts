import {
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";
import { readFile } from "node:fs/promises";

export const DEVNET_RPC_URL = "https://api.devnet.solana.com";
export const DEVNET_WS_URL = "wss://api.devnet.solana.com";

export const rpc = createSolanaRpc(DEVNET_RPC_URL);
export const rpcSubscriptions = createSolanaRpcSubscriptions(DEVNET_WS_URL);

export async function loadSignerFromFile(path: string) {
  const file = await readFile(path, "utf-8");
  const bytes = new Uint8Array(JSON.parse(file));

  return createKeyPairSignerFromBytes(bytes);
}
