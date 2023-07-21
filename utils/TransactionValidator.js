import InputDataDecoder from "ethereum-input-data-decoder";

const ETHERSCAN_API_KEY = "98B8XHEXBKTJSGS7CYIPWUA35JQV7MGYHR";

/* 
    Returns ContractABI of from a given smart contract address
    Returns null if no contract was found
*/
export async function getContractABI(contract_address) {
  try {
    const data = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${contract_address}&apikey=${ETHERSCAN_API_KEY}`
    ).then((res) => res.json());

    if (!data || data.status != 1) {
      // Bad request
      return null;
    }

    console.log(data.result);

    return JSON.parse(data.result);
  } catch (err) {
    // Handle error
    console.error(err);
  }
}

/* 
    Given a contract address and a method this will return the data of the given method at the contract address
    Returns null if method is not found or if address was incorrect
*/
export async function getRequestedMethodFromContract(
  contract_address,
  requested_method
) {
  try {
    const contractABI = await getContractABI(contract_address);

    const method = contractABI.find((method) => {
      return method.type === "function" && method.name === requested_method;
    });

    return method || null;
  } catch (err) {
    // Handle error
    console.error(err);
  }
}

/* 
    Given a wallet address this verifies if the transaction happened or not
    Returns True if a matching transaction exists otherwise false
*/
export async function verifyTransaction(wallet_address, transaction) {
  try {
    const data = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${wallet_address}&sort=asc&apikey=${ETHERSCAN_API_KEY}`
    ).then((res) => res.json());

    if (!data || data.status != 1) {
      // Bad request
      return false;
    }

    const contractABI = await getContractABI(transaction.smart_contract);
    const decoder = new InputDataDecoder(contractABI);

    const matchedTransactions = data.result.filter((currentTransaction) => {
      if (
        transaction.smart_contract === currentTransaction.to &&
        transaction.name === currentTransaction.functionName.split("(")[0]
      ) {
        const decodedInput = decoder.decodeData(currentTransaction.input);

        const currentTransactionMeetsCriteria = transaction.criteria.every(
          (currentCriteria, index) => {
            if (!currentCriteria.name === decodedInput.names[index]) {
              return False;
            }

            // Only check uint256 and address, other criteria are included to make matching the output since both arrays are same size
            if (currentCriteria.type === "address") {
              return currentCriteria.value === decodedInput.inputs[index];
            } else if (currentCriteria.type === "uint256") {
              return (
                currentCriteria.value <= BigInt(decodedInput.inputs[index]._hex)
              );
            } else {
              return True;
            }
          }
        );

        return currentTransactionMeetsCriteria;
      }
    });

    return matchedTransactions.length > 0;
  } catch (err) {
    // Handle error
    console.error(err);
  }
}

// verifyTransaction("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e", {
//   name: "transfer",
//   smart_contract: "0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc",
//   criteria: [
//     {
//       name: "to",
//       type: "address",
//       value: "81E7dF85DB59A6CF2937b74be17282bd0E23b7e9",
//     },
//     {
//       name: "amount",
//       type: "uint256",
//       value: BigInt("140396274579000000000000"),
//     },
//   ],
// }).then((d) => {
//   console.log(d);
// });
