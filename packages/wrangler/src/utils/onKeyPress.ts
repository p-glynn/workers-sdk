import readline from "readline";
import { Transform } from "stream";

type KeypressEvent = { name: string; ctrl: boolean };

export function onKeyPress(callback: (key: string) => void) {
	// Listening for events on process.stdin (eg .on('keypress')) causes it to go into 'old mode'
	// which keeps this nodejs process alive even after calling .off('keypress')
	// WORKAROUND: piping stdin via a transform stream allows us to call stream.destroy()
	// which then allows this nodejs process to close cleanly
	// https://nodejs.org/api/process.html#signal-events:~:text=be%20used%20in-,%22old%22%20mode,-that%20is%20compatible
	const stream = new Transform({
		transform(chunk, encoding, cb) {
			cb(null, chunk);
		},
	});
	process.stdin.pipe(stream);

	if (process.stdin.isTTY) {
		readline.emitKeypressEvents(stream);
		process.stdin.setRawMode(true);
	}

	const handler = async (char: string, key: KeypressEvent) => {
		if (key && key.ctrl && key.name == "c") {
			char = "CTRL+C";
		}

		if (char) {
			callback(char);
		}
	};

	stream.on("keypress", handler);

	return () => {
		process.stdin.setRawMode(false);
		stream.off("keypress", handler);
		stream.destroy();
	};
}
