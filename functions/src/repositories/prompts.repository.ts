import { FirebaseRepository } from "./firebase.repository";


export class PromptsRepository extends FirebaseRepository<any> {
    constructor() {
        super('prompts');
    }

    async getPrompts(): Promise<any> {
        return await this.getAll();
    }
}