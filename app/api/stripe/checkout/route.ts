import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Você precisa estar logado para assinar." }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Pagamentos ainda não configurados. Falta STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Resolve the price via lookup_key (set in the Stripe Dashboard) instead of a raw
    // price_... id — ids can contain ambiguous characters (I vs l) that are easy to
    // mistype when copying by hand. A lookup_key is whatever plain text you choose.
    const lookupKey = process.env.STRIPE_PRICE_LOOKUP_KEY;
    let priceId = process.env.STRIPE_PRICE_ID;

    if (lookupKey) {
      const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
      if (prices.data.length === 0) {
        return NextResponse.json(
          { error: `Nenhum preço ativo encontrado com o lookup_key "${lookupKey}".` },
          { status: 500 }
        );
      }
      priceId = prices.data[0].id;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Configure STRIPE_PRICE_LOOKUP_KEY ou STRIPE_PRICE_ID nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    // Find or create a Stripe customer id tied to this Supabase user.
    const { data: profile } = await supabase
      .from("profiles")
      .select("dopabet_stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.dopabet_stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id, product: "dopabet-live" },
      });
      customerId = customer.id;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ dopabet_stripe_customer_id: customerId })
        .eq("id", user.id);
      if (updateError) {
        console.error("Falha ao salvar dopabet_stripe_customer_id no profile:", updateError.message);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/conta?checkout=success`,
      cancel_url: `${siteUrl}/premium?checkout=cancel`,
      metadata: { supabase_user_id: user.id, product: "dopabet-live" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao criar checkout.";
    console.error("Erro no /api/stripe/checkout:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
