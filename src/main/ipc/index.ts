import { registerAIIPC } from './ai.ipc';
import { registerFileIPC } from './file.ipc';
import { registerDbIPC } from './db.ipc';
import { registerAppIPC } from './app.ipc';

export function registerAllIPC() {
  registerAIIPC();
  registerFileIPC();
  registerDbIPC();
  registerAppIPC();
}
