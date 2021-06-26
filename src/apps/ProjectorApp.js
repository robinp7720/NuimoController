import NuimoApp from '../NuimoApp';

import SSH from 'simple-ssh';

import {matrixFromNumber, next, pause, play, previous} from '../images';
import {touchCodes} from '../lib/nuimo-sdk';

export default class ProjectorApp extends NuimoApp {

    constructor(nuimo) {
        super(nuimo);

        this.appName = "Projector";

        this.appIcon =
              "         "
            + "  █████  "
            + "  █   █  "
            + "  █   █  "
            + "  █   █  "
            + "  ██ ██  "
            + "  █████  "
            + "  █   █  "
            + "  █████  ";

        this.open = false;

    }

    async lowerScreen() {
        let ssh = new SSH({
            host: '192.168.178.89',
            user: 'pi',
            pass: 'raspberry'
        });

        ssh.exec('/home/pi/lower.sh', {
            out: function(stdout) {
                console.log('STDOUT', stdout);
            },
            err: function(stderr) {
                console.log('Error', stderr); // this-does-not-exist: command not found
            },
            exit: function(code) {
                console.log('EXiT', code);
                ssh.end();
            }
        }).start();
    }

    async raiseScreen() {
        let ssh = new SSH({
            host: '192.168.178.89',
            user: 'pi',
            pass: 'raspberry'
        });

        ssh.exec('/home/pi/raise.sh', {
            out: function(stdout) {
                console.log('STDOUT', stdout);
            },
            err: function(stderr) {
                console.log('Error', stderr); // this-does-not-exist: command not found
            },
            exit: function(code) {
                console.log('EXiT', code);
                ssh.end();
            }
        }).start();
    }

    async handleScroll(event) {

    }

    async handleButton(event) {
        if (event.value) return;

        if (this.open) {
            await this.raiseScreen();
            this.open = false;
            return
        }

        await this.lowerScreen();
        this.open = true;

    }

    async handleTouch(event) {

    }
}
