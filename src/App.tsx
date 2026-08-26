import { Fragment, useState } from "react";
import { accessories, recipes, sauces } from "./data";
import type { Accessory, BatchRecipe, QuickRecipe, Sauce } from "./types";
import Builder from "./Builder";
import { MatrixView } from "./Matrix";

type AnyRecipe = QuickRecipe | BatchRecipe;
type Tab = "recipes" | "sauces" | "accessories" | "builder";

function ViewToggle({
    view,
    setView,
}: {
    view: "list" | "matrix";
    setView: (v: "list" | "matrix") => void;
}) {
    return (
        <div className="chips tabs-follow">
            <button
                className={`chip${view === "list" ? " selected" : ""}`}
                onClick={() => setView("list")}
            >
                List
            </button>
            <button
                className={`chip${view === "matrix" ? " selected" : ""}`}
                onClick={() => setView("matrix")}
            >
                Matrix
            </button>
        </div>
    );
}

function ThemeToggle() {
    const [dark, setDark] = useState(() =>
        document.documentElement.classList.contains("dark"),
    );
    return (
        <button
            className="ghost"
            onClick={() => {
                const next = !dark;
                setDark(next);
                document.documentElement.classList.toggle("dark", next);
                localStorage.setItem("theme", next ? "dark" : "light");
            }}
        >
            {dark ? "Light" : "Dark"}
        </button>
    );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
    return (
        <nav className="tabs">
            {(["recipes", "sauces", "accessories", "builder"] as const).map((t) => (
                <button
                    key={t}
                    className={`ghost${tab === t ? " active" : ""}`}
                    onClick={() => setTab(t)}
                >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
            ))}
        </nav>
    );
}

function findSauce(name?: string | null): Sauce | undefined {
    return name ? sauces.find((s) => s.name === name) : undefined;
}

interface Column {
    key: string;
    label: string;
    value: (r: AnyRecipe) => string;
}

const baseColumns: Column[] = [
    { key: "total", label: "Total", value: (r) => `${r.total_time}m` },
    { key: "active", label: "Active", value: (r) => `${r.active_time}m` },
    { key: "kcal", label: "kcal", value: (r) => `${r.calories_kcal}` },
    { key: "protein", label: "Protein", value: (r) => `${r.protein_g}g` },
];

const quickColumns: Column[] = [
    ...baseColumns,
    {
        key: "equipment",
        label: "Equipment",
        value: (r) => r.equipment.join(", "),
    },
    {
        key: "sauce",
        label: "Sauce",
        value: (r) => findSauce(r.sauce)?.name ?? "",
    },
];

const batchColumns: Column[] = [
    ...baseColumns,
    {
        key: "servings",
        label: "Servings",
        value: (r) => ("batch_servings" in r ? String(r.batch_servings) : ""),
    },
    {
        key: "fridge",
        label: "Fridge",
        value: (r) => ("fridge_days" in r ? `${r.fridge_days}d` : ""),
    },
    {
        key: "freeze",
        label: "Freezer",
        value: (r) =>
            "freezes_well" in r ? (r.freezes_well ? "yes" : "no") : "",
    },
];

function RecipeRow({
    recipe,
    columns,
    open,
    onToggle,
}: {
    recipe: AnyRecipe;
    columns: Column[];
    open: boolean;
    onToggle: () => void;
}) {
    const sauce = findSauce(recipe.sauce);
    return (
        <>
            <tr className="recipe-row" onClick={onToggle} aria-expanded={open}>
                <td>
                    <span className="chevron">{open ? "▾" : "▸"}</span>{" "}
                    <strong>{recipe.name}</strong>{" "}
                    <span className="dim">{recipe.cuisine}</span>
                </td>
                {columns.map((col) => {
                    const title =
                        col.key === "sauce" && sauce
                            ? sauce.flavor
                            : col.key === "freeze" && "reheat" in recipe
                              ? recipe.reheat
                              : undefined;
                    return (
                        <td key={col.key} title={title}>
                            {col.value(recipe)}
                        </td>
                    );
                })}
            </tr>
            {open && (
                <tr className="foldout-row">
                    <td colSpan={columns.length + 1}>
                        <div className="foldout">
                            {"reheat" in recipe && (
                                <section>
                                    <h4>Storage</h4>
                                    <p>
                                        Fridge:{" "}
                                        {(recipe as BatchRecipe).fridge_days}{" "}
                                        days · Freezer:{" "}
                                        {(recipe as BatchRecipe).freezes_well
                                            ? "yes"
                                            : "no"}{" "}
                                        — {(recipe as BatchRecipe).reheat}
                                    </p>
                                </section>
                            )}
                            {sauce && (
                                <section>
                                    <h4>Sauce</h4>
                                    <p>
                                        {sauce.name} ({sauce.technique}) —{" "}
                                        {sauce.flavor}. {sauce.ingredients}.
                                        <em> {sauce.notes}</em>
                                    </p>
                                </section>
                            )}
                            <section>
                                <h4>Ingredients</h4>
                                <ul>
                                    {recipe.ingredients.map((ing) => (
                                        <li key={ing}>{ing}</li>
                                    ))}
                                </ul>
                            </section>
                            <section>
                                <h4>Steps</h4>
                                <ol>
                                    {recipe.steps.map((step) => (
                                        <li key={step}>{step}</li>
                                    ))}
                                </ol>
                            </section>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function RecipeTable({
    title,
    note,
    recipes,
}: {
    title: string;
    note: string;
    recipes: AnyRecipe[];
}) {
    const [openName, setOpenName] = useState<string | null>(null);
    const [sort, setSort] = useState<{
        key: "total_time" | "active_time";
        dir: 1 | -1;
    } | null>(null);
    const columns =
        "batch_servings" in (recipes[0] ?? {}) ? batchColumns : quickColumns;

    function cycleSort(colKey: string) {
        if (colKey !== "total" && colKey !== "active") return;
        const key =
            colKey === "total"
                ? ("total_time" as const)
                : ("active_time" as const);
        setSort((s) =>
            !s || s.key !== key
                ? { key, dir: 1 }
                : s.dir === 1
                  ? { key, dir: -1 }
                  : null,
        );
    }

    const sorted =
        sort === null
            ? recipes
            : [...recipes].sort(
                  (a, b) => (a[sort.key] - b[sort.key]) * sort.dir,
              );

    return (
        <section>
            <h2>
                {title} <small className="dim">{note}</small>
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        {columns.map((col) => (
                            <th key={col.key}>
                                {col.key === "total" || col.key === "active" ? (
                                    <button
                                        className="sort"
                                        onClick={() => cycleSort(col.key)}
                                        title="Sort"
                                    >
                                        {col.label}
                                        {sort &&
                                            (col.key === "total") ===
                                                (sort.key === "total_time") && (
                                                <span>
                                                    {" "}
                                                    {sort.dir === 1 ? "↑" : "↓"}
                                                </span>
                                            )}
                                    </button>
                                ) : (
                                    col.label
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((r) => (
                        <RecipeRow
                            key={r.name}
                            recipe={r}
                            columns={columns}
                            open={openName === r.name}
                            onToggle={() =>
                                setOpenName(openName === r.name ? null : r.name)
                            }
                        />
                    ))}
                </tbody>
            </table>
        </section>
    );
}

export default function App() {
    const [tab, setTab] = useState<Tab>("recipes");
    return (
        <main>
            <header>
                <h1>Cooking</h1>
                <ThemeToggle />
            </header>
            <Tabs tab={tab} setTab={setTab} />
            {tab === "recipes" && (
                <>
                    <RecipeTable
                        title="Quick"
                        note={`${recipes.quick.length} recipes · fast start-to-ready`}
                        recipes={recipes.quick}
                    />
                    <RecipeTable
                        title="Batch"
                        note={`${recipes.batch.length} recipes · low active time, freezer-friendly`}
                        recipes={recipes.batch}
                    />
                </>
            )}
            {tab === "sauces" && <SaucesTab />}
            {tab === "accessories" && <AccessoriesTab />}
            {tab === "builder" && <Builder />}
        </main>
    );
}

function SauceTable() {
    const [openName, setOpenName] = useState<string | null>(null);
    return (
        <section>
            <h2>
                Sauces <small className="dim">{sauces.length}</small>
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Technique</th>
                        <th>Flavor</th>
                        <th>Ingredients</th>
                    </tr>
                </thead>
                <tbody>
                    {sauces.map((s) => (
                        <Fragment key={s.name}>
                            <tr
                                className="recipe-row"
                                onClick={() =>
                                    setOpenName(
                                        openName === s.name ? null : s.name,
                                    )
                                }
                                aria-expanded={openName === s.name}
                            >
                                <td>
                                    <span className="chevron">
                                        {openName === s.name ? "▾" : "▸"}
                                    </span>{" "}
                                    <strong>{s.name}</strong>
                                </td>
                                <td>{s.technique}</td>
                                <td>{s.flavor}</td>
                                <td>{s.ingredients}</td>
                            </tr>
                            {openName === s.name && (
                                <tr className="foldout-row">
                                    <td colSpan={4}>
                                        <div className="foldout">
                                            <p>{s.notes}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

function SaucesTab() {
    const [view, setView] = useState<"list" | "matrix">("list");
    return (
        <>
            <ViewToggle view={view} setView={setView} />
            {view === "list" ? (
                <SauceTable />
            ) : (
                <MatrixView
                    title="Sauce matrix"
                    note="region × flavor profile"
                    items={sauces}
                    rowKey={(s: Sauce) => s.regions}
                    colKey={(s: Sauce) => [s.profile]}
                />
            )}
        </>
    );
}

function AccessoriesTab() {
    const [view, setView] = useState<"list" | "matrix">("list");
    return (
        <>
            <ViewToggle view={view} setView={setView} />
            {view === "list" ? (
                <AccessoryList />
            ) : (
                <MatrixView
                    title="Accessory matrix"
                    note="region × type"
                    items={accessories}
                    rowKey={(a: Accessory) => a.regions}
                    colKey={(a: Accessory) => [a.type]}
                />
            )}
        </>
    );
}

function AccessoryList() {
    return (
        <section>
            <h2>
                Accessories <small className="dim">{accessories.length}</small>
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Region</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {accessories.map((a) => (
                        <tr key={a.name}>
                            <td>
                                <strong>{a.name}</strong>
                            </td>
                            <td>{a.regions.join(", ")}</td>
                            <td>{a.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
