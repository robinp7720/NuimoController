import mpd from 'mpd';

import { EventEmitter } from 'events'

export default class Index extends EventEmitter {
    constructor(host, port) {
        super()

        this.client = mpd.connect({host, port});

        this.data = {};

        this.client.on('system', () => {
            this.update();
        });

        this.client.on('system-player', () => {
            this.update();
        });

        this.client.on('ready', () => {
            this.update();
        });
    }

    sendCommand(command, args) {
        return new Promise((resolve, reject) => {
            this.client.sendCommand(mpd.cmd(command, args), function (err, msg) {
                if (err) reject(err);
                resolve(msg);
            });
        });
    }

    async pause() {
        await this.sendCommand('pause', [1]);
    }

    async resume() {
        await this.sendCommand('pause', [0]);
    }

    async next() {
        await this.sendCommand('next', []);
    }

    async previous() {
        await this.sendCommand('previous', []);
    }

    async clearQueue() {
        await this.sendCommand('clear', []);
    }

    async volume(value) {
        if (value > 100) value = 100;
        if (value < 0) value = 0;

        await this.sendCommand('setvol', [value]);
    }

    async seekRel(value) {
        if (value >= 0)
            return await this.sendCommand('seekcur', ["+"+Math.abs(value)]);
        return await this.sendCommand('seekcur', ['-'+Math.abs(value)])
    }

    async currentVolume() {
        return this.data.volume;
    }

    async playing() {
        return this.data.state === 'play';
    }

    async removeFromQueue(id) {
        if (id === -1) {
            id = this.data.song;
        }

        await this.next();
        await this.sendCommand('delete', [id]);
    }

    update() {
        const oldData = this.data;

        return new Promise((resolve, reject) => {
            this.client.sendCommand(mpd.cmd('status', []), (err, msg) => {
                if (err) reject();
                let data = msg.split(/\n/g);

                for (let i in data) {
                    let item = data[i];
                    item = item.split(': ');
                    this.data[item[0]] = item[1];
                }

                resolve(msg);
            });
        });
    }
}
