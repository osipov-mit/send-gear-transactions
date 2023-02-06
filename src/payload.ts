import { IProgram } from './types';
import { KeyringPair } from '@polkadot/keyring/types';
import { decodeAddress } from '@gear-js/api';

const ACC_REGEX = /\$account \w+/g;
const PROG_REGEX = /\$program \d+/g;

export function getPayload(accounts: Record<string, KeyringPair>, programs: Record<number, IProgram>, payload: any) {
  let stringPayload = JSON.stringify(payload);

  const matchAcc = stringPayload.match(ACC_REGEX);
  const matchProg = stringPayload.match(PROG_REGEX);

  if (matchProg) {
    for (const match of matchProg) {
      const program = programs[Number(match.split(' ')[1])].address;
      stringPayload = stringPayload.replace(match, program);
    }
  }
  if (matchAcc) {
    for (const match of matchAcc) {
      const acc = decodeAddress(accounts[match.split(' ')[1]].address);
      stringPayload = stringPayload.replace(match, acc);
    }
  }
  return JSON.parse(stringPayload);
}
