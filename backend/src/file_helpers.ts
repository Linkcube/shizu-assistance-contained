import { Dirent, createWriteStream, readdirSync } from "fs";
import { basename, extname, join, resolve, normalize, parse } from "path";
import { get } from "https";
import { ffprobe } from "fluent-ffmpeg";
import { urlToHttpOptions } from "url";
import {
  IDjObject,
  IFileBlob,
  IFileObject,
  ILegacyLedger,
  IPromoObject,
} from "./types";

/**
 * Ensures required environment variables are set for file system paths.
 * Throws an error if any of the following environment variables are not defined:
 * - DOCKER_LOGOS_PATH
 * - DOCKER_RECORDINGS_PATH
 * - DOCKER_THEMES_PATH
 * - DOCKER_EXPORT_PATH
 * - DOCKER_IMPORT_PATH
 * - DOCKER_GENERIC_VISUALS_PATH
 */
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
if (process.env.DOCKER_GENERIC_VISUALS_PATH === undefined)
  throw new Error("DOCKER_GENERIC_VISUALS_PATH is not set!");

export const LOGOS_ROOT = process.env.DOCKER_LOGOS_PATH;
export const RECORDINGS_ROOT = process.env.DOCKER_RECORDINGS_PATH;
export const THEMES_ROOT = process.env.DOCKER_THEMES_PATH;
export const EXPORT_ROOT = process.env.DOCKER_EXPORT_PATH;
export const VISUALS_ROOT = process.env.DOCKER_GENERIC_VISUALS_PATH;

/**
 * Map of root path identifiers to their corresponding directories.
 */
export const root_map = new Map([
  ["LOGOS", LOGOS_ROOT],
  ["RECORDINGS", RECORDINGS_ROOT],
  ["THEMES", THEMES_ROOT],
  ["EXPORT", EXPORT_ROOT],
  ["VISUALS", VISUALS_ROOT],
]);

/**
 * Retrieves local logo files from a specified subdirectory path.
 * @param sub_dirs - Array of directory names to navigate through
 * @returns Object containing filtered files, path array, and top directory name
 */
export const getLocalLogoFiles = (sub_dirs: string[]) => {
  console.log(sub_dirs);
  const new_path = join(LOGOS_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files: IFileBlob[]; path: string[]; top_dir: string } = {
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
      is_dir: file.isDirectory(),
    };
  });
  retval.path = sub_dirs;
  retval.top_dir = "Logos";

  return retval;
};

/**
 * Reconstructs a logo path from an array of directory components.
 * @param dirs - Array of directory names to join with the logos root
 * @returns Full reconstructed path string
 */
export const reconstructLogoPath = (dirs: string[]) => {
  return join(LOGOS_ROOT, ...dirs);
};

/**
 * Retrieves local recording files from a specified subdirectory path.
 * @param sub_dirs - Array of directory names to navigate through
 * @returns Object containing filtered files, path array, and top directory name
 */
export const getLocalRecordingFiles = (sub_dirs: string[]) => {
  const new_path = join(RECORDINGS_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files: IFileBlob[]; path: string[]; top_dir: string } = {
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
      is_dir: file.isDirectory(),
    };
  });
  retval.path = sub_dirs;
  retval.top_dir = "Recordings";

  return retval;
};

/**
 * Reconstructs a recording path from an array of directory components.
 * @param dirs - Array of directory names to join with the recordings root
 * @returns Full reconstructed path string
 */
export const reconstructRecordingPath = (dirs: string[]) => {
  return join(RECORDINGS_ROOT, ...dirs);
};

/**
 * Retrieves local theme files from a specified subdirectory path.
 * @param sub_dirs - Array of directory names to navigate through
 * @returns Object containing all files and path information
 */
export const getLocalThemeFiles = (sub_dirs: string[]) => {
  const new_path = join(THEMES_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files: IFileBlob[]; path: string[]; top_dir: string } = {
    files: [],
    path: sub_dirs,
    top_dir: "Themes",
  };
  retval.files = new_items.map((file) => {
    const parsed = parse(file.name);
    return {
      name: parsed.name,
      ext: parsed.ext,
      is_dir: file.isDirectory(),
    };
  });

  return retval;
};

/**
 * Reconstructs a theme path from an array of directory components.
 * @param dirs - Array of directory names to join with the themes root
 * @returns Full reconstructed path string
 */
export const reconstructThemePath = (dirs: string[]) => {
  return join(THEMES_ROOT, ...dirs);
};

/**
 * Retrieves local export directories from a specified subdirectory path.
 * @param sub_dirs - Array of directory names to navigate through
 * @returns Object containing filtered directories, path array, and top directory name
 */
export const getLocalExportDirs = (sub_dirs: string[]) => {
  const new_path = join(EXPORT_ROOT, ...sub_dirs);
  const new_items = readdirSync(new_path, { withFileTypes: true });

  const retval: { files: IFileBlob[]; path: string[]; top_dir: string } = {
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
      is_dir: file.isDirectory(),
    };
  });
  retval.path = sub_dirs;
  retval.top_dir = "Export";

  return retval;
};

/**
 * Reconstructs an export path from an array of directory components.
 * @param dirs - Array of directory names to join with the export root
 * @returns Full reconstructed path string
 */
export const reconstructExportPath = (dirs: string[]) => {
  return join(EXPORT_ROOT, ...dirs);
};

/**
 * Creates a static logo permission object for access control.
 * @returns Object containing ID and resolved path for logos directory
 */
export const staticLogoPermission = () => {
  const id = basename(LOGOS_ROOT);
  const path = resolve(LOGOS_ROOT);

  return {
    id,
    path,
  };
};

/**
 * Creates a static recording permission object for access control.
 * @returns Object containing ID and resolved path for recordings directory
 */
export const staticRecordingPermission = () => {
  const id = basename(RECORDINGS_ROOT);
  const path = resolve(RECORDINGS_ROOT);

  return {
    id,
    path,
  };
};

/**
 * Creates a static theme permission object for access control.
 * @returns Object containing ID and resolved path for themes directory
 */
export const staticThemePermission = () => {
  const id = basename(THEMES_ROOT);
  const path = resolve(THEMES_ROOT);

  return {
    id,
    path,
  };
};

/**
 * Fetches a file from a URL and saves it locally.
 * @param url - URL of the remote file to download
 * @param local_path - Local filesystem path where the file should be saved
 * @returns Promise that resolves when download completes or rejects on error
 */
export const fetchFile = (url: string, local_path: string) => {
  return new Promise((promise_resolve, reject) => {
    const file_url = new URL(url);
    const options = urlToHttpOptions(file_url);
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

/**
 * Gets the resolution of a video file.
 * @param file_path - Path to the video file
 * @returns Promise resolving with array of [width, height] or Error object
 */
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

/**
 * Normalizes a file path.
 * @param file_path - File path to normalize
 * @returns Normalized path string, or empty string if input is falsy
 */
export const resolvePath = (file_path: string | undefined) => {
  if (!file_path) return "";
  return normalize(file_path);
};

/**
 * Builds a map of all files within a directory structure.
 * @param path - Root path to traverse
 * @returns Map containing filename -> Dirent mapping for all files in the tree
 */
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

/**
 * Rebuilds legacy objects from a ledger into modern format.
 * @param ledger - Legacy ledger containing old DJ and promo data
 * @returns Object containing converted files, DJs, and promos
 */
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
        const trimmed_parent_path = file.parentPath.slice(
          LOGOS_ROOT.length + 1,
        );
        const new_file: IFileObject = {
          name: parsed_file.name,
          root: "LOGOS",
          file_path: join(trimmed_parent_path, file.name),
        };
        new_files.push(new_file);
        new_dj.logo = new_file.name;
      }
    }
    // TODO: Either toss this into event DJs or ignore entirely
    // if (dj.recording_path) {
    //   const parsed_file = parse(dj.recording_path);
    //   const file = recordings_file_map.get(parsed_file.base);
    //   if (file) {
    //     const trimmed_parent_path = file.parentPath.slice(
    //       RECORDINGS_ROOT.length + 1,
    //     );
    //     const new_file: IFileObject = {
    //       name: parsed_file.name,
    //       root: "RECORDINGS",
    //       file_path: join(trimmed_parent_path, file.name),
    //     };
    //     new_files.push(new_file);
    //     new_dj.recording = new_file.name;
    //   }
    // }
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
        const trimmed_parent_path = file.parentPath.slice(
          RECORDINGS_ROOT.length + 1,
        );
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
