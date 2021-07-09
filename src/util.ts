export const isDebug: () => boolean = () =>
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")
