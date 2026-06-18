import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const konsolehOnly = searchParams.get("konsolehOnly") === "true";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (konsolehOnly) {
      where.isKonsoleh = true;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { domain: { contains: search } },
        { konsolehServer: { contains: search } },
      ];
    }

    const [results, total] = await Promise.all([
      db.emailEntry.findMany({
        where,
        orderBy: { verifiedAt: "desc" },
        skip,
        take: limit,
      }),
      db.emailEntry.count({ where }),
    ]);

    return NextResponse.json({
      results: results.map((r) => ({
        ...r,
        mxRecords: r.mxRecords ? JSON.parse(r.mxRecords) : [],
      })),
      total,
      page,
      limit,
      hasMore: skip + results.length < total,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.emailEntry.deleteMany({});
    await db.verificationSession.deleteMany({});
    return NextResponse.json({ success: true, message: "All data cleared" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
