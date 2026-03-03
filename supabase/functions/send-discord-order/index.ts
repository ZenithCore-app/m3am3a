import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (!DISCORD_WEBHOOK_URL) throw new Error('DISCORD_WEBHOOK_URL is not configured');

    const { customerName, customerPhone, items, total, location } = await req.json();

    if (!customerName || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsList = items
      .map((item: { name: string; quantity: number; price: number }) =>
        `• ${item.quantity}x ${item.name} — $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const fields = [
      { name: '👤 Customer', value: customerName, inline: true },
      { name: '📞 Phone', value: customerPhone || 'N/A', inline: true },
      { name: '🛒 Order Items', value: itemsList },
      { name: '💰 Total', value: `**$${total.toFixed(2)}**`, inline: true },
    ];

    if (location?.lat && location?.lng) {
      fields.push({
        name: '📍 Location',
        value: `[Open in Maps](https://www.google.com/maps?q=${location.lat},${location.lng})`,
        inline: true,
      });
    }

    const embed = {
      title: '🍔 New Order!',
      color: 0xFF6B00,
      fields,
      timestamp: new Date().toISOString(),
      footer: { text: 'Mellal Express Order System' },
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord API failed [${response.status}]: ${errorText}`);
    }
    await response.text();

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
