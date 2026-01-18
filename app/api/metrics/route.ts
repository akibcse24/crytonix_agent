import { NextResponse } from 'next/server';
import { metrics, getCostSummary, getPerformanceSummary } from '@/lib/monitoring/metrics';

/**
 * GET /api/metrics
 * Get system metrics and performance data
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const window = searchParams.get('window');

        // Time window in milliseconds (default: last hour)
        const timeWindow = window ? parseInt(window) * 1000 : 60 * 60 * 1000;

        const costSummary = getCostSummary(timeWindow);
        const perfSummary = getPerformanceSummary(timeWindow);

        return NextResponse.json({
            success: true,
            timeWindow: timeWindow / 1000, // Convert back to seconds
            costs: costSummary,
            performance: perfSummary,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get metrics',
            },
            { status: 500 }
        );
    }
}
