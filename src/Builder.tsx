import { Fragment, useState } from "react";
import {
    accessories,
    formFactors,
    loadBuilds,
    proteins,
    removeBuild,
    saveBuild,
    sauces,
    techniques,
} from "./data";
import type { Accessory, Build, Sauce } from "./types";
import { MatrixView } from "./Matrix";

const STEPS = [
    "Form factor",
    "Protein",
    "Technique",
    "Accessories",
    "Sauce",
    "Review",
];

interface Draft {
    formFactor: string | null;
    protein: string | null;
    cut: string | null;
    technique: string | null;
    accessories: string[];
    sauce: string | null;
}

const emptyDraft: Draft = {
    formFactor: null,
    protein: null,
    cut: null,
    technique: null,
    accessories: [],
    sauce: null,
};

function rand<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function allAccessories(): string[] {
  return accessories.map((a) => a.name)
}

function randomAccessoryPick(): string[] {
    const shuffled = [...allAccessories()].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2 + Math.floor(Math.random() * 3));
}

function Chip({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`chip${selected ? " selected" : ""}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

function BuildCell({
    label,
    value,
    onEdit,
    onRandom,
}: {
    label: string;
    value: string;
    onEdit: () => void;
    onRandom: () => void;
}) {
    return (
        <div className="build-cell">
            <span className="cell-label">{label}</span>
            <span className="cell-value">{value}</span>
            <span className="cell-actions">
                <button type="button" className="linklike" onClick={onEdit}>
                    Change
                </button>
                <button type="button" className="linklike" onClick={onRandom}>
                    🎲 Random
                </button>
            </span>
        </div>
    );
}

export default function Builder() {
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [builds, setBuilds] = useState<Build[]>(loadBuilds);
    const [returnToReview, setReturnToReview] = useState(false);
    const [groupBy, setGroupBy] = useState<"region" | "profile" | "matrix">(
        "region",
    );
    const [accGroupBy, setAccGroupBy] = useState<"region" | "type" | "matrix">(
        "type",
    );

    const done =
        draft.formFactor &&
        draft.protein &&
        draft.cut &&
        draft.technique !== null;

    function pick<K extends keyof Draft>(key: K, value: Draft[K]) {
        setDraft((d) => ({ ...d, [key]: value }));
    }

    function isComplete(d: Draft): boolean {
        return Boolean(d.formFactor && d.protein && d.cut && d.technique);
    }

    // Navigate forward after a selection; if the user came here from the review
    // screen and the build is complete again, return to review instead.
    function advance(updated?: Draft) {
        if (returnToReview && isComplete(updated ?? draft)) {
            setReturnToReview(false);
            setStep(5);
            return;
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }

    function back() {
        setStep((s) => Math.max(s - 1, 0));
    }

    function reset() {
        setDraft(emptyDraft);
        setStep(0);
    }

    function onSave() {
        if (!done) return;
        setBuilds(
            saveBuild({
                id: Date.now(),
                formFactor: draft.formFactor!,
                protein: draft.protein!,
                cut: draft.cut!,
                technique: draft.technique!,
                accessories: draft.accessories,
                sauce: draft.sauce,
                savedAt: new Date().toISOString(),
            }),
        );
    }

    const proteinLabel =
        proteins.find((p) => p.name === draft.protein)?.label ?? draft.protein;

    const stepComplete = [
        Boolean(draft.formFactor),
        Boolean(draft.protein && draft.cut),
        Boolean(draft.technique),
        draft.accessories.length > 0,
        Boolean(done),
        Boolean(done),
    ];

    const canGoTo = (i: number) =>
        [0, 1, 2].slice(0, i).every((j) => stepComplete[j]);

    function toggleAccessory(name: string) {
        pick(
            "accessories",
            draft.accessories.includes(name)
                ? draft.accessories.filter((x) => x !== name)
                : [...draft.accessories, name],
        );
    }

    function pickProtein(name: string) {
        setDraft((d) => ({ ...d, protein: name, cut: null }));
    }

    function pickCut(c: string) {
        const nd = { ...draft, cut: c };
        setDraft(nd);
        advance(nd);
    }

    function pickTechnique(t: string) {
        const nd = { ...draft, technique: t };
        setDraft(nd);
        advance(nd);
    }

    function pickSauce(name: string | null) {
        pick("sauce", name);
        advance({ ...draft, sauce: name });
    }

    function randomizeAll() {
        const p = rand(proteins);
        setDraft({
            formFactor: rand(formFactors),
            protein: p.name,
            cut: rand(p.cuts),
            technique: rand(techniques),
            accessories: randomAccessoryPick(),
            sauce: rand(sauces).name,
        });
        setStep(5);
    }

    function randomizeField(
        field: "formFactor" | "protein" | "technique" | "accessories" | "sauce",
    ) {
        switch (field) {
            case "formFactor":
                pick("formFactor", rand(formFactors));
                break;
            case "protein": {
                const p = rand(proteins);
                setDraft((d) => ({
                    ...d,
                    protein: p.name,
                    cut: rand(p.cuts),
                    sauce: null,
                }));
                break;
            }
            case "technique":
                pick("technique", rand(techniques));
                break;
            case "accessories":
                pick("accessories", randomAccessoryPick());
                break;
            case "sauce":
                pick("sauce", rand(sauces).name);
                break;
        }
    }

    return (
        <section>
            <ol className="steps">
                {STEPS.map((label, i) => (
                    <li
                        key={label}
                        className={[
                            i === step ? "current" : "",
                            stepComplete[i] && i !== step ? "done" : "",
                            canGoTo(i) ? "clickable" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={() => {
                            if (canGoTo(i)) {
                                setReturnToReview(false);
                                setStep(i);
                            }
                        }}
                    >
                        {label}
                    </li>
                ))}
            </ol>

            {step === 0 && (
                <>
                    <h4>Pick a form factor</h4>
                    <div className="chips">
                        {formFactors.map((f) => (
                            <Chip
                                key={f}
                                label={f}
                                selected={draft.formFactor === f}
                                onClick={() => {
                                    pick("formFactor", f);
                                    advance({ ...draft, formFactor: f });
                                }}
                            />
                        ))}
                    </div>
                    <div className="step-nav">
                        <button className="ghost" onClick={randomizeAll}>
                            🎲 Surprise me
                        </button>
                    </div>
                </>
            )}

            {step === 1 && (
                <>
                    <h4>Pick a protein</h4>
                    <div className="chips">
                        {proteins.map((p) => (
                            <Chip
                                key={p.name}
                                label={p.label}
                                selected={draft.protein === p.name}
                                onClick={() => pickProtein(p.name)}
                            />
                        ))}
                    </div>
                    {draft.protein && (
                        <>
                            <h4>Cut</h4>
                            <div className="chips">
                                {(
                                    proteins.find(
                                        (p) => p.name === draft.protein,
                                    )?.cuts ?? []
                                ).map((c) => (
                                    <Chip
                                        key={c}
                                        label={c}
                                        selected={draft.cut === c}
                                        onClick={() => pickCut(c)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {step === 2 && (
                <>
                    <h4>Seasoning / cooking technique</h4>
                    <div className="chips">
                        {techniques.map((t) => (
                            <Chip
                                key={t}
                                label={t}
                                selected={draft.technique === t}
                                onClick={() => pickTechnique(t)}
                            />
                        ))}
                    </div>
                </>
            )}

            {step === 3 && (
                <>
                    <h4>Accessories (any number)</h4>
                    {(() => {
                        const keyOf = (a: Accessory) =>
                            accGroupBy === "region" ? a.regions : [a.type];
                        const groups = [...new Set(accessories.map(keyOf))];
                        return (
                            <>
                                <div className="chips">
                                    <Chip
                                        label="By type"
                                        selected={accGroupBy === "type"}
                                        onClick={() => setAccGroupBy("type")}
                                    />
                                    <Chip
                                        label="By region"
                                        selected={accGroupBy === "region"}
                                        onClick={() => setAccGroupBy("region")}
                                    />
                                    <Chip
                                        label="Matrix"
                                        selected={accGroupBy === "matrix"}
                                        onClick={() => setAccGroupBy("matrix")}
                                    />
                                </div>
                                {accGroupBy === "matrix" ? (
                                    <MatrixView
                                        items={accessories}
                                        rowKey={(a: Accessory) => a.regions}
                                        colKey={(a: Accessory) => [a.type]}
                                        selectedNames={draft.accessories}
                                        onToggle={toggleAccessory}
                                    />
                                ) : (
                                    groups.map((group) => (
                                        <Fragment key={group.join(" | ")}>
                                            <h5>{group.join(" / ")}</h5>
                                            <div className="chips">
                                                {accessories
                                                    .filter(
                                                        (a) => keyOf(a) === group,
                                                    )
                                                    .map((a) => (
                                                        <Chip
                                                            key={a.name}
                                                            label={a.name}
                                                            selected={draft.accessories.includes(
                                                                a.name,
                                                            )}
                                                            onClick={() =>
                                                                toggleAccessory(
                                                                    a.name,
                                                                )
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                        </Fragment>
                                    ))
                                )}
                            </>
                        );
                    })()}
                    <div className="step-nav">
                        <button
                            className="ghost"
                            onClick={() => advance()}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {step === 4 && (
                <>
                    <h4>Sauce</h4>
                    {(() => {
                        const keyOf = (s: Sauce) =>
                            groupBy === "region" ? s.regions : [s.profile];
                        const groups = [...new Set(sauces.map(keyOf))];
                        return (
                            <>
                                <div className="chips">
                                    <Chip
                                        label="By region"
                                        selected={groupBy === "region"}
                                        onClick={() => setGroupBy("region")}
                                    />
                                    <Chip
                                        label="By flavor"
                                        selected={groupBy === "profile"}
                                        onClick={() => setGroupBy("profile")}
                                    />
                                    <Chip
                                        label="Matrix"
                                        selected={groupBy === "matrix"}
                                        onClick={() => setGroupBy("matrix")}
                                    />
                                </div>
                                {groupBy === "matrix" ? (
                                    <>
                                        <MatrixView
                                            items={sauces}
                                            rowKey={(s: Sauce) => s.regions}
                                            colKey={(s: Sauce) => [s.profile]}
                                            selectedNames={
                                                draft.sauce
                                                    ? [draft.sauce]
                                                    : []
                                            }
                                            onToggle={(name) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    sauce:
                                                        d.sauce === name
                                                            ? null
                                                            : name,
                                                }))
                                            }
                                        />
                                        <div className="step-nav">
                                            <button
                                                className="ghost"
                                                onClick={() => advance()}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    groups.map((group) => (
                                        <Fragment key={group.join(" | ")}>
                                            <h5>{group.join(" / ")}</h5>
                                            <div className="chips">
                                                {sauces
                                                    .filter(
                                                        (s) => keyOf(s) === group,
                                                    )
                                                    .map((s) => (
                                                        <Chip
                                                            key={s.name}
                                                            label={`${s.name} — ${s.flavor}`}
                                                            selected={
                                                                draft.sauce ===
                                                                s.name
                                                            }
                                                            onClick={() =>
                                                                pickSauce(s.name)
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                        </Fragment>
                                    ))
                                )}
                            </>
                        );
                    })()}
                    <p>
                        <button
                            className="ghost"
                            onClick={() => pickSauce(null)}
                        >
                            No sauce
                        </button>
                        <button
                            className="ghost"
                            onClick={() => pickSauce(rand(sauces).name)}
                        >
                            🎲 Random sauce
                        </button>
                    </p>
                </>
            )}

            <div className="step-nav">
                {step > 0 && step < STEPS.length - 1 && (
                    <button className="ghost" onClick={back}>
                        Back
                    </button>
                )}
            </div>

            {done && step === 5 && (
                <div className="summary">
                    <h4>Your build</h4>
                    <p className="build-line">
                        {[
                            `${draft.technique} ${proteinLabel!.toLowerCase()} (${draft.cut})`,
                            `over ${draft.formFactor}`,
                            draft.accessories.length > 0 &&
                                `with ${draft.accessories.join(", ")}`,
                            draft.sauce && `+ ${draft.sauce}`,
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    </p>
                    <div className="build-grid">
                        <BuildCell
                            label="Form factor"
                            value={draft.formFactor ?? "None"}
                            onEdit={() => {
                                setReturnToReview(true);
                                setStep(0);
                            }}
                            onRandom={() => randomizeField("formFactor")}
                        />
                        <BuildCell
                            label="Protein & cut"
                            value={`${proteinLabel} · ${draft.cut}`}
                            onEdit={() => {
                                setReturnToReview(true);
                                setStep(1);
                            }}
                            onRandom={() => randomizeField("protein")}
                        />
                        <BuildCell
                            label="Technique"
                            value={draft.technique ?? "None"}
                            onEdit={() => {
                                setReturnToReview(true);
                                setStep(2);
                            }}
                            onRandom={() => randomizeField("technique")}
                        />
                        <BuildCell
                            label="Accessories"
                            value={
                                draft.accessories.length > 0
                                    ? draft.accessories.join(", ")
                                    : "None"
                            }
                            onEdit={() => {
                                setReturnToReview(true);
                                setStep(3);
                            }}
                            onRandom={() => randomizeField("accessories")}
                        />
                        <BuildCell
                            label="Sauce"
                            value={draft.sauce ?? "None"}
                            onEdit={() => {
                                setReturnToReview(true);
                                setStep(4);
                            }}
                            onRandom={() => randomizeField("sauce")}
                        />
                    </div>
                    <div className="step-nav">
                        <button className="ghost" onClick={onSave}>
                            Save build
                        </button>
                        <button className="ghost" onClick={reset}>
                            Start over
                        </button>
                        <button
                            className="ghost push-right"
                            onClick={randomizeAll}
                        >
                            🎲 Randomize everything
                        </button>
                    </div>
                </div>
            )}

            {builds.length > 0 && (
                <>
                    <h3>Saved builds</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Build</th>
                                <th>Accessories</th>
                                <th>Sauce</th>
                                <th>Saved</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {builds.map((b) => (
                                <tr key={b.id}>
                                    <td>{`${b.technique} ${b.protein} (${b.cut}) over ${b.formFactor}`}</td>
                                    <td>{b.accessories.join(", ")}</td>
                                    <td>{b.sauce ?? "—"}</td>
                                    <td>
                                        {new Date(
                                            b.savedAt,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button
                                            className="ghost"
                                            onClick={() =>
                                                setBuilds(removeBuild(b.id))
                                            }
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </section>
    );
}
