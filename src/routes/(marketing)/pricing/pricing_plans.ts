export const defaultPlanId = "free"

export const pricingPlans = [
  {
    id: "pro",
    name: "Pro",
    description:
      "Subscribe monthly and get access to all the features. Cancel anytime.",
    price: "$4.99",
    priceIntervalName: "per month",
    stripe_price_id: "price_1PAipH018unCjwxRnInTDsgA",
    stripe_product_id: "prod_Q0kJdqOUnL3Yek",
    features: [
      "Get email summary",
      "Add tasks from your email to your calendar in a single click"
    ],
  },
  {
    id: "pro-yearly",
    name: "Annual Pro",
    description:
      "Subscribe annually for full access, it's 15% cheaper",
    price: "$49.99",
    priceIntervalName: "per year",
    stripe_price_id: "price_1PAipb018unCjwxRRXgHjZ68",
    stripe_product_id: "prod_Q0kJdqOUnL3Yek",
    features: [
      "Everything is free",
      "15% off",
    ],
  },
]
