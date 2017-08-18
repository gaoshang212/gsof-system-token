import { getSystemToken } from '../';

async function test() {
    let token = await getSystemToken();
    console.log(token);
}

test();
