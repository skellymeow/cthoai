import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadAudioFromUrl, deleteAudio } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "fal-ai/playai/tts/v3", voice = "Jennifer (English (US)/American)" } = await request.json();

    // Get user from Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.FAL_API_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Call FAL API for TTS using the correct endpoint
    const falResponse = await fetch('https://fal.run/fal-ai/playai/tts/v3', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: prompt,
        voice: voice,
        response_format: "url"
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      throw new Error(`FAL API error: ${falResponse.status} - ${errorText}`);
    }

    const falData = await falResponse.json();
    const audioUrl = falData.audio?.url;

    if (!audioUrl) {
      throw new Error('No audio URL returned from FAL API');
    }

    // Upload to Cloudinary
    const publicId = `cthai_audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Attempting to upload audio to Cloudinary:', { audioUrl, publicId });
    
    const uploadResponse = await uploadAudioFromUrl(audioUrl, publicId) as any;
    console.log('Cloudinary upload response:', uploadResponse);

    // Save to Supabase
    const { data: audioData, error: insertError } = await supabase
      .from('cthai_audios')
      .insert({
        user_id: user.id,
        cloudinary_url: uploadResponse.secure_url,
        cloudinary_public_id: uploadResponse.public_id,
        prompt: prompt,
        model: model,
        voice: voice
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      // Delete from Cloudinary if Supabase insert fails
      await deleteAudio(uploadResponse.public_id);
      throw new Error(`Failed to save audio to database: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      audioUrl: uploadResponse.secure_url,
      audioId: audioData.id,
      prompt,
      voice,
      model
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
} 