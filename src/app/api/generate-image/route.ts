import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadImageFromUrl, deleteImage } from '@/lib/cloudinary';



const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "1:1", model = "google/imagen-4-fast" } = await request.json();

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

    // Map aspect ratios to Replicate format
    const aspectRatioMap: { [key: string]: string } = {
      "1:1": "1:1",
      "4:3": "4:3", 
      "3:4": "3:4",
      "16:9": "16:9",
      "9:16": "9:16"
    };

    const mappedAspectRatio = aspectRatioMap[aspectRatio] || "1:1";

    // Different models have different input parameters
    let input: any = {
      prompt: prompt,
    };

    // Add model-specific parameters
    if (model === "google/imagen-4-fast") {
      input = {
        prompt: prompt,
        aspect_ratio: mappedAspectRatio,
        output_format: "jpg",
        safety_filter_level: "block_only_high"
      };
    } else if (model === "black-forest-labs/flux-schnell") {
      input = {
        prompt: prompt
      };
    } else if (model.startsWith("stability-ai/")) {
      input = {
        prompt: prompt,
        width: mappedAspectRatio === "1:1" ? 1024 : mappedAspectRatio === "4:3" ? 1024 : 768,
        height: mappedAspectRatio === "1:1" ? 1024 : mappedAspectRatio === "4:3" ? 768 : 1024,
      };
    } else if (model.startsWith("runwayml/")) {
      input = {
        prompt: prompt,
        width: mappedAspectRatio === "1:1" ? 512 : mappedAspectRatio === "4:3" ? 768 : 512,
        height: mappedAspectRatio === "1:1" ? 512 : mappedAspectRatio === "4:3" ? 512 : 768,
      };
    }

    const output = await replicate.run(model, { input });

    // Handle different output formats
    let imageUrl: string;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (output && typeof (output as any).url === 'function') {
      imageUrl = (output as any).url();
    } else if (output && typeof output === 'object' && 'url' in output) {
      imageUrl = (output as any).url;
    } else {
      throw new Error('Invalid response format from image generation service');
    }

    // Upload to Cloudinary
    const publicId = `cthai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Attempting to upload to Cloudinary:', { imageUrl, publicId });
    
    const uploadResponse = await uploadImageFromUrl(imageUrl, publicId) as any;
    console.log('Cloudinary upload response:', uploadResponse);

    // Save to Supabase
    const { data: imageData, error: insertError } = await supabase
      .from('cthai_images')
      .insert({
        user_id: user.id,
        cloudinary_url: uploadResponse.secure_url,
        cloudinary_public_id: uploadResponse.public_id,
        prompt: prompt,
        model: model,
        resolution: mappedAspectRatio
      })
      .select()
      .single();

    if (insertError) {
      // Delete from Cloudinary if Supabase insert fails
      await deleteImage(uploadResponse.public_id);
      throw new Error('Failed to save image to database');
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadResponse.secure_url,
      imageId: imageData.id,
      prompt,
      aspectRatio: mappedAspectRatio,
      model
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 