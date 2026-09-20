# DeHatch

DeHatch is a milestone-based crowdfunding platform for student projects, built on the Stellar network.

Investors fund a project with USDC. The money is locked in a Soroban smart contract and is released to the team one milestone at a time, so a project can only spend what it has earned. Users can also buy USDC with Turkish Lira (TRY) and cash out back to TRY through a Stellar anchor.

Everything in this repository runs on the **Stellar testnet**. No real money is used.

## The problem

Student and early-stage teams struggle to raise money, and investors are afraid of losing it. In a normal crowdfunding campaign the team receives all the funds at once. If the team stops working, the investors have no protection.

## Our solution

1. **Milestone funding.** The smart contract holds all the money. The platform admin releases a payment only when the previous milestone is finished and enough funds have been collected for the next one.
2. **Transparent by design.** Funding status, milestones and contributions are stored on-chain and can be read by anyone.
3. **Local currency access.** A Stellar anchor (SEP-10 and SEP-6) lets users move between TRY and USDC inside the app.

## What is implemented

| Area | What it does |
| --- | --- |
| Soroban contract | Multi-project crowdfunding escrow with ordered milestone releases. Deployed to testnet with 15 projects registered. |
| Wallet | Freighter connection and transaction signing. If Freighter is not on Testnet, the app still connects but shows a warning and blocks transactions. Clear messages are shown when Freighter is missing, locked, or does not answer. |
| Investing | A user signs one Soroban transaction and the USDC moves into the project escrow. The interface shows the live on-chain total. |
| Anchor | SEP-1 discovery, SEP-10 wallet login, SEP-6 deposit and withdrawal against a TRY/USDC test anchor. |
| Project application | A three-step form with strict validation (Zod and react-hook-form). Submitted applications are saved in the browser and shown on the history page. |
| Interface | Landing page, project list, project detail page, application form, and application history page. The whole interface, including form validation messages and project descriptions, is available in English and Turkish. Use the EN / TR switch in the navigation bar. The app opens in the browser language and remembers your choice. |

## How it works

```
                +-----------------------+
                |   Next.js web app     |
                |  (React, TypeScript)  |
                +-----------+-----------+
                            |
        +-------------------+--------------------+
        |                   |                    |
  Freighter wallet    Soroban RPC          TR Mock Anchor
  (sign transactions) (crowdfund contract) (SEP-1 / 10 / 6)
                            |                    |
                            +---- Stellar testnet (USDC) ----+
```

**User journey**

1. The user connects Freighter.
2. If the user has no USDC, they open the anchor window, log in with SEP-10, and start a TRY deposit (SEP-6). After the simulated bank transfer, the anchor sends real testnet USDC to the wallet.
3. The user chooses a project and invests. Freighter asks for one signature, and the contract pulls the USDC into escrow.
4. When a milestone is complete, the admin releases its share to the project owner. The contract enforces the order and the funding rule.
5. Withdrawal works in the other direction: the user sends USDC to the anchor with a memo and receives TRY.

## Smart contract

Location: `contracts/crowdfund/src/lib.rs`

| Function | Who can call it | Purpose |
| --- | --- | --- |
| `initialize(admin, token)` | Once | Sets the platform admin and the USDC token. |
| `create_project(id, owner, milestone_amounts)` | Admin | Registers a project. The sum of the milestone amounts is the funding goal. |
| `invest(project, investor, amount)` | Investor (signs) | Moves USDC into escrow. Rejects zero amounts and amounts above the goal. |
| `release_milestone(project, index)` | Admin | Pays one milestone to the owner. It must be the next unreleased milestone, and the total funding must cover it. |
| `get_status`, `get_milestones`, `get_contribution` | Anyone | Read-only status for the interface. |

The contract has 6 unit tests that cover investing, repeat investors, ordered releases, unfunded releases, invalid input, and double initialization.

### Testnet deployment

| Item | Value |
| --- | --- |
| Crowdfund contract | [`CANWMWKEIXKIJI4UZSYA7KE247V6CHHG4ZLIIA35KCTTTOWZKXDGVRDS`](https://stellar.expert/explorer/testnet/contract/CANWMWKEIXKIJI4UZSYA7KE247V6CHHG4ZLIIA35KCTTTOWZKXDGVRDS) |
| USDC token contract | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` (issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`) |
| Admin account | `GBLQ3S4N2P5JI3UWVTPQDHBX2QALWRXC3VUDI25JCAL4HKANBMHV76LV` |
| Example investment | [transaction `c34aead7...72b1`](https://stellar.expert/explorer/testnet/tx/c34aead7edaae7b6cb731453061cb24dbb3ff63b5318dc2a2919e5edafdd72b1) |

The example investment was made during testing. The USDC came from the anchor deposit flow, and the contract recorded the contribution.

## Anchor integration

The app uses the public **TR Mock Anchor** (`tr-mock-anchor.fly.dev`), a testnet sandbox that mimics a Turkish TRY/USDC ramp.

| Standard | Use in DeHatch |
| --- | --- |
| SEP-1 | Reads `stellar.toml` to find the endpoints and the USDC issuer. |
| SEP-10 | Wallet login. The app checks the challenge transaction before Freighter signs it. |
| SEP-6 | Deposit (TRY to USDC), withdrawal (USDC to TRY), and status tracking. |

Note: this anchor does not offer SEP-24, so the integration uses SEP-6. Code: `src/lib/anchor/` and `src/components/anchor/AnchorModal.tsx`.

## Run it locally

**Requirements**

- Node.js 20 or newer
- The [Freighter](https://www.freighter.app/) browser extension, set to **Testnet**
- A testnet account funded through `https://friendbot.stellar.org/?addr=YOUR_ADDRESS`

**Start the app**

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app already points to the deployed testnet contract, so no extra setup is needed. To use your own deployment, copy `.env.example` to `.env.local` and change the values.

On Windows PowerShell, if `npm` is blocked by the execution policy, run this once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**Build the contract (optional)**

Requires Rust, the `wasm32v1-none` target, and the Stellar CLI.

```bash
cd contracts
stellar contract build
cargo test
```

## Suggested demo for reviewers

1. Open the landing page, choose EN or TR in the navigation bar, and click **Connect Wallet** to connect Freighter (testnet).
2. Open any project, click **Support with USDC**, and check that the on-chain total is shown.
3. If the wallet has no USDC, click **Get USDC with TRY**. Enter a TRY amount, sign the login, and follow the link to the sandbox bank page to simulate the transfer. USDC arrives in the wallet after a short delay.
4. Enter an amount and confirm. Sign the transaction in Freighter, then open the transaction link to see it on the explorer.
5. Open **Apply with a Project** and try to move forward with empty or invalid data. Then complete the form and submit it. The result appears under **Application History** (link in the footer).

## Application form rules

The form blocks progress until the current step is valid. Key rules:

- Names accept letters and spaces only. Phone numbers accept digits and `+`. Stellar addresses must start with `G` and have 56 characters.
- University, department, project name, and tagline have minimum lengths. The project description and "how it works" text need at least 100 characters.
- The goal must be greater than 100 USDC. Every milestone needs a title, amount, description, and a future date.
- The milestone amounts must add up exactly to the total goal. Amounts are compared as exact integers, so rounding errors cannot occur.

Code: `src/lib/launchSchema.ts` and `src/app/launch/page.tsx`.

## Project structure

```
contracts/crowdfund/     Soroban smart contract and tests (Rust)
contracts/register-projects.mjs   Registers the sample projects on-chain
src/app/                 Pages: landing, projects, launch form, application history
src/lib/i18n/            English and Turkish text, language switch, translated project content
src/components/          Navbar, project cards, invest window, anchor window
src/lib/soroban.ts       Contract reads and the invest transaction
src/lib/wallet.tsx       Shared Freighter wallet state
src/lib/anchor/          SEP-1, SEP-10, SEP-6 client and Horizon helpers
src/lib/launchSchema.ts  Application form validation rules
src/lib/applicationStore.ts   Browser storage for submitted applications
```

## Technology

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, react-hook-form, Zod, Freighter API, Stellar SDK 17, Soroban SDK 28 (Rust).

## Current limitations

We prefer to be clear about what is not finished.

- **Testnet only.** The contract has not been audited and must not be used with real funds.
- **Admin-controlled releases.** Milestone releases are done by the platform admin through the Stellar CLI. There is no admin screen yet, and no voting or evidence review.
- **Demo project owner.** All sample projects use the admin account as the owner. Real owners would be set at registration.
- **Sample project data.** Project descriptions, teams, and the funding numbers on the cards come from sample data. Only the numbers inside the invest window are read from the contract.
- **Local application storage.** Submitted applications stay in the browser of the person who sent them. A backend is needed before the team can review them.
- **Sandbox anchor.** The bank transfer and KYC are simulated, and the anchor may be slow to pay out.

## Roadmap

- An admin screen for milestone review and release
- Investor voting on milestones
- A backend and database for applications
- Refunds when a milestone is missed
- A contract audit and a mainnet launch with a licensed anchor
