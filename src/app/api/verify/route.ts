import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyEmailBatch } from "@/lib/konsoleh-verifier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for large batches

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emails, sessionName } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    if (emails.length > 1000) {
      return NextResponse.json({ error: "Maximum 1000 emails per batch" }, { status: 400 });
    }

    console.log(`Starting verification of ${emails.length} emails...`);

    // Verify emails
    const results = await verifyEmailBatch(emails, 15, (completed, total) => {
      if (completed % 10 === 0 || completed === total) {
        console.log(`Progress: ${completed}/${total}`);
      }
    });

    console.log(`Verification complete. Storing results...`);

    // Store results in database
    let konsolehCount = 0;
    let validCount = 0;

    for (const result of results) {
      if (result.isKonsoleh) konsolehCount++;
      if (result.smtpVerified) validCount++;

      await db.emailEntry.upsert({
        where: { email: result.email },
        update: {
          domain: result.domain,
          formatValid: result.formatValid,
          domainExists: result.domainExists,
          mxRecords: result.mxRecords.length > 0 ? JSON.stringify(result.mxRecords) : null,
          isKonsoleh: result.isKonsoleh,
          konsolehServer: result.konsolehServer,
          smtpVerified: result.smtpVerified,
          notes: result.error || null,
          verifiedAt: new Date(),
        },
        create: {
          email: result.email,
          domain: result.domain,
          formatValid: result.formatValid,
          domainExists: result.domainExists,
          mxRecords: result.mxRecords.length > 0 ? JSON.stringify(result.mxRecords) : null,
          isKonsoleh: result.isKonsoleh,
          konsolehServer: result.konsolehServer,
          smtpVerified: result.smtpVerified,
          notes: result.error || null,
        },
      });
    }

    // Create session record
    if (sessionName) {
      await db.verificationSession.create({
        data: {
          name: sessionName,
          totalCount: results.length,
          konsolehCount,
          validCount,
        },
      });
    }

    console.log(`Stored ${results.length} results. KonsoleH: ${konsolehCount}, Valid: ${validCount}`);

    return NextResponse.json({
      success: true,
      total: results.length,
      konsolehCount,
      validCount,
      results: results.map((r) => ({
        email: r.email,
        domain: r.domain,
        isKonsoleh: r.isKonsoleh,
        konsolehServer: r.konsolehServer,
        smtpVerified: r.smtpVerified,
        mxRecords: r.mxRecords,
        error: r.error,
      })),
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
