import NuimoSdk from "./lib/nuimo-sdk"
import {touchCodes} from './lib/nuimo-sdk';
import MpdController from './lib/MPDController'

import {music, numbers, play, pause, next, previous, matrixFromNumber} from './images';
import MusicApp from './apps/MusicApp';
import LightsApp from './apps/LightsApp';
import ThermoStatApp from './apps/ThermoStatApp';
import ProjectorApp from './apps/ProjectorApp';

(async () => {
    const nuimo = new NuimoSdk("EF:AE:62:A9:4B:47");
    const mpd = new MpdController('localhost', 6600)

    await nuimo.connect();

    let apps = [
        new MusicApp(nuimo),
        new LightsApp(nuimo),
        new ThermoStatApp(nuimo),
        new ProjectorApp(nuimo)
    ]

    let activeApp = 0;

    function activateApp(app) {
        if (app > apps.length - 1) app = apps.length - 1;
        if (app < 0) app = 0;

        console.log('Activating app', apps[app].appName);
        activeApp = app;
        nuimo.drawMatrix(apps[activeApp].appIcon)
    }

    activateApp(0);

    nuimo.on('scroll', async (event) => {
        await apps[activeApp].handleScroll(event);
    })

    nuimo.on('button', async (event) => {
        await apps[activeApp].handleButton(event);
    })

    nuimo.on('touch', async (event) => {
        if (event.value === touchCodes.LONG_RIGHT) {
            activateApp(activeApp + 1);
            return;
        }

        if (event.value === touchCodes.LONG_LEFT) {
            activateApp(activeApp - 1);
            return;
        }

        await apps[activeApp].handleTouch(event);
    })

})();

/*(async () => {
    const nuimo = new NuimoSdk("EF:AE:62:A9:4B:47");
    const mpd = new MpdController('localhost', 6600)

    await nuimo.connect();

    let discardPress = false;

    let pageVector = 0;
    let lastPage = 0;

    let pages = [music, play, pause];

    async function handleVolumeScroll(event) {
        const acceleration = event.value;
        let change = Math.ceil(acceleration/100);

        if (acceleration < 0) {
            change = Math.floor(acceleration/100);
        }

        await mpd.volume(await mpd.currentVolume() - - change);

        await nuimo.drawMatrix(matrixFromNumber(- - await mpd.currentVolume()));
    }

    async function handleSeekScroll(event) {
        const acceleration = event.value;
        await mpd.seekRel(acceleration/20);
    }

    nuimo.on('scroll', async (event) => {
        discardPress = true;
        const acceleration = event.value;

        if (!event.buttonDepressed) {
            await handleVolumeScroll(event);
            return
        }

        //if (page === 1) {
            await handleSeekScroll(event);
        //}

    })

    nuimo.on('button', async (event) => {
        if (event.value)
            discardPress = false;

        if (event.value) return;
        if (discardPress) return;

        if (await mpd.playing()) {
            await nuimo.drawMatrix(pause);
            await mpd.pause();
            return;
        }
        await nuimo.drawMatrix(play);
        await mpd.resume();
    })

    nuimo.on('touch', async (event) => {
        if (event.value === touchCodes.SWIPE_RIGHT) {
            await nuimo.drawMatrix(next);
            await mpd.next();
        }

        if (event.value === touchCodes.SWIPE_LEFT) {
            await nuimo.drawMatrix(previous)
            await mpd.previous();
        }
    })

    setInterval(async () => {

    }, 10000);

})();

*/
