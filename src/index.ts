import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';
import { file, directory } from 'gsof-simple-file-async';
import * as crypto from 'crypto';
import { v4 } from "uuid";

const zero = "\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000";

var _ctoken;
var _token;

async function exec(command: string): Promise<string> {
    let promise = new Promise<string>((resolve, rejecte) => {
        let token = child_process.exec(command, (err, stdout, stderr) => {
            resolve((stdout || '').trim());
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
        token = await exec('dmidecode -s system-uuid');
    }
    return token;
}

function getForMac(): Promise<string> {
    return exec("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { split($0, line, \"\\\"\"); printf(\"%s\\n\", line[4]); }'")
}

async function getCustomToken(): Promise<string> {
    if (_ctoken) {
        return Promise.resolve(_ctoken);
    }

    let tp = path.join(os.homedir(), '.token', 'customtoken');

    let token;
    let exists = await file.exists(tp);
    if (exists) {
        _ctoken = token = await file.readAllText(tp);
    }

    if (!token || token === zero) {
        _ctoken = token = createToken();

        if (!exists) {
            const dir = path.dirname(tp)
            await directory.createDirectory(dir);
        }
        await file.writeAllText(tp, _ctoken);
    }

    return token;
}

function createToken() {
    // let timestamp = Date.now();
    // let pid = process.pid;
    return v4();//createMd5(pid.toString() + timestamp.toString());
}

async function saveToken(token: string) {
    let tp = path.join(os.homedir(), '.token', 'token');
    let dir = path.dirname(tp);
    const exists = await file.exists(dir)
    if (!exists) {
        await directory.createDirectory(dir);
    }
    await file.writeAllText(tp, token);
}

async function getToken() {
    let tp = path.join(os.homedir(), '.token', 'token');
    let exists = await file.exists(tp);
    if (!exists) {
        return null;
    }
    return await file.readAllText(tp);
}

function createMd5(data: string) {
    const md5 = crypto.createHash('md5');
    return md5.update(data).digest('hex');
}

function checkToken(token) {
    return token && typeof token === 'string' && token !== zero
}

async function getSystemToken(): Promise<string> {
    let token = process.env["SYSTEMTOKEN"];
    if (typeof token === "string") {
        return token;
    }

    if (checkToken(_token)) {
        return _token;
    }

    token = await getToken();
    if (checkToken(token)) {
        return token && token.length > 36 ? token.substr(0, 36) : token;
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
    if (!token || token === '00000000-0000-0000-0000-000000000000' || token === zero || token.length < 32) {
        token = await getCustomToken();
    }

    if (token && token.length > 36) {
        token = token.substr(0, 36);
    }

    _token = token;
    //let result = createMd5(token);
    saveToken(token);

    return token;
}

export { getSystemToken };