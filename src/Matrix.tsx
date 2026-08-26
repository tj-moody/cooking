export function MatrixView<T extends { name: string }>({
    title,
    note,
    items,
    rowKey,
    colKey,
    selectedNames,
    onToggle,
}: {
    title?: string;
    note?: string;
    items: T[];
    rowKey: (item: T) => string[];
    colKey: (item: T) => string[];
    selectedNames?: string[];
    onToggle?: (name: string) => void;
}) {
    const rows = [...new Set(items.flatMap(rowKey))];
    const cols = [...new Set(items.flatMap(colKey))];
    const selectable = Boolean(onToggle);
    return (
        <section>
            {title && (
                <h2>
                    {title} {note && <small className="dim">{note}</small>}
                </h2>
            )}
            <table className="matrix">
                <thead>
                    <tr>
                        <th></th>
                        {cols.map((c) => (
                            <th key={c}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r}>
                            <th>{r}</th>
                            {cols.map((c) => {
                                const cell = items.filter(
                                    (i) =>
                                        rowKey(i).includes(r) &&
                                        colKey(i).includes(c),
                                );
                                return (
                                    <td
                                        key={c}
                                        className={
                                            cell.length === 0 ? "empty" : ""
                                        }
                                    >
                                        {cell.map((i) => {
                                            const selected = selectedNames?.includes(
                                                i.name,
                                            );
                                            return selectable ? (
                                                <button
                                                    key={i.name}
                                                    type="button"
                                                    className={`matrix-item${
                                                        selected ? " selected" : ""
                                                    }`}
                                                    onClick={() =>
                                                        onToggle!(i.name)
                                                    }
                                                >
                                                    {selected ? (
                                                        <span className="marker">
                                                            ●{" "}
                                                        </span>
                                                    ) : null}
                                                    {i.name}
                                                </button>
                                            ) : (
                                                <div key={i.name}>{i.name}</div>
                                            );
                                        })}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
