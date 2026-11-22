#!/usr/bin/env node
import { run } from '../src/cli.mjs';

const { code, stdout, stderr } = await run(process.argv.slice(2));
if (stdout) process.stdout.write(stdout + '\n');
if (stderr) process.stderr.write(stderr + '\n');
process.exit(code);
