import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadImageFromUrl, deleteImage } from '@/lib/cloudinary';
import Replicate from 'replicate';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const model = formData.get('model') as string;

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

    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Convert image to base64 for Replicate
    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUri = `data:${image.type};base64,${base64Image}`;

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Call Replicate API for vision analysis
    const output = await replicate.run(
      "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb",
      {
        input: {
          image: dataUri,
          prompt: prompt
        }
      }
    );

    if (!output) {
      throw new Error('No response from vision model');
    }

    // Convert array output to string
    const responseText = Array.isArray(output) ? output.join('') : String(output);

    // Upload image to Cloudinary
    const publicId = `cthai_vision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Attempting to upload image to Cloudinary:', { dataUri, publicId });
    
    const uploadResponse = await uploadImageFromUrl(dataUri, publicId) as any;
    console.log('Cloudinary upload response:', uploadResponse);

    // Save to Supabase
    const { data: visionData, error: insertError } = await supabase
      .from('cthai_vision')
      .insert({
        user_id: user.id,
        image_url: uploadResponse.secure_url,
        cloudinary_public_id: uploadResponse.public_id,
        prompt: prompt,
        response: responseText,
        model: model
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      // Delete from Cloudinary if Supabase insert fails
      await deleteImage(uploadResponse.public_id);
      throw new Error(`Failed to save vision analysis to database: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadResponse.secure_url,
      analysisId: visionData.id,
      prompt,
      response: responseText,
      model
    });

  } catch (error) {
    console.error('Vision analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 