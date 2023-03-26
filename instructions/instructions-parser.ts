import { load } from 'js-yaml';
import { readFileSync, existsSync } from 'fs';

/**
 * Parses an instruction string/file path into a javascript object.
 *
 * @param {string} instructionString string/file path of instructions.
 */
export const parseInstructions = (instructionString: string): any[] => {
    console.log('parsing instructions: ', instructionString);
    if (existsSync(instructionString)) {
        instructionString = readFileSync(instructionString, { encoding: 'utf-8' });
    }

    return load(instructionString) as any[];
};

export const argToList = (items: string | string[]): string[] => {
    if (!items) {
        return [];
    }

    if (Array.isArray(items)) {
        return items;
    }

    return items.split(',');
};