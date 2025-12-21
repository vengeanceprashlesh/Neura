export type FilePatch = {
    path: string;                          // e.g. "App.tsx"
    kind: "create" | "update" | "delete";
    previousContent?: string | null;       // optional, for safety
    nextContent?: string | null;           // required for create/update
};

export type PatchResponse = {
    patches: FilePatch[];
    messages?: { role: "assistant"; content: string }[];
};
