import { address, appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createTransactionMessage, getSignatureFromTransaction, lamports, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/kit";
import { loadSignerFromFile, rpc,rpcSubscriptions } from "./lib/solana.js";
import { getTransferSolInstruction } from "@solana-program/system";

async function main() { 
  const senderKeypairPath = process.argv[2];
  const recipientAddressInput = process.argv[3];
  const amountSolInput = process.argv[4];

  if (!senderKeypairPath || !recipientAddressInput || !amountSolInput) {
    throw new Error("Usage: pnpm tsx scripts/send.ts <SENDER_KEYPAIR_PATH> <RECIPIENT_ADDRESS> <AMOUNT_SOL>");
  }

  const sender = await loadSignerFromFile(senderKeypairPath);
  const recipientAddress = address(recipientAddressInput);
  const amountSol = Number(amountSolInput);

  if (!Number.isFinite(amountSol) || amountSol <= 0) { 
    throw new Error("Amount must be +ve SOL");
  }

  const amountLamports = BigInt(Math.round(amountSol * 1_000_000_000));

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transferinstruction = getTransferSolInstruction({
    source: sender,
    destination: recipientAddress,
    amount: lamports(amountLamports),
  });

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(sender, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([transferinstruction], tx),
  );

  const signedTransaction = await signTransactionMessageWithSigners(message);

  const sendAndConfrm = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  assertIsTransactionWithBlockhashLifetime(signedTransaction);

  await sendAndConfrm(signedTransaction, { commitment: "confirmed" });

  console.log({
    signature: getSignatureFromTransaction(signedTransaction),
    from: sender.address,
    to: recipientAddress,
    amountSol
  });
}

main().catch((error) => {
  console.error("send Failed", error);
  process.exit(1);
});