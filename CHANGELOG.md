# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.5.0-0](https://github.com/matter-labs/zksync-wallet-vue/compare/v2.4.1...v2.5.0-0) (2021-08-20)


### ⚠ BREAKING CHANGES

* **firebase:** ```yarn dev``` now is binded with ropsten-beta when called localy
* **Firebase:** * dev-rinkeby host removed
* dev-deployment workflow removed

Closes ZKF-689

### Features

* **UI/UX:** UX improvement for the NFTs ([5865e93](https://github.com/matter-labs/zksync-wallet-vue/commit/5865e937f23df94b736fd245847ae2aa48509593))
* **UX/UI:** Component for the badge (beta/testnet) was extracted out of Logo and unified ([70ac6e1](https://github.com/matter-labs/zksync-wallet-vue/commit/70ac6e1bf061c64fca89664a3661febadeb12171))


### Bug Fixes

* NFT mint address ([b6a381c](https://github.com/matter-labs/zksync-wallet-vue/commit/b6a381cdc8971b293dbfa70f0ab9b022ea7ac284))
* **Operations:** Transfer fix & type-extended support ([5aa96fd](https://github.com/matter-labs/zksync-wallet-vue/commit/5aa96fd96d0647c51b8ce773b818fd49488ebf78))
* **runner:** CI runner changed ([cf50984](https://github.com/matter-labs/zksync-wallet-vue/commit/cf509842c071eebbf58dc0fe574456e2bdeefda8))
* **UI:** fixed issue with the non-100% button MINT ([c1bd180](https://github.com/matter-labs/zksync-wallet-vue/commit/c1bd180d873f5e3ebaa484537ad01e19f19e0e54))


### ci

* **Firebase:** firebase reconfigured ([e50f198](https://github.com/matter-labs/zksync-wallet-vue/commit/e50f198a409a72ca8364b3eb895b83286151add2))
* **firebase:** Google Action workflows updated ([f18ae64](https://github.com/matter-labs/zksync-wallet-vue/commit/f18ae64a23a122ae6ec2e70a3b3a2b7206ca4273)), closes [#ZKF-867](https://github.com/matter-labs/zksync-wallet-vue/issues/ZKF-867)

#### [2.4.0](https://github.com/matter-labs/zksync-wallet-vue/compare/2.4.0-prerelease...2.4.0)

> 25 May 2021

#### [2.4.0-prerelease](https://github.com/matter-labs/zksync-wallet-vue/compare/2.4.0-alpha...2.4.0-prerelease)

> 25 May 2021

#### [2.4.0-alpha](https://github.com/matter-labs/zksync-wallet-vue/compare/2.3.5...2.4.0-alpha)

> 25 May 2021

* 6-hours long UI/UX testing
* all icons where replaced
* corrections
and tweaks were done to assure the wallet is polished
* ..and
everything previously mentioned
* scroll issues solved f**king finally

Closes ZKF-559
Closes ZKF-505

- refactor(SCSS): unification and dedupe for the styles + icons adoption [`3c83b49`](https://github.com/matter-labs/zksync-wallet-vue/commit/3c83b49020187749a7874102aa42aa7f7b937450)
- optimization(performance) [`5358afe`](https://github.com/matter-labs/zksync-wallet-vue/commit/5358afe5f7d0b4386819618ced7ceda3057e50ea)
- refactor(Merging): done [`e81e45a`](https://github.com/matter-labs/zksync-wallet-vue/commit/e81e45ae820a75d0be26bd7bfff77c0edd6aade8)

#### [2.3.5](https://github.com/matter-labs/zksync-wallet-vue/compare/2.3.4...2.3.5)

> 20 May 2021

* typed restructured
* *.md files added for the description
* cypress configuration added
* babel-preset to pre-process build added
* eslint updated and optimized
* peer-dependencies fixed
* prettier configuration optimized
* ts-builder updated and the configuration was optimized
* UI for the mobile version (Tokens lists & Balances lists) now uses horizontal space correctly (https://cln.sh/55504B)

...and countless more optimizations...

- Transactions watch fixes [`#57`](https://github.com/matter-labs/zksync-wallet-vue/pull/57)

#### [2.3.4](https://github.com/matter-labs/zksync-wallet-vue/compare/2.3.3...2.3.4)

> 6 May 2021

- keriat zkf 476 mainnet doesnt return eth when [`#54`](https://github.com/matter-labs/zksync-wallet-vue/pull/54)
- hotfix(Operations): Fixed issue with unrecognizable accepted fee token [`#53`](https://github.com/matter-labs/zksync-wallet-vue/pull/53)

#### [2.3.3](https://github.com/matter-labs/zksync-wallet-vue/compare/2.3.2...2.3.3)

> 26 April 2021

- Switching the logos back to zkSync [`#51`](https://github.com/matter-labs/zksync-wallet-vue/pull/51)

#### [2.3.2](https://github.com/matter-labs/zksync-wallet-vue/compare/2.3.1...2.3.2)

> 26 April 2021

* Wallet connect issues resolved
* Deposit notifications fixed
* Restricted Tokens check improved
* package saas-loader updated to version 10.1.1
* scripts w/t &lt;bash ...&gt; changed to &lt;sh ...&gt;

- hotfix(Operations): WalletConnect issues resolved & deposit fixed [`4dd1c60`](https://github.com/matter-labs/zksync-wallet-vue/commit/4dd1c60a57d49b149ec68e2897614f970fcb6a34)
- Change connect wallet button [`60dba01`](https://github.com/matter-labs/zksync-wallet-vue/commit/60dba0178dd8a0c39886d06f7122f3bef1a961c0)
- build(favicon): Fixed favicon [`1821962`](https://github.com/matter-labs/zksync-wallet-vue/commit/1821962f00c9ca94f08a212577a97ebfa0a00eb8)

#### [2.3.1](https://github.com/matter-labs/zksync-wallet-vue/compare/2.3.0...2.3.1)

> 26 April 2021

- style(UI): zkWallet Logo replaced w/t zkSync, zkSync ecosystem in footer hidden [`08cbe38`](https://github.com/matter-labs/zksync-wallet-vue/commit/08cbe38c4082050c6d65713f14bdc813d3ecc644)
- build(OGG tags): zkWallet ogg-tags changed [`806acc2`](https://github.com/matter-labs/zksync-wallet-vue/commit/806acc28c0ea934663ba3a05e2e29a586b679229)
- build(Version bump): Version bumped up to 2.3.1 [`3de523a`](https://github.com/matter-labs/zksync-wallet-vue/commit/3de523a4e7282cef19bb9c2ad9c27a0d43dde37a)

#### [2.3.0](https://github.com/matter-labs/zksync-wallet-vue/compare/2.1.0...2.3.0)

> 20 April 2021

Correct env processing

- Correct env processing [`#50`](https://github.com/matter-labs/zksync-wallet-vue/pull/50)
- Preparing the new release: zkWallet v.2.2.0 [`#48`](https://github.com/matter-labs/zksync-wallet-vue/pull/48)
- Revert "Update firebase-hosting-push-master.yml" [`#47`](https://github.com/matter-labs/zksync-wallet-vue/pull/47)
- Update firebase-hosting-push-master.yml [`#46`](https://github.com/matter-labs/zksync-wallet-vue/pull/46)
- addressing environment [`#45`](https://github.com/matter-labs/zksync-wallet-vue/pull/45)
- added deploy to mainnet [`#44`](https://github.com/matter-labs/zksync-wallet-vue/pull/44)
- Some wallet fixes and edits + Onboard modal text change [`#42`](https://github.com/matter-labs/zksync-wallet-vue/pull/42)
- Edit onboard modal text and link [`#43`](https://github.com/matter-labs/zksync-wallet-vue/pull/43)
- Dev [`#40`](https://github.com/matter-labs/zksync-wallet-vue/pull/40)
- Tiny update [`#41`](https://github.com/matter-labs/zksync-wallet-vue/pull/41)
- Features/keriat wallet release mostly version bump — v.2.1.0 [`#39`](https://github.com/matter-labs/zksync-wallet-vue/pull/39)
- Hot-fix & bunch of optimisations [`#38`](https://github.com/matter-labs/zksync-wallet-vue/pull/38)
- Fast Withdrawal disactivated [`#37`](https://github.com/matter-labs/zksync-wallet-vue/pull/37)
- Hotfix: compare numbers instead of strings [`#36`](https://github.com/matter-labs/zksync-wallet-vue/pull/36)
- Update issue templates [`#35`](https://github.com/matter-labs/zksync-wallet-vue/pull/35)
- return normal withdrawal time indicator [`#34`](https://github.com/matter-labs/zksync-wallet-vue/pull/34)
- Dev [`#33`](https://github.com/matter-labs/zksync-wallet-vue/pull/33)
- Bump zksync.js version [`#32`](https://github.com/matter-labs/zksync-wallet-vue/pull/32)
- Modal dialog when transferring to a new account [`#31`](https://github.com/matter-labs/zksync-wallet-vue/pull/31)
- Disable Service Worker cache for .html files [`#30`](https://github.com/matter-labs/zksync-wallet-vue/pull/30)
- HTTP -&gt; WS provider [`#29`](https://github.com/matter-labs/zksync-wallet-vue/pull/29)
- Dev [`#28`](https://github.com/matter-labs/zksync-wallet-vue/pull/28)
- Add packing error [`#27`](https://github.com/matter-labs/zksync-wallet-vue/pull/27)
- Introduce `digitsError` and plans for future  refactoring [`#26`](https://github.com/matter-labs/zksync-wallet-vue/pull/26)
- Fix some bugs [`#25`](https://github.com/matter-labs/zksync-wallet-vue/pull/25)
- update: balance sorting & amount validation [`#24`](https://github.com/matter-labs/zksync-wallet-vue/pull/24)
- huge fix: custom text in onboard-js changeable, changed the way of handling big number across the dapp [`#23`](https://github.com/matter-labs/zksync-wallet-vue/pull/23)
- ci(GA CI fix #2): Reconnected [`#2`](https://github.com/matter-labs/zksync-wallet-vue/issues/2)

#### [2.1.0](https://github.com/matter-labs/zksync-wallet-vue/compare/2.1.0-beta2...2.1.0)

> 7 January 2021

#### [2.1.0-beta2](https://github.com/matter-labs/zksync-wallet-vue/compare/2.1.0-beta...2.1.0-beta2)

> 26 February 2021

- Tiny update [`#41`](https://github.com/matter-labs/zksync-wallet-vue/pull/41)
- Features/keriat wallet release mostly version bump — v.2.1.0 [`#39`](https://github.com/matter-labs/zksync-wallet-vue/pull/39)

#### [2.1.0-beta](https://github.com/matter-labs/zksync-wallet-vue/compare/2.0.4...2.1.0-beta)

> 25 February 2021

- Hot-fix & bunch of optimisations [`#38`](https://github.com/matter-labs/zksync-wallet-vue/pull/38)

#### [2.0.4](https://github.com/matter-labs/zksync-wallet-vue/compare/2.0.3...2.0.4)

> 11 February 2021

- Fast Withdrawal disactivated [`#37`](https://github.com/matter-labs/zksync-wallet-vue/pull/37)
- Hotfix: compare numbers instead of strings [`#36`](https://github.com/matter-labs/zksync-wallet-vue/pull/36)
- Update issue templates [`#35`](https://github.com/matter-labs/zksync-wallet-vue/pull/35)
- return normal withdrawal time indicator [`#34`](https://github.com/matter-labs/zksync-wallet-vue/pull/34)
- Dev [`#33`](https://github.com/matter-labs/zksync-wallet-vue/pull/33)
- Bump zksync.js version [`#32`](https://github.com/matter-labs/zksync-wallet-vue/pull/32)
- Modal dialog when transferring to a new account [`#31`](https://github.com/matter-labs/zksync-wallet-vue/pull/31)
- Disable Service Worker cache for .html files [`#30`](https://github.com/matter-labs/zksync-wallet-vue/pull/30)
- HTTP -&gt; WS provider [`#29`](https://github.com/matter-labs/zksync-wallet-vue/pull/29)
- Dev [`#28`](https://github.com/matter-labs/zksync-wallet-vue/pull/28)
- Add packing error [`#27`](https://github.com/matter-labs/zksync-wallet-vue/pull/27)
- Introduce `digitsError` and plans for future  refactoring [`#26`](https://github.com/matter-labs/zksync-wallet-vue/pull/26)
- Fix some bugs [`#25`](https://github.com/matter-labs/zksync-wallet-vue/pull/25)
- update: balance sorting & amount validation [`#24`](https://github.com/matter-labs/zksync-wallet-vue/pull/24)
- huge fix: custom text in onboard-js changeable, changed the way of handling big number across the dapp [`#23`](https://github.com/matter-labs/zksync-wallet-vue/pull/23)

#### [2.0.3](https://github.com/matter-labs/zksync-wallet-vue/compare/2.0.0-beta6...2.0.3)

> 6 January 2021

- Fixes made for the withdrawal, wallet connect dark mode and  minor changes [`#22`](https://github.com/matter-labs/zksync-wallet-vue/pull/22)
- Dev [`#21`](https://github.com/matter-labs/zksync-wallet-vue/pull/21)
- hotfix: footer fix for logged-in-state [`#20`](https://github.com/matter-labs/zksync-wallet-vue/pull/20)
- update: multiple updates [`#18`](https://github.com/matter-labs/zksync-wallet-vue/pull/18)
- Fix ERC-1271 logic [`#19`](https://github.com/matter-labs/zksync-wallet-vue/pull/19)
- production deploy fixed [`#17`](https://github.com/matter-labs/zksync-wallet-vue/pull/17)
- prod config [`#16`](https://github.com/matter-labs/zksync-wallet-vue/pull/16)
- no conditional branches [`#15`](https://github.com/matter-labs/zksync-wallet-vue/pull/15)
- CI fixes [`#14`](https://github.com/matter-labs/zksync-wallet-vue/pull/14)
- Versions updated in package.json [`#13`](https://github.com/matter-labs/zksync-wallet-vue/pull/13)
- Dev [`#12`](https://github.com/matter-labs/zksync-wallet-vue/pull/12)
- Potential fix async call refresh [`#11`](https://github.com/matter-labs/zksync-wallet-vue/pull/11)
- portis key added [`#10`](https://github.com/matter-labs/zksync-wallet-vue/pull/10)
- Dev [`#9`](https://github.com/matter-labs/zksync-wallet-vue/pull/9)
- release-candidate [`#8`](https://github.com/matter-labs/zksync-wallet-vue/pull/8)
- Dev [`#7`](https://github.com/matter-labs/zksync-wallet-vue/pull/7)
- Dev [`#6`](https://github.com/matter-labs/zksync-wallet-vue/pull/6)
- better check for master [`#5`](https://github.com/matter-labs/zksync-wallet-vue/pull/5)
- PR#2 [`#4`](https://github.com/matter-labs/zksync-wallet-vue/pull/4)
- Master [`#3`](https://github.com/matter-labs/zksync-wallet-vue/pull/3)
- PR for Alex as is [`#2`](https://github.com/matter-labs/zksync-wallet-vue/pull/2)
- Release of the v.2.0.0-beta6 [`#1`](https://github.com/matter-labs/zksync-wallet-vue/pull/1)

#### [2.0.0-beta6](https://github.com/matter-labs/zksync-wallet-vue/compare/2.0.0-beta1...2.0.0-beta6)

> 25 December 2020

- Release v.1.6.0-release [`#280`](https://github.com/matter-labs/zksync-wallet-vue/pull/280)
- Fixes for the reported issues [`#279`](https://github.com/matter-labs/zksync-wallet-vue/pull/279)
- Production release v.1.5.6 [`#277`](https://github.com/matter-labs/zksync-wallet-vue/pull/277)
- v.1.5.6 released [`#276`](https://github.com/matter-labs/zksync-wallet-vue/pull/276)
- Feature/keriat zkf 59 replicate same token restrictions for [`#274`](https://github.com/matter-labs/zksync-wallet-vue/pull/274)
- fix: package-lock.json build with node v14 [`#273`](https://github.com/matter-labs/zksync-wallet-vue/pull/273)
- Feature/keriat zkf 59 replicate same token restrictions for [`#271`](https://github.com/matter-labs/zksync-wallet-vue/pull/271)
- fix: config restored [`#270`](https://github.com/matter-labs/zksync-wallet-vue/pull/270)
- Feature/keriat zkf 59 replicate same token restrictions for [`#269`](https://github.com/matter-labs/zksync-wallet-vue/pull/269)
- update: huge release and refactoring [`#267`](https://github.com/matter-labs/zksync-wallet-vue/pull/267)
- Implemented support for the assets, restricted to use for the fee payments [`#264`](https://github.com/matter-labs/zksync-wallet-vue/pull/264)
- Release/1.5.4.1 [`#265`](https://github.com/matter-labs/zksync-wallet-vue/pull/265)
- Deploy v.1.5.3.2 to MainNet [`#261`](https://github.com/matter-labs/zksync-wallet-vue/pull/261)
- Deploy v.1.5.3.2 to Ropsten [`#260`](https://github.com/matter-labs/zksync-wallet-vue/pull/260)
- Deploy v.1.5.3.2 [`#259`](https://github.com/matter-labs/zksync-wallet-vue/pull/259)
- Hotfix/1.5.3.2 [`#257`](https://github.com/matter-labs/zksync-wallet-vue/pull/257)
- Mainnet [`#256`](https://github.com/matter-labs/zksync-wallet-vue/pull/256)
- Ropsten [`#255`](https://github.com/matter-labs/zksync-wallet-vue/pull/255)
- Rinkeby [`#254`](https://github.com/matter-labs/zksync-wallet-vue/pull/254)
- fix: fee exceed [`#230`](https://github.com/matter-labs/zksync-wallet-vue/pull/230)

#### [2.0.0-beta1](https://github.com/matter-labs/zksync-wallet-vue/compare/1.6.0...2.0.0-beta1)

> 24 December 2020

- * First VERY raw release of the zkWallet, well known as a dAPP of the zkSync. [`31934f6`](https://github.com/matter-labs/zksync-wallet-vue/commit/31934f60875af1f106bbbf6238788bbf7b427ebf)
- update: huge pack of updates (from 03.12) [`3f8bf0c`](https://github.com/matter-labs/zksync-wallet-vue/commit/3f8bf0cbeced31ad7a51b1bbf443b7e065617928)
- Update: massive update [`6cb6f2d`](https://github.com/matter-labs/zksync-wallet-vue/commit/6cb6f2d7d785c079e584a587454a914b94841d5f)

#### [1.6.0](https://github.com/matter-labs/zksync-wallet-vue/compare/1.5.4...1.6.0)

> 18 December 2020

- Production release v.1.5.6 [`#277`](https://github.com/matter-labs/zksync-wallet-vue/pull/277)
- Feature/keriat zkf 59 replicate same token restrictions for [`#274`](https://github.com/matter-labs/zksync-wallet-vue/pull/274)
- fix: package-lock.json build with node v14 [`#273`](https://github.com/matter-labs/zksync-wallet-vue/pull/273)
- Feature/keriat zkf 59 replicate same token restrictions for [`#271`](https://github.com/matter-labs/zksync-wallet-vue/pull/271)
- fix: config restored [`#270`](https://github.com/matter-labs/zksync-wallet-vue/pull/270)
- Feature/keriat zkf 59 replicate same token restrictions for [`#269`](https://github.com/matter-labs/zksync-wallet-vue/pull/269)
- update: huge release and refactoring [`#267`](https://github.com/matter-labs/zksync-wallet-vue/pull/267)
- Release/1.5.4.1 [`#265`](https://github.com/matter-labs/zksync-wallet-vue/pull/265)
- Deploy v.1.5.3.2 to MainNet [`#261`](https://github.com/matter-labs/zksync-wallet-vue/pull/261)
- Deploy v.1.5.3.2 to Ropsten [`#260`](https://github.com/matter-labs/zksync-wallet-vue/pull/260)
- Deploy v.1.5.3.2 [`#259`](https://github.com/matter-labs/zksync-wallet-vue/pull/259)
- Mainnet [`#256`](https://github.com/matter-labs/zksync-wallet-vue/pull/256)
- Ropsten [`#255`](https://github.com/matter-labs/zksync-wallet-vue/pull/255)
- Rinkeby [`#254`](https://github.com/matter-labs/zksync-wallet-vue/pull/254)
- fix: fee exceed [`#230`](https://github.com/matter-labs/zksync-wallet-vue/pull/230)

#### 1.5.4

> 7 December 2020

- Hotfix/1.5.3.2 [`#257`](https://github.com/matter-labs/zksync-wallet-vue/pull/257)
- update: event change to onClick [`#253`](https://github.com/matter-labs/zksync-wallet-vue/pull/253)
- fix: apply keriat's patch for external wallet [`#252`](https://github.com/matter-labs/zksync-wallet-vue/pull/252)
- fix: fee exceed [`#230`](https://github.com/matter-labs/zksync-wallet-vue/pull/230)
- fix: token transfer props [`#229`](https://github.com/matter-labs/zksync-wallet-vue/pull/229)
- fix: zeros, decimals exceed, wc unlink [`#228`](https://github.com/matter-labs/zksync-wallet-vue/pull/228)
- fix: exponential number [`#227`](https://github.com/matter-labs/zksync-wallet-vue/pull/227)
- fix: amount big value [`#226`](https://github.com/matter-labs/zksync-wallet-vue/pull/226)
- Fix amount big value bug [`#224`](https://github.com/matter-labs/zksync-wallet-vue/pull/224)
- fix: token transfer props [`#229`](https://github.com/matter-labs/zksync-wallet-vue/pull/229)
- fix: zeros, decimals exceed, wc unlink [`#228`](https://github.com/matter-labs/zksync-wallet-vue/pull/228)
- fix: exponential number [`#227`](https://github.com/matter-labs/zksync-wallet-vue/pull/227)
- fix: amount big value [`#226`](https://github.com/matter-labs/zksync-wallet-vue/pull/226)
- Fix amount big value bug [`#224`](https://github.com/matter-labs/zksync-wallet-vue/pull/224)
- fix: max amount value [`#221`](https://github.com/matter-labs/zksync-wallet-vue/pull/221)
- feat: disable portis, fortmatic, coinbase [`#219`](https://github.com/matter-labs/zksync-wallet-vue/pull/219)
- fix: clear amount props [`#218`](https://github.com/matter-labs/zksync-wallet-vue/pull/218)
- fix: merge bug [`#217`](https://github.com/matter-labs/zksync-wallet-vue/pull/217)
- WIP fix: state [`#201`](https://github.com/matter-labs/zksync-wallet-vue/pull/201)
- fix: single token autoselect [`#216`](https://github.com/matter-labs/zksync-wallet-vue/pull/216)
- fix: token is not supported [`#215`](https://github.com/matter-labs/zksync-wallet-vue/pull/215)
- fix: fixed condition [`#213`](https://github.com/matter-labs/zksync-wallet-vue/pull/213)
- fix: transaction token select [`#214`](https://github.com/matter-labs/zksync-wallet-vue/pull/214)
- fix: amount text fixed [`#208`](https://github.com/matter-labs/zksync-wallet-vue/pull/208)
- fix: multi login [`#204`](https://github.com/matter-labs/zksync-wallet-vue/pull/204)
- fix: portis createwallet crash [`#202`](https://github.com/matter-labs/zksync-wallet-vue/pull/202)
- fix: burner wallet unlock [`#200`](https://github.com/matter-labs/zksync-wallet-vue/pull/200)
- Fix props bug [`#198`](https://github.com/matter-labs/zksync-wallet-vue/pull/198)
- feat: token store to extended store [`#184`](https://github.com/matter-labs/zksync-wallet-vue/pull/184)
- fix: address width fixed [`#197`](https://github.com/matter-labs/zksync-wallet-vue/pull/197)
- fix: portis login [`#196`](https://github.com/matter-labs/zksync-wallet-vue/pull/196)
- fix: wallets icons added [`#194`](https://github.com/matter-labs/zksync-wallet-vue/pull/194)
- Wallet fix 17 10 [`#195`](https://github.com/matter-labs/zksync-wallet-vue/pull/195)
- fix: links hover fix [`#191`](https://github.com/matter-labs/zksync-wallet-vue/pull/191)
- fix: names truncated [`#190`](https://github.com/matter-labs/zksync-wallet-vue/pull/190)
- fix: revive package-lock [`#188`](https://github.com/matter-labs/zksync-wallet-vue/pull/188)
- fix: transactions list fixed [`#172`](https://github.com/matter-labs/zksync-wallet-vue/pull/172)
- fix: pay transfer in another token [`#187`](https://github.com/matter-labs/zksync-wallet-vue/pull/187)
- fix: withdraw checkbox to radio [`#186`](https://github.com/matter-labs/zksync-wallet-vue/pull/186)
- fix: long name truncated [`#178`](https://github.com/matter-labs/zksync-wallet-vue/pull/178)
- fix: padding added to edit button [`#179`](https://github.com/matter-labs/zksync-wallet-vue/pull/179)
- #144 External wallet modal size scroll overlap [`#166`](https://github.com/matter-labs/zksync-wallet-vue/pull/166)
- fix: dark icons color fixed [`#177`](https://github.com/matter-labs/zksync-wallet-vue/pull/177)
- #146 fix: spinner wrapper added [`#176`](https://github.com/matter-labs/zksync-wallet-vue/pull/176)
- fix: onclick replaced to button [`#182`](https://github.com/matter-labs/zksync-wallet-vue/pull/182)
- fix: height fixed [`#181`](https://github.com/matter-labs/zksync-wallet-vue/pull/181)
- fix: line-height added to submit-button [`#180`](https://github.com/matter-labs/zksync-wallet-vue/pull/180)
- fix: saved wallet [`#185`](https://github.com/matter-labs/zksync-wallet-vue/pull/185)
- fix: fortmatic, portis, coinbase [`#183`](https://github.com/matter-labs/zksync-wallet-vue/pull/183)
- #149 fix: 'enter' keyup event added [`#167`](https://github.com/matter-labs/zksync-wallet-vue/pull/167)
- fix: bigint uncorrect transformation [`#171`](https://github.com/matter-labs/zksync-wallet-vue/pull/171)
- fix: walletconnect unlink, address cut [`#170`](https://github.com/matter-labs/zksync-wallet-vue/pull/170)
- #121 fix: links color fixed [`#165`](https://github.com/matter-labs/zksync-wallet-vue/pull/165)
- fix: blink, changeacc bugs [`#150`](https://github.com/matter-labs/zksync-wallet-vue/pull/150)
- Fix logout changeacc [`#157`](https://github.com/matter-labs/zksync-wallet-vue/pull/157)
- fix: notification margins [`#135`](https://github.com/matter-labs/zksync-wallet-vue/pull/135)
- fix: notification margins [`#113`](https://github.com/matter-labs/zksync-wallet-vue/pull/113)
- feat: update zksync up to 0.7.4 [`#140`](https://github.com/matter-labs/zksync-wallet-vue/pull/140)
- fix: select token overlap fixed [`#136`](https://github.com/matter-labs/zksync-wallet-vue/pull/136)
- feat: return new unlock [`#139`](https://github.com/matter-labs/zksync-wallet-vue/pull/139)
- Tx refactoring 2 [`#137`](https://github.com/matter-labs/zksync-wallet-vue/pull/137)
- feat: update zksync to 0.7.3 [`#131`](https://github.com/matter-labs/zksync-wallet-vue/pull/131)
- feat: refactoring of tx page [`#130`](https://github.com/matter-labs/zksync-wallet-vue/pull/130)
- Fix exponential [`#126`](https://github.com/matter-labs/zksync-wallet-vue/pull/126)
- fix: clear symbolname on back route [`#123`](https://github.com/matter-labs/zksync-wallet-vue/pull/123)
- fix: overlow [`#122`](https://github.com/matter-labs/zksync-wallet-vue/pull/122)
- changePubKey [`#90`](https://github.com/matter-labs/zksync-wallet-vue/pull/90)
- fix: verification method [`#114`](https://github.com/matter-labs/zksync-wallet-vue/pull/114)
- fix: infura bumplimit [`#109`](https://github.com/matter-labs/zksync-wallet-vue/pull/109)
- fix: exponential numbers appearence [`#104`](https://github.com/matter-labs/zksync-wallet-vue/pull/104)
- fix: reduse gas request [`#98`](https://github.com/matter-labs/zksync-wallet-vue/pull/98)
- fix: setsigningkey args [`#95`](https://github.com/matter-labs/zksync-wallet-vue/pull/95)
- feat: update zksync up to 0.7.2 [`#93`](https://github.com/matter-labs/zksync-wallet-vue/pull/93)
- fix: condition error height [`#85`](https://github.com/matter-labs/zksync-wallet-vue/pull/85)
- fix: copyblock clickable [`#84`](https://github.com/matter-labs/zksync-wallet-vue/pull/84)
- fix: fonts, copy hints, typos [`#83`](https://github.com/matter-labs/zksync-wallet-vue/pull/83)
- fix: styles [`#81`](https://github.com/matter-labs/zksync-wallet-vue/pull/81)
- fix: styles [`#78`](https://github.com/matter-labs/zksync-wallet-vue/pull/78)
- Store refactoring [`#76`](https://github.com/matter-labs/zksync-wallet-vue/pull/76)
- feat: stage to rinkeby [`#75`](https://github.com/matter-labs/zksync-wallet-vue/pull/75)
- fix: disable access modal on external wallet [`#74`](https://github.com/matter-labs/zksync-wallet-vue/pull/74)
- External fixes [`#73`](https://github.com/matter-labs/zksync-wallet-vue/pull/73)
- fix: fee on amount change [`#72`](https://github.com/matter-labs/zksync-wallet-vue/pull/72)
- Wallets autologin [`#46`](https://github.com/matter-labs/zksync-wallet-vue/pull/46)
- Coinbase turn on [`#37`](https://github.com/matter-labs/zksync-wallet-vue/pull/37)
- fix: prices [`#71`](https://github.com/matter-labs/zksync-wallet-vue/pull/71)
- WIP feat: fast withdraw [`#52`](https://github.com/matter-labs/zksync-wallet-vue/pull/52)
- fix: load eth balances only on balances list opened [`#70`](https://github.com/matter-labs/zksync-wallet-vue/pull/70)
- fix: address validation [`#68`](https://github.com/matter-labs/zksync-wallet-vue/pull/68)
- fix: styles [`#66`](https://github.com/matter-labs/zksync-wallet-vue/pull/66)
- fix: styles [`#65`](https://github.com/matter-labs/zksync-wallet-vue/pull/65)
- External wallet styles [`#64`](https://github.com/matter-labs/zksync-wallet-vue/pull/64)
- External wallet [`#63`](https://github.com/matter-labs/zksync-wallet-vue/pull/63)
- fix: coinbase interrupt [`#59`](https://github.com/matter-labs/zksync-wallet-vue/pull/59)
- fix: temporarly disable coinbase [`#55`](https://github.com/matter-labs/zksync-wallet-vue/pull/55)
- feat: add GA [`#54`](https://github.com/matter-labs/zksync-wallet-vue/pull/54)
- fix: account unlock for erc1271 wallets [`#51`](https://github.com/matter-labs/zksync-wallet-vue/pull/51)
- Coinbase turn on [`#37`](https://github.com/matter-labs/zksync-wallet-vue/pull/37)
- Coinbase turn on [`#37`](https://github.com/matter-labs/zksync-wallet-vue/pull/37)
- feat: temp disable portis fortmatic [`#39`](https://github.com/matter-labs/zksync-wallet-vue/pull/39)
- feat: change max withdrawal time up to 3 hrs [`#38`](https://github.com/matter-labs/zksync-wallet-vue/pull/38)
- Portis, Fortmatic [`#36`](https://github.com/matter-labs/zksync-wallet-vue/pull/36)
- fix: update token price on select [`#35`](https://github.com/matter-labs/zksync-wallet-vue/pull/35)
- feat: disable mltt on mainnet [`#31`](https://github.com/matter-labs/zksync-wallet-vue/pull/31)
- fix: check for undefined [`#26`](https://github.com/matter-labs/zksync-wallet-vue/pull/26)
- fix: ethereum for outdated metamask [`#21`](https://github.com/matter-labs/zksync-wallet-vue/pull/21)
- feat: token price from zk [`#20`](https://github.com/matter-labs/zksync-wallet-vue/pull/20)
- fix: ropsten urls [`#19`](https://github.com/matter-labs/zksync-wallet-vue/pull/19)
- Swap the content of the environment settings [`#15`](https://github.com/matter-labs/zksync-wallet-vue/pull/15)
- Use correct short commit hash [`#10`](https://github.com/matter-labs/zksync-wallet-vue/pull/10)
- fix: attempt to unlock before acc init [`#11`](https://github.com/matter-labs/zksync-wallet-vue/pull/11)
- Add the intermediate stage for manual deployment [`#13`](https://github.com/matter-labs/zksync-wallet-vue/pull/13)
- Incorporate changes from the stage to the master branch [`#12`](https://github.com/matter-labs/zksync-wallet-vue/pull/12)
- fix: transactions list fixed (#172) [`#145`](https://github.com/matter-labs/zksync-wallet-vue/issues/145)
- fix: padding added to edit button (#179) [`#153`](https://github.com/matter-labs/zksync-wallet-vue/issues/153)
- fix: height fixed (#181) [`#156`](https://github.com/matter-labs/zksync-wallet-vue/issues/156)
- fix: line-height added to submit-button (#180) [`#154`](https://github.com/matter-labs/zksync-wallet-vue/issues/154)
