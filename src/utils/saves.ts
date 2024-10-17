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

function writeToStorage() {
  localStorage.setItem(`game-saves-v0`, JSON.stringify(saves));
}

export function saveSave(id: string, save: GameSave) {
  saves[id] = save;
  writeToStorage();
}

export function deleteSave(id: string) {
  delete saves[id];
  writeToStorage();
}

export function loadSave(id: string) {
  return saves[id];
}

export function hasSave(id: string) {
  return id in saves;
}
