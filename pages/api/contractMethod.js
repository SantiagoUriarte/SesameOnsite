import { getRequestedMethodFromContract } from "../../utils/TransactionValidator";

export default async function handler(req, res) {
  const { query } = req;

  const method = await getRequestedMethodFromContract(
    query.contractAddress,
    query.method
  );

  return res.status(200).json({ data: method });
  try {
  } catch (err) {
    // Handle error
    res.sendStatus(500);
  }
}
