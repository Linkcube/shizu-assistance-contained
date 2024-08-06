import { Dirent, createWriteStream, readdirSync } from "fs";
import { basename, extname, join, resolve, normalize, parse } from "path";
import { get } from "https";
import { ffprobe } from "fluent-ffmpeg";
import { urlToHttpOptions } from "url";
import { IDjObject, IFileBlob, IFileObject, ILegacyLedger, IPromoObject } from "./types";

if (process.env.DOCKER_LOGOS_PATH === undefined)
  throw new Error("DOCKER_LOGOS_PATH is not set!");
if (process.env.DOCKER_RECORDINGS_PATH === undefined)
  throw new Error("RECORDINGS_ROOT is not set!");
if (process.env.DOCKER_THEMES_PATH === undefined)
  throw new Error("THEMES_ROOT is not set!");
if (process.env.DOCKER_EXPORT_PATH === undefined)
  throw new Error("EXPORT_ROOT is not set!");
if (process.env.DOCKER_IMPORT_PATH === undefined)
  throw new Error("DOCKER_IMPORT_PATH is not set!");

export const LOGOS_ROOT = process.env.DOCKER_LOGOS_PATH;
export const RECORDINGS_ROOT = process.env.DOCKER_RECORDINGS_PATH;
export const THEMES_ROOT = process.env.DOCKER_THEMES_PATH;
export const EXPORT_ROOT = process.env.DOCKER_EXPORT_PATH;

export const root_map = new Map([
  ["LOGOS", LOGOS_ROOT],
  ["RECORDINGS", RECORDINGS_ROOT],
  ["THEMES", THEMES_ROOT],
  ["EXPORT", EXPORT_ROOT],
]);

export const getLocalLogoFiles = (sub_dirs: string[]) => {
  const new_path = join(LOGOS_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files:IFileBlob[]; path: string[]; top_dir: string } = {
    files: [],
    path: [],
    top_dir: "",
  };
  const filtered_files = new_items.filter((file) => {
    return (
      [
        ".png",
        ".jpg",
        ".jpeg",
        ".apng",
        ".gif",
        ".webp",
        ".svg",
        ".avif",
      ].includes(extname(file.name)) || file.isDirectory()
    );
  });
  retval.files = filtered_files.map((file) => {
    const parsed = parse(file.name);
    return {
      name: parsed.name,
      ext: parsed.ext,
      is_dir: file.isDirectory()
    }
  });
  retval.path = sub_dirs;
  retval.top_dir = "Logos";

  return retval;
};

export const reconstructLogoPath = (dirs: string[]) => {
  return join(LOGOS_ROOT, ...dirs);
};

export const getLocalRecordingFiles = (sub_dirs: string[]) => {
  const new_path = join(RECORDINGS_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files:IFileBlob[]; path: string[]; top_dir: string } = {
    files: [],
    path: [],
    top_dir: "",
  };
  const filtered_files = new_items.filter((file) => {
    return (
      [
        ".mkv",
        ".webm",
        ".avi",
        ".mov",
        ".mp4",
        ".mp3",
        ".wav",
        ".flac",
      ].includes(extname(file.name)) || file.isDirectory()
    );
  });
  retval.files = filtered_files.map((file) => {
    const parsed = parse(file.name);
    return {
      name: parsed.name,
      ext: parsed.ext,
      is_dir: file.isDirectory()
    }
  });
  retval.path = sub_dirs;
  retval.top_dir = "Recordings";

  return retval;
};

export const reconstructRecordingPath = (dirs: string[]) => {
  return join(RECORDINGS_ROOT, ...dirs);
};

export const getLocalThemeFiles = (sub_dirs: string[]) => {
  const new_path = join(THEMES_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files:IFileBlob[]; path: string[]; top_dir: string } = {
    files: [],
    path: sub_dirs,
    top_dir: "Themes",
  };
  retval.files = new_items.map((file) => {
    const parsed = parse(file.name);
    return {
      name: parsed.name,
      ext: parsed.ext,
      is_dir: file.isDirectory()
    }
  });

  return retval;
};

export const reconstructThemePath = (dirs: string[]) => {
  return join(THEMES_ROOT, ...dirs);
};

export const getLocalExportDirs = (sub_dirs: string[]) => {
  const new_path = join(EXPORT_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files:IFileBlob[]; path: string[]; top_dir: string } = {
    files: [],
    path: [],
    top_dir: "",
  };
  const filtered_files = new_items.filter((file) => file.isDirectory());
  retval.files = filtered_files.map((file) => {
    const parsed = parse(file.name);
    return {
      name: parsed.name,
      ext: parsed.ext,
      is_dir: file.isDirectory()
    }
  });
  retval.path = sub_dirs;
  retval.top_dir = "Export";

  return retval;
};

export const reconstructExportPath = (dirs: string[]) => {
  return join(EXPORT_ROOT, ...dirs);
};

export const staticLogoPermission = () => {
  const id = basename(LOGOS_ROOT);
  const path = resolve(LOGOS_ROOT);

  return {
    id,
    path,
  };
};

export const staticRecordingPermission = () => {
  const id = basename(RECORDINGS_ROOT);
  const path = resolve(RECORDINGS_ROOT);

  return {
    id,
    path,
  };
};

export const staticThemePermission = () => {
  const id = basename(THEMES_ROOT);
  const path = resolve(THEMES_ROOT);

  return {
    id,
    path,
  };
};

export const fetchFile = (url: string, local_path: string) => {
  return new Promise((promise_resolve, reject) => {
    const file_url = new URL(url);
    const options = urlToHttpOptions(file_url);
    // TODO: move into envs/configs
    options.auth = process.env.FILE_SERVER_AUTHORIZATION;
    // TODO: switch on http/https
    const file = createWriteStream(local_path);
    get(options, (response) => {
      // TODO: error on 403
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        promise_resolve(null);
      });
      response.on("error", (err) => {
        file.destroy();
        promise_resolve(err);
      });
    });
  });
};

export const getResolution = (file_path: string): Promise<number[] | Error> => {
  if (!file_path)
    return new Promise((promise_resolve, _) => promise_resolve([]));
  file_path = resolvePath(file_path);
  return new Promise((promise_resolve, reject) => {
    ffprobe(file_path, (err, metadata) => {
      if (err) {
        console.log(err);
        promise_resolve(new Error(`Invalid file selected for ${file_path}.`));
      }
      if (metadata && metadata.streams) {
        const video_stream = metadata.streams.filter(
          (stream) => stream.codec_type === "video",
        );
        if (video_stream) {
          promise_resolve(
            video_stream.map((stream) => [stream.width!, stream.height!])[0],
          );
        }
      }
      promise_resolve([]);
    });
  });
};

export const resolvePath = (file_path: string | undefined) => {
  if (!file_path) return "";
  return normalize(file_path);
};

const buildFileMap = (path: string): Map<string, Dirent> => {
  const top_files = readdirSync(path, { withFileTypes: true });
  let this_map = new Map();
  const dirs = [];
  for (const file of top_files) {
    file.parentPath = path;
    if (file.isDirectory()) {
      dirs.push(file);
    } else {
      this_map.set(file.name, file);
    }
  }

  for (const dir of dirs) {
    const sub_map = buildFileMap(join(path, dir.name));
    this_map = new Map([...this_map, ...sub_map]);
  }

  return this_map;
};

export const rebuildLegacyObjects = (ledger: ILegacyLedger) => {
  const new_djs: IDjObject[] = [];
  const new_promos: IPromoObject[] = [];
  const new_files: IFileObject[] = [];

  // Build file maps for mounts
  const logos_file_map = buildFileMap(LOGOS_ROOT);
  const recordings_file_map = buildFileMap(RECORDINGS_ROOT);

  // Find matching files for legacy objects, and bulid new objects
  ledger.djs.forEach((dj) => {
    const new_dj: IDjObject = {
      name: dj.name,
      rtmp_server: dj.rtmp_server,
      rtmp_key: dj.stream_key,
    };
    if (dj.logo_path) {
      const parsed_file = parse(dj.logo_path);
      const file = logos_file_map.get(parsed_file.base);
      if (file) {
        let trimmed_parent_path = file.parentPath.slice(LOGOS_ROOT.length+1)
        const new_file: IFileObject = {
          name: parsed_file.name,
          root: "LOGOS",
          file_path: join(trimmed_parent_path, file.name),
        };
        new_files.push(new_file);
        new_dj.logo = new_file.name;
      }
    }
    if (dj.recording_path) {
      const parsed_file = parse(dj.recording_path);
      const file = recordings_file_map.get(parsed_file.base);
      if (file) {
        let trimmed_parent_path = file.parentPath.slice(RECORDINGS_ROOT.length+1)
        const new_file: IFileObject = {
          name: parsed_file.name,
          root: "RECORDINGS",
          file_path: join(trimmed_parent_path, file.name),
        };
        new_files.push(new_file);
        new_dj.recording = new_file.name;
      }
    }
    new_djs.push(new_dj);
  });
  ledger.promos.forEach((promo) => {
    const new_promo: IPromoObject = {
      name: promo.name,
    };
    if (promo.path) {
      const parsed_file = parse(promo.path);
      const file = recordings_file_map.get(parsed_file.base);
      if (file) {
        let trimmed_parent_path = file.parentPath.slice(RECORDINGS_ROOT.length+1)
        const new_file: IFileObject = {
          name: parsed_file.name,
          root: "RECORDINGS",
          file_path: join(trimmed_parent_path, file.name),
        };
        new_files.push(new_file);
        new_promo.promo_file = new_file.name;
      }
    }
    new_promos.push(new_promo);
  });

  return {
    files: new_files,
    djs: new_djs,
    promos: new_promos,
  };
};
