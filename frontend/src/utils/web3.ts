import { AddressType } from "../actions/types/eth";

export const sendTransaction = (web3: any, from: AddressType, to: AddressType, data: string = "", value: number = 0): Promise<string> => {
    return new Promise((res, rej) => {
        web3.eth.sendTransaction(
            {
                from,
                to,
                value,
                data,
            },
            (err: any, transactionHash: string) => {
                if (err) {
                    if (err instanceof Error) {
                        rej(err);
                    } else if (typeof err === "object") {
                        rej(new Error(JSON.stringify(err)));
                    } else {
                        rej(err);
                    }
                }

                res(transactionHash);
            },
        );
    });
};
