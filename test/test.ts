import { getSystemToken } from '../';

async function test() {
    console.time('start');
    let token = await getSystemToken();
    console.timeEnd('start');
    console.log(token);
}

test();
