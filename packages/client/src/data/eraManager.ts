export interface Era {
    id: string;
    name: string;
    description?: string;
    order: number;
}

export const initialEras: Era[] = [
    {
        id: 'era_1',
        name: 'The Age of Beginnings',
        description: 'A time of myth and nascent magics.',
        order: 1,
    },
    {
        id: 'era_2',
        name: 'The Sundered Age',
        description: 'An era of conflict and broken alliances.',
        order: 2,
    }
];