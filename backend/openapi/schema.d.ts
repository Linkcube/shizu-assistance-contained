/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all files. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/logos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Returns a list of all logo files.
         * @description Server-side filtering of all files for logos only
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/recordings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Returns a list of all recording files.
         * @description Server-side filtering of all files for recordings only
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/themes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Returns a list of all theme files.
         * @description Server-side filtering of all files for themes only
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/{fileName}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    fileName: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["File"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/logo-permissions/{logoPath}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    logoPath: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FileDialogBlob"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/recording-permissions/{recordingPath}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    recordingPath: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FileDialogBlob"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/theme-permissions/{themePath}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    themePath: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FileDialogBlob"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/themes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all themes. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/themes/min": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all themes with minimal properties. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/themes/{themeName}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    themeName: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Theme"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/djs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all djs. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/djs/min": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all djs with minimal properties. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/djs/{djName}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    djName: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DJ"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all events. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/min": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all events with minimal properties. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/{eventName}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    eventName: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Event"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/promos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all promos. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/promos/min": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all promos with minimal properties. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/promos/{promoName}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    promoName: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Promo"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/app-themes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Returns a list of all app themes. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/app-themes/{appThemeName}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    appThemeName: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AppTheme"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        File: {
            /** @description File identifier */
            name?: string;
            /** @description Root directory of file, denotes intended use. */
            root?: string;
            /** @description Local path inside docker file mapping. */
            file_path?: string;
            /** @description Remote path for file, fetched at event export. */
            url_path?: string;
        };
        Files: components["schemas"]["File"][];
        Theme: {
            /** @description Theme identifier. */
            name?: string;
            /** @description Identifier for overlay theme file. */
            overlay_file?: string;
            /** @description Identifier for stinger theme file. */
            stinger_file?: string;
            /** @description Identifier for starting theme file. */
            starting_file?: string;
            /** @description Identifier for ending theme file. */
            ending_file?: string;
            /**
             * Format: int32
             * @description Pixel width for video files to be scaled to.
             */
            target_video_width?: number;
            /**
             * Format: int32
             * @description Pixel height for video files to be scaled to.
             */
            target_video_height?: number;
            /**
             * Format: int32
             * @description Pixel count for video files to horizontally offset by.
             */
            video_offset_x?: number;
            /**
             * Format: int32
             * @description Pixel count for video files to vertically offset by.
             */
            video_offset_y?: number;
            /**
             * Format: int32
             * @description Pixel width for overlay chat.
             */
            chat_width?: number;
            /**
             * Format: int32
             * @description Pixel height for overlay chat.
             */
            chat_height?: number;
            /**
             * Format: int32
             * @description Pixel count for overlay chat to horizontally offset by.
             */
            chat_offset_x?: number;
            /**
             * Format: int32
             * @description Pixel count for overlay chat to vertically offset by.
             */
            chat_offset_y?: number;
        };
        Themes: components["schemas"]["Theme"][];
        ThemeMin: {
            /** @description Theme identifier. */
            name?: string;
        };
        ThemesMin: components["schemas"]["ThemeMin"][];
        DJ: {
            /** @description DJ identifier. Used in streams if no logo or public_name is provided. */
            name?: string;
            /** @description Logo file identifier. */
            logo?: string;
            /** @description Recording file identifier. */
            recording?: string;
            /** @description Specific RTMP server to use for live streams. */
            rtmp_server?: string;
            /** @description RTMP key to use for live streams. */
            rtmp_key?: string;
            /** @description Public name for displaying in stream. Used if no logo is provided. */
            public_name?: string;
            /** @description Discord ID, used for bookkeeping and contact. */
            discord_id?: string;
            /** @description List of past events the DJ has performed in */
            past_events?: string[];
        };
        DJs: components["schemas"]["DJ"][];
        DJMin: {
            /** @description DJ identifier. Used in streams if no logo or public_name is provided. */
            name?: string;
            /** @description Logo file identifier. */
            logo?: string;
            /** @description Recording file identifier. */
            recording?: string;
            /** @description Specific RTMP server to use for live streams. */
            rtmp_server?: string;
        };
        DJsMin: components["schemas"]["DJMin"][];
        LineupDJ: {
            /** @description DJ identifier */
            name?: string;
            /** @description If the DJ is using a RTMP config for streaming. */
            is_live?: boolean;
            /** @description Present if the visuals for a DJ are done by a VJ. */
            vj?: string;
        };
        Event: {
            /** @description Event identifier */
            name?: string;
            /** @description Array of LineupDJ objects for an event, describes event specific values. */
            djs?: components["schemas"]["LineupDJ"][];
            /** @description Array of promotional video identifiers. */
            promos?: string[];
            /** @description Theme identifier to use for an event. */
            theme?: string;
            /** @description If the event has been announced. */
            public?: boolean;
            /** @description Date the event is to be aired, in YYYY/MM/DD. */
            date?: string;
            /** @description Time the event is to be aired, in 24hr HH:MM for eastern time. */
            start_time?: string;
        };
        Events: components["schemas"]["Event"][];
        EventMin: {
            /** @description Event identifier */
            name?: string;
        };
        EventsMin: components["schemas"]["EventMin"][];
        Promo: {
            /** @description Promo identifier */
            name?: string;
            /** @description File identifier. */
            promo_file?: string;
        };
        Promos: components["schemas"]["Promo"][];
        PromoMin: {
            /** @description Promo identifier */
            name?: string;
        };
        PromosMin: components["schemas"]["PromoMin"][];
        AppTheme: {
            /** @description App Theme identifier */
            name?: string;
            /** @description Color stylings for an App Theme. */
            style?: {
                /** @description Primary color used in a theme. */
                primaryColor?: string;
                /** @description Secondary color used in a theme. */
                secondaryColor?: string;
                /** @description Background color used in a theme. */
                backgroundColor?: string;
                /** @description Primary text color used in a theme. */
                primaryTextColor?: string;
                /** @description Secondary text color used in a theme. */
                secondaryTextColor?: string;
                /** @description Highlight color used in a theme. */
                highlightColor?: string;
                /** @description Focus color used in a theme. */
                focusColor?: string;
                /** @description Active color used in a theme. */
                activeColor?: string;
                /** @description Delete color used in a theme. */
                deleteColor?: string;
                /** @description Cancel text color used in a theme. */
                cancelTextColor?: string;
                /** @description Cancel background color used in a theme. */
                cancelBackgroundColor?: string;
                /** @description Submit text color used in a theme. */
                submitTextColor?: string;
                /** @description Submit background color used in a theme. */
                submitBackgroundColor?: string;
            };
        };
        AppThemes: components["schemas"]["AppTheme"][];
        FileBlob: {
            /** @description Name of the file */
            name?: string;
            /** @description Extension of the file, if present. */
            ext?: string;
            /** @description Whether the file is a directory. */
            is_dir?: boolean;
        };
        FileDialogBlob: {
            /** @description Array of FileBlobs, describing each file. */
            files?: components["schemas"]["FileBlob"][];
            /** @description File path broken into an array for each directory. */
            path?: string[];
            /** @description Parent directory the blob stems from, typically same as a File root. */
            top_dir?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
