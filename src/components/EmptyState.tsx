import { SearchIcon } from "./icons";

/** Shown when the active filters exclude every group. */
export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty">
      <SearchIcon size={32} />
      <h3>Keine Gruppen gefunden</h3>
      <p>Für diese Filter gibt es keine Treffer. Versuch es mit weniger Filtern.</p>
      <button type="button" className="btn-ghost" style={{ marginTop: 16 }} onClick={onReset}>
        Filter zurücksetzen
      </button>
    </div>
  );
}
