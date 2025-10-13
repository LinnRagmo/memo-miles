import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { selectedDate, tripData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Find the day matching the selected date
    const dayData = tripData?.days?.find((day: any) => {
      const dayDate = new Date(day.date).toDateString();
      const selected = new Date(selectedDate).toDateString();
      return dayDate === selected;
    });

    let systemPrompt = "You are a creative travel journal assistant. Generate a compelling journal entry title and thoughtful notes based on the planned activities.";
    let userPrompt = "";

    if (dayData && dayData.stops && dayData.stops.length > 0) {
      const activities = dayData.stops
        .map((stop: any) => `${stop.location}${stop.notes ? ': ' + stop.notes : ''}`)
        .join(', ');
      
      userPrompt = `Generate a journal entry for this day of travel:\n\nDate: ${selectedDate}\nPlanned activities: ${activities}\n\nProvide:\n1. A catchy, engaging title (max 50 characters)\n2. Thoughtful notes (2-3 sentences) that capture the essence of the day's activities in an inspiring way.\n\nFormat your response as:\nTitle: [your title]\nNotes: [your notes]`;
    } else {
      userPrompt = `Generate a journal entry for this travel day:\n\nDate: ${selectedDate}\nNo specific activities planned yet.\n\nProvide:\n1. A generic but inspiring title (max 50 characters)\n2. Brief notes (1-2 sentences) encouraging the traveler to document their experiences.\n\nFormat your response as:\nTitle: [your title]\nNotes: [your notes]`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse the response to extract title and notes
    const titleMatch = generatedText.match(/Title:\s*(.+)/i);
    const notesMatch = generatedText.match(/Notes:\s*(.+)/is);

    const title = titleMatch ? titleMatch[1].trim() : "A Day to Remember";
    const notes = notesMatch ? notesMatch[1].trim() : generatedText;

    return new Response(JSON.stringify({ title, notes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in suggest-journal-entry function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
