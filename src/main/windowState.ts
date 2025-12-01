import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const STATE_FILE = 'window-state.json';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

const getStatePath = () => path.join(app.getPath('userData'), STATE_FILE);

export function loadWindowState(): WindowState | null {
  try {
    const statePath = getStatePath();
    if (fs.existsSync(statePath)) {
      const data = fs.readFileSync(statePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load window state:', error);
  }
  return null;
}

export function saveWindowState(state: WindowState) {
  try {
    const statePath = getStatePath();
    fs.writeFileSync(statePath, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}
