import { ChildProcess, exec } from "child_process";
import { Observable } from "rxjs";
import treeKill from "tree-kill";

export const parseArrayOptions = (value: string, opts: string[]) => [...opts, value];

export const execAsync = (command: string) => {
    return new Observable<string>((subscriber) => {
        const proc = exec(command, (error, stdout, stderr) => {
            if (error) {
                subscriber.error(error);
                return;
            }

            subscriber.next(stdout);
            subscriber.complete();
        });

        const events: NodeJS.Signals[] = ['SIGINT', 'SIGBREAK'];
        const removeCallback = () => subscriber.complete();
        const removeEvents = () => {
            events.forEach(event => process.on(event, removeCallback));
            process.on('exit', removeCallback);

            return () => {
                events.forEach(event => process.off(event, removeCallback));
                process.off('exit', removeCallback);
            };
        };

        return () => {
            killProcess(proc);
            removeEvents();
        };
    });
}

export const killProcess = (proc: ChildProcess) => {
    if (proc.stdout) {
        proc.stdout.removeAllListeners();
    }

    if (proc.stderr) {
        proc.stderr.removeAllListeners();
    }

    proc.removeAllListeners();

    if (typeof proc.pid === 'number') {
        treeKill(proc.pid, 'SIGTERM');
        return;
    }

    proc.kill('SIGTERM');
}
