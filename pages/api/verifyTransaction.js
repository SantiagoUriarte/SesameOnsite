import { verifyTransaction } from "../../utils/TransactionValidator";

export default async function handler(req, res) {
  if (req.method === "POST") {
    let { body } = req;
    body = JSON.parse(body);

    try {
      const transactionVerified = await verifyTransaction(
        body.wallet_address,
        body.transaction
      );

      return res.status(200).json({ verified: transactionVerified });
    } catch (err) {
      // Handle error

      return res.sendStatus(500);
    }
  }
}
