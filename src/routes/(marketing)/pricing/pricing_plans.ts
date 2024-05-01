export const defaultPlanId = "free"

export const pricingPlans = [
  {
    id: "pro",
    name: "Pro",
    description:
      "Subscribe monthly and get access to all the features. Cancel anytime.",
    price: "$4.99",
    priceIntervalName: "per month",
    stripe_price_id: "price_1PBRqNA7HIDVdCI741qoqn7e",
    stripe_product_id: "prod_Q1UqnTYHt545gU",
    features: [
      "Summarize your emails and quickly understand what's important",
      "Extract action items and to-dos from emails and schedule them as events directly from your email",
    ],
  },
  {
    id: "pro-yearly",
    name: "Annual Pro - 15% OFF",
    description: "Subscribe annually for full access",
    price: "$49.99",
    priceIntervalName: "per year",
    stripe_price_id: "price_1PBRqNA7HIDVdCI74noDytd0",
    stripe_product_id: "prod_Q1UqnTYHt545gU",
    features: [
      "Summarize your emails and quickly understand what's important",
      "Extract action items and to-dos from emails and schedule them as events directly from your email",
    ],
  },
]
