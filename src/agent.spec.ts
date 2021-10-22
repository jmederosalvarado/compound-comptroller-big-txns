import {
  TransactionEvent,
  FindingType,
  FindingSeverity,
  Finding,
  EventType,
  Network,
  HandleTransaction,
  Log,
  Transaction,
  Trace,
  TxEventBlock,
} from "forta-agent";
import agent from "./agent";
import { COMP_ADDRESS } from "./utils";

describe("Detect Very High Txn Value", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  const createTxEvent = (from, to, amount): TransactionEvent => {
    const blockNumber = 0;
    return new TransactionEvent(
      EventType.BLOCK,
      Network.MAINNET,
      {} as Transaction,
      {
        root: "",
        logs: [
          {
            address: 
          }
        ],
        status: true,
        gasUsed: "",
        blockHash: "",
        logsBloom: "",
        blockNumber: blockNumber,
        contractAddress: COMP_ADDRESS,
        transactionHash: "0x01",
        transactionIndex: 0,
        cumulativeGasUsed: "",
      },
      [] as Trace[],
      {} as any,
      {} as TxEventBlock
    );
  };

  describe("Handle Transaction", () => {
    it("returns empty findings if value is below threshold", async () => {
      const txEvent = createTxEvent(from, to, amount);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if value is equal to threshold", async () => {
      const txEvent = createTxEvent({
        transaction: { value: TX_VALUE_THRESHHOLD },
      });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns a findings if value is above threshold", async () => {
      const value = 101 * DECIMALS;
      const txEvent = createTxEvent({
        transaction: { value: value },
      });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Values Transaction Detected",
          description: `Value is: ${value}`,
          alertId: "NETHFORTA-2",
          severity: FindingSeverity.High,
          type: FindingType.Suspicious,
        }),
      ]);
    });
  });
});
