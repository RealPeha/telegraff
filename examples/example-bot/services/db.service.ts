import { Injectable } from '../../../src'

@Injectable()
export class DBService {

    private db = { test: 'as'};

    print() {
        console.log(this.db)
    }

    find(prop) {
        return this.db[prop];
    }

    save(prop, value) {
        this.db[prop] = value;
        return this.db[prop];
    }

    push(prop, value) {
        Array.isArray(this.db[prop]) ? this.db[prop].push(value) : this.save(prop, [value]);
    }
}
