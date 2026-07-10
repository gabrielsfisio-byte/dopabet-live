import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe não configurado." }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida";
    return NextResponse.json({ error: `Webhook signature error: ${message}` }, { status: 400 });
  }

  const supabase = await createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            dopabet_premium: true,
            dopabet_stripe_subscription_id: session.subscription as string,
            dopabet_premium_since: new Date().toISOString(),
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      await supabase
        .from("profiles")
        .update({ dopabet_premium: isActive })
        .eq("dopabet_stripe_customer_id", subscription.customer as string);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
