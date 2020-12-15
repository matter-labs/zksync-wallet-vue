<template>
    <div class="formPage">
        <div class="formView">
            <div class="formHeaderText">
                <div class="headline">Step 2/4: Assets require your attention</div>
                <p class="text">
                    3 assets require your attention. Go through the list below and perform required actions until each ends up with a green status: <b>’Ready to proceed‘</b>
                </p>
            </div>
            <div class="formContainer">
                <div class="formHeader">
                    <div class="headerText">My zkWallet</div>
                    <div class="headerBtns">
                        <button class="customBtn icon"><i class="far fa-wallet"></i></button>
                        <button class="customBtn icon"><i class="far fa-sign-out-alt"></i></button>
                    </div>
                </div>
                <div class="formBody">

                    <div class="walletBlock">
                        <div class="leftSide">
                            <div class="headline">Your zkWallet Address</div>
                            <div class="address">0xc0f97CC918C9d6fA4E9fc6be61a6a06589D199b2</div>
                        </div>
                        <div class="rightSide">
                            <button class="customBtn icon"><i class="fas fa-copy"></i></button>
                            <button class="customBtn icon"><i class="fas fa-qrcode"></i></button>
                        </div>
                    </div>

                    <div class="hintBlock mt-3">
                        <div class="icon">
                            <i class="fas fa-bookmark"></i>
                        </div>
                        <div class="text">Deposit funds from the wallet you’ve used for authentication to proceed</div>
                    </div>
                    <div class="field">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token disabled">
                                    <img src="@/assets/imgs/tokens/link.svg" alt="Link">
                                    <span>LINK</span>
                                </div>
                                <div class="totalPrice block">
                                    <div class="label danger">Top up!</div>
                                    <div class="main">9.13</div>
                                    <div class="secondary">119.88 $</div>
                                </div>
                            </div>
                            <div class="rightSide">
                                <div class="numberInputContainer">
                                    <!-- <div class="numberInputError">Min. amount to deposit:</div> -->
                                    <div class="numberInput">
                                        <div class="iconHandle minus disabled"><i class="far fa-minus-circle"></i></div>
                                        <div class="numbers">
                                            <input type="number" value="6.00">
                                            <div class="price">78.79 $</div>
                                        </div>
                                        <div class="iconHandle plus"><i class="far fa-plus-circle"></i></div>
                                        <div class="iconHandle mobile"><i class="fas fa-pen"></i></div>
                                    </div>
                                </div>
                                <button class="customBtn">Deposit</button>
                            </div>
                        </div>
                    </div>

                    <div class="field mt-4">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token">
                                    <img src="@/assets/imgs/tokens/btc.svg" alt="BTC">
                                    <span>BTC</span>
                                </div>
                                <div class="totalPrice">
                                    <div class="main">0.00013</div>
                                    <div class="secondary">2.31 $</div>
                                </div>
                            </div>
                            <div class="rightSide">
                                <div class="statusBlock success">
                                    <div class="icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <span class="text">Ready to proceed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="hintBlock mt-3">
                        <div class="icon">
                            <i class="fas fa-bookmark"></i>
                        </div>
                        <div class="text">Link is required to enable deposit/checkout/withdraw</div>
                    </div>
                    <div class="field">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token disabled">
                                    <img src="@/assets/imgs/tokens/eth.svg" alt="ETH">
                                    <span>ETH</span>
                                </div>
                                <div class="statusBlock">
                                    <div class="icon">
                                        <i class="icon far fa-link"></i>
                                    </div>
                                    <span class="text">Link required</span>
                                </div>
                            </div>
                            <div class="rightSide">
                                <button class="customBtn"><i class="far fa-link"></i> Link</button>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="formFooter">
                    <div class="leftSide">
                        <div class="infoItem network">
                            <div class="infoLabel">Network</div>
                            <div class="infoValue">Mainnet</div>
                        </div>
                        <div class="separator"></div>
                        <div class="infoItem network">
                            <div class="infoLabel">zkSync Lib:</div>
                            <div class="infoValue">v.0.1.1.36601a5</div>
                        </div>
                    </div>
                    <a href="#" class="zkScan">zkScan <i class="fas fa-external-link"></i></a>
                </div>
            </div>
        </div>

        <div class="formView">
            <div class="formHeaderText">
                <div class="headline danger">Pause: Checkout is paused by the blocking issue</div>
                <p class="text">
                    It means that you’re expected to perform some actions outside of the checkout in separate tab/app or you need to re-login
                </p>
            </div>

            <div class="message">
                <div class="messageHeadline danger">
                    <i class="fas fa-minus-circle"></i>
                    <span>Checkout vendor rejected your asset account address</span>
                </div>
                <div class="messageContent">
                    <div class="messageText">
                        Vendor behind current checkout session restricts it to exact account/wallet address. And your account/wallet used for the authentication unfortunately doesn't match one specified by the Vendor. <a href="#">Learn more</a>
                    </div>
                    <div class="walletBlock">
                        <div class="leftSide">
                            <div class="headline">Account/wallet you’ve used</div>
                            <div class="address">0xc0f97CC918C9d6fA4E9fc6be61a6a06589D199b2</div>
                        </div>
                        <div class="rightSide">
                            <button class="customBtn icon"><i class="fas fa-copy"></i></button>
                        </div>
                    </div>
                    <div class="message">
                        <div class="messageHeadline">
                            <i class="fas fa-lightbulb-on"></i>
                            <span>Simple tip you can follow to meet Vendor’s requirements</span>
                        </div>
                        <div class="messageContent">
                            <div class="messageText">
                                Usually vendors apply restrictions when the user linked some specific account/wallet at vendor’s service or app. It’s pretty easy to check — use button above to copy rejected address and compare it with the data listed in your profile or account details at vendor’s.  In case you can’t find any linked wallet, then contact Vendor’s support and provide them with copied address and details of this checkout session.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="formContainer">
                <div class="formHeader">
                    <div class="headerText">My zkWallet</div>
                    <div class="headerBtns">
                        <button class="customBtn icon"><i class="far fa-sign-out-alt"></i></button>
                    </div>
                </div>
                <div class="formBody">
                    <div class="walletBlock">
                        <div class="leftSide">
                            <div class="headline">Your zkWallet Address</div>
                            <div class="address">0xc0f97CC918C9d6fA4E9fc6be61a6a06589D199b2</div>
                        </div>
                        <div class="rightSide">
                            <button class="customBtn icon"><i class="fas fa-copy"></i></button>
                            <button class="customBtn icon"><i class="fas fa-qrcode"></i></button>
                        </div>
                    </div>
                    <div class="formBlocked">
                        <i class="fal fa-ban"></i>
                    </div>
                </div>
                <div class="formFooter">
                    <div class="leftSide">
                        <div class="infoItem network">
                            <div class="infoLabel">Network</div>
                            <div class="infoValue">Mainnet</div>
                        </div>
                        <div class="separator"></div>
                        <div class="infoItem network">
                            <div class="infoLabel">zkSync Lib:</div>
                            <div class="infoValue">v.0.1.1.36601a5</div>
                        </div>
                    </div>
                    <a href="#" class="zkScan">zkScan <i class="fas fa-external-link"></i></a>
                </div>
            </div>
        </div>

        <div class="formView">
            <div class="formHeaderText">
                <div class="headline success">Components states</div>
            </div>
            <div class="formContainer">
                <div class="formBody" style="overflow: hidden">
                    <div style="display: flex; flex-wrap: wrap;">
                        <button class="customBtn" style="margin-right: 10px;">Logout</button>
                        <button class="customBtn danger" style="margin-right: 10px;">Logout</button>
                        <button class="customBtn success" style="margin-right: 10px;">Logout</button>
                        <button class="customBtn" disabled style="margin-right: 10px;">Logout</button>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; margin-top: 5px;">
                        <button class="customBtn" style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i> Logout</button>
                        <button class="customBtn danger" style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i> Logout</button>
                        <button class="customBtn success" style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i> Logout</button>
                        <button class="customBtn" disabled style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i> Logout</button>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; margin-top: 5px;">
                        <button class="customBtn icon" style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i></button>
                        <button class="customBtn icon danger" style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i></button>
                        <button class="customBtn icon success" style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i></button>
                        <button class="customBtn icon" disabled style="margin-right: 10px;"><i class="far fa-sign-out-alt"></i></button>
                    </div>

                    <div class="field mt-4">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token">
                                    <img src="@/assets/imgs/tokens/eth.svg" alt="ETH">
                                    <span>ETH</span>
                                </div>
                                <div class="totalPrice">
                                    <div class="main">12.1003</div>
                                    <div class="secondary">23.45 $</div>
                                </div>
                            </div>
                            <div class="rightSide">
                                <div class="statusBlock success">
                                    <div class="icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <span class="text">Ready to proceed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="field mt-4">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token">
                                    <img src="@/assets/imgs/tokens/eth.svg" alt="ETH">
                                    <span>ETH</span>
                                </div>
                                <div class="totalPrice success">
                                    <div class="main">
                                        <span>12.1003</span>
                                        <div class="underline">Paid asset amount</div>
                                    </div>
                                    <div class="secondary">23.45 $</div>
                                </div>
                            </div>
                            <div class="rightSide">
                                <div class="statusBlock success">
                                    <div class="icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <span class="text">Ready to proceed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="hintBlock mt-4">
                        <div class="icon">
                            <i class="fas fa-bookmark"></i>
                        </div>
                        <div class="text">Link is required to enable deposit/checkout/withdraw</div>
                    </div>
                    <div class="field">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token disabled">
                                    <img src="@/assets/imgs/tokens/eth.svg" alt="ETH">
                                    <span>ETH</span>
                                </div>
                                <div class="statusBlock">
                                    <div class="icon">
                                        <i class="far fa-link"></i>
                                    </div>
                                    <span class="text">Link required</span>
                                </div>
                            </div>
                            <div class="rightSide">
                                <button class="customBtn"><i class="far fa-link"></i> Link</button>
                            </div>
                        </div>
                    </div>

                    <div class="hintBlock mt-4">
                        <div class="icon">
                            <i class="fas fa-bookmark"></i>
                        </div>
                        <div class="text">Deposit funds from the wallet you’ve used for authentication to proceed</div>
                    </div>
                    <div class="field">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token">
                                    <img src="@/assets/imgs/tokens/link.svg" alt="Link">
                                    <span>LINK</span>
                                </div>
                                <div class="totalPrice">
                                    <div class="main">9.13</div>
                                    <div class="secondary">119.88 $</div>
                                </div>
                            </div>
                            <div class="rightSide">
                                <div class="numberInputContainer">
                                    <!-- <div class="numberInputError">Min. amount to deposit:</div> -->
                                    <div class="numberInput">
                                        <div class="iconHandle minus disabled"><i class="far fa-minus-circle"></i></div>
                                        <div class="numbers">
                                            <input type="number" value="6.00">
                                            <div class="price">78.79 $</div>
                                        </div>
                                        <div class="iconHandle plus"><i class="far fa-plus-circle"></i></div>
                                        <div class="iconHandle mobile"><i class="fas fa-pen"></i></div>
                                    </div>
                                </div>
                                <button class="customBtn">Deposit</button>
                            </div>
                        </div>
                    </div>

                    <div class="field loading mt-4">
                        <div class="filedLoader">
                            <div class="filedLoaderProgress"></div>
                        </div>
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token disabled">
                                    <img src="@/assets/imgs/tokens/eth.svg" alt="ETH">
                                    <span>ETH</span>
                                </div>
                                <div class="statusBlock">
                                    <div class="icon">
                                        <i class="fad fa-spinner-third"></i>
                                    </div>
                                    <span class="text">Linking in progress and may take up to 5 mins</span>
                                </div>
                            </div>
                            <div class="rightSide">
                                <button class="customBtn" disabled><i class="far fa-link"></i> Link</button>
                            </div>
                        </div>
                    </div>

                    <div class="hintBlock mt-4">
                        <div class="icon">
                            <i class="fad fa-spinner-third"></i>
                        </div>
                        <div class="text"><b>Status:</b> Received 2 / 10 confirmations...</div>
                    </div>
                    <div class="field loading">
                        <div class="filedLoader">
                            <div class="filedLoaderProgress"></div>
                        </div>
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token disabled">
                                    <img src="@/assets/imgs/tokens/eth.svg" alt="ETH">
                                    <span>ETH</span>
                                </div>
                                <div class="statusBlock">
                                    <div class="icon">
                                        <i class="fad fa-spinner-third"></i>
                                    </div>
                                    <span class="text">Linking in progress and may take up to 5 mins</span>
                                </div>
                            </div>
                            <div class="rightSide">
                                <button class="customBtn" disabled><i class="far fa-link"></i> Link</button>
                            </div>
                        </div>
                    </div>

                    <div class="hintBlock mt-4">
                        <div class="icon">
                            <i class="fal fa-file-invoice"></i>
                        </div>
                        <div class="text"><b>Top-up done:</b> You can check performed transaction using <b>zkSync Scan</b></div>
                    </div>
                    <div class="field">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token">
                                    <img src="@/assets/imgs/tokens/link.svg" alt="LINK">
                                    <span>LINK</span>
                                </div>
                                <div class="totalPrice">
                                    <div class="main">15.1300</div>
                                    <div class="secondary">197.40 $</div>
                                </div>
                            </div>
                            <div class="rightSide">
                                <div class="statusBlock success">
                                    <div class="icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <span class="text">Deposit done.<br>Ready to proceed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="hintBlock mt-4">
                        <div class="icon">
                            <i class="fas fa-minus-circle"></i>
                        </div>
                        <div class="text">Connect this asset to your on-chain wallet to continue. To access FAQ use the button below.</div>
                    </div>
                    <div class="field">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token">
                                    <img src="@/assets/imgs/tokens/btc.svg" alt="BTC">
                                    <span>BTC</span>
                                </div>
                                <div class="statusBlock danger">
                                    <div class="icon">
                                        <i class="fas fa-ban"></i>
                                    </div>
                                    <span class="text">No asset found. Checkout can’t be finished without it.</span>
                                </div>
                            </div>
                            <div class="rightSide">
                                <button class="customBtn danger"><i class="fas fa-question-circle"></i> FAQ</button>
                            </div>
                        </div>
                    </div>

                    <div class="hintBlock mt-4">
                        <div class="icon">
                            <i class="fas fa-minus-circle"></i>
                        </div>
                        <div class="text">Insufficient funds to make the deposit. Top up your on-chain wallet to proceed. Use the button below to copy your linked account address into the clipboard.</div>
                    </div>
                    <div class="field">
                        <div class="fieldContent">
                            <div class="leftSide">
                                <div class="token">
                                    <img src="@/assets/imgs/tokens/btc.svg" alt="BTC">
                                    <span>BTC</span>
                                </div>
                                <div class="totalPrice block danger">
                                    <div class="label">L2 balance:</div>
                                    <div class="main">0.00010</div>
                                    <div class="secondary">1.64 $</div>
                                </div>
                                <div class="statusBlock danger">
                                    <div class="icon">
                                        <i class="fas fa-ban"></i>
                                    </div>
                                    <span class="text">Ext. wallet run out of funds.<br>Missing <b>0,00003</b></span>
                                </div>
                            </div>
                            <div class="rightSide">
                                <button class="customBtn icon"><i class="fas fa-copy"></i></button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  layout: "index",
};
</script>

<style scoped lang="scss">
$white: #fff;
$dark: #243955;
$violet: #5436d6;
$red: #f25f5c;
$green: #057a55;
$lightGray: #f6f8fa;

$firaSans: "Fira Sans", sans-serif;
$firaSansCondensed: "Fira Sans Condensed", sans-serif;
$sourceSansPro: "Source Sans Pro", sans-serif;
$openSans: "Open Sans", sans-serif;

@import url("https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;500;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:wght@300;400;500&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap");

.mt-3 {
  margin-top: 30px;
}
.mt-4 {
  margin-top: 40px;
}
.formView {
  width: 100%;
  max-width: 840px;
  background-color: #ebf2fa;
  margin: 0 auto;
  padding: 50px 0;

  .formHeaderText {
    width: 90%;
    text-align: center;
    max-width: 590px;
    margin: 0 auto;
    margin-bottom: 40px;

    .headline {
      font-family: $firaSans;
      font-weight: 700;
      font-size: 24px;
      color: $dark;
      &.success {
        color: $green;
      }
      &.danger {
        color: $red;
      }
    }
    .text {
      font-family: $firaSans;
      font-size: 20px;
      line-height: 30px;
      font-weight: 300;
      color: $dark;
      margin: 0;

      b {
        font-weight: 700;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 30px 0;

    .formHeaderText {
      margin-bottom: 25px;

      .headline {
        font-size: 20px;
      }
      .text {
        font-size: 16px;
        line-height: 22px;
      }
    }
  }
}
.formContainer {
  width: 90%;
  max-width: 590px;
  margin: 0 auto;
  background: $white;
  box-shadow: 0px 2px 60px rgba(0, 0, 0, 0.06);
  border-radius: 10px;

  .formHeader,
  .formBody,
  .formFooter {
    padding: 15px 36px;
    box-sizing: border-box;
  }
  .formHeader {
    display: flex;
    width: 100%;
    align-items: center;

    .headerText {
      width: 100%;
      font-size: 24px;
      line-height: 30px;
      color: $dark;
      font-weight: 500;
      font-family: $firaSans;
    }
    .headerBtns {
      display: flex;
      flex-wrap: nowrap;

      & > * {
        &:not(:last-child) {
          margin-right: 5px;
        }
      }
    }
  }
  .formBody {
    position: relative;
    background-color: $lightGray;
    border-top: 2px solid #ebf2fa;
    border-bottom: 2px solid #ebf2fa;
    box-sizing: border-box;

    .formBlocked {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 220px;
      padding: 20px 0;
      background: #f6f8fac9;

      i {
        font-size: 180px;
        color: #bababa;
        text-align: center;
      }
    }
  }
  .formFooter {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .leftSide {
      display: flex;
      align-items: center;

      .infoItem {
        font-family: $firaSansCondensed;
        font-weight: 500;
        padding: 0 12px;
        box-sizing: border-box;
        &:first-child {
          padding-left: 0;
        }

        .infoLabel {
          color: #a2a2a2;
          font-size: 16px;
        }
        .infoValue {
          color: #3c4257;
          font-size: 14px;
        }
      }
      .separator {
        height: 21px;
        width: 1px;
        background-color: #e1e4e8;
        margin: 0 2px;
      }
    }
    .zkScan {
      font-family: $firaSansCondensed;
      font-size: 16px;
      font-weight: 500;
      color: $violet;
      text-decoration: none;

      i {
        color: $dark;
        font-size: 14px;
        margin-left: 5px;
      }
    }
    /* font-family: $firaSansCondensed;
            color: #8D9AAC;
            font-size: 16px;
            font-weight: 300;

            b {
                color: $dark;
                font-weight: 500;
            } */
  }

  @media (max-width: 768px) {
    .formHeader,
    .formBody,
    .formFooter {
      padding: 15px 20px;
    }
    .formHeader {
      flex-direction: column;

      .headerText {
        font-size: 20px;
        line-height: 24px;
        text-align: center;
        margin-bottom: 10px;
      }
    }
    .formFooter {
      .leftSide .infoItem {
        padding: 0 8px;

        .infoLabel {
          font-size: 14px;
        }
        .infoValue {
          font-size: 12px;
        }
      }
    }
  }
}
.customBtn {
  display: block;
  background-color: $violet;
  font-weight: 600;
  color: $white;
  font-size: 16px;
  font-family: $sourceSansPro;
  white-space: nowrap;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 7px 12px;
  border: none;
  box-sizing: border-box;
  outline: none;
  transition: filter 0.2s ease;
  &.danger {
    background-color: $red;
  }
  &.success {
    background-color: $green;
  }
  &:not(:disabled) {
    cursor: pointer;
    &:hover {
      filter: brightness(115%);
    }
    &:active {
      transition: 0.001s;
      filter: brightness(100%);
    }
  }
  &:disabled {
    opacity: 0.4;
  }
  &.icon {
    min-width: 40px;
    padding-left: 12px;
    padding-right: 12px;
    text-align: center;

    i {
      margin: 0;
    }
  }

  i {
    margin-right: 4px;
  }
}
.walletBlock {
  display: flex;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
  background: $white;
  border: 1px solid #e1e4e8;
  box-sizing: border-box;

  .leftSide {
    width: 100%;
    display: flex;
    flex-direction: column;
    text-align: left;
    padding-right: 5px;
    box-sizing: border-box;
    font-weight: 500;
    font-family: $firaSansCondensed;

    .headline {
      color: $dark;
      font-size: 14px;
    }
    .address {
      color: #5d768e;
      font-size: 12px;
      line-height: 14px;
      padding-top: 2px;
    }
  }
  .rightSide {
    display: flex;
    & > * {
      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;

    .leftSide {
      margin-bottom: 10px;
      text-align: center;
      white-space: pre-line;
      word-break: break-word;
    }
    .rightSide {
      justify-content: center;
    }
  }
}
.hintBlock {
  display: flex;
  width: 100%;
  min-height: 20px;
  margin-bottom: 5px;
  flex-wrap: nowrap;
  align-items: center;
  color: $violet;

  .icon {
    width: 20px;
    margin-right: 10px;
    font-size: 18px;
    text-align: center;
  }
  .text {
    font-family: $openSans;
    font-weight: 400;
    text-align: left;
    font-size: 11px;
    line-height: 14px;

    b {
      font-weight: 600;
    }
  }
}
.message {
  width: 90%;
  max-width: 590px;
  margin: 40px auto;
  border: 1px solid #e1e4e8;
  padding: 10px 12px;
  border-radius: 5px;
  box-sizing: border-box;

  .messageHeadline {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-family: $firaSansCondensed;
    font-weight: 500;
    color: $violet;
    margin-bottom: 5px;
    &.danger {
      color: $red;
    }
    &.success {
      color: $green;
    }

    i {
      margin-right: 5px;
    }
  }
  .messageContent {
    width: 100%;
    padding-left: 40px;
    box-sizing: border-box;

    & > * {
      &:not(:last-child) {
        margin: 10px 0;
      }
    }
  }
  .messageText {
    font-size: 16px;
    font-family: $firaSansCondensed;
    font-weight: 300;
    color: $dark;

    a {
      color: $violet;
      text-decoration: none;
      font-weight: 700;
    }
  }
  .message {
    width: 100%;
    margin: 0;

    .messageHeadline {
      font-size: 18px;
    }
    .messageText {
      font-size: 14px;
    }
  }

  @media (max-width: 768px) {
    margin: 20px auto;

    .messageContent {
      padding-left: 20px;
    }
    .messageHeadline {
      font-size: 18px;
      line-height: 20px;
    }
    .messageText {
      font-size: 14px;
    }
    .message {
      .messageHeadline {
        font-size: 16px;
        line-height: 18px;
      }
      .messageText {
        font-size: 12px;
      }
    }
  }
}
.field {
  width: 100%;
  height: 60px;
  border-radius: 5px;
  background-color: $white;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  &.loading {
    padding: 0;

    .filedLoader {
      height: 8px;
    }
    .fieldContent {
      height: 52px;
      padding: 5px 10px;
    }
  }

  .filedLoader {
    width: 100%;
    height: 0;
    border-radius: 5px 5px 0 0;
    background-color: #b8b2eb;
    transition: height 0.3s ease;

    .filedLoaderProgress {
      width: 10%;
      height: 100%;
      background-color: $violet;
      transition: width 0.2s ease;
    }
  }
  .fieldContent {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;

    .leftSide,
    .rightSide {
      height: 100%;
      width: max-content;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;

      & > * {
        &:not(:last-child) {
          margin-right: 5px;
        }
      }
    }
    .token {
      display: flex;
      align-items: center;
      padding-right: 5px;
      transition: opacity 0.3s ease;
      &.disabled {
        opacity: 0.5;
      }

      img {
        display: block;
        height: 20px;
        width: auto;
        margin-right: 3px;
      }
      span {
        font-weight: 600;
        font-size: 18px;
        font-family: $openSans;
        text-align: left;
        color: #3c4257;
        white-space: nowrap;
      }
    }
    .totalPrice {
      display: flex;
      align-items: center;
      white-space: nowrap;
      &.block {
        flex-direction: column;
        justify-content: center;
        .main,
        .secondary,
        .label {
          text-align: center;
        }
      }
      &.danger {
        .main,
        .secondary {
          color: $red;
        }
      }
      &.success {
        .main,
        .secondary {
          color: $green;
        }
      }

      .label {
        font-family: $firaSans;
        font-weight: 400;
        font-size: 9px;
        line-height: 12px;
        color: #8d9aac;
        text-align: left;
        &.danger {
          color: $red;
        }
        &.success {
          color: $green;
        }
      }
      .main {
        font-weight: 600;
        font-size: 18px;
        font-family: $openSans;
        text-align: left;
        color: $violet;
      }
      .secondary {
        font-weight: 300;
        font-size: 12px;
        line-height: 12px;
        font-family: $firaSans;
        color: #4e529a;
        text-align: left;
        margin-left: 5px;
      }
      .underline {
        text-align: center;
        font-size: 9px;
        line-height: 10px;
        font-weight: 400;
        font-family: $firaSansCondensed;
      }
    }
    .numberInputContainer {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;

      /* .numberInputError {
                    margin-right: 5px;
                    text-align: right;
                    font-size: 14px;
                    line-height: 16px;
                    color: $red;
                    font-weight: 400;
                    font-family: $firaSansCondensed;
                    max-width: 100px;
                } */
      .numberInput {
        display: grid;
        grid-template-columns: 18px 1fr 18px;
        grid-template-rows: 100%;
        align-items: center;
        width: 120px;
        height: 47px;
        border-radius: 5px;
        background-color: $lightGray;
        padding: 10px 6px;
        box-sizing: border-box;

        .iconHandle {
          width: 100%;
          text-align: center;
          font-size: 18px;
          color: $violet;
          transition: color 0.2s ease;
          cursor: pointer;
          &.disabled {
            opacity: 0.5;
            pointer-events: none;
          }
          &.mobile {
            display: none;
          }
          &:hover {
            color: lighten($color: $violet, $amount: 15);
          }
          &:active {
            transition: 0.001s;
            color: $violet;
          }
        }
        .numbers {
          width: 100%;
          height: max-content;
          padding-bottom: 3px;

          input {
            width: 100%;
            height: 16px;
            line-height: 16px;
            font-size: 16px;
            background: none;
            padding: 0;
            border: none;
            text-align: center;
            color: $violet;
            font-family: $firaSans;
            font-weight: 600;
            outline: none;
          }
          .price {
            font-family: $firaSans;
            font-weight: 300;
            color: #8d9aac;
            text-align: center;
            font-size: 12px;
            line-height: 12px;
          }
        }
      }
    }
    .statusBlock {
      display: flex;
      align-items: center;
      color: $violet;
      &.success {
        color: $green;
      }
      &.danger {
        color: $red;
      }

      .icon {
        width: 25px;
        font-size: 16px;
        margin-right: 3px;
        text-align: center;
        transform: translateY(-1px);
      }
      .text {
        font-weight: 400;
        font-size: 14px;
        font-family: $firaSansCondensed;
        text-align: left;
      }
    }

    @media (max-width: 768px) {
      .token {
        flex-direction: column;
        padding: 0 4px;
        box-sizing: border-box;

        img {
          height: 15px;
          margin-right: 0;
        }
        span {
          text-align: center;
          font-size: 12px;
        }
      }
      .totalPrice {
        flex-direction: column;

        .main {
          font-size: 16px;
          line-height: 16px;
          text-align: center;
        }
        .secondary {
          font-size: 9px;
          line-height: 10px;
        }
      }
      .statusBlock {
        .text {
          font-size: 12px;
          line-height: 15px;
        }
      }
      .numberInputContainer {
        /* .numberInputError {
                        font-size: 11px;
                        line-height: 14px;
                        max-width: 65px;
                        @media (max-width: 415px) {
                            max-width: 50px;
                        }
                    } */
        .numberInput {
          width: 66px;
          grid-template-columns: 1fr 12px;

          .iconHandle {
            display: none;
            &.mobile {
              display: block;
              font-size: 12px;
            }
          }
          .numbers {
            input {
              font-size: 12px;
              line-height: 12px;
              height: 12px;
              text-align: left;
            }
            .price {
              font-size: 9px;
              text-align: left;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
}
</style>
