import { NextResponse } from 'next/server';
import { z } from 'zod';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/slug';
export async function GET(){if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});if(!db)return NextResponse.json([]);return NextResponse.json(await db.select().from(categories).orderBy(asc(categories.sortOrder)));}
export async function POST(req:Request){if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});try{const v=z.object({name:z.string().min(1).max(80),slug:z.string().max(100).optional()}).parse(await req.json());if(!db)return NextResponse.json({error:'Database is not configured.'},{status:503});const [item]=await db.insert(categories).values({name:v.name,slug:slugify(v.slug||v.name)}).returning();return NextResponse.json(item,{status:201});}catch{return NextResponse.json({error:'Invalid category or slug already exists.'},{status:400});}}
export async function PATCH(req:Request){if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});try{const v=z.object({id:z.string().uuid(),name:z.string().min(1).max(80),slug:z.string().max(100).optional()}).parse(await req.json());if(!db)return NextResponse.json({error:'Database is not configured.'},{status:503});const [item]=await db.update(categories).set({name:v.name,slug:slugify(v.slug||v.name)}).where(eq(categories.id,v.id)).returning();return NextResponse.json(item);}catch{return NextResponse.json({error:'Invalid category details.'},{status:400});}}
export async function DELETE(req:Request){if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});try{const {id}=await req.json();if(!db)return NextResponse.json({error:'Database is not configured.'},{status:503});await db.delete(categories).where(eq(categories.id,id));return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Could not delete category.'},{status:400});}}
