import Verifier from '../../../../lib/scripts/plugins/verifier';
import Task from '../../src/task';
import {neonscan} from "hardhat"
import { StablePoolDeployment } from './input';

export default async (task: Task, force = false): Promise<void> => {
  const output = task.output({ ensure: false });

  if (force || !output.factory) {
    const input = task.input() as StablePoolDeployment;
    const factory = await task.deploy('StablePoolFactory', [input.vault]);
    task.save({ factory });
    await neonscan.verifier.verify('StablePoolFactory', factory.address, [input.vault])
    
  }
};
