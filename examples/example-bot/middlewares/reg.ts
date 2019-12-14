import { Middleware } from '../../../src';
import { DBService } from '../services';

@Middleware()
export class Reg {

    constructor(private readonly db: DBService) {}

    handler(ctx, next) {
        if (ctx.session.user) {
            return next();
        }

        ctx.session.user = this.db.find(ctx.from.id) || this.db.save(ctx.from.id, { id: ctx.from.id, username: ctx.from.username })

        next();
    }

}
