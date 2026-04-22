import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sourceFile = formData.get('source') as File;
    const targetFile = formData.get('target') as File;

    if (!sourceFile || !targetFile) {
      return NextResponse.json({ error: 'Both source and target images are required.' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken || apiToken === 'your_replicate_api_token_here') {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN not configured. Please add your Replicate API key to .env.local file.' },
        { status: 500 }
      );
    }

    // Convert files to base64 data URIs
    const sourceBuffer = await sourceFile.arrayBuffer();
    const targetBuffer = await targetFile.arrayBuffer();
    const sourceBase64 = `data:${sourceFile.type};base64,${Buffer.from(sourceBuffer).toString('base64')}`;
    const targetBase64 = `data:${targetFile.type};base64,${Buffer.from(targetBuffer).toString('base64')}`;

    // Use codeplugtech/face-swap model on Replicate (2.1M+ runs, actively maintained)
    // source_img = face donor (whose face to use), target_img = base image (where to place the face)
    const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34',
        input: {
          source_img: sourceBase64,  // The face to swap in
          target_img: targetBase64,  // The image to receive the new face
          cache_days: 10,
        },
      }),
    });

    if (!replicateRes.ok) {
      const errorData = await replicateRes.json();
      console.error('Replicate API error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to start face swap prediction.' },
        { status: replicateRes.status }
      );
    }

    const prediction = await replicateRes.json();
    const predictionId = prediction.id;

    // Poll for result (max 55s)
    const startTime = Date.now();
    while (Date.now() - startTime < 55000) {
      await new Promise((r) => setTimeout(r, 2000));

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiToken}` },
      });

      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded') {
        const outputUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
        return NextResponse.json({ output: outputUrl, status: 'succeeded' });
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        return NextResponse.json(
          { error: pollData.error || 'Face swap processing failed.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Processing timeout. Please try again.' }, { status: 504 });

  } catch (err: unknown) {
    console.error('Face swap error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
