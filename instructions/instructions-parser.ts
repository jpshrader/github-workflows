import { load } from 'js-yaml';
import { readFileSync, existsSync } from 'fs';

export const parseInstructions = (instructionString: string): any[] => {
    if (existsSync(instructionString)) {
        instructionString = readFileSync(instructionString, { encoding: 'utf-8' });
    }

    return (load(instructionString) as any).instructions;
};