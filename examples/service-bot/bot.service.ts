import { Injectable } from '../../src'

@Injectable()
export class LogService {

    info(text) {
        console.log('INFO: ', text);
    }

    error(error) {
        console.log('ERROR: ', error);
    }

}

@Injectable()
export class BotService {

    constructor(private readonly logger: LogService) {}

    sayHello() {
        this.logger.info('call sayHello');
        return 'Hello from BotService';
    }

}
