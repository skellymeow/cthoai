import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadVideoFromUrl, deleteVideo } from '@/lib/cloudinary';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "bytedance/seedance-1-pro", resolution = "1920x1080", duration = "5" } = await request.json();

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

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Run video generation
    const output = await replicate.run(model, {
      input: {
        prompt: prompt,
      }
    });

    // Handle different output formats
    let videoUrl: string;
    if (typeof output === 'string') {
      videoUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      videoUrl = output[0];
    } else if (output && typeof (output as any).url === 'function') {
      videoUrl = (output as any).url();
    } else if (output && typeof output === 'object' && 'url' in output) {
      videoUrl = (output as any).url;
    } else {
      throw new Error('Invalid response format from video generation service');
    }

    // Upload to Cloudinary
    const publicId = `cthai_video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Attempting to upload video to Cloudinary:', { videoUrl, publicId });
    
    const uploadResponse = await uploadVideoFromUrl(videoUrl, publicId) as any;
    console.log('Cloudinary upload response:', uploadResponse);

    // Save to Supabase
    const { data: videoData, error: insertError } = await supabase
      .from('cthai_videos')
      .insert({
        user_id: user.id,
        cloudinary_url: uploadResponse.secure_url,
        cloudinary_public_id: uploadResponse.public_id,
        prompt: prompt,
        model: model,
        resolution: resolution,
        duration: duration
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      // Delete from Cloudinary if Supabase insert fails
      await deleteVideo(uploadResponse.public_id);
      throw new Error(`Failed to save video to database: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      videoUrl: uploadResponse.secure_url,
      videoId: videoData.id,
      prompt,
      resolution,
      duration,
      model
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
} 