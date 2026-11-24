import { address } from "@solana/kit";
import { rpc } from "./lib/solana.js";

async function main() {
  const input = process.argv[2];

  if (!input) {
    throw new Error("Usage: pnpm tsx scripts/balance.ts <ADDRESS>");
  }

  const accountAddress = address(input);
  const { value: balanceLamports } = await rpc
    .getBalance(accountAddress)
    .send();

  console.log({
    address: input,
    lamports: balanceLamports.toString(),
    sol: Number(balanceLamports) / 1_000_000_000,
  });
}

main().catch((error) => {
  console.error("Balance failed", error);
  process.exit(1);
});
