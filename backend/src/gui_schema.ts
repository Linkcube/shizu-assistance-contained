import { buildSchema } from "graphql";

export const GUI_SCHEMA = buildSchema(`
type Query {
    guiGetFiles: [fileObject]
    guiGetLogoFiles: [fileObject]
    guiGetRecordingFiles: [fileObject]
    guiGetThemeFiles: [fileObject]
    guiGetThemes: [themeObject]
    guiGetEvents: [eventObject]
    guiGetDjs: [djObject]
    guiGetPromos: [promoObject]
    guiGetFile(file_name: String!): fileObject
    guiGetTheme(theme_name: String!): themeObject
    guiGetEvent(event_name: String!): eventObject
    guiGetDj(dj_name: String!): djObject
    guiGetPromo(promo_name: String!): promoObject
    guiGetAppThemes: [appThemeObject]
    guiGetLogoPermissions(sub_dirs: [String]): fileDialogBlob
    guiGetRecordingPermissions(sub_dirs: [String]): fileDialogBlob
}
type Mutation {
    guiAddNewFile(
        name: String!,
        root: String,
        file_path: String,
        url_path: String): fileObject
    guiAddNewLogoFile(
        name: String!,
        file_path: String,
        url_path: String): fileObject
    guiAddNewRecordingFile(
        name: String!,
        file_path: String,
        url_path: String): fileObject
    guiAddNewThemeFile(
        name: String!,
        file_path: String,
        url_path: String): fileObject
    guiAddNewTheme(
        name: String!,
        overlay_file: String,
        stinger_file: String,
        starting_file: String,
        ending_file: String
    ): [themeObject]
    guiAddDj(
        name: String!,
        logo: String,
        recording: String,
        rtmp_server: String,
        rtmp_key: String,
        public_name: String,
        discord_id: String,
        past_events: [String]
    ): [djObject]
    guiAddPromo(
        name: String!,
        promo_file: String!
    ): [promoObject]
    guiAddEvent(
        name: String!,
        djs: [djLineupInput],
        promos: [String],
        theme: String,
        public: Boolean
    ): [eventObject]
    guiAddEventDj(
        event_name: String!,
        dj_data: djLineupInput
    ): [eventObject]
    guiAddEventPromo(
        event_name: String!,
        promo_name: String!
    ): [eventObject]
    guiUpdateFile(
        name: String!,
        root: String,
        file_path: String,
        url_path: String
    ): fileObject
    guiUpdateTheme(
        name: String!,
        overlay_file: String,
        stinger_file: String,
        starting_file: String,
        ending_file: String
    ): [themeObject]
    guiUpdateDj(
        name: String!,
        logo: String,
        recording: String,
        rtmp_server: String,
        rtmp_key: String,
        public_name: String,
        discord_id: String,
        past_events: [String]
    ): [djObject]
    guiUpdatePromo(
        name: String!,
        promo_file: String!
    ): [promoObject]
    guiUpdateEvent(
        name: String!,
        djs: [djLineupInput],
        promos: [String],
        theme: String,
        public: Boolean
    ): [eventObject]
    guiUpdateEventDj(
        event_name: String!,
        dj_name: String!,
        is_live: Boolean,
        vj: String
    ): [eventObject]
    guiRemoveEventDj(
        event_name: String!,
        dj_name: String!
    ): [eventObject]
    guiRemoveEventPromo(
        event_name: String!,
        promo_name: String!
    ): [eventObject]
    guiMoveEventDj(
        event_name: String!,
        index_a: Int!,
        index_b: Int!
    ): [eventObject]
    guiMoveEventPromo(
        event_name: String!,
        index_a: Int!,
        index_b: Int!
    ): [eventObject]
    guiDeleteFile(file_name: String!): [fileObject]
    guiDeleteTheme(theme_name: String!): [themeObject]
    guiDeleteEvent(event_name: String!): [eventObject]
    guiDeleteDj(dj_name: String!): [djObject]
    guiDeletePromo(promo_name: String!): [promoObject]
    guiExportEvent(event_name: String!): String
    guiImportLegacyLedger(ledger_path: String!): String
    guiImportLegacyEvents(lineups_path: String!): String
    guiAddAppTheme(name: String): [appThemeObject]
    guiEditAppTheme(
        name: String!,
        style: appThemeObjectInput!
    ): [appThemeObject]
    guiDeleteAppTheme(name: String!): [appThemeObject]
},
type djObject {
    name: String,
    logo: String,
    recording: String,
    rtmp_server: String,
    rtmp_key: String,
    public_name: String,
    discord_id: String,
    past_events: [String]
},
type djLineupObject {
    name: String,
    is_live: Boolean,
    vj: String
},
type eventObject {
    name: String,
    djs: [djLineupObject],
    promos: [String],
    theme: String,
    public: Boolean
},
type themeObject {
    name: String,
    overlay_file: String,
    stinger_file: String,
    starting_file: String,
    ending_file: String
},
type fileObject {
    name: String,
    root: String,
    file_path: String,
    url_path: String
},
type promoObject {
    name: String,
    promo_file: String
},
type appThemeObject {
    name: String,
    style: themeStyle
},
type themeStyle {
    primaryColor: String,
    secondaryColor: String,
    backgroundColor: String,
    primaryTextColor: String,
    secondaryTextColor: String,
    highlightColor: String,
    focusColor: String,
    activeColor: String,
    deleteColor: String,
    cancelTextColor: String,
    cancelBackgroundColor: String,
    submitTextColor: String,
    submitBackgroundColor: String
},
type fileDialogBlob {
    files: [fileBlob],
    path: [String],
    top_dir: String
},
type fileBlob {
    name: String,
    ext: String
    is_dir: Boolean
},
input djLineupInput {
    name: String,
    is_live: Boolean,
    vj: String
},
input appThemeObjectInput {
    primaryColor: String,
    secondaryColor: String,
    backgroundColor: String,
    primaryTextColor: String,
    secondaryTextColor: String,
    highlightColor: String,
    focusColor: String,
    activeColor: String,
    deleteColor: String,
    cancelTextColor: String,
    cancelBackgroundColor: String,
    submitTextColor: String,
    submitBackgroundColor: String
}
`);
