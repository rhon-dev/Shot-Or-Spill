import type { DeckId, Intensity } from "../content/meta";

export interface Player {
  id: string;
  name: string;
}

export interface GameConfig {
  decks: DeckId[];
  intensity: Intensity;
  /** Soft-cap warning threshold in shots (F12, default 6). */
  softCap: number;
}

/** How the table resolved a card (PRD §5 "How choices are logged"). */
export type Outcome =
  /** Spill or Shot, Double Down, and Tanggero cards. `answererId` is required on Tanggero cards (D-09). */
  | { kind: "choice"; choice: "spill" | "shot"; answererId?: string }
  /** Everyone Who and Most Likely To: 1 shot for each player tapped (D-10). */
  | { kind: "group"; drinkerIds: string[] }
  /** Hot Seat: shots taken, 0 to 3; each answered question is a spill (D-11). */
  | { kind: "hotSeat"; shots: number }
  /** Water Break: nothing is logged. */
  | { kind: "water" };

export interface Result {
  playerId: string;
  spills: number;
  shots: number;
  /** "choice" shots count toward Most Secretive; "group" shots don't (D-19). */
  source: "choice" | "group";
}

export interface LogEntry {
  cardId: string;
  readerId: string;
  results: Result[];
}

/** The card on the table, with names already filled in (resolved once per draw, F8). */
export interface Drawn {
  cardId: string;
  text: string;
  p1Id: string | null;
  p2Id: string | null;
  faceUp: boolean;
  /** Show "Pass the phone to" on the card back (the reader just changed). */
  handoff: boolean;
}

export interface SessionCore {
  players: Player[];
  config: GameConfig;
  /** Card ids left in this cycle, drawn from the front (F9). */
  queue: string[];
  current: Drawn | null;
  /** Every eligible card has been drawn: show the reshuffle prompt (F9). */
  exhausted: boolean;
  readerIndex: number;
  /** Completed non-Water-Break cards. Drives Tanggero rotation (F3, D-13). */
  completed: number;
  tanggeroStart: number;
  pacing: {
    /** Completed cards since the last Water Break. */
    sinceBreak: number;
    /** Insert a Water Break once sinceBreak reaches this (12 to 15, D-12). */
    nextAt: number;
  };
  /** Whether the next drawn card is a hand-off to a new reader. */
  handoff: boolean;
  log: LogEntry[];
  /** Players who have already seen the soft-cap warning. */
  warned: string[];
  /** Players to show the soft-cap warning to, in order (a group card can tip several at once). */
  pendingWarnings: string[];
  startedAt: number;
}

export interface Session extends SessionCore {
  /** State before the last resolved card, for Undo (F16). One level. */
  previous: SessionCore | null;
}

export interface PlayerStats {
  spills: number;
  shots: number;
  choiceShots: number;
  groupShots: number;
  /** Spills on intensity-3 or Double Down cards (Biggest Tea, D-19). */
  bigTea: number;
}

export interface Award {
  id: "most-honest" | "most-secretive" | "biggest-tea";
  title: string;
  playerIds: string[];
  value: number;
  unit: string;
}

export type Rng = () => number;
