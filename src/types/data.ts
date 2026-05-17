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
  heurepassage: string;
  last_update_fme: string;
}

export interface DataFile<T> {
  values: T[];
}
