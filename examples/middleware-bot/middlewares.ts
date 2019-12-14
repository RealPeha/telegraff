import { Injectable, Middleware } from '../../src'

@Injectable()
export class LogService {

    info(text) {
        console.log('INFO: ', text);
    }

    error(error) {
        console.log('ERROR: ', error);
    }

}

// Middleware-класс
@Middleware()
export class LogMiddleware {

    constructor(private readonly logger: LogService) {}

    handler(ctx, next) {
        this.logger.info('42');
        next();
    }

}

// Middleware-функция
export const TestMiddleware = (ctx, next) => {
    console.log('TestMiddleware')
    next();
}
