import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { DatabaseHelpers } from '@/lib/mongodb'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await DatabaseHelpers.findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await DatabaseHelpers.createUser({
      name,
      email,
      password: hashedPassword,
      balance: 10000 // Starting balance
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input data',
          details: error.issues
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create account',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
