import { WorkerEntrypoint } from "cloudflare:workers";

export class EntrypointB extends WorkerEntrypoint {
	/*
	 * HTTP fetch
	 *
	 * Incoming HTTP requests to a Worker are passed to the fetch() handler
	 * as a Request object.
	 *
	 * see https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/
	 */
	async fetch(request) {
		return new Response("Hello from worker-🐝 fetch()");
	}

	/*
	 * Named method without parameters
	 */
	bee() {
		return "Hello from worker-🐝 bee()";
	}

	/*
	 * Named method with parameters
	 */
	busyBee(bee: string) {
		return `Hello busy ${bee}s from worker-🐝 busyBee(bee)`;
	}

	/*
	 * Cron Triggers
	 *
	 * When a Worker is invoked via a Cron Trigger, the scheduled() handler
	 * handles the invocation.
	 *
	 * see https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
	 */
	async scheduled() {
		console.log("Hello from worker-🐝 scheduled()");
	}
}

export default class extends WorkerEntrypoint {
	async fetch(request) {
		return new Response("Hello from worker-🐝 default entrypoint fetch()");
	}
}
