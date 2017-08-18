import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as ap from 'appdata-path';
import * as fs from 'fs';
import { file, directory } from 'gsof-simple-file-async';
import * as crypto from 'crypto';

var _token;

async function exec(command: string): Promise<string> {
    let promise = new Promise<string>((resolve, rejecte) => {
        let token = child_process.exec(command, (err, stdout, stderr) => {
            resolve(stdout);
        });
    });
    return promise;
}

function getForWindows(): Promise<string> {
    let epath = path.join(__dirname, 'dmidecode.exe');
    return exec(`${epath} -s system-uuid`);
}

async function getForLinux(): Promise<string> {
    let token = await exec('hal-get-property --udi /org/freedesktop/Hal/devices/computer --key system.hardware.uuid');
    if (!token) {
        token = await exec('dmidecode -s system-uui');
    }
    return token;
}

function getForMac(): Promise<string> {
    return exec("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { split($0, line, \"\\\"\"); printf(\"%s\\n\", line[4]); }'")
}

async function getCustomToken(): Promise<string> {
    if (_token) {
        return Promise.resolve(_token);
    }

    let tp = path.join(os.homedir(), '.token', 'token');

    let token;
    let exists = await file.exists(tp);
    if (exists) {
        _token = token = await file.readAllText(tp);
    }

    if (!token) {
        _token = token = createToken();

        if (!exists) {
            const dir = path.dirname(tp)
            await directory.createDirectory(dir);
        }
        await file.writeAllText(tp, _token);
    }

    return token;
}

function createToken() {
    let timestamp = Date.now();
    let pid = process.pid;
    return createMd5(pid.toString() + timestamp.toString());
}

function createMd5(data: string) {
    const md5 = crypto.createHash('md5');
    return md5.update(data).digest('hex');
}

async function getSystemToken(): Promise<string> {
    let token = process.env["SYSTEMTOKEN"];
    if (typeof token === "string") {
        return token;
    }

    switch (os.platform()) {
        case "win32":
            token = await getForWindows();
            break;
        case "darwin":
            token = await getForMac();
            break;
        case "linux":
            token = await getForLinux();
            break;
    }

    //00000000-0000-0000-0000-000000000000
    if (!token || token === '00000000-0000-0000-0000-000000000000' || token.length < 32) {
        token = await getCustomToken();
    }

    return createMd5(token);
}

export { getSystemToken };