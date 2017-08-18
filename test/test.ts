import { getDeviceToken } from '../';

async function test() {
    let token = await getDeviceToken();
    console.log(token);
}

test();
