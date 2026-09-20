# DeHatch

**DeHatch is a crowdfunding website for student projects where the money is released in stages, not all at once.**

People who support a project (investors) pay in USDC, a digital dollar. The money does not go to the team. It is locked in a smart contract on the Stellar blockchain. The team receives it in parts, one milestone at a time. If a team stops working, the money that was not yet released stays protected.

Everything in this repository runs on the **Stellar testnet**, a practice network. No real money is used.

## Contents

1. [The idea in a simple example](#the-idea-in-a-simple-example)
2. [Key words explained](#key-words-explained)
3. [What you can do in the app](#what-you-can-do-in-the-app)
4. [How the money moves, step by step](#how-the-money-moves-step-by-step)
5. [Try it yourself in 10 minutes](#try-it-yourself-in-10-minutes)
6. [If something does not work](#if-something-does-not-work)
7. [What is real and what is sample data](#what-is-real-and-what-is-sample-data)
8. [Technical details](#technical-details)
9. [Project structure](#project-structure)
10. [Roadmap](#roadmap)

## The idea in a simple example

The problem: in normal crowdfunding, the team gets all the money on day one. Investors have to trust that the team will finish the work. Many teams do not, and the investors lose their money.

Our solution, with real numbers from the app. The project **AgroChain AI** wants to raise **50,000 USDC** and has three milestones:

| Stage | Goal of the stage | Money for this stage |
| --- | --- | --- |
| 1 | Build the first version (MVP) | 15,000 USDC |
| 2 | Launch a beta with 100 farmers | 10,000 USDC |
| 3 | Scale to 1,000 farmers | 25,000 USDC |

1. Investors put money into the contract. The money stays inside the contract.
2. When stage 1 is finished, the platform admin releases **15,000 USDC** to the team. Only that amount.
3. The team must finish stage 1 before stage 2 can be paid. The contract enforces this order. Nobody can skip a stage.
4. The rest of the money stays locked until the next stage is approved.

So a team can only spend what it has earned by delivering work.

## Key words explained

| Word | Simple meaning |
| --- | --- |
| **Stellar** | The blockchain (a public, shared record book) that DeHatch runs on. |
| **Testnet** | A practice version of Stellar. The coins have no real value. |
| **USDC** | A digital coin that is always worth about one US dollar. It is the money used in DeHatch. |
| **Smart contract** | A small program on the blockchain that holds money and follows fixed rules. Nobody can change the rules after it is published. |
| **Soroban** | The name of Stellar's smart contract system. Our contract is written for it. |
| **Escrow** | Money held by a neutral third party until conditions are met. Our smart contract is the escrow. |
| **Milestone** | One stage of a project, for example "first version ready". Each milestone has its own part of the money. |
| **Freighter** | A browser extension that works like a digital wallet. It holds your Stellar account and asks you to approve every payment. |
| **Anchor** | A company that connects normal money with the blockchain. Here it lets you swap Turkish Lira (TRY) for USDC and back. Our anchor is a test version. |
| **SEP-10, SEP-6** | Standard rules for anchors. SEP-10 is a login by proving you own your wallet (no password). SEP-6 is the standard way to deposit and withdraw money. |
| **Friendbot** | A free service that gives new testnet accounts some test coins. |

## What you can do in the app

The interface is available in **English and Turkish**. Use the **EN / TR** switch in the middle of the top bar. The app opens in your browser language and remembers your choice.

| Screen | What it does |
| --- | --- |
| Home | Shows featured projects and explains why DeHatch is safer. |
| Explore Projects | A list of all projects with search, filters and sorting. |
| Project page | Shows the team, the stages, the story of the project and a button to invest. |
| Sign in / Sign up | The round person icon at the top right opens a window to create an account or sign in. You need an account to apply with a project or to invest. |
| Connect Wallet | Connects your Freighter wallet. It also shows a warning if Freighter is on the wrong network. |
| Invest window | Lets you invest USDC. It shows how much the contract has really collected. |
| Add / Withdraw Funds (TRY) | Lets you buy USDC with TRY, or cash USDC out to TRY, through the anchor. |
| Apply with a Project | A three-step form where students can apply with their own project. |
| Application History | Lists the applications that you sent with your account. |

## How the money moves, step by step

There are four flows. For each one, you see what you do and what happens behind the scenes.

### 1. Get USDC with Turkish Lira

| You do | What happens behind the scenes |
| --- | --- |
| Open the wallet menu and choose the deposit tab. Enter an amount in TRY. | The app logs you in to the anchor (SEP-10). Freighter asks you to sign a login message. This is free and does not move money. |
| If needed, approve "add USDC to my account". | Your Stellar account must agree to hold USDC first. This is called a trustline. |
| You see bank details and a reference code. Click the link to the sandbox bank and press the button. | This test bank pretends that your TRY transfer arrived. In real life you would send a bank transfer. |
| Wait a short time. | The anchor sends real testnet USDC to your wallet. The window shows the status until it says "Completed". |

### 2. Invest in a project

| You do | What happens behind the scenes |
| --- | --- |
| Sign in (or sign up) first. Then open a project, click **Support with USDC**, choose an amount, continue. If you are not signed in, the sign-in window opens and the invest window continues right after you sign in. | The app checks your balance and how much of the goal is still open. You cannot invest more than the goal. |
| Freighter opens. Approve the payment. | One transaction is sent. The smart contract moves your USDC from your wallet into escrow and records your contribution. |
| You see a link to the transaction. | Anyone can open this link on the public explorer and check it. |

### 3. Release a milestone (done by the admin)

The platform admin calls the contract to pay one stage to the project team. The contract only allows it when:

- the previous stage was already paid, and
- enough money has been collected to cover this stage.

If one of these is not true, the contract refuses. There is no admin screen yet. The admin uses a command line tool (see [Current limits](#what-is-real-and-what-is-sample-data)).

### 4. Cash out to Turkish Lira

| You do | What happens behind the scenes |
| --- | --- |
| Choose the withdraw tab and enter an amount in USDC. | The app logs you in and asks the anchor for a withdrawal. The anchor answers with its account and a memo (a reference number). |
| Approve the payment in Freighter. | You send USDC to the anchor with that memo. The anchor sees it and pays TRY to your bank account (simulated in this test version). |

## Try it yourself in 10 minutes

### What you need

- Node.js version 20 or newer
- The [Freighter](https://www.freighter.app/) browser extension
- A test account with test coins (steps below)

### Step 1: Set up Freighter

1. Install Freighter and create a wallet.
2. Open Freighter settings and switch the network to **Testnet**. Freighter often starts on Mainnet, which is the real network.
3. Copy your address. It starts with the letter G.
4. Open `https://friendbot.stellar.org/?addr=YOUR_ADDRESS` in a browser, with your own address at the end. Your account now has test coins.

### Step 2: Start the app

```bash
npm install
npm run dev
```

Open http://localhost:3000. You do not need any other setup. The app already points to our deployed test contract.

On Windows, if PowerShell says that running scripts is disabled, run this once and open a new terminal:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Step 3: Walk through the app

| Step | What to do | What you should see |
| --- | --- | --- |
| 1 | Click the round person icon at the top right, choose **Sign Up**, and create an account. | The window closes and the icon turns yellow. You are signed in. |
| 2 | Click **Connect Wallet** and approve in Freighter. | Your address appears at the top right. |
| 3 | Open a project, for example AgroChain AI, and click **Support with USDC**. | A window with your balance and the amount collected on-chain. |
| 4 | If you have no USDC, click **Get USDC with TRY**. Enter a TRY amount, sign the login, then use the link to the sandbox bank. | After a short wait, USDC appears in your balance. |
| 5 | Choose an amount and confirm. Approve in Freighter. | A success message with a transaction link. The on-chain total goes up. |
| 6 | On the home page click **Apply with a Project**. Try to press Next with empty or wrong data. | The Next button stays disabled and red messages explain what to fix. |
| 7 | Fill in the form correctly and submit. | A success page with an application number. Open **Application History** from the footer or from the account menu to see it. |

Tip: if you are signed out, the application form and the invest window are locked and ask you to sign in first.

### Optional: build and test the contract

You need Rust, the `wasm32v1-none` target and the Stellar CLI.

```bash
cd contracts
stellar contract build
cargo test
```

## If something does not work

| Problem | Reason and fix |
| --- | --- |
| The wallet does not connect and a message says Freighter was not found | Freighter is not installed or is disabled for this site. Install it, then reload the page. |
| A "Wrong network" badge appears | Freighter is on Mainnet. Switch it to **Testnet** in Freighter and return to the tab. |
| Nothing happens after clicking **Connect Wallet** | Click the Freighter icon in the toolbar and unlock it. Check that pop-ups are not blocked. After 90 seconds the app shows a message and lets you try again. |
| "Account not found on testnet" | Your account has no test coins yet. Use the Friendbot link from Step 1. |
| The invest button is disabled | You have no USDC, the amount is above your balance, or the amount is above what is left of the goal. |
| USDC does not arrive after the sandbox bank step | The test anchor can be slow. Wait a few minutes. The window keeps checking the status. |
| The application form or the invest window asks me to sign in | This is intended. Click the round person icon and sign in or create an account. |
| I forgot my password | There is no password reset in this demo. Create a new account with another email, or clear the site data in your browser. |
| `npm` is blocked on Windows | Run the PowerShell command from Step 2. |

## What is real and what is sample data

We want to be clear about this.

**Real (works on the testnet):**

- The smart contract, its rules and its 15 registered projects
- Freighter connection and signing
- Investing USDC into the contract and reading the collected amount
- The anchor login, deposit and withdrawal (with a test anchor)
- The application form and its validation
- Sign up and sign in screens, and the rule that applying and investing need an account

**Sample or limited:**

- **Project cards and pages** use sample text, teams and funding numbers. Only the numbers inside the invest window come from the contract.
- **"My investments"** in the wallet menu is a sample list, not your real history.
- **Milestone release** is done by the admin with a command line tool, for example `stellar contract invoke --id <contract> --source admin --network testnet -- release_milestone --project agrochain-ai --index 0`. The admin key exists only on the developer's computer. There is no admin screen, voting or proof review yet.
- **Project owner**: all sample projects use the admin account as the owner.
- **Accounts are demo accounts.** They are stored only in the browser where you created them. Passwords are saved as salted hashes (PBKDF2), never as plain text, but there is no server, no email check, no password reset and no limit on wrong attempts. This is a gate for the demo, not real security. A backend is needed for real accounts. Your wallet is still your real identity on the blockchain.
- **Applications** are saved only in the browser that sent them and are linked to the account that sent them. A backend is needed before a team can review them.
- **The anchor is a sandbox.** Bank transfer and identity checks are simulated.
- **Not audited.** The contract must not be used with real money.

## Technical details

### Smart contract

Location: `contracts/crowdfund/src/lib.rs`. One deployed contract holds many projects, each one identified by its name in the URL (the "slug").

| Function | Who can call it | What it does |
| --- | --- | --- |
| `initialize(admin, token)` | Once | Sets the admin and the USDC token. |
| `create_project(id, owner, milestone_amounts)` | Admin | Adds a project. The sum of the milestone amounts is the goal. |
| `invest(project, investor, amount)` | Investor (signs) | Moves USDC into escrow. Refuses zero amounts and amounts above the goal. |
| `release_milestone(project, index)` | Admin | Pays one milestone to the owner, in order, only if enough money is collected. |
| `get_status`, `get_milestones`, `get_contribution` | Anyone | Reads information for the interface. |

The contract has 6 unit tests. They cover investing, repeat investors, ordered releases, unfunded releases, invalid input and double setup.

### Testnet deployment

| Item | Value |
| --- | --- |
| Crowdfund contract | [`CANWMWKEIXKIJI4UZSYA7KE247V6CHHG4ZLIIA35KCTTTOWZKXDGVRDS`](https://stellar.expert/explorer/testnet/contract/CANWMWKEIXKIJI4UZSYA7KE247V6CHHG4ZLIIA35KCTTTOWZKXDGVRDS) |
| USDC token contract | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` (issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`) |
| Admin account | `GBLQ3S4N2P5JI3UWVTPQDHBX2QALWRXC3VUDI25JCAL4HKANBMHV76LV` |
| Example investment | [transaction `c34aead7...72b1`](https://stellar.expert/explorer/testnet/tx/c34aead7edaae7b6cb731453061cb24dbb3ff63b5318dc2a2919e5edafdd72b1) |

The example investment was made during testing. The USDC came from the anchor deposit flow, and the contract recorded the contribution. To use your own deployment, copy `.env.example` to `.env.local` and change the values.

### Anchor

The app uses the public test anchor **TR Mock Anchor** (`tr-mock-anchor.fly.dev`). It offers three standards that we use:

| Standard | What it is used for |
| --- | --- |
| SEP-1 | The anchor's public information page. The app reads it to find the anchor's addresses. |
| SEP-10 | Login by proving you own your wallet. The app checks the login message before Freighter signs it. |
| SEP-6 | Deposit (TRY to USDC), withdrawal (USDC to TRY) and status tracking. |

This anchor does not offer SEP-24, the other common standard with a hosted web page, so we use SEP-6. Code: `src/lib/anchor/` and `src/components/anchor/AnchorModal.tsx`.

### Application form rules

The form blocks the Next button until the current step is valid.

- **Names** accept letters and spaces only. **Phone** accepts digits and `+`. A **Stellar address** must start with `G` and have 56 characters.
- **University, department, project name and tagline** have minimum lengths. The **description** and **how it works** texts need at least 100 characters.
- The **goal** must be more than 100 USDC. Every milestone needs a title, an amount, a description and a date in the future.
- The **milestone amounts must add up exactly to the goal.** Amounts are compared as exact numbers, so rounding errors cannot happen.

Code: `src/lib/launchSchema.ts` and `src/app/launch/page.tsx`.

### Technology

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, react-hook-form, Zod, Freighter API, Stellar SDK 17 and Soroban SDK 28 (Rust).

## Project structure

```
contracts/crowdfund/            The smart contract and its tests (Rust)
contracts/register-projects.mjs Adds the sample projects to the contract
src/app/                        Pages: home, projects, application form, application history
src/components/                 Top bar, project cards, invest window, anchor window
src/lib/soroban.ts              Reads the contract and sends the invest transaction
src/lib/wallet.tsx              Freighter connection, network check, signing
src/lib/anchor/                 Anchor login, deposit and withdrawal
src/lib/launchSchema.ts         Application form rules
src/lib/applicationStore.ts     Saves sent applications in the browser
src/lib/auth.tsx, authStore.ts  Sign up, sign in, sign out (demo accounts in the browser)
src/lib/authSchema.ts           Rules for the sign-up and sign-in forms
src/components/auth/            Sign-in window, account menu, and the lock shown to signed-out users
src/lib/i18n/                   English and Turkish texts and translated project content
```

## Roadmap

- An admin screen to review and release milestones
- Investor voting on milestones
- A backend and a database for applications
- Refunds when a milestone is missed
- A security audit, then a launch on the real network with a licensed anchor
