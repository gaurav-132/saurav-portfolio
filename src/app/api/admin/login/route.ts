import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { admins } from '@/lib/schema';
import { getSession } from '@/lib/auth';
const attempts=new Map<string,{n:number,at:number}>();
export async function POST(req:Request){const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown';const now=Date.now();const a=attempts.get(ip);if(a&&now-a.at<15*60_000&&a.n>=8)return NextResponse.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429});try{const b=z.object({email:z.email(),password:z.string().min(1).max(128)}).parse(await req.json());if(!db)return NextResponse.json({error:'Database is not configured.'},{status:503});const [admin]=await db.select().from(admins).where(eq(admins.email,b.email.toLowerCase())).limit(1);if(!admin||!await bcrypt.compare(b.password,admin.passwordHash)){attempts.set(ip,{n:(a?.n||0)+1,at:a?.at||now});return NextResponse.json({error:'Email or password is incorrect.'},{status:401});}attempts.delete(ip);const s=await getSession();s.adminId=admin.id;await s.save();return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Please check your details and try again.'},{status:400});}}
