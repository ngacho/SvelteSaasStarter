declare global {
  type FormAccountUpdateResult = {
    errorMessage?: string
    errorFields?: string[]
    fullName?: string
    companyName?: string
    website?: string
    email?: string
  }
  type AuthcodeRequestUrlParams = {
    response_type: string
    client_id: string
    client_secret: string
    redirect_uri: string
    state?: string // Optional property
    scope: string
  }

  type AuthcodeResponse = {
    status: number
    body: {
      access_token: string
      token_type: string
      expires_in: number
      authCodeRequest: AuthcodeRequestUrlParams
    }
  }

  type TokenRequest = {
    [key: string]: string
    code?: string
    client_secret?: string
    redirect_uri?: string
    client_id?: string
  }
}

export {}
