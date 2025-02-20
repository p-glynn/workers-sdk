import { readFileSync } from "fs";
import { version } from "workerd";
import { logger } from "../logger";
import { generateEnvTypes } from ".";
import type { Config } from "../config";
import type { Entry } from "../deployment-bundle/entry";

export const checkTypesDiff = async (config: Config, entry: Entry) => {
	if (!entry.file.endsWith(".ts")) {
		return;
	}
	let maybeExistingTypesFile: string[];
	try {
		// Note: this checks the default location only
		maybeExistingTypesFile = readFileSync(
			"./worker-configuration.d.ts",
			"utf-8"
		).split("\n");
	} catch {
		return;
	}
	const existingEnvHeader = maybeExistingTypesFile.find((line) =>
		line.startsWith("// Generated by Wrangler by running")
	);
	const maybeExistingHash =
		existingEnvHeader?.match(/hash: (?<hash>.*)\)/)?.groups?.hash;
	const previousStrictVars = existingEnvHeader?.match(
		/--strict-vars(=|\s)(?<result>true|false)/
	)?.groups?.result;
	const previousEnvInterface = existingEnvHeader?.match(
		/--env-interface(=|\s)(?<result>[a-zA-Z][a-zA-Z0-9_]*)/
	)?.groups?.result;

	let newEnvHeader: string | undefined;
	try {
		const { envHeader } = await generateEnvTypes(
			config,
			{ strictVars: previousStrictVars === "false" ? false : true },
			previousEnvInterface ?? "Env",
			"worker-configuration.d.ts",
			entry,
			// don't log anything
			false
		);
		newEnvHeader = envHeader;
	} catch (e) {
		logger.error(e);
	}

	const newHash = newEnvHeader?.match(/hash: (?<hash>.*)\)/)?.groups?.hash;

	const existingRuntimeHeader = maybeExistingTypesFile.find((line) =>
		line.startsWith("// Runtime types generated with")
	);
	const newRuntimeHeader = `// Runtime types generated with workerd@${version} ${config.compatibility_date} ${config.compatibility_flags.sort().join(",")}`;

	const envOutOfDate = existingEnvHeader && maybeExistingHash !== newHash;
	const runtimeOutOfDate =
		existingRuntimeHeader && existingRuntimeHeader !== newRuntimeHeader;

	if (envOutOfDate || runtimeOutOfDate) {
		logger.log(
			"❓ It looks like your types might be out of date. Have you updated your config file since last running `wrangler types`?"
		);
	}
};
