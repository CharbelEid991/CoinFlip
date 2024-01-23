import 'bootstrap/dist/css/bootstrap.min.css';
import {WalletSelector} from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {
    useWallet, InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import Loader from './Components/Loader';
import {Aptos} from "@aptos-labs/ts-sdk";
import {useEffect, useState} from 'react';


function App() {
    const {account, isLoading, signAndSubmitTransaction} = useWallet();
    const aptos = new Aptos()
    const [alreadyPlayed, setAlreadyPlayed] = useState(false)
    const [values, setValues] = useState({winning_counter: 0, last_result: null})
    const [loadingResult, setLoadingResult] = useState(false)
    const moduleAddress = "0xc91137876e45c4ddfb8dd494caeaf85790d325052c590b09b5e753b998bf0e61"

    useEffect(() => {
        fetUserResult()
    }, [account])

    const fetUserResult = async () => {
        if (!account) return [];
        setLoadingResult(true)
        // change this to be your module account address
        try {
            const coinFlipResults = await aptos.getAccountResource(
                {
                    accountAddress: account?.address,
                    resourceType: `${moduleAddress}::coinFlip::CoinFlip`
                }
            );
            setAlreadyPlayed(true)
            setValues(coinFlipResults)
            setLoadingResult(false)
        } catch (e: any) {
            setAlreadyPlayed(false)
            setLoadingResult(false)
        }
    };

    const startPlaying = async () => {
        if (!account) return [];

        const transaction: InputTransactionData = {
            data: {
                function: `${moduleAddress}::coinFlip::create_game`,
                functionArguments: []
            }
        }
        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction(transaction);
            // wait for transaction
            await aptos.waitForTransaction({transactionHash: response.hash});
            setAlreadyPlayed(true)
        } catch (error: any) {
            setAlreadyPlayed(false)
        }
    }


    const handleCoinOption = async (option: 'heads' | 'tails') => {
        if (!account) return [];

        setLoadingResult(true)
        const transaction: InputTransactionData = {
            data: {
                function: `${moduleAddress}::coinFlip::play`,
                functionArguments: [option]
            }
        }
        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction(transaction);
            // wait for transaction
            await aptos.waitForTransaction({transactionHash: response.hash});
            fetUserResult()
            setLoadingResult(false)

        } catch (error: any) {
            setLoadingResult(false)
        }
    }

    return (
        <>
            {
                isLoading ?
                    <Loader/>
                    :
                    <div className="container mt-5">
                        <div className="row">
                            <div className="col-md-6">
                                <h3>Coin Flip Game</h3>
                            </div>
                            <div className="col-md-6">
                                <div className="justify-content-end">
                                    <WalletSelector/>
                                </div>
                            </div>
                        </div>

                        {
                            account?.address ?
                                <>
                                    {
                                        alreadyPlayed ?
                                            <>
                                                <div className="row mt-5">
                                                    <div className="col-md-6">
                                                        <h4>Select Your Option</h4>
                                                    </div>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-md-6 mt-4">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <button onClick={() => handleCoinOption('heads')}
                                                                        className='btn btn-primary'> Heads
                                                                </button>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <button onClick={() => handleCoinOption('tails')}
                                                                        className='btn btn-secondary'> Tails
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mt-4">
                                                        {
                                                            !loadingResult ?
                                                                <>
                                                                    <div className="row">
                                                                        <div className="col-md-6">
                                                                            Total Winning Streak
                                                                            : {values?.winning_counter}
                                                                        </div>
                                                                    </div>
                                                                    {values.last_result === true ?
                                                                        <div>Result: You win</div>
                                                                        :
                                                                        values.last_result === false &&
                                                                        <div>
                                                                            Result: You loose
                                                                        </div>
                                                                    }
                                                                </>
                                                                :
                                                                <Loader/>

                                                        }
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            <div>
                                                <button onClick={() => startPlaying()}
                                                        className='btn btn-primary'> Start Playing
                                                </button>
                                            </div>
                                    }
                                </>
                                :
                                <div>
                                    No connection to your wallet .
                                </div>
                        }
                    </div>
            }
        </>
    );
}

export default App;
