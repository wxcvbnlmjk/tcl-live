export interface Arret {
  id: number;
  nom: string;
  lat: number;
  lon: number;
}

export interface TclPassage {
  id: number;
  ligne: string;
  delaipassage: string;
  direction: string;
  idtarretdestination: number;
}

export interface DataFile<T> {
  values: T[];
}
