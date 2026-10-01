import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Tests never hit the network (the Pixel UI fetches live weather).
vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("kein Netz im Test"))));

// jsdom has no canvas; make getContext quietly return null (the scene falls back) instead of logging "not implemented".
HTMLCanvasElement.prototype.getContext = () => null;
