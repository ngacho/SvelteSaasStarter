import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public"
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
import Stripe from "stripe"
import type { Tables, TablesInsert } from "../../../../DatabaseDefinitions"
import { createClient } from "@supabase/supabase-js"
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

type Product = Tables<"products">
type Price = Tables<"prices">

const TRIAL_PERIOD_DAYS = 14

const supabaseAdmin = createClient(
  PUBLIC_SUPABASE_URL,
  PRIVATE_SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } },
)

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  }

  const { error: upsertError } = await supabaseAdmin
    .from("products")
    .upsert([productData])
  if (upsertError) {
    console.log('upsertError', upsertError.message)
    throw new Response(`Product insert/update failed: ${upsertError.message}`, {status : 500})
  }

  console.log(`Product inserted/updated: ${product.id}`)
}

// Function to upsert a price record
const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3,
): Promise<void> => {
  const priceData = {
    id: price.id,
    product_id: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS,
  }

  const { error: upsertError } = await supabaseAdmin
    .from("prices")
    .upsert([priceData])

  if (upsertError?.message.includes("foreign key constraint")) {
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await upsertPriceRecord(price, retryCount + 1, maxRetries)
    } else {
      console.log(`Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`)
      throw new Response(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`,
        {status : 500}
      )
    }
  } else if (upsertError) {
    console.log('upsertError', upsertError.message)
    throw new Response(`Price insert/update failed: ${upsertError.message}`, {status : 500})
  } else {
    console.log(`Price inserted/updated: ${price.id}`)
  }
}

const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", product.id)
  if (deletionError){
    console.log('deletionError', deletionError.message)
    throw new Response(`Product deletion failed: ${deletionError.message}`, {status : 500})
  }
  console.log(`Product deleted: ${product.id}`)
}

const deletePriceRecord = async (price: Stripe.Price) => {
  const { error: deletionError } = await supabaseAdmin
    .from("prices")
    .delete()
    .eq("id", price.id)
  if (deletionError){
    console.log('deletionError', deletionError.message)
    throw new Response(`Price deletion failed: ${deletionError.message}`, {status : 500})
  }
  console.log(`Price deleted: ${price.id}`)
}

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const now = new Date()
  const { error: upsertError } = await supabaseAdmin
    .from("stripe_customers")
    .upsert([{ id: uuid, now, stripe_customer_id: customerId }])

  if (upsertError){
    console.log('upsertError', upsertError.message)
    throw new Response(
      `Supabase customer record creation failed: ${upsertError.message}`,
      {status : 500}
    )

  }
    

  return customerId
}

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email }
  const newCustomer = await stripe.customers.create(customerData)
  if (!newCustomer){
    console.log(' customer creation failed ')
    throw new Response("Stripe customer creation failed.", {status : 500})
  }
    

  return newCustomer.id
}

const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email: string
  uuid: string
}) => {
  // Check if the customer already exists in Supabase
  const { data: existingSupabaseCustomer, error: queryError } =
    await supabaseAdmin
      .from("stripe_customers")
      .select("*")
      .eq("id", uuid)
      .maybeSingle()

  if (queryError) {
    console.log('queryError', queryError.message)
    throw new Response(`Supabase customer lookup failed: ${queryError.message}`, {status : 500})
  }

  // Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id,
    )
    console.log(`Existing Stripe customer: ${existingStripeCustomer.id}`)
    stripeCustomerId = existingStripeCustomer?.id
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({ email: email })
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined
  }

  // If still no stripeCustomerId, create a new customer in Stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email)
  if (!stripeIdToInsert) throw new Response("Stripe customer creation failed.", {status : 500})

  if (existingSupabaseCustomer && stripeCustomerId) {
    // If Supabase has a record but doesn't match Stripe, update Supabase record
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      const { error: updateError } = await supabaseAdmin
        .from("stripe_customers")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", uuid)

      if (updateError){
        console.log('updateError', updateError.message)
        throw new Response(
          `Supabase customer record update failed: ${updateError.message}`,
          {status : 500}
        )
      }
      console.warn(
        `Supabase customer record mismatched Stripe ID. Supabase record updated.`,
      )
    }
    // If Supabase has a record and matches Stripe, return Stripe customer ID
    return stripeCustomerId
  } else {
    console.warn(
      `Supabase customer record was missing. A new record was created.`,
    )

    // If Supabase has no record, create a new record and return Stripe customer ID
    const upsertedStripeCustomer = await upsertCustomerToSupabase(
      uuid,
      stripeIdToInsert,
    )
    if (!upsertedStripeCustomer){
      console.log('upsertedStripeCustomer', upsertedStripeCustomer)
      throw new Response("Supabase customer record creation failed.", {status : 500})
    }
      

    return upsertedStripeCustomer
  }
}

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod,
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string
  const { name, phone, address } = payment_method.billing_details
  if (!name || !phone || !address) return
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address })
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] },
    })
    .eq("id", uuid)
  if (updateError){
    console.log('updateError', updateError.message)
    throw new Response(`Customer update failed: ${updateError.message}`, {
      status: 400,
    })
  }
}

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false,
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (noCustomerError){
    console.log('noCustomerError', noCustomerError.message)
    throw new Response(`Customer lookup failed: ${noCustomerError.message}`)
  }

  const { user_id: uuid } = customerData!

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  })
  // Upsert the latest status of the subscription object.
  const subscriptionData: TablesInsert<"subscriptions"> = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start,
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end,
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null,
  }

  const { error: upsertError } = await supabaseAdmin
    .from("subscriptions")
    .upsert([subscriptionData])
  if (upsertError) {
    console.log('upsertError', upsertError.message)
    throw new Response("Unhandled relevant event!", { status: 400 })
  }
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`,
  )

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod,
    )
}

function toDateTime(cancel_at: number): Date {
  return new Date(cancel_at * 1000)
}

export {
  stripe,
  upsertProductRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
}
