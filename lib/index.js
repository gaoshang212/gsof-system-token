"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const path = require("path");
const os = require("os");
const gsof_simple_file_async_1 = require("gsof-simple-file-async");
const crypto = require("crypto");
var _token;
function exec(command) {
    return __awaiter(this, void 0, void 0, function* () {
        let promise = new Promise((resolve, rejecte) => {
            let token = child_process.exec(command, (err, stdout, stderr) => {
                console.log(stdout);
                resolve(stdout);
            });
        });
        return promise;
    });
}
function getForWindows() {
    let epath = path.join(__dirname, 'dmidecode.exe');
    return exec(`${epath} -s system-uuid`);
}
function getForLinux() {
    return exec('hal-get-property --udi /org/freedesktop/Hal/devices/computer --key system.hardware.uuid');
}
function getForMac() {
    return exec("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { split($0, line, \"\\\"\"); printf(\"%s\\n\", line[4]); }'");
}
function getCustomToken() {
    return __awaiter(this, void 0, void 0, function* () {
        if (_token) {
            return Promise.resolve(_token);
        }
        let tp = path.join(os.homedir(), '.token', 'token');
        let token;
        let exists = yield gsof_simple_file_async_1.file.exists(tp);
        if (exists) {
            _token = token = yield gsof_simple_file_async_1.file.readAllText(tp);
        }
        if (!token) {
            _token = token = createToken();
            if (!exists) {
                const dir = path.dirname(tp);
                yield gsof_simple_file_async_1.directory.createDirectory(dir);
            }
            yield gsof_simple_file_async_1.file.writeAllText(tp, _token);
        }
        return token;
    });
}
function createToken() {
    let timestamp = Date.now();
    let pid = process.pid;
    return createMd5(pid.toString() + timestamp.toString());
}
function createMd5(data) {
    const md5 = crypto.createHash('md5');
    return md5.update(data).digest('hex');
}
function getSystemToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let token = process.env["SYSTEMTOKEN"];
        if (typeof token === "string") {
            return token;
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
        if (!token || token === '00000000-0000-0000-0000-000000000000' || token.length < 32) {
            token = yield getCustomToken();
        }
        return createMd5(token);
    });
}
exports.getSystemToken = getSystemToken;
//# sourceMappingURL=index.js.map