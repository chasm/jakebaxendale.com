import { readdir, unlink } from "node:fs/promises"
import { join } from "node:path"

async function clean(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) await clean(path)
		else if (entry.name === ".DS_Store") await unlink(path)
	}
}

await clean(new URL("../dist/", import.meta.url).pathname)
