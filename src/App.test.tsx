import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  it("should render the dashboard heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Hackdays/i);
  });

  it("should render a card for each seed group", () => {
    render(<App />);
    // 12 groups in the seed data → 12 detail buttons.
    const cards = screen.getAllByRole("button", { name: /Details zu/i });
    expect(cards.length).toBeGreaterThanOrEqual(12);
  });

  it("should filter groups by search input", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("searchbox"), "SmartBeet");
    const cards = screen.getAllByRole("button", { name: /Details zu/i });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Team Grünpause");
  });

  it("should show an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("searchbox"), "zzz-kein-treffer");
    expect(screen.getByText(/Keine Gruppen gefunden/i)).toBeInTheDocument();
  });

  it("should open the detail drawer when a card is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);
    const firstCard = screen.getAllByRole("button", { name: /Details zu/i })[0];
    expect(firstCard).toBeDefined();
    await user.click(firstCard as HTMLElement);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Projekt/i)).toBeInTheDocument();
  });
});
