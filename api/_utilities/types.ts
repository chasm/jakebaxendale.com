export interface EmailDelivery {
	recipient: string
}

export interface ApiRequest {
	method?: string
	body: unknown
	delivery?: EmailDelivery | null | undefined
}

export interface ApiResponse {
	setHeader(key: string, value: string): ApiResponse
	status(code: number): ApiResponse
	end(): void
}

export type Body = {
	confirmation?: string | undefined | null
	emailAddress: string
	feedback?: string | undefined | null
	message?: string | undefined | null
	name: string | undefined | null
	password?: string | undefined | null
}
