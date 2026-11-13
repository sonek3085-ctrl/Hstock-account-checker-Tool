# AURUM LUDO — Game Rules, System Architecture & Operational Scaling Plan
**Document Version:** 1.0.0  
**Project:** Android Online Multiplayer Ludo Game  
**Target Platform:** Android (Web PWA / Android WebView / Unity Client)  
**Security Classification:** Production Confidential  

---

## 1. Official Game Rules Specification

### 1.1 Board Topology
- **Board Grid:** 15 × 15 coordinate space.
- **Player Colors & Home Quadrants:**
  - **Red (Player 0):** Bottom-Left quadrant (Yard coordinates: `[1..4, 1..4]`, Starting cell: Cell 1).
  - **Green (Player 1):** Top-Left quadrant (Yard coordinates: `[1..4, 10..13]`, Starting cell: Cell 14).
  - **Yellow (Player 2):** Top-Right quadrant (Yard coordinates: `[10..13, 10..13]`, Starting cell: Cell 27).
  - **Blue (Player 3):** Bottom-Right quadrant (Yard coordinates: `[10..13, 1..4]`, Starting cell: Cell 40).
- **Global Track:** 52 shared circuit tiles (`0` through `51`).
- **Safe Squares (Star Cells):**
  - There are 8 standard safe squares: Indices `1, 9, 14, 22, 27, 35, 40, 48`.
  - Tokens on Safe Squares can never be captured. Multiple tokens (including of different colors) may co-exist peacefully on Safe Squares.
- **Home Run Paths:**
  - 5 private colored tiles per color leading to the final Home triangle:
    - Red Home Run: `R1, R2, R3, R4, R5` -> **Home** (Target: 6 steps from track exit `50`).
    - Green Home Run: `G1, G2, G3, G4, G5` -> **Home** (Target: 6 steps from track exit `12`).
    - Yellow Home Run: `Y1, Y2, Y3, Y4, Y5` -> **Home** (Target: 6 steps from track exit `25`).
    - Blue Home Run: `B1, B2, B3, B4, B5` -> **Home** (Target: 6 steps from track exit `38`).
- **Exact Finish Requirement:**
  - To enter Home, a token requires the exact dice value. For example, if a token is at position 4 on the Home Run, it requires a roll of exactly `2` to enter Home. Any roll greater than `2` cannot be applied to that token.

### 1.2 Token Lifecycle & States
Every player commands 4 tokens (`t0, t1, t2, t3`). Each token exists in one of four states:
1. `YARD`: Locked inside the player's starting base.
2. `TRACK`: Moving along the 52-cell shared circuit.
3. `HOMERUN`: Moving along the color-locked home corridor.
4. `HOME`: Successfully reached the destination.

### 1.3 Dice Rolling & Turn Mechanics
1. **Dice Generation:** Server-authoritative cryptographic pseudo-random number generator producing integers `1` to `6`. Clients never determine or influence dice rolls.
2. **Token Entry from Yard:** A token in the `YARD` state can only enter the starting square if the player rolls a **`6`**.
3. **Extra Turns:**
   - Rolling a **`6`** grants an extra roll.
   - Capturing an opponent's token grants an extra roll.
   - Successfully maneuvering a token into **Home** grants an extra roll.
   - **Three-Six Rule:** Rolling three consecutive `6`s in a single turn forfeits the third turn and immediately passes control to the next player.
4. **Capturing (Bumping):**
   - When a token lands on a non-safe cell occupied by an opponent's token, the opponent's token is captured and sent back to its owner's `YARD`.
   - Safe squares (marked with Golden Stars) protect tokens from capture.
5. **Turn Timer & Timeout:**
   - Active player has **15 seconds** per roll and move.
   - If the timer reaches 0, the server executes an auto-roll/auto-pass to ensure the game never hangs.
   - Disconnected players have a 30-second grace window to reconnect before being transitioned to an automated surrogate.

---

## 2. Networking & Multiplayer Architecture

### 2.1 Protocol & Transport
- **Transport:** WebSocket (`ws://` / `wss://`) on port 3000 alongside Express HTTP API.
- **Framing:** JSON-RPC style event frames:
  ```json
  {
    "type": "ACTION_TYPE",
    "roomId": "AL-928103",
    "playerId": "usr_94819",
    "payload": { ... }
  }
  ```
- **Authoritative State Model:**
  - Clients send player intent (e.g. `ROLL_DICE`, `SELECT_TOKEN`).
  - Server maintains master room state, validates turn order, validates dice logic, recalculates positions, checks captures, and broadcasts delta events (`DICE_ROLLED`, `TOKEN_MOVED`, `TURN_CHANGED`, `GAME_OVER`).
  - Reconnecting clients request `SYNC_STATE` and receive the entire synchronized board snapshot.

### 2.2 Matchmaking & Rooms
1. **2-Player Online Matchmaking:** Pairs 2 players into opposite colors (Red vs Yellow).
2. **4-Player Online Matchmaking:** Pairs 4 players across all four colors (Red, Green, Yellow, Blue).
3. **Private Custom Rooms:**
   - Host creates a room and receives a unique 6-character code (e.g. `AURUM7`).
   - Friends join using the code.
   - Host can start the match when all participants are ready.

---

## 3. Virtual Coins & Economy Security
- **No Cash Value:** Virtual coins are strictly in-game points with zero monetary redemption or conversion.
- **Starting Bonus:** 5,000 coins upon account creation.
- **Daily Reward:** 1,000 coins with 24-hour timestamp cooldown verified on the server.
- **Rewarded Ads:** 500 coins per completed rewarded video ad with a minimum cooldown of 30 seconds and server-side completion token verification.
- **Transaction Ledger:** Every balance mutation is logged with an immutable Transaction ID (`TXN-...`), timestamp, mutation type, and post-transaction balance.

---

## 4. Concurrent-User Capacity & Scaling Plan

| Concurrent Users (CCU) | Infrastructure Tier | Monthly Estimate (USD) | Bottleneck & Mitigation |
| :--- | :--- | :--- | :--- |
| **0 – 1,000 CCU** | Single Node.js server (2 vCPU, 4GB RAM) | $20 – $40 | In-memory room manager + JSON database. |
| **1,000 – 10,000 CCU** | Clustered Node.js + Redis Pub/Sub + Postgres | $150 – $300 | Redis adapter for cross-node WebSocket broadcasting. |
| **10,000 – 100,000 CCU** | Kubernetes (GKE / EKS) + Distributed Redis | $1,200 – $2,500 | Dedicated matchmaking microservice + autoscaling pods. |

---

## 5. Security & Anti-Cheat Measures
1. **Server-Generated Dice:** Dice values are never accepted from clients; clients only trigger the roll request.
2. **Server-Side Move Verification:** Server checks whether the selected token can legally advance the rolled distance.
3. **Replay & Rate Limiting:** All inbound action packets carry monotonically increasing sequence numbers and client nonce hashes.
4. **No Direct Wallet Modification:** Coin balances cannot be set by client requests; balances only change through audited server events.
