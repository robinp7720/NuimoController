import { createBluetooth } from "node-ble";
import { EventEmitter } from 'events';

const characteristics = {
    BUTTON: "f29b1529-cb19-40f3-be5c-7241ecb82fd2",
    SCROLL: "f29b1528-cb19-40f3-be5c-7241ecb82fd2",
    TOUCH: "f29b1527-cb19-40f3-be5c-7241ecb82fd2",

    DISPLAY_INPUT: "f29b1524-cb19-40f3-be5c-7241ecb82fd1"
}

const PRIMARY_SERVICE_UUID = "f29b1525-cb19-40f3-be5c-7241ecb82fd2";
const DISPLAY_SERVICE_UUID = "f29b1523-cb19-40f3-be5c-7241ecb82fd1";

export const touchCodes = {
    SWIPE_LEFT: 0,
    SWIPE_RIGHT: 1,
    SWIPE_UP:  2,
    SWIPE_DOWN: 3,

    TOUCH_LEFT: 4,
    TOUCH_RIGHT: 5,
    TOUCH_UP: 6,
    TOUCH_DOWN: 7,

    LONG_RIGHT: 9,
    LONG_LEFT: 8,
    LONG_UP: 11,
    LONG_DOWN: 12,
};

export default class Index extends EventEmitter {
    /**
     *
     * @param {string} mac Mac Address of the Nuimo
     */
    constructor(mac) {
        super();

        this.mac = mac;

        this.state = {
            buttonDepressed: false
        }
    }

    async connect() {
        const adapter = await createBluetooth().bluetooth.defaultAdapter();

        if (!await adapter.isDiscovering()) await adapter.startDiscovery();

        const device = await adapter.waitDevice(this.mac);
        await device.connect();

        const gatt = await device.gatt();

        this.primaryService = await gatt.getPrimaryService(PRIMARY_SERVICE_UUID);
        this.displayService = await gatt.getPrimaryService(DISPLAY_SERVICE_UUID);

        await this.setupListeners();

        this.emit('connected');
    }

    async subscribeCharacteristic(uuid, callback) {
        const characteristic = await this.primaryService.getCharacteristic(uuid);
        await characteristic.startNotifications();
        characteristic.on('valuechanged', buffer => callback(buffer));
    }

    /**
     *
     * @param {Buffer} buffer
     * @return {Promise<void>}
     */
    async handleButton(buffer) {
        const depressed = buffer.readInt8() === 1;

        this.state.buttonDepressed = depressed;

        this.emit('button', {
            value: depressed,
            ...this.state
        });
    }

    /**
     *
     * @param {Buffer} buffer
     * @return {Promise<void>}
     */
    async handleScroll(buffer) {
        this.emit('scroll', {
            value: buffer.readInt16LE(),
            ...this.state
        });
    }

    /**
     *
     * @param {Buffer} buffer
     * @return {Promise<void>}
     */
    async handleTouch(buffer) {
        this.emit('touch', {
            value: buffer.readInt8(),
            ...this.state
        });
    }

    async setupListeners() {
        await this.subscribeCharacteristic(characteristics.BUTTON, (buffer) => this.handleButton(buffer));
        await this.subscribeCharacteristic(characteristics.SCROLL, (buffer) => this.handleScroll(buffer));
        await this.subscribeCharacteristic(characteristics.TOUCH, (buffer) => this.handleTouch(buffer));
    }


    async drawMatrix(matrix) {
        if (!matrix || matrix.length !== 81)
            throw new Error("Invalid matrix");

        const substrings = [];

        for (let i = 0; i < 80; i += 8) substrings.push(matrix.substr(i, 8));

        const array = substrings.map(leds => leds.split('').reduce((acc, led, index) => led !== " " ? acc + (1 << index) : acc, 0));

        array.push(16); // 16 if fading
        array.push(255); // brightness
        array.push(5); // interval

        const c = await this.displayService.getCharacteristic(characteristics.DISPLAY_INPUT);

        await c.writeValue(Buffer.from(new Uint8Array(array)));
    }
}
