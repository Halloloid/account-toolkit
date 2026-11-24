import { address, fetchEncodedAccount } from "@solana/kit";
import { rpc } from "./lib/solana.js";

async function main() {
  const input = process.argv[2];

  if (!input) {
    throw new Error("Usage: pnpm tsx scripts/inspect.ts <ADDRESS>");
  }

  const accountAddress = address(input);
  const account = await fetchEncodedAccount(rpc, accountAddress);

  if (!account.exists) {
    console.log({ exist: false, address: input });
    return;
  }

  console.log({
    exist: true,
    address: input,
    lamports: account.lamports.toString(),
    owner: account.programAddress,
    executable: account.executable,
    dataLength: account.data.length,
  });
}

main().catch((error) => {
  console.error("inspect failed", error);
  process.exit(1);
});
