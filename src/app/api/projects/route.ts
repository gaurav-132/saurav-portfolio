import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { projects,categories } from '@/lib/schema';
export async function GET(){if(!db)return NextResponse.json({projects:[],categories:[]});const [items,cats]=await Promise.all([db.select().from(projects).where(eq(projects.published,true)).orderBy(asc(projects.sortOrder)),db.select().from(categories).orderBy(asc(categories.sortOrder))]);return NextResponse.json({projects:items,categories:cats},{headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=300'}});}
