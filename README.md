# gsof-system-token

[![npm version](https://badge.fury.io/js/gsof-system-token.svg)](https://badge.fury.io/js/gsof-system-token)
<br>
get the a system hardware unique uuid

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

## Description

- in Windows: use **dmidecode.exe**

```shell
dmidecode.exe -s system-uuid
```

- in Mac OS :

```shell
ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { split($0, line, \"\\\"\"); printf(\"%s\\n\", line[4]); }'
```

- in Linux

```shell
hal-get-property --udi /org/freedesktop/Hal/devices/computer --key system.hardware.uuid

#or

dmidecode -s system-uuid
```
