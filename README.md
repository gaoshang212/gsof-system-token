# gsof-system-token

[![npm version](https://badge.fury.io/js/gsof-system-token.svg)](https://badge.fury.io/js/gsof-system-token)
<br>
The nodejs or electron library for system token

## Installation

Using npm:

```shell
$ npm install --save gsof-system-token
```

## Example

```javascript
const { getSystemToken } = reuqire("gsof-system-token");

// use await
const token = await getSystemToken();

// use then
getSystemToken().then((token) => {
  // do something
});
```