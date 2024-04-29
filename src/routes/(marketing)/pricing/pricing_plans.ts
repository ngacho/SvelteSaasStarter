export const defaultPlanId = "free"

export const pricingPlans = [
  {
    id: "free",
    name: "Free",
    description: "A free plan to get you started!",
    price: "$0",
    priceIntervalName: "per month",
    stripe_price_id: null,
    features: ["MIT Licence", "Fast Performance", "Stripe Integration"],
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "A plan to test the purchase experience. Try buying this with the test credit card 4242424242424242.",
    price: "$5",
    priceIntervalName: "per month",
    stripe_price_id: "price_1P2z8l018unCjwxRmXD5SHWh",
    stripe_product_id: "prod_Psj2Jr9Jw4EDoc",
    features: [
      "Everything in Free",
      "Support us with fake money",
      "Test the purchase experience",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "A plan to test the upgrade expereince. Try buying this with the test credit card 4242424242424242.",
    price: "$50 ",
    priceIntervalName: "per year",
    stripe_price_id: "price_1P2z2B018unCjwxRuZ2BJeHD",
    stripe_product_id: "prod_Psj2Jr9Jw4EDoc",
    features: [
      "Everything in Pro",
      "Try the 'upgrade plan' UX",
      "Still actually free!",
    ],
  },
]
