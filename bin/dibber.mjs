#!/usr/bin/env node
// The `dibber` command's entry point ([DIB-7](../tickets/DIB-7.md)); the work is in src/cli.mjs.
import { run } from '../src/cli.mjs';

const { code, stdout, stderr } = await run(process.argv.slice(2));
if (stdout) process.stdout.write(stdout + '\n');
if (stderr) process.stderr.write(stderr + '\n');
process.exit(code);
