import { load } from 'js-yaml';
import { readFileSync, existsSync } from 'fs';

/**
 * Parses an instruction string/file path into a javascript object.
 *
 * @param {string} instructionString string/file path of instructions.
 */
export const parseInstructions = (instructionString: string): any[] => {
    if (existsSync(instructionString)) {
        instructionString = readFileSync(instructionString, { encoding: 'utf-8' });
    }

    return load(instructionString) as any[];
};