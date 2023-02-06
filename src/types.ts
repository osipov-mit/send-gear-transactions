import { ProgramMetadata } from '@gear-js/api';

export interface IProgram {
  name: string;
  path_to_wasm: string;
  path_to_meta: string;
  init_payload: any;
  value?: number;
  address: `0x${string}`;
  meta: ProgramMetadata;
}
