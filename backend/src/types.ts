// TS types

export interface IColumnDefinition {
  name: string;
  type: string;
  fkey?: string;
  multi_col?: boolean;
  no_updates?: boolean;
}

export interface IFileObject {
  name: string;
  root?: string;
  file_path?: string;
  url_path?: string;
}

export interface IThemeObject {
  name: string;
  overlay_file?: string;
  stinger_file?: string;
  starting_file?: string;
  ending_file?: string;
  target_video_width?: number;
  target_video_height?: number;
  video_offset_x?: number;
  video_offset_y?: number;
  chat_width?: number;
  chat_height?: number;
  chat_offset_x?: number;
  chat_offset_y?: number;
}

export interface IEventObject {
  name: string;
  promos?: string[];
  theme?: string;
  date?: string;
  start_time?: string;
  public?: boolean;
}

export interface IDjObject {
  name: string;
  logo?: string;
  rtmp_server?: string;
  rtmp_key?: string;
  public_name?: string;
  discord_id?: string;
  past_events?: string[];
}

export interface IPromoObject {
  name: string;
  promo_file?: string;
}

// Now only for UI use
export interface ILineupDjObject {
  name: string;
  is_live?: boolean;
  vj?: string;
  recording?: string;
}

export interface IEventDjObject {
  event: string;
  dj: string;
  position: number;
  is_live?: boolean;
  vj?: string;
  recording?: string;
}

export interface IExportDjineupData {
  name: string;
  logo_path: string;
  recording_path: string;
  resolution: Promise<number[] | Error>;
  url: string;
  vj: string;
}

export interface IExportPromoLineupData {
  name: string;
  path: string;
  resolution: Promise<number[] | Error>;
}

export interface IExportThemeData {
  name: string;
  overlay?: string;
  starting?: string;
  stinger?: string;
  ending?: string;
  video_width?: number;
  video_height?: number;
  video_offset_x?: number;
  video_offset_y?: number;
  chat_width?: number;
  chat_height?: number;
  chat_offset_x?: number;
  chat_offset_y?: number;
}

export interface ILegacyLedger {
  djs: ILegacyDj[];
  promos: ILegacyPromo[];
}

export interface ILegacyDj {
  name: string;
  logo_path?: string;
  recording_path?: string;
  rtmp_server?: string;
  stream_key?: string;
  last_live_resolution?: number[];
}

export interface ILegacyPromo {
  name: string;
  path?: string;
}

export interface ILegacyLineupDj {
  name: string;
  is_live: boolean;
  url?: string;
  recording_path?: string;
  vj?: string;
}

export interface ILegacyLineup {
  djs: ILegacyLineupDj[];
  promos: string[];
}

export interface IFileBlob {
  name: string;
  ext: string;
  is_dir: boolean;
}
