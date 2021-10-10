// - ActiveModelSerializer forma que tem de mandar dados aninhados (com relacionamento pai - filho) de uma unica vez para a API
import { createServer, Factory, Model, Response, ActiveModelSerializer } from 'miragejs'
import faker from 'faker'

type User = {
	name: string;
	email: string;
	created_at: string;
}

export function makeServer() {
	const server = createServer({
		// serializers e quem determina como serao tratados os dados alterados
		serializers: {
			application: ActiveModelSerializer,
		},

		models: {
			user: Model.extend<Partial<User>>({})
		},

		factories: {
			user: Factory.extend({
				name(i: number) {
					return `user ${i + 1}`
				},
				email() {
					return faker.internet.email().toLowerCase();
				},
				createdAt() { // createdAt ja entende que é created_at pela factory
					return faker.date.recent(10);

				}
			})
		},

		seeds(server) {
			server.createList('user', 100)
		},

		routes() {

			this.namespace = 'api';
			this.timing = 750; // demora 750 ms, para simular um delay

			this.get('/users', function (schema, request) {
				const { page = 1, per_page = 10 } = request.queryParams

				const total = schema.all('user').length

				const pageStart = (Number(page) - 1) * Number(per_page)
				const pageEnd = pageStart + Number(per_page)

				const users = this.serialize(schema.all('user'))
					.users
					.sort((a, b) => a.created_at - b.created_at)
					.slice(pageStart, pageEnd)

				// retorna um header, para deixar o metadados (total de paginas) fora do corpo da listagem de user
				return new Response(
					200,
					{ 'x-total-count': String(total) }, // metadados
					{ users } // listagem
				)

			});
			this.get('/users/:id');
			this.post('/users');

			this.namespace = ''; // volta ao estado original, para o caso da pasta pages ter uma subpasta api, para nao dar conflito
			this.passthrough();
		}
	})

	return server;
}