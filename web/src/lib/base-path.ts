// Where the site lives on the domain (site-path.json). "/test-website" while the placeholder
// holds the root; "" once the site launches. Next.js adds it to <Link>s and its own files;
// page URLs written by hand (canonical, social previews, plain <a>) go through page().
// Photos and fonts (/uploads, /media, /fonts) stay at the root either way.
import config from "../../site-path.json";

export const BASE_PATH: string = config.basePath;

/** A page path ("/", "/projects/x/") as it appears on the domain. */
export const page = (path: string) => `${BASE_PATH}${path}`;

/** True while the site is a preview behind the placeholder. */
export const IS_PREVIEW = BASE_PATH !== "";
