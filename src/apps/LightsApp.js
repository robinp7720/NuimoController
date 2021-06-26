import NuimoApp from '../NuimoApp';

import {matrixFromNumber, next, pause, play, previous} from '../images';
import {touchCodes} from '../lib/nuimo-sdk';

import MiLight from 'milight'

const milight = new MiLight({
    host: '192.168.178.255',
    broadcast: true
});

export default class LightsApp extends NuimoApp {

    constructor(nuimo) {
        super(nuimo);

        this.appName = "Lights";

        this.appIcon =
              "         "
            + "   ███   "
            + "  █   █  "
            + "  █   █  "
            + "  █   █  "
            + "  ██ ██  "
            + "   ███   "
            + "         "
            + "  █████  ";


        this.discardPress = false;

        this.lightState = false;
        this.brightness = 0;

        this.allowUpdate = true;
    }

    async handleScroll(event) {
        const acceleration = event.value;
        let change = Math.ceil(acceleration/100);

        if (acceleration < 0) {
            change = Math.floor(acceleration/100);
        }

        this.brightness += change;

        if (this.brightness > 100) this.brightness = 100;
        if (this.brightness < 0) this.brightness = 0;

        await this.nuimo.drawMatrix(matrixFromNumber(this.brightness));

        if (this.allowUpdate) {
            milight.allZones().brightness(this.brightness);
            this.allowUpdate = false;
        }

        setTimeout(() => {
            this.allowUpdate = true;
            milight.allZones().brightness(this.brightness);
        }, 1000)
    }

    async handleButton(event) {
        if (event.value)
            this.discardPress = false;

        if (event.value) return;
        if (this.discardPress) return;

        if (this.lightState) {
            milight.allZones().off();
            this.lightState = false;
            return;
        }

        milight.allZones().on();
        this.lightState = true;
    }

    async handleTouch(event) {

    }
}
