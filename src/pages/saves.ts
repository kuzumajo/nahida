export type GameSave = {
  save_time: number;
  chapter: string;
  data: any;
};

let saves: Record<string, GameSave> = {};
try {
  const plain = localStorage.getItem(`game-saves-v0`);
  if (plain) saves = JSON.parse(plain);
} catch {}

export function saveSave(id: string, save: GameSave) {
  saves[id] = save;
  localStorage.setItem(`game-saves-v0`, JSON.stringify(saves));
}

export function loadSave(id: string) {
  return saves[id];
}

export function hasSave(id: string) {
  return id in saves;
}
