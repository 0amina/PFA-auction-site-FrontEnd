// Browser polyfills required by @solana/web3.js (Buffer + global).
// Must be imported before any code that touches web3.js.
import { Buffer } from 'buffer';

const g = globalThis as unknown as { Buffer?: typeof Buffer; global?: unknown };
if (!g.Buffer) g.Buffer = Buffer;
if (!g.global) g.global = globalThis;
