import { describe, expect, it, vi } from "vitest";

import {
    type CompletionBackend,
    buildInfoNode,
    jediTypeToCm,
    makeReplCompletionSource,
} from "./completions";

// A single-line CompletionContext stub: enough surface for the source (matchBefore /\w*/, doc access).
const makeContext = (source: string, pos: number, explicit = false) => {
    const text = (source.slice(0, pos).match(/\w*$/) ?? [""])[0];
    const from = pos - text.length;
    return {
        pos,
        explicit,
        matchBefore: () => ({ from, to: pos, text }),
        state: {
            doc: {
                toString: () => source,
                sliceString: (a: number, b: number) => source.slice(a, b),
                lineAt: () => ({ number: 1, from: 0 }),
            },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
};

const backend = (over: Partial<CompletionBackend> = {}): CompletionBackend => ({
    isInitialized: true,
    complete: () => [
        { name: "supercell", type: "instance" },
        { name: "create_supercell", type: "function" },
    ],
    describe: (_s, _l, _c, name) => ({ signature: `${name}(x)`, docstring: `doc for ${name}` }),
    ...over,
});

describe("jediTypeToCm", () => {
    it("maps Jedi kinds to CodeMirror completion types", () => {
        expect(jediTypeToCm("function")).toBe("function");
        expect(jediTypeToCm("instance")).toBe("variable");
        expect(jediTypeToCm("module")).toBe("namespace");
        expect(jediTypeToCm("keyword")).toBe("keyword");
    });
    it("falls back to 'variable' for unknown kinds", () => {
        expect(jediTypeToCm("weird")).toBe("variable");
    });
});

describe("buildInfoNode", () => {
    it("returns null when there is nothing to show", () => {
        expect(buildInfoNode(null)).toBeNull();
        expect(buildInfoNode({ signature: "", docstring: "" })).toBeNull();
    });
    it("renders the signature and docstring into a bounded node", () => {
        const node = buildInfoNode({ signature: "f(x)", docstring: "does f" });
        expect(node).not.toBeNull();
        expect(node?.textContent).toContain("f(x)");
        expect(node?.textContent).toContain("does f");
    });
});

describe("makeReplCompletionSource", () => {
    it("returns null before the session is initialized", () => {
        const source = makeReplCompletionSource(backend({ isInitialized: false }));
        expect(source(makeContext("sup", 3))).toBeNull();
    });

    it("offers backend completions (variables AND functions) anchored at the word start", () => {
        const source = makeReplCompletionSource(backend());
        const result = source(makeContext("sup", 3));
        expect(result?.from).toBe(0);
        expect(result?.options.map((o) => o.label)).toEqual(["supercell", "create_supercell"]);
        expect(result?.options.map((o) => o.type)).toEqual(["variable", "function"]);
    });

    it("does not pop up on an empty prefix unless explicit", () => {
        const source = makeReplCompletionSource(backend());
        expect(source(makeContext("", 0))).toBeNull();
        expect(source(makeContext("", 0, true))?.options).toHaveLength(2);
    });

    it("DOES pop up after a dot (attribute access) even without an explicit request", () => {
        const source = makeReplCompletionSource(backend());
        expect(source(makeContext("material.", 9))?.options).toHaveLength(2);
    });

    it("boosts keyword-arg (param) completions and completes them as `name=`", () => {
        const source = makeReplCompletionSource(
            backend({
                complete: () => [
                    { name: "crystal", type: "param" },
                    { name: "abs", type: "function" },
                ],
            }),
        );
        const result = source(makeContext("create_slab(", 12, true));
        const param = result?.options.find((o) => o.label === "crystal");
        const other = result?.options.find((o) => o.label === "abs");
        expect(param?.apply).toBe("crystal=");
        expect(param?.boost).toBe(99);
        expect(other?.boost).toBe(0);
    });

    it("resolves signature/docstring lazily via the info callback", () => {
        const describe = vi.fn(backend().describe);
        const source = makeReplCompletionSource(backend({ describe }));
        const result = source(makeContext("sup", 3));
        expect(describe).not.toHaveBeenCalled(); // not until the item is highlighted
        const info = result?.options[0].info as (c: unknown) => HTMLElement | null;
        const node = info({});
        expect(describe).toHaveBeenCalledOnce();
        expect(node?.textContent).toContain("supercell(x)");
    });
});
