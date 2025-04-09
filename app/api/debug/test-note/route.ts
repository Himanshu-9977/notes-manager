import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Note } from '@/lib/models/note';

export async function POST() {
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Create a test note
    const testNote = await Note.create({
      title: `Test Note ${new Date().toISOString()}`,
      content: 'This is a test note created from the debug API',
      isPublic: false,
      userId,
      tags: [],
    });

    return NextResponse.json({
      success: true,
      note: {
        _id: testNote._id.toString(),
        title: testNote.title,
        createdAt: testNote.createdAt,
      }
    });
  } catch (error) {
    console.error('Error creating test note:', error);
    return NextResponse.json({ 
      error: 'Failed to create test note',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
