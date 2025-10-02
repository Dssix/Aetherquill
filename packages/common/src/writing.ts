export interface WritingEntry {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    linkedCharacterIds?: string[];
    linkedWorldId?: string | null;
    linkedEventIds?: string[];
    createdAt: number;
    updatedAt: number;
}