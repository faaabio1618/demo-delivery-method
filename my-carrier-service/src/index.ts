export interface Env {
	SHIPPING_CONFIGURATION: KVNamespace;
}

type RateConf = {
	min_weight_kg: number,
	max_weight_kg: number,
	price: number,
	service: string
}

type RatesConf = {
	'rates': RateConf[]
}

type CarrierServiceResponse = {
	rates: {
		currency: string,
		description: string, // if left empty is not shown
		service_code: string,
		service_name: string, // this is what is shown at checkout
		weight_min_lb?: number, //if not specified, no limit is applied
		weight_max_lb?: number, //if not specified, no limit is applied
		total_price?: number
	}[]
}
const DEFAULT_RATES: RatesConf = {
	'rates': [{
		'min_weight_kg': 0,
		'max_weight_kg': 0.1,
		'price': 5,
		'service': 'Carrier 1'
	}, {
		'min_weight_kg': 0.1,
		'max_weight_kg': 0.1,
		'price': 5,
		'service': 'Carrier 2'
	}
	]
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// const body : CarrierServiceRequestBody = await request.json(); we don't need this, but here we would have the Shopify request body
		const value: RatesConf = JSON.parse(await env.SHIPPING_CONFIGURATION.get('rates') || 'null') || DEFAULT_RATES;
		let services: Set<string> = new Set();
		let rates: CarrierServiceResponse = {
			'rates': value.rates.map((rate) => {
				services.add(rate.service);
				return {
					currency: 'EUR', // this could be put in configuration
					description: '',
					service_code: rate.service,
					service_name: rate.service,
					weight_min_lb: rate.min_weight_kg * 2.20462,
					weight_max_lb: rate.max_weight_kg * 2.20462,
					total_price: rate.price * 100 // this would be better to be saved in cents in the configuration
				};
			})
		};
		services.forEach((service) => {
			rates.rates.push({
				currency: 'EUR',
				description: '',
				service_code: service,
				service_name: '{FREE}' + service,
				total_price: 0
			});
		});
		return new Response(JSON.stringify(rates));
	}
};
