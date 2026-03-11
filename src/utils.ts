import { exec } from "child_process";
import { promisify } from "util";

export const parseArrayOpts = (value: string, opts: string[]) => [...opts, value];
export const execAsync = promisify(exec);