"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemToken = void 0;
const child_process = require("child_process");
const path = require("path");
const os = require("os");
const gsof_simple_file_async_1 = require("gsof-simple-file-async");
const crypto = require("crypto");
const uuid_1 = require("uuid");
const zero = "\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000";
var _ctoken;
var _token;
function exec(command) {
    return __awaiter(this, void 0, void 0, function* () {
        let promise = new Promise((resolve, rejecte) => {
            child_process.exec(command, (err, stdout, stderr) => {
                resolve((stdout || '').trim());
            });
        });
        return promise;
    });
}
function execFile(path, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        let promise = new Promise((resolve, rejecte) => {
            child_process.execFile(path, args, { encoding: 'utf8' }, (err, stdout, stderr) => {
                resolve((stdout || '').trim());
            });
        });
        return promise;
    });
}
function getForWindows() {
    let epath = path.join(__dirname, 'dmidecode.exe');
    return execFile(epath, "-s", "system-uuid");
}
function getForLinux() {
    return __awaiter(this, void 0, void 0, function* () {
        let token = yield exec('hal-get-property --udi /org/freedesktop/Hal/devices/computer --key system.hardware.uuid');
        if (!token) {
            token = yield exec('dmidecode -s system-uuid');
        }
        return token;
    });
}
function getForMac() {
    return exec("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { split($0, line, \"\\\"\"); printf(\"%s\\n\", line[4]); }'");
}
function getCustomToken() {
    return __awaiter(this, void 0, void 0, function* () {
        if (_ctoken) {
            return Promise.resolve(_ctoken);
        }
        let tp = path.join(os.homedir(), '.token', 'customtoken');
        let token;
        let exists = yield gsof_simple_file_async_1.file.exists(tp);
        if (exists) {
            _ctoken = token = yield gsof_simple_file_async_1.file.readAllText(tp);
        }
        if (!token || token === zero) {
            _ctoken = token = createToken();
            try {
                if (!exists) {
                    const dir = path.dirname(tp);
                    yield gsof_simple_file_async_1.directory.createDirectory(dir);
                }
                gsof_simple_file_async_1.file.writeAllText(tp, _ctoken);
            }
            catch (err) {
                console.log(err);
            }
        }
        return token;
    });
}
function createToken() {
    // let timestamp = Date.now();
    // let pid = process.pid;
    return uuid_1.v4(); //createMd5(pid.toString() + timestamp.toString());
}
function saveToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        let tp = path.join(os.homedir(), '.token', 'token');
        let dir = path.dirname(tp);
        const exists = yield gsof_simple_file_async_1.file.exists(dir);
        try {
            if (!exists) {
                yield gsof_simple_file_async_1.directory.createDirectory(dir);
            }
            yield gsof_simple_file_async_1.file.writeAllText(tp, token);
        }
        catch (err) {
            console.log(err);
        }
    });
}
function getToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let tp = path.join(os.homedir(), '.token', 'token');
        let exists = yield gsof_simple_file_async_1.file.exists(tp);
        if (!exists) {
            return null;
        }
        let token = "";
        try {
            token = yield gsof_simple_file_async_1.file.readAllText(tp);
        }
        catch (err) {
            console.log(err);
        }
        return token;
    });
}
function createMd5(data) {
    const md5 = crypto.createHash('md5');
    return md5.update(data).digest('hex');
}
function checkToken(token) {
    return token && typeof token === 'string' && token !== zero;
}
function getSystemToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let token = process.env["SYSTEMTOKEN"];
        if (typeof token === "string") {
            return token;
        }
        if (checkToken(_token)) {
            return _token;
        }
        token = yield getToken();
        if (checkToken(token)) {
            return token && token.length > 36 ? token.substr(0, 36) : token;
        }
        switch (os.platform()) {
            case "win32":
                token = yield getForWindows();
                break;
            case "darwin":
                token = yield getForMac();
                break;
            case "linux":
                token = yield getForLinux();
                break;
        }
        //00000000-0000-0000-0000-000000000000
        if (!token || token === '00000000-0000-0000-0000-000000000000' || token === zero || token.length < 32) {
            token = yield getCustomToken();
        }
        if (token && token.length > 36) {
            token = token.substr(0, 36);
        }
        _token = token;
        //let result = createMd5(token);
        saveToken(token);
        return token;
    });
}
exports.getSystemToken = getSystemToken;
//# sourceMappingURL=index.js.map