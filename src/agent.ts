import BigNumber from "bignumber.js";
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
} from "forta-agent";
import Web3 from "web3";
import {
  COMPTROLLER_ADDRESS,
  COMP_ADDRESS,
  COMP_THRESHOLD,
  ERC20_TRANSFER_EVENT,
} from "./utils";

const web3 = new Web3();

export const createFinding = (amount: string) =>
  Finding.fromObject({
    name: "Big transaction out of Comptroller",
    description: `An amount greater than ${COMP_THRESHOLD} COMP was moved out of Comptroller`,
    alertId: "COMPOUND_COMPTROLLER_ALERT",
    severity: FindingSeverity.Medium,
    type: FindingType.Suspicious,
    metadata: {
      amountTransfered: amount,
    },
  });

const handleTransaction: HandleTransaction = async (txEvent) => {
  return txEvent
    .filterEvent(ERC20_TRANSFER_EVENT, COMP_ADDRESS)
    .map((log) => ({
      from: web3.eth.abi.decodeParameter("address", log.topics[1]) as any,
      amount: web3.eth.abi.decodeParameter("uint256", log.data) as any,
    }))
    .filter(
      ({ from, amount }) =>
        from.toLowerCase() === COMPTROLLER_ADDRESS.toLowerCase() &&
        new BigNumber(amount).gt(new BigNumber(COMP_THRESHOLD))
    )
    .map(({ amount }) => createFinding(amount));
};

export default {
  handleTransaction,
};
