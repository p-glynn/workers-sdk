import { existsSync } from "node:fs";
import chalk from "chalk";
import { dedent } from "ts-dedent";
import { logger } from "../../logger";

/**
 * Constructs a comprehensive log message for the user after generating runtime types.
 */
export function logRuntimeTypesMessage(
	outFile: string,
	tsconfigTypes: string[],
	isNodeCompat = false
) {
	const isWorkersTypesInstalled = tsconfigTypes.find((type) =>
		type.startsWith("@cloudflare/workers-types")
	);
	const isNodeTypesInstalled = tsconfigTypes.find((type) => type === "node");
	const updatedTypesString = buildUpdatedTypesString(tsconfigTypes, outFile);
	const maybeHasOldRuntimeFile = existsSync("./.wrangler/types/runtime.d.ts");
	if (maybeHasOldRuntimeFile) {
		logAction("Remove the old runtime.d.ts file");
		logger.log(
			chalk.dim(
				"`wrangler types` now outputs runtime and Env types in one file.\nYou can now delete the ./.wrangler/types/runtime.d.ts and update your tsconfig.json`"
			)
		);
		logger.log("");
	}
	if (isWorkersTypesInstalled) {
		logAction(
			"Migrate from @cloudflare/workers-types to generated runtime types"
		);
		logger.log(
			chalk.dim(
				"`wrangler types` now generates runtime types and supersedes @cloudflare/workers-types.\nYou should now uninstall @cloudflare/workers-types and remove it from your tsconfig.json."
			)
		);
		logger.log("");
	}
	if (updatedTypesString) {
		logAction("Update your tsconfig.json to include the generated types");
		logger.log(
			chalk.dim(dedent`
				{
					"compilerOptions": {
						"types": ${updatedTypesString}
					}
				}
		`)
		);
		logger.log("");
	}
	if (isNodeCompat && !isNodeTypesInstalled) {
		logAction("Install types@node");
		logger.log(
			chalk.dim(
				`Since you have the \`nodejs_compat\` flag, you should install Node.js types by running "npm i --save-dev @types/node${isWorkersTypesInstalled ? '@20.8.3".\nFor more details: https://developers.cloudflare.com/workers/languages/typescript/#known-issues' : '".'}`
			)
		);
		logger.log("");
	}

	logger.log(
		`📖 Read about runtime types\n` +
			`${chalk.dim("https://developers.cloudflare.com/workers/languages/typescript/#generate-types")}`
	);
}

/**
 * Constructs a string representation of the existing types array with the new types path appended to.
 * It removes any existing types that are no longer relevant.
 */
function buildUpdatedTypesString(
	types: string[],
	newTypesPath: string
): string | null {
	if (types.some((type) => type.includes(newTypesPath))) {
		return null;
	}

	const updatedTypesArray = types
		.filter(
			(type) =>
				!type.startsWith("@cloudflare/workers-types") &&
				!type.includes("./wrangler/types/runtime.d.ts")
		)
		.concat([newTypesPath]);

	return JSON.stringify(updatedTypesArray);
}

const logAction = (msg: string) => {
	logger.log(chalk.hex("#BD5B08").bold("Action required"), msg);
};
