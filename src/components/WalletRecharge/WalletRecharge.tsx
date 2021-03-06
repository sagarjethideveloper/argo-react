import React, { useContext, useEffect, useState } from "react";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import { useHistory } from "react-router-dom";
import BounceLoader from "react-spinners/BounceLoader";
import { ActionContext, StateContext } from "../../hooks";
import { IActionModel, IStateModel } from "../../model/hooks.model";
import { ApiService, ArweaveService } from "../../services";
import "./WalletRecharge.scss";

const RootHeader = React.lazy(() => import("../_SharedComponents/RootHeader"));

function WalletRecharge() {
  const history = useHistory();
  const { fetchUser } = useContext<IActionModel>(ActionContext);
  const { user } = useContext<IStateModel>(StateContext);

  const [walletFileName, setWalletFileName] = useState<string>("");
  const [walletKey, setWalletKey] = useState<any>();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBal, setWalletBal] = useState<number>(0);
  const [rechargeAmount, setRechargeAmount] = useState<string>("0.2");
  const [walletLoader, setWalletLoader] = useState<boolean>(false);
  const [rechargeLoader, setRechargeLoader] = useState<boolean>(false);
  const [rechargeDisabled, setRechargeDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (
      Number.parseFloat(rechargeAmount) >= 0.2 &&
      walletBal > Number.parseFloat(rechargeAmount)
    ) {
      setRechargeDisabled(false);
    } else {
      setRechargeDisabled(true);
    }
  }, [rechargeAmount, walletBal]);

  //load file to json
  const walletLogin = (file: any) => {
    setWalletLoader(true);
    setWalletFileName(file.name);
    const fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  //set pk json to state
  const handleFileRead = async (evt: any) => {
    const jwk = JSON.parse(evt.target.result);
    setWalletKey(jwk);
    const address = await ArweaveService.getWalletAddress(jwk);
    setWalletAddress(address);
    const winstonBal = await ArweaveService.getWalletAmount(address);
    const arBal = ArweaveService.convertToAr(winstonBal);
    setWalletBal(+arBal);
    setWalletLoader(false);
  };

  const rechargeArGo = () => {
    setRechargeLoader(true);
    ArweaveService.rechargeArgo(rechargeAmount, walletKey).then((transaction_id) => {
      // eslint-disable-next-line no-console
      const recharge = {
        wallet_address: walletAddress,
        wallet_balance: Number.parseFloat(rechargeAmount),
        transaction_id,
      };
      ApiService.rechargeWallet(recharge).subscribe((res) => {
        fetchUser();
        setRechargeLoader(false);
        history.push("/user/settings/wallet");
      });
    });
  };

  return (
    <div className="WalletRecharge">
      <RootHeader parent={"CreateOrg"} />
      <main className="app-main">
        <div className="wallet-recharge-container">
          <div className="wallet-recharge-card">
            <div className="wallet-recharge-card-inner">
              <h1 className="wallet-recharge-title">Wallet recharge</h1>
              <div className="wallet-recharge-form">
                <label className="wallet-recharge-form-title">
                  Your Arweave wallet
                </label>
                <label className="wallet-recharge-form-subtitle">
                  Please recharge your ArGo wallet using your Arweave wallet.
                </label>
                <label className="wallet-recharge-form-subtitle">
                  To start deploying your application, minimum balance required is
                  0.2 AR.
                </label>
                <label className="wallet-recharge-form-keypoint">
                  If you don’t yet have a keyfile, you can get one by creating an
                  <a
                    href="https://www.arweave.org/wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Arweave Wallet
                  </a>
                  .
                </label>
                <div className="current-wallet-details">
                  <div className="current-wallet-details-title">
                    Current Balance:
                  </div>
                  <div className="current-wallet-details-desc">
                    {user?.argo_wallet?.wallet_balance
                      ? user?.argo_wallet?.wallet_balance
                      : 0}{" "}
                    AR
                  </div>
                </div>
                <div className="wallet-choose-container">
                  <button type="button" className="file-upload-button">
                    Choose
                  </button>
                  <input
                    type="file"
                    className="file-upload"
                    accept="application/JSON"
                    onChange={(e: any) => walletLogin(e.target.files[0])}
                  />
                  {walletFileName && (
                    <span className="file-upload-name">{walletFileName}</span>
                  )}
                </div>
              </div>
              {walletFileName && (
                <>
                  <div className="wallet-recharge-form">
                    <label className="wallet-recharge-form-title">
                      Wallet Details
                    </label>
                    <div className="wallet-details-container">
                      <div className="wallet-details-items">
                        <div className="wallet-details-item-title">
                          Wallet Address
                        </div>
                        <div className="wallet-details-item-desc">
                          {!walletLoader ? (
                            walletAddress
                          ) : (
                            <Skeleton width={300} duration={2} />
                          )}
                        </div>
                      </div>
                      <div className="wallet-details-items">
                        <div className="wallet-details-item-title">Ar Balance</div>
                        <div className="wallet-details-item-desc">
                          {!walletLoader ? (
                            `${walletBal} AR`
                          ) : (
                            <Skeleton width={150} duration={2} />
                          )}
                        </div>
                      </div>
                      {walletBal === 0 && !walletLoader && (
                        <div className="wallet-details-items">
                          <span className="exclamation-icon">
                            <FontAwesomeIcon
                              icon={faExclamationCircle}
                            ></FontAwesomeIcon>
                          </span>
                          <span>
                            You do not have enough balance to recharge your ArGo
                            wallet.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="wallet-recharge-form">
                    <label className="wallet-recharge-form-title">
                      Wallet Recharge
                    </label>
                    <label className="wallet-recharge-form-subtitle">
                      Please provide the recharge amount.
                    </label>
                    <input
                      type="number"
                      min={0.2}
                      className="wallet-recharge-form-input"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="button-container">
                <button
                  type="button"
                  className="primary-button"
                  disabled={rechargeDisabled || rechargeLoader}
                  onClick={rechargeArGo}
                >
                  {rechargeLoader && (
                    <BounceLoader size={20} color={"#fff"} loading={true} />
                  )}
                  Recharge
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={(e) => history.goBack()}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WalletRecharge;
