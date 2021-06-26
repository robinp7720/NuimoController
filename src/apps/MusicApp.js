import NuimoApp from '../NuimoApp';

import MpdController from '../lib/MPDController';

import {matrixFromNumber, next, pause, play, previous} from '../images';
import {touchCodes} from '../lib/nuimo-sdk';

const mpd = new MpdController('localhost', 6600);

export default class MusicApp extends NuimoApp {

    constructor(nuimo) {
        super(nuimo);

        this.appName = "Music";
        this.appIcon =
              "  █████  "
            + "  █████  "
            + "  █   █  "
            + "  █   █  "
            + "  █   █  "
            + " ██  ██  "
            + "███ ███  "
            + " █   █   "
            + "         ";

        this.discardPress = false;
    }

    async handleVolumeScroll(event) {
        const acceleration = event.value;
        let change = Math.ceil(acceleration/100);

        if (acceleration < 0) {
            change = Math.floor(acceleration/100);
        }

        await mpd.volume(await mpd.currentVolume() - - change);

        await this.nuimo.drawMatrix(matrixFromNumber(- - await mpd.currentVolume()));
    }

    async handleSeekScroll(event) {
        const acceleration = event.value;
        await mpd.seekRel(acceleration/20);
    }

    async handleScroll(event) {
        await super.handleScroll(event);

        this.discardPress = true;

        if (!event.buttonDepressed) {
            await this.handleVolumeScroll(event);
            return
        }

        await this.handleSeekScroll(event);
    }

    async handleButton(event) {
        if (event.value)
            this.discardPress = false;

        if (event.value) return;
        if (this.discardPress) return;

        if (await mpd.playing()) {
            await this.nuimo.drawMatrix(pause);
            await mpd.pause();
            return;
        }
        await this.nuimo.drawMatrix(play);
        await mpd.resume();
    }

    async handleTouch(event) {
        if (event.value === touchCodes.SWIPE_RIGHT) {
            await this.nuimo.drawMatrix(next);
            await mpd.next();
        }

        if (event.value === touchCodes.SWIPE_LEFT) {
            await this.nuimo.drawMatrix(previous)
            await mpd.previous();
        }
    }
}
