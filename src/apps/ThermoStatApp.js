import NuimoApp from '../NuimoApp';

import MpdController from '../lib/MPDController';

import {matrixFromNumber, next, pause, play, previous} from '../images';
import {touchCodes} from '../lib/nuimo-sdk';

const mpd = new MpdController('localhost', 6600);

export default class ThermoStatApp extends NuimoApp {

    constructor(nuimo) {
        super(nuimo);

        this.appName = "Thermostat";
        this.appIcon =
              "    ██   "
            + "   █  █  "
            + "   ██ █  "
            + "   █  █  "
            + "   ██ █  "
            + "  █   ██ "
            + " █     █ "
            + " ██   ██ "
            + "  █████  ";

        this.discardPress = false;
        this.temperature = 0;
    }

    async handleVolumeScroll(event) {

    }

    async handleSeekScroll(event) {
        const acceleration = event.value;
        await mpd.seekRel(acceleration/20);
    }

    async handleScroll(event) {
        await super.handleScroll(event);

        this.discardPress = true;

        if (event.buttonDepressed) {
            return
        }

        const acceleration = event.value;
        let change = Math.ceil(acceleration/100);

        if (acceleration < 0) {
            change = Math.floor(acceleration/100);
        }

        this.temperature += change

        await this.nuimo.drawMatrix(matrixFromNumber(this.temperature));
    }

    async handleButton(event) {
        this.nuimo.drawMatrix(
            "         "
            + "    █    "
            + "  █ █ █  "
            + "   ███   "
            + " ███ ███ "
            + "   ███   "
            + "  █ █ █  "
            + "    █    "
            + "         ");
    }

    async handleTouch(event) {

    }
}
