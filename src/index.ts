import { parse } from 'yaml';
import fs from 'fs';
import { GearApi } from '@gear-js/api';
import { waitReady } from '@polkadot/wasm-crypto';
import { fundAccounts, getAccounts } from './accounts';
import { getPrograms, uploadProgram } from './program';
import { getPayload } from './payload';
import { sendMessage } from './message';
import assert from 'assert';

const [pathToScheme] = process.argv.slice(2);
assert.notStrictEqual(pathToScheme, undefined, 'Path to scheme is not specified');

const schemeFile = fs.readFileSync(pathToScheme, 'utf-8');
const scheme = parse(schemeFile);

const main = async () => {
  await waitReady();
  const api = await GearApi.create();
  const accounts = getAccounts(scheme.accounts);
  const programs = getPrograms(scheme.programs);

  console.log(`[*] Fund accounts ${JSON.stringify(scheme.fund_accounts)}`);

  await fundAccounts(api, accounts, scheme.prefunded_account, scheme.fund_accounts);

  for (const { type, ...rest } of scheme.transactions) {
    const program = programs[rest.program];
    const acc = accounts[rest.account];

    if (type === 'upload') {
      console.log(`[*] Upload ${program.name}`);
      const { programId, meta } = await uploadProgram(
        api,
        acc,
        program.path_to_wasm,
        program.path_to_meta,
        getPayload(accounts, programs, program.init_payload),
        program.value,
      );
      console.log();
      program['address'] = programId;
      program['meta'] = meta;
      continue;
    }

    if (type === 'message') {
      const payload = getPayload(accounts, programs, rest.payload);
      console.log(`[*] Send message ${JSON.stringify(payload)} to ${program.name}`);
      await sendMessage(api, acc, program.address, program.meta, payload, rest.value, rest.increase_gas);
      console.log();
      continue;
    }
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
