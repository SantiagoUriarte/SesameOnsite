import { useState, useEffect } from "react";

export default function Home() {
  const [contractAddress, setContractAddress] = useState(
    "0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc"
  );
  const [methodName, setMethodName] = useState("transfer");
  const [method, setMethod] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [criteria, setCriteria] = useState([]);

  useEffect(() => {}, []);

  return (
    <div className="text-center">
      <h1 className="font-2xl">Transaction Validator</h1>

      <div className="flex flex-col p-6 gap-5 items-center justify-center bg-red-200">
        <label>
          Enter a smart contract address{" "}
          <input
            className="border border-gray-400 w-full"
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value);
            }}
            type="text"
          />
        </label>
        <label>
          Enter a method name you want to verify{" "}
          <input
            className="border border-gray-400 w-full"
            value={methodName}
            onChange={(e) => {
              setMethodName(e.target.value);
            }}
            type="text"
          />
        </label>

        <button
          className="border border-black px-8 py-4"
          onClick={() => {
            fetch(
              `http://localhost:3000/api/contractMethod?contractAddress=${contractAddress.trim()}&method=${methodName.trim()}`
            )
              .then((res) => res.json())
              .then((data) => {
                if (!data || !data.data) {
                  alert("Bad request");
                } else {
                  setMethod(data);

                  console.log(data);

                  const criteria = data.data.inputs.map((input) => {
                    return {
                      name: input.name,
                      type: input.type,
                      value: null,
                    };
                  });

                  setCriteria(criteria);
                }
              });
          }}
        >
          Check
        </button>
        <button
          onClick={() => {
            setContractAddress("");
            setMethodName("");
            setWalletAddress("");
            setMethod(null);
            setCriteria([]);
          }}
        >
          Reset
        </button>
      </div>

      {method && (
        <div className="flex flex-col p-6 gap-5 items-center justify-center">
          <label>
            Enter wallet address{" "}
            <input
              className="border border-gray-400 w-full"
              value={walletAddress}
              onChange={(e) => {
                setWalletAddress(e.target.value);
              }}
              type="text"
            />
          </label>
          {method.data.inputs.map((input, index) => {
            if (input.type === "address" || input.type === "uint256") {
              return (
                <label key={index}>
                  Enter value for &nbsp;
                  <span className="text-blue-400">
                    {input.name} ({input.type})
                  </span>
                  <input
                    className="border border-gray-400 w-full"
                    type="text"
                    value={criteria[index]?.value || ""}
                    onChange={(e) => {
                      const updatedCriteria = [...criteria];

                      updatedCriteria[index] = {
                        name: input.name,
                        type: input.type,
                        value: e.target.value.trim(),
                      };

                      setCriteria(updatedCriteria);
                    }}
                  />
                </label>
              );
            }
          })}

          <button
            className="px-8 py-4 border border-black"
            onClick={() => {
              fetch("http://localhost:3000/api/verifyTransaction", {
                method: "POST",
                body: JSON.stringify({
                  wallet_address: walletAddress.trim(),
                  transaction: {
                    name: methodName.trim(),
                    smart_contract: contractAddress.trim(),
                    criteria,
                  },
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  alert(data.verified);
                });
            }}
          >
            Verify
          </button>
          <button
            onClick={() => {
              setWalletAddress("");
              const criteria = method.data.inputs.map((input) => {
                return {
                  name: input.name,
                  type: input.type,
                  value: null,
                };
              });

              setCriteria(criteria);
            }}
          >
            Clear{" "}
          </button>
        </div>
      )}
    </div>
  );
}
