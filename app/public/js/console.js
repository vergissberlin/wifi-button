const HANDSHAKE = String.fromCodePoint(0x1f91d);
const MAG = String.fromCodePoint(0x1f50e);
const ROCKET = String.fromCodePoint(0x1f680);

const URL_ISSUES = 'https://wifi-button.com/Wifi-Button-org/Wifi-Button/-/issues';
const URL_ISSUES_NEW = 'https://Wifi-Button.com/Wifi-Button-org/Wifi-Button/-/issues/new';

const logHello = () => {
    // eslint-disable-next-line no-console
    console.log(
        `%c🔴 Welcome to Wifi-Button!%c

Does this page need fixes or improvements? Open an issue or contribute a merge request to help make Wifi-Button more lovable. At Wifi-Button, everyone can contribute!

🤝 Contribute to Wifi-Button:\t\thttps://rebrand.ly/wb-contribute
🐛 Create a new Wifi-Button issue:\thttps://rebrand.ly/wb-issue
🚀 Launch a new ESP-Button:\t\t\thttps://rebrand.ly/esp-web-tools
`,
        `padding-top: 0.5em; font-size: 2em;`,
        'padding-bottom: 0.5em;',
    );
};
