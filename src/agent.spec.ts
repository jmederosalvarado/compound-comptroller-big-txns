import BigNumber from "bignumber.js";
import {
  EventType,
  HandleTransaction,
  Network,
  Trace,
  Transaction,
  TransactionEvent,
  TxEventBlock,
} from "forta-agent";
import Web3 from "web3";
import agent, { createFinding } from "./agent";
import {
  COMPTROLLER_ADDRESS,
  COMP_ADDRESS,
  COMP_THRESHOLD,
  ERC20_TRANSFER_EVENT,
} from "./utils";

const web3 = new Web3();

describe("Detect Very High Txn Value", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  const createTxEvent = (
    from: string,
    to: string,
    amount: any
  ): TransactionEvent => {
    const blockNumber = 0;
    const blockHash = "";
    const txHash = "";
    const txIdx = 0;

    return new TransactionEvent(
      EventType.BLOCK,
      Network.MAINNET,
      {} as Transaction,
      {
        root: "",
        logs: [
          {
            address: COMP_ADDRESS,
            data: web3.eth.abi.encodeParameter("uint256", amount),
            topics: [
              web3.utils.keccak256(ERC20_TRANSFER_EVENT),
              web3.eth.abi.encodeParameter("address", from),
              web3.eth.abi.encodeParameter("address", to),
            ],
            removed: false,
            logIndex: 0,
            blockHash: blockHash,
            blockNumber: blockNumber,
            transactionHash: txHash,
            transactionIndex: txIdx,
          },
        ],
        status: true,
        gasUsed: "",
        blockHash: blockHash,
        logsBloom: "",
        blockNumber: blockNumber,
        contractAddress: COMP_ADDRESS,
        transactionHash: txHash,
        transactionIndex: txIdx,
        cumulativeGasUsed: "",
      },
      [] as Trace[],
      { [COMP_ADDRESS]: true },
      {} as TxEventBlock
    );
  };

  describe("Handle Transaction", () => {
    it("returns empty findings if value is below threshold", async () => {
      const txEvent = createTxEvent(
        COMPTROLLER_ADDRESS,
        "0x0000000000000000000000000000000000000001",
        "2"
      );

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if value is equal to threshold", async () => {
      const txEvent = createTxEvent(
        COMPTROLLER_ADDRESS,
        "0x0000000000000000000000000000000000000001",
        COMP_THRESHOLD
      );

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns a findings if value is above threshold", async () => {
      const amount = new BigNumber(COMP_THRESHOLD)
        .plus(new BigNumber("10"))
        .toString();
      const txEvent = createTxEvent(
        COMPTROLLER_ADDRESS,
        "0x0000000000000000000000000000000000000001",
        amount
      );

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([createFinding(amount)]);
    });
  });
});
