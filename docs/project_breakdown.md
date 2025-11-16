# Descrow* - (trustless escrow + transparent state on Polkadot),  **accepts both DOT (on-chain) and M-Pesa (fiat)**.


1. Two clear payment flows (DOT-first — fully on-chain; M-Pesa-first — hybrid with on-chain state & off-chain fiat custody).
2. A compact architecture diagram (Mermaid).
3. Concrete ink! contract API (storage, enums, functions, events).
4. Backend & integration responsibilities (M-Pesa, Polkadot RPC).
5. Frontend UX/flows (buyer/seller/admin).
6. Database models, endpoints, and sequencing for both payment flows.
7. A 3–5 day hackathon plan with per-role tasks and testing checklist.
8. Tradeoffs & next steps.


# Executive summary (1 sentence)

Implement a single ink! escrow contract that handles DOT payments natively, while supporting a hybrid M-Pesa flow where the platform acts as fiat custodian but all order state and evidence hashes are recorded on-chain for transparency and dispute resolution.

---

# Two supported payment modes (MUST explain tradeoffs)

**Mode A — DOT (native on-chain, preferred for decentralization)**

* Buyer pays DOT directly to `DescrowContract`’s escrow account.
* Contract holds tokens and releases DOT to seller on `confirm_delivery` or `resolve_dispute`.
* Fully trustless and auditable on-chain.

**Mode B — M-Pesa (hybrid / hackathon practical)**

* Buyer pays via M-Pesa to the platform’s merchant/paybill (platform is custodian of fiat).
* Platform (backend) upon successful payment calls the contract `record_fiat_payment(order_id, meta_hash)` OR simply emits `OrderFundedOffchain` state on-chain (contract doesn’t hold fiat).
* When buyer confirms delivery, backend issues M-Pesa B2C payout to seller (off-chain).
* On-chain still stores product proof hashes, timestamps and dispute evidence for full transparency.
* Tradeoff: **platform custody** for fiat (centralized), but this is acceptable for MVP demo value and quick integration. Plan future tokenization or a trusted custodian integration for full decentralization.

---

# High-level architecture (Mermaid)

```mermaid
flowchart TD
  subgraph FE[Frontend - React]
    A[Buyer UI]
    B[Seller UI]
    C[Admin UI]
  end

  subgraph BACK[Backend - Node/TS]
    X[API]
    Y[M-Pesa Service]
    Z[Polkadot.js Client / Oracle]
    DB[(Postgres/Mongo)]
    IPFS[IPFS/FileStore]
  end

  subgraph CHAIN[Polkadot ink! Contract]
    SC[DescrowContract]
  end

  A -->|browse/list| BACK
  B -->|list product (IPFS CID)| BACK
  A -->|checkout (DOT)| Z
  A -->|checkout (M-Pesa)| Y
  Y -->|callback| BACK
  BACK -->|call| Z
  Z -->|tx/events| SC
  SC -->|events| Z
  Z -->|notify| BACK
  BACK -->|notify| FE
  C -->|resolve disputes| Z
  C -->|issue payouts (M-Pesa)| Y
```

---

# Contract design (ink! sketch)

### Storage

```rust
pub struct Order {
    buyer: AccountId,
    seller: AccountId,
    product_cid: Hash,     // IPFS CID or product metadata hash
    amount: Balance,       // Amount in native chain token (DOT) OR 0 for fiat orders
    payment_mode: PaymentMode, // DOT or MPESA
    status: OrderStatus,
    created_at: Timestamp,
    evidence_cids: Vec<Hash>, // photos, tracking proofs
}
```

### Enums

```rust
pub enum PaymentMode { DOT, MPESA }
pub enum OrderStatus {
    Created,
    Funded,       // funds on-chain for DOT; or payment acknowledged for M-Pesa
    Shipped,
    Delivered,
    Disputed,
    Completed,
    Refunded
}
```

### Key functions (public)

* `create_order(seller: AccountId, product_cid: Hash, payment_mode: PaymentMode) -> OrderId`
* `fund_order_dot(order_id) -> payable`  // buyer sends DOT in tx
* `record_offchain_payment(order_id, mpesa_tx_ref: Hash)`  // callable by authorized oracle/backend
* `mark_shipped(order_id, tracking_hash: Hash)`
* `confirm_delivery(order_id)`  // buyer calls to release funds (DOT) or mark delivered (MPESA)
* `raise_dispute(order_id, evidence_hash: Hash)`
* `resolve_dispute(order_id, verdict: Verdict)`  // admin/DAO
* `withdraw_seller(order_id)`  // seller withdraws DOT after release

### Events

* `OrderCreated(order_id)`
* `OrderFunded(order_id, payment_mode, payer)`
* `OrderShipped(order_id, tracking_hash)`
* `OrderDelivered(order_id)`
* `OrderDisputed(order_id, reason_hash)`
* `OrderResolved(order_id, verdict)`
* `FundsReleased(order_id, amount)`

**Important authority rule:** for some state transitions (e.g., `record_offchain_payment`, `resolve_dispute`) the contract must restrict caller to an admin/oracle account (a backend key). For DOT path the fund transfer itself is authoritative (since funds are received by contract).

---

# Sequence flows

### DOT (on-chain) flow — fully trustless

1. Buyer connects Polkadot wallet in UI.
2. Buyer `create_order` (off-chain metadata created and IPFS CID returned).
3. Buyer calls `fund_order_dot` sending `amount` DOT in same tx → contract stores funds, emits `OrderFunded`.
4. Seller marks `mark_shipped(order_id, tracking_hash)` (calls from seller wallet).
5. Buyer receives product and calls `confirm_delivery(order_id)` → contract `transfer` DOT to seller or sets state enabling `withdraw_seller`.
6. If `raise_dispute`, contract moves to `Disputed` and awaits `resolve_dispute` (admin/DAO) which then `refund_buyer` or `release_funds`.

### M-Pesa (hybrid) flow — centralized fiat custody, on-chain state

1. Buyer chooses M-Pesa at checkout. UI presents paybill/payee & STK push.
2. Backend triggers STK push via M-Pesa (Daraja) and records pending status in DB.
3. On M-Pesa success callback, backend verifies tx and calls `record_offchain_payment(order_id, mpesa_tx_hash)` on chain (signed by backend oracle account) → contract sets `Funded`.
4. Seller marks shipped, logs tracking CID (calls `mark_shipped`).
5. Buyer confirms delivery in UI; backend triggers M-Pesa B2C payout to seller and calls `OrderDelivered` or `FundsReleased` on chain (or leaves FundsReleased as an event after payout).
6. Disputes: buyer uploads evidence; backend sets contract `Disputed`, admin resolves, backend issues refund via M-Pesa.

**Note:** contract does not hold fiat in this flow. On-chain records are evidence and state — custody is off-chain.

---

# Backend responsibilities (Node.js/TS)

**Core modules**

* `polkadotClient`: polkadot.js wrapper for contract calls and event listeners.
* `mpesaService`: STK push, webhook verification, B2C payouts (Daraja or sandbox).
* `orderService`: orchestrates flows, verifies identities, stores metadata.
* `ipfsService`: uploads images/proofs and returns CIDs.
* `auth`: session + simple KYC mock for sellers.
* `wsNotifier`: WebSocket / SSE for real-time updates to frontend.

**Important rules**

* Backend acts as **authorized oracle** on chain (uses an admin account/keypair) — only for operations that cannot be done by buyer/seller wallets (e.g., recording M-Pesa payments, resolving disputes if admin path).
* All admin/oracle actions must be logged, signed, and replay-protected (use nonces, tx receipts).
* Webhooks must be idempotent and validated (signature + payload checks).

**APIs (minimal)**

* `POST /api/products` — seller → upload metadata (IPFS) → return product CID
* `GET /api/products` — browse
* `POST /api/orders` — create order (off-chain record; returns orderId & contract order reference)
* `POST /api/orders/:id/pay/mpesa` — start STK push (returns paybill/ref)
* `POST /api/mpesa/webhook` — mpesa callback (validates, updates DB, calls contract `record_offchain_payment`)
* `POST /api/orders/:id/ship` — seller mark shipped (uploads tracking CID & calls contract)
* `POST /api/orders/:id/confirm` — buyer confirm (for M-Pesa, backend triggers B2C payout)
* `POST /api/orders/:id/dispute` — create dispute (uploads evidence)
* `POST /api/admin/orders/:id/resolve` — admin resolve dispute (calls contract)

**DB models (simplified)**

* `users { id, accountId, role(buyer/seller/admin), kyc_status, created_at }`
* `products { id, seller_id, cid, price_dot, created_at }`
* `orders { id, product_id, buyer_id, seller_id, amount_dot, payment_mode, status, contract_order_ref, mpesa_tx_ref, created_at }`
* `evidence { id, order_id, cid, uploader, timestamp }`

---

# Frontend UX and components

**Pages**

* Landing / Browse (guest)
* Product page -> “Buy with DOT” (wallet flow) or “Buy with M-Pesa” (STK push)
* Checkout modal with payment mode selector
* Wallet connect component (Polkadot extension)
* Order page: shows state machine, on-chain TX links, proofs (IPFS images), actions (confirm, dispute)
* Seller dashboard: orders, mark shipped, upload tracking
* Admin dashboard: disputes, evidence & resolve action

**Key UX notes**

* For DOT: show TX status (pending, in-block, confirmed), event logs from contract (OrderFunded etc).
* For M-Pesa: show STK push status, MPESA TX ref, and a note “Funds are held off-chain by Descrow platform (MVP)”.
* Show evidence CIDs / thumbnails served from IPFS gateway, and on-chain event IDs for auditability.
* Display clear instructions for buyer admins about the post-purchase steps to confirm delivery and raise disputes.

---

# Security & fraud mitigation (MVP level)

* Restrict `record_offchain_payment` in contract to an oracle account (backend). Log action off-chain.
* Validate M-Pesa callbacks via provider signature / validation flow and persist proof.
* Rate limit admin endpoints and require admin wallet signature for sensitive on-chain actions.
* Store image evidence on IPFS + hash in contract so on-chain content can be validated (do not store raw binary on chain).
* Use HTTPS + JWT on backend; webhooks must validate payloads.
* For seller onboarding in hackathon: require simple KYC docs upload (photo + phone number) but clearly label as MOCK for MVP.

---

# Testing & devops

* Local/in-memory Substrate or a public testnet that supports ink! (deploy and test) — keep scripts to bootstrap local node & contract.
* Unit tests for ink! contract (ink! unit tests and integration tests).
* Backend: unit tests for M-Pesa webhook handling, idempotency, and Polkadot client stubs.
* End-to-end tests using test wallets and simulated M-Pesa callbacks.
* CI: run ink! contract compilation and tests + backend build on PRs.
* Deploy backend in a Docker container; use ngrok for MPESA webhooks in hackathon demos.

---

# Minimal MVP feature checklist (priority ordered)

**Must-have (MVP demo):**

1. ink! `DescrowContract` deployed on testnet: `create_order`, `fund_order_dot`, `mark_shipped`, `confirm_delivery`, `raise_dispute`, `resolve_dispute`, events.
2. Frontend: wallet connect, product listing, checkout DOT flow, order page with events.
3. Backend: polkadot.js client + event listener to update DB and notify frontend via WebSockets.
4. M-Pesa integration: STK push flow + webhook emulator + `record_offchain_payment` call to contract.
5. Admin UI: list disputes + resolve (triggers on-chain resolve).

**Nice-to-have during hackathon:**

* IPFS upload for product metadata and proof images.
* QR seal simulation: generate package hash and show verification flow.
* B2C payout flow (M-Pesa) simulated (sandbox) to demonstrate payout after delivery confirmation.
* Basic seller verification mock (upload + approve).

---

# 3–5 day hackathon plan (roles & tasks)

Assume 3 full days (intense). I’ll break into Day 0 (prep) + Day 1–3.

### Day 0 — prep (1 day or a few hours)

* Everyone: define demo script + acceptance criteria (what judge sees).
* Smart Contract Engineer: scaffold ink! project, write types + basic unit tests.
* Backend + Frontend: scaffold repos, wire basic auth & DB.
* DevOps: testnet endpoints, CI skeleton, ngrok setup for mpesa.

### Day 1 — core on-chain + frontend basics

* Smart Contract Eng: implement create + fund + ship + confirm + events; deploy testnet.
* Frontend Eng: wallet connect + product list + product page + create order UI.
* Backend Dev: polkadotClient + event listener that updates DB.

### Day 2 — Integrations & M-Pesa

* Backend: implement M-Pesa STK push (use sandbox). Implement webhook handler + record_offchain_payment call on success.
* Frontend: Add M-Pesa checkout UI; show STK push flow & UX states.
* Smart Contract Eng: implement record_offchain_payment and admin resolve functions.
* QA/DevOps: run e2e flow for DOT and M-Pesa flows.

### Day 3 — polish, dispute flows, demo prep

* Implement upload evidence to IPFS; wire evidence to order & contract (hash stored).
* Admin UI + dispute resolution flow.
* Demo runthrough, fix bugs, create visuals and short walkthrough script.

**Per-role breakdown**

* Smart Contract Eng: Days 0–2 highest focus. Day 3 assist backend integration.
* Backend Dev: Days 0–3 heavy on M-Pesa and polkadot client.
* Frontend Dev: Days 1–3 connect wallet + build checkout flows + real-time updates.
* Product/UX: full time polishing UI/UX, demo script, Figma.
* QA/DevOps: setup testnet, CI, docker, and test runs.

---

# Monitoring & metrics to show in demo

* Number of orders created / funded (DOT vs M-Pesa).
* On-chain events count (OrderFunded, OrderShipped, OrderDelivered).
* Average time to confirm a DOT tx (show latency).
* M-Pesa STK push success rate (sandbox simulated).
* Evidence attachment counts and dispute outcomes.

---

# Migration path & next steps (after hackathon)

* Replace fiat custody with tokenized stablecoins on chain (e.g., USDT or a stable parachain) or integrate a regulated custodian for fiat on/off ramp.
* Build DAO arbitration contract for decentralized dispute resolution.
* Integrate courier APIs or verifiable logistics oracles for automated shipment verification.
* Add cross-chain bridges / parachain integrations for other ecosystems.

---

# Final notes — important to communicate in demo

* Be explicit in the UI and demo talk track about **which payments are fully on-chain (DOT)** and which are **hybrid (M-Pesa with platform custody)**. Judges appreciate honesty.
* Emphasize that **all evidence and state transitions are recorded on-chain** even for M-Pesa flow — giving transparency and auditable trails.
* For hackathon, aim to demo: DOT flow end-to-end + one M-Pesa flow (STK push + backend call + B2C simulation) + a dispute resolution example.


