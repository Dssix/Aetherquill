export interface Era {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
}

export const initialEras: Era[] = [
    {
        id: 'era_800_900',
        name: 'The Age of Whispers',
        startDate: '0800-01-01',
        endDate: '0899-12-31',
    },
    {
        id: 'era_900_1000',
        name: 'The Shattered Accord',
        startDate: '0900-01-01',
        endDate: '0999-12-31',
    }
];