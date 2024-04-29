<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingModule from "../../../../(marketing)/pricing/pricing_module.svelte"
  import {
    pricingPlans,
    defaultPlanId,
  } from "../../../../(marketing)/pricing/pricing_plans"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  export let data

  let currentPlanId = data.currentPlanId ?? defaultPlanId
  let currentPlanName = pricingPlans.find(
    (x) => x.id === data.currentPlanId,
  )?.name
</script>

<svelte:head>
  <title>Billing</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">
  {data.isActiveCustomer ? "Billing" : "Select a Plan"}
</h1>

{#if !data.isActiveCustomer}
  <div class="mt-12">
    <PricingModule {currentPlanId} callToAction="Select Plan" center={false} />
  </div>

  {#if data.hasEverHadSubscription}
    <div class="mt-10">
      <a href="/account/billing/manage" class="link">View past invoices</a>
    </div>
  {/if}
{:else}
  <div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow">
    <form method="POST">
      <div>
        <div class="text-xl font-bold mb-3 w-48 flex-none">Subscription</div>
        <div class="w-full min-w-48">
          <div class="mb-6">
            <div class="text-sm text-gray-600">Current Plan</div>
            <div class="text-lg font-bold">{currentPlanName}</div>
          </div>
          <button class="btn btn-outline btn-sm min-w-[145px]">
            Cancel Subscription
          </button>
        </div>
      </div>
    </form>
  </div>
{/if}
